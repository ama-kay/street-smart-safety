import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmergencyRequestBody {
  token?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  trigger_source?: "app" | "shortcut";
}

interface ShortcutToken {
  id: string;
  user_id: string;
  token: string;
  active: boolean;
  last_used: string | null;
}

interface TriggerSession {
  id: string;
  user_id: string;
  trigger_count: number;
  started_at: string;
  last_tap_at: string;
  expires_at: string;
  status: "pending" | "completed" | "expired";
  purpose: "test" | "emergency";
}

Deno.serve(async (req) => {
  // =========================================================
  // CORS
  // =========================================================

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // =========================================================
    // 1. Read request body
    // =========================================================

    let body: EmergencyRequestBody;

    try {
      body = (await req.json()) as EmergencyRequestBody;
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid or empty JSON request body.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { token, latitude, longitude, address, trigger_source } = body;

    // =========================================================
    // 2. Supabase service-role client
    // =========================================================

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // =========================================================
    // 3. Determine trigger type
    // =========================================================

    let userId: string;
    let purpose: "test" | "emergency" = "emergency";
    let session: TriggerSession | null = null;
    let shortcutToken: ShortcutToken | null = null;

    // =========================================================
    // APP TRIGGER
    // =========================================================

    if (trigger_source === "app") {
      const authorization = req.headers.get("Authorization");

      if (!authorization?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({
            error: "Missing authentication.",
          }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      const accessToken = authorization.replace("Bearer ", "");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(accessToken);

      if (authError || !user) {
        return new Response(
          JSON.stringify({
            error: "Invalid or expired authentication.",
          }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      userId = user.id;

      console.log("APP EMERGENCY AUTHENTICATED:", {
        user_id: userId,
      });
    } else {
      // =========================================================
      // SHORTCUT TRIGGER
      // =========================================================

      if (!token) {
        return new Response(
          JSON.stringify({
            error: "Missing token.",
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      // ---------------------------------------------------------
      // Find shortcut token
      // ---------------------------------------------------------

      const { data: foundShortcutToken, error: tokenError } = await supabase
        .from("shortcut_tokens")
        .select("*")
        .eq("token", token)
        .single();

      if (tokenError || !foundShortcutToken) {
        return new Response(
          JSON.stringify({
            error: "Invalid token.",
          }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      shortcutToken = foundShortcutToken as ShortcutToken;

      // ---------------------------------------------------------
      // Determine test vs emergency
      // ---------------------------------------------------------

      const isActiveToken = shortcutToken.active === true;

      const isNewUntestedToken = shortcutToken.active === false && shortcutToken.last_used === null;

      if (!isActiveToken && !isNewUntestedToken) {
        return new Response(
          JSON.stringify({
            error: "This shortcut token is no longer valid.",
          }),
          {
            status: 401,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      purpose = isNewUntestedToken ? "test" : "emergency";

      userId = shortcutToken.user_id;

      // ---------------------------------------------------------
      // Current time
      // ---------------------------------------------------------

      const now = new Date();
      const nowISOString = now.toISOString();

      // ---------------------------------------------------------
      // Find pending session
      // ---------------------------------------------------------

      const { data: existingSession, error: sessionError } = await supabase
        .from("shortcut_trigger_sessions")
        .select("*")
        .eq("user_id", shortcutToken.user_id)
        .eq("purpose", purpose)
        .eq("status", "pending")
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (sessionError) {
        throw sessionError;
      }

      // ---------------------------------------------------------
      // Handle existing session
      // ---------------------------------------------------------

      if (existingSession) {
        const typedExistingSession = existingSession as TriggerSession;

        const expiresAt = new Date(typedExistingSession.expires_at);

        if (now >= expiresAt) {
          // Expire old session

          const { error: expireError } = await supabase
            .from("shortcut_trigger_sessions")
            .update({
              status: "expired",
              completed_at: nowISOString,
            })
            .eq("id", typedExistingSession.id);

          if (expireError) {
            throw expireError;
          }

          // Start new session

          const newExpiresAt = new Date(now.getTime() + 20 * 1000);

          const { data: newSession, error: newSessionError } = await supabase
            .from("shortcut_trigger_sessions")
            .insert({
              user_id: shortcutToken.user_id,
              trigger_count: 1,
              started_at: nowISOString,
              last_tap_at: nowISOString,
              expires_at: newExpiresAt.toISOString(),
              status: "pending",
              purpose,
            })
            .select()
            .single();

          if (newSessionError) {
            throw newSessionError;
          }

          session = newSession as TriggerSession;
        } else {
          // Existing session still active

          const newTriggerCount = typedExistingSession.trigger_count + 1;

          const completed = newTriggerCount >= 3;

          const { data: updatedSession, error: updateError } = await supabase
            .from("shortcut_trigger_sessions")
            .update({
              trigger_count: newTriggerCount,
              last_tap_at: nowISOString,
              status: completed ? "completed" : "pending",
              completed_at: completed ? nowISOString : null,
            })
            .eq("id", typedExistingSession.id)
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }

          session = updatedSession as TriggerSession;
        }
      } else {
        // -------------------------------------------------------
        // No existing session
        // -------------------------------------------------------

        const expiresAt = new Date(now.getTime() + 20 * 1000);

        const { data: newSession, error: newSessionError } = await supabase
          .from("shortcut_trigger_sessions")
          .insert({
            user_id: shortcutToken.user_id,
            trigger_count: 1,
            started_at: nowISOString,
            last_tap_at: nowISOString,
            expires_at: expiresAt.toISOString(),
            status: "pending",
            purpose,
          })
          .select()
          .single();

        if (newSessionError) {
          throw newSessionError;
        }

        session = newSession as TriggerSession;
      }

      if (!session) {
        throw new Error("Failed to create or retrieve trigger session.");
      }

      // ---------------------------------------------------------
      // Shortcut session not complete
      // ---------------------------------------------------------

      if (session.status !== "completed") {
        return new Response(
          JSON.stringify({
            success: true,
            emergency: false,
            purpose,
            status: "pending",
            trigger_count: session.trigger_count,
            message: `${
              purpose === "test" ? "Test" : "Emergency"
            } trigger ${session.trigger_count} of 3 registered.`,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      // ---------------------------------------------------------
      // Onboarding test completed
      // ---------------------------------------------------------

      if (purpose === "test") {
        const { error: tokenUpdateError } = await supabase
          .from("shortcut_tokens")
          .update({
            active: true,
            last_used: nowISOString,
          })
          .eq("id", shortcutToken.id);

        if (tokenUpdateError) {
          throw tokenUpdateError;
        }

        return new Response(
          JSON.stringify({
            success: true,
            emergency: false,
            test_completed: true,
            purpose: "test",
            status: "completed",
            trigger_count: session.trigger_count,
            message: "Shortcut test completed successfully. Your shortcut is now active.",
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }
    }

    // =========================================================
    // COMMON REAL EMERGENCY PROCESSING
    // =========================================================

    console.log("PROCESSING REAL EMERGENCY:", {
      user_id: userId,
      trigger_source: trigger_source === "app" ? "app" : "shortcut",
    });

    const now = new Date();
    const nowISOString = now.toISOString();

    const actualTriggerSource = trigger_source === "app" ? "app" : "shortcut";

    // =========================================================
    // 4. Location
    // =========================================================

    const locationData = {
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      address: address ?? null,
    };

    // =========================================================
    // 5. Create SOS alert
    // =========================================================

    const { data: alert, error: alertError } = await supabase
      .from("sos_alerts")
      .insert({
        user_id: userId,
        message: "Emergency alert triggered",
        location: JSON.stringify(locationData),
        trigger_source: actualTriggerSource,
        status: "active",
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      })
      .select()
      .single();

    if (alertError) {
      throw alertError;
    }

    console.log("SOS ALERT CREATED:", {
      alert_id: alert.id,
      user_id: userId,
    });

    // =========================================================
    // 5B. Tracking URL
    // =========================================================
    //
    // A separate tracking URL will be created for every
    // emergency contact below.
    //
    // We intentionally do NOT create one shared tracking URL
    // here because each contact can have different sharing
    // permissions.
    // =========================================================

    // =========================================================
    // 6. Create in-app notification
    // =========================================================

    const { error: notificationError } = await supabase.from("notifications").insert({
      user_id: userId,
      type: "emergency",
      title: "Emergency Alert Activated",
      message: "Your emergency alert was successfully activated.",
      read: false,
    });

    if (notificationError) {
      console.error("Failed to create emergency notification:", notificationError);
    }

    // =========================================================
    // 7. Get emergency contacts
    // =========================================================

    const { data: contacts, error: contactsError } = await supabase
      .from("emergency_contact")
      .select(
        "contact_id, name, phone, relationship, address, share_medical_info, share_personal_info",
      )
      .eq("user_id", userId)
      .order("created_at", {
        ascending: true,
      });

    if (contactsError) {
      throw contactsError;
    }

    // =========================================================
    // 8. Process contacts
    // =========================================================

    if (!contacts || contacts.length === 0) {
      console.error("Emergency alert created, but the user has no emergency contacts.");
    } else {
      // ---------------------------------------------------------
      // Get user profile
      // ---------------------------------------------------------

      const { data: profile, error: profileError } = await supabase
        .from("user_profile")
        .select(
          "first_name, last_name, other_names, phone, DOB, country, gender, profession, blood_type, allergies, health_conditions, address",
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      // ---------------------------------------------------------
      // Get Arkesel credentials once
      // ---------------------------------------------------------

      const arkeselApiKey = Deno.env.get("ARKESEL_API_KEY");

      const arkeselSenderId = Deno.env.get("ARKESEL_SENDER_ID");

      if (!arkeselApiKey) {
        throw new Error("ARKESEL_API_KEY is not configured.");
      }

      if (!arkeselSenderId) {
        throw new Error("ARKESEL_SENDER_ID is not configured.");
      }

      // ---------------------------------------------------------
      // Build victim name once
      // ---------------------------------------------------------

      const victimName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();

      // ---------------------------------------------------------
      // Process every emergency contact
      // ---------------------------------------------------------

      for (const contact of contacts) {
        // =======================================================
        // Generate a unique tracking token for this contact
        // =======================================================

        const trackingToken = crypto.randomUUID();

        const trackingUrl = `http://172.20.10.3:5173/track/${alert.id}/${trackingToken}`;

        console.log("CONTACT-SPECIFIC TRACKING LINK:", {
          alert_id: alert.id,
          contact_id: contact.contact_id,
          contact: contact.name,
          tracking_url: trackingUrl,
          share_medical_info: contact.share_medical_info,
          share_personal_info: contact.share_personal_info,
        });

        // =======================================================
        // Prepare SMS
        // =======================================================

        const emergencyMessage = [
          "EMERGENCY ALERT",
          `${victimName || "Your emergency contact"} needs help.`,
          "",
          `Track their live location: ${trackingUrl}`,
        ].join("\n");

        console.log("PREPARED EMERGENCY DELIVERY:", {
          contact: contact.name,
          original_phone: contact.phone,
          message_length: emergencyMessage.length,
          tracking_url: trackingUrl,
          message: emergencyMessage,
        });

        // =======================================================
        // 9. Create alert_deliveries record
        // =======================================================

        const { data: delivery, error: deliveryError } = await supabase
          .from("alert_deliveries")
          .insert({
            alert_id: alert.id,
            contact_id: contact.contact_id,
            phone: contact.phone,
            message: emergencyMessage,
            tracking_token: trackingToken,
            status: "pending",
          })
          .select()
          .single();

        if (deliveryError) {
          console.error(`Failed to create delivery record for ${contact.name}:`, deliveryError);

          continue;
        }

        // =======================================================
        // 10. Send SMS through Arkesel legacy API
        // =======================================================

        try {
          const params = new URLSearchParams({
            action: "send-sms",
            api_key: arkeselApiKey,
            to: contact.phone,
            from: arkeselSenderId,
            sms: emergencyMessage,
          });

          const smsStartedAt = Date.now();

          const arkeselResponse = await fetch(
            `https://sms.arkesel.com/sms/api?${params.toString()}`,
            {
              method: "GET",
            },
          );

          const smsFinishedAt = Date.now();

          const arkeselResponseText = await arkeselResponse.text();

          console.log("ARKESEL HTTP STATUS:", {
            contact: contact.name,
            phone: contact.phone,
            status: arkeselResponse.status,
          });

          console.log("ARKESEL RESPONSE:", {
            contact: contact.name,
            response: arkeselResponseText,
          });

          console.log("ARKESEL REQUEST TIMING:", {
            contact: contact.name,
            duration_ms: smsFinishedAt - smsStartedAt,
          });

          if (!arkeselResponse.ok) {
            throw new Error(
              `Arkesel request failed with HTTP ${arkeselResponse.status}: ${arkeselResponseText}`,
            );
          }

          console.log("ARKESEL SMS REQUEST ACCEPTED:", {
            contact: contact.name,
            phone: contact.phone,
            response: arkeselResponseText,
          });

          // =====================================================
          // SMS request accepted
          //
          // sent_at means Street Smart successfully submitted
          // the SMS request to Arkesel.
          //
          // It does NOT necessarily mean the recipient's
          // phone has received the SMS yet.
          // =====================================================

          const sentAt = new Date().toISOString();

          const { error: deliveryUpdateError } = await supabase
            .from("alert_deliveries")
            .update({
              status: "sent",
              sent_at: sentAt,
              error_message: null,
            })
            .eq("id", delivery.id);

          if (deliveryUpdateError) {
            console.error(
              `Failed to update delivery status for ${contact.name}:`,
              deliveryUpdateError,
            );
          }
        } catch (smsError) {
          const smsErrorMessage =
            smsError instanceof Error ? smsError.message : "Unknown Arkesel SMS error.";

          console.error("Arkesel SMS request failed:", {
            contact: contact.name,
            phone: contact.phone,
            error: smsErrorMessage,
          });

          await supabase
            .from("alert_deliveries")
            .update({
              status: "failed",
              error_message: smsErrorMessage,
            })
            .eq("id", delivery.id);
        }
      }

      // =========================================================
      // 11. Update shortcut token usage
      // =========================================================

      if (shortcutToken) {
        const { error: tokenUpdateError } = await supabase
          .from("shortcut_tokens")
          .update({
            active: true,
            last_used: nowISOString,
          })
          .eq("id", shortcutToken.id);

        if (tokenUpdateError) {
          throw tokenUpdateError;
        }
      }
    }

    // =========================================================
    // 12. Successful emergency response
    // =========================================================

    return new Response(
      JSON.stringify({
        success: true,
        emergency: true,
        purpose: "emergency",
        status: "active",
        trigger_source: actualTriggerSource,
        trigger_count: session?.trigger_count ?? null,
        alert,
        message: "Emergency alert activated.",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Emergency Edge Function error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
