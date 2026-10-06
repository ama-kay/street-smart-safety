import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  /*
   * =========================================================
   * CORS
   * =========================================================
   */

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    /*
     * =========================================================
     * 1. Create service-role client
     * =========================================================
     *
     * This key stays inside the Edge Function.
     * It is NEVER sent to the browser.
     */

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    /*
     * =========================================================
     * 2. Verify the requesting user
     * =========================================================
     */

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

    /*
     * =========================================================
     * 3. Verify admin role
     * =========================================================
     */

    const { data: adminRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Admin role lookup failed:", roleError);

      return new Response(
        JSON.stringify({
          error: "Failed to verify admin permissions.",
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

    if (!adminRole) {
      return new Response(
        JSON.stringify({
          error: "Administrator access required.",
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
     * =========================================================
     * 4. Total users
     * =========================================================
     */

    const { count: totalUsers, error: usersError } = await supabase
      .from("user_profile")
      .select("user_id", {
        count: "exact",
        head: true,
      });

    if (usersError) {
      throw new Error(`Failed to fetch total users: ${usersError.message}`);
    }

    /*
     * =========================================================
     * 5. Active emergencies
     * =========================================================
     */

    const { count: activeEmergencies, error: activeError } = await supabase
      .from("sos_alerts")
      .select("id", {
        count: "exact",
        head: true,
      })
      .ilike("status", "active");

    if (activeError) {
      throw new Error(`Failed to fetch active emergencies: ${activeError.message}`);
    }

    /*
     * =========================================================
     * 6. Alerts today
     * =========================================================
     */

    const startOfToday = new Date();

    startOfToday.setHours(0, 0, 0, 0);

    const startOfTodayISO = startOfToday.toISOString();

    const { count: alertsToday, error: todayError } = await supabase
      .from("sos_alerts")
      .select("id", {
        count: "exact",
        head: true,
      })
      .gte("created_at", startOfTodayISO);

    if (todayError) {
      throw new Error(`Failed to fetch today's alerts: ${todayError.message}`);
    }

    /*
     * =========================================================
     * 7. Cancelled alerts
     * =========================================================
     */

    const { count: cancelledAlerts, error: cancelledError } = await supabase
      .from("sos_alerts")
      .select("id", {
        count: "exact",
        head: true,
      })
      .ilike("status", "cancelled");

    if (cancelledError) {
      throw new Error(`Failed to fetch cancelled alerts: ${cancelledError.message}`);
    }

    /*
     * =========================================================
     * 8. Recent alerts
     * =========================================================
     */

    const { data: recentAlerts, error: alertsError } = await supabase
      .from("sos_alerts")
      .select(
        `
          id,
          created_at,
          location,
          status,
          user_id,
          user_profile (
            first_name,
            last_name
          )
        `,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

    if (alertsError) {
      throw new Error(`Failed to fetch recent alerts: ${alertsError.message}`);
    }

    /*
     * =========================================================
     * 9. Return dashboard data
     * =========================================================
     */

    return new Response(
      JSON.stringify({
        stats: {
          totalUsers: totalUsers ?? 0,
          activeEmergencies: activeEmergencies ?? 0,
          alertsToday: alertsToday ?? 0,
          cancelledAlerts: cancelledAlerts ?? 0,
        },

        recentAlerts: recentAlerts ?? [],
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
    console.error("Admin dashboard function error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error.",
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
