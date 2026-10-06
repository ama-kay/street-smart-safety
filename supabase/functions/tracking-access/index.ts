import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle browser CORS preflight requests.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed.",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const body = await req.json();

    const alertId = typeof body.alertId === "string" ? body.alertId : null;

    const trackingToken = typeof body.trackingToken === "string" ? body.trackingToken : null;

    if (!alertId || !trackingToken) {
      return new Response(
        JSON.stringify({
          error: "Alert ID and tracking token are required.",
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Supabase environment variables are missing.");

      return new Response(
        JSON.stringify({
          error: "Server configuration error.",
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

    // Service-role client.
    //
    // This function performs the authorization checks itself,
    // so the external tracking contact does not need a
    // Street Smart account.
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    /*
     * 1. Validate the tracking token.
     *
     * The token must belong to this specific alert.
     */
    const { data: delivery, error: deliveryError } = await supabaseAdmin
      .from("alert_deliveries")
      .select(
        `
            id,
            alert_id,
            contact_id,
            tracking_token
          `,
      )
      .eq("alert_id", alertId)
      .eq("tracking_token", trackingToken)
      .maybeSingle();

    if (deliveryError) {
      console.error("Tracking delivery lookup failed:", deliveryError);

      return new Response(
        JSON.stringify({
          error: "Unable to validate tracking link.",
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

    if (!delivery) {
      return new Response(
        JSON.stringify({
          error: "This tracking link is invalid or has expired.",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    /*
     * 2. Load the emergency.
     */
    const { data: alert, error: alertError } = await supabaseAdmin
      .from("sos_alerts")
      .select(
        `
            id,
            user_id,
            status,
            message,
            trigger_source,
            created_at,
            latitude,
            longitude,
            location_accuracy,
            location_updated_at
          `,
      )
      .eq("id", alertId)
      .maybeSingle();

    if (alertError) {
      console.error("Emergency lookup failed:", alertError);

      return new Response(
        JSON.stringify({
          error: "Unable to load emergency.",
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

    if (!alert) {
      return new Response(
        JSON.stringify({
          error: "This emergency could not be found.",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    /*
     * 3. Make sure the delivery/contact belongs to
     *    the same user who owns the emergency.
     */
    const { data: contact, error: contactError } = await supabaseAdmin
      .from("emergency_contact")
      .select(
        `
            contact_id,
            user_id,
            share_medical_info,
            share_personal_info
          `,
      )
      .eq("contact_id", delivery.contact_id)
      .eq("user_id", alert.user_id)
      .maybeSingle();

    if (contactError) {
      console.error("Contact permission lookup failed:", contactError);

      return new Response(
        JSON.stringify({
          error: "Unable to verify tracking permissions.",
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

    if (!contact) {
      return new Response(
        JSON.stringify({
          error: "The tracking contact could not be verified.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    /*
     * 4. Load the victim's profile.
     *
     * We retrieve the profile server-side because the
     * external contact is not authenticated.
     */
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profile")
      .select(
        `
            user_id,
            first_name,
            last_name,
            other_names,
            email,
            phone,
            DOB,
            country,
            gender,
            profession,
            blood_type,
            allergies,
            health_conditions,
            address,
            avatar_url
          `,
      )
      .eq("user_id", alert.user_id)
      .maybeSingle();

    if (profileError) {
      console.error("Victim profile lookup failed:", profileError);

      return new Response(
        JSON.stringify({
          error: "Unable to load victim information.",
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

    /*
     * 5. Build the response according to the contact's
     *    sharing permissions.
     *
     * Core identity information is always returned:
     * - first name
     * - last name
     * - other names
     * - phone
     *
     * Additional personal information is only returned
     * when share_personal_info is enabled.
     *
     * Medical information is only returned when
     * share_medical_info is enabled.
     */

    const victim = profile
      ? {
          user_id: profile.user_id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          other_names: profile.other_names,
          phone: profile.phone,

          ...(contact.share_personal_info
            ? {
                email: profile.email,
                DOB: profile.DOB,
                country: profile.country,
                gender: profile.gender,
                profession: profile.profession,
                address: profile.address,
                avatar_url: profile.avatar_url,
              }
            : {}),

          ...(contact.share_medical_info
            ? {
                blood_type: profile.blood_type,
                allergies: profile.allergies,
                health_conditions: profile.health_conditions,
              }
            : {}),
        }
      : null;

    /*
     * 6. Return only the information required by the
     *    tracking page.
     */
    return new Response(
      JSON.stringify({
        alert: {
          id: alert.id,
          user_id: alert.user_id,
          status: alert.status,
          message: alert.message,
          trigger_source: alert.trigger_source,
          created_at: alert.created_at,
          latitude: alert.latitude,
          longitude: alert.longitude,
          location_accuracy: alert.location_accuracy,
          location_updated_at: alert.location_updated_at,
        },

        permissions: {
          contact_id: contact.contact_id,
          share_medical_info: contact.share_medical_info,
          share_personal_info: contact.share_personal_info,
        },

        victim,
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
    console.error("Tracking access function failed:", error);

    return new Response(
      JSON.stringify({
        error: "Something went wrong while accessing this emergency.",
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
