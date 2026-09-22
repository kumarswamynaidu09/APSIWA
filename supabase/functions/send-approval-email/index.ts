// Supabase Edge Function: send-approval-email
// Follows standard Deno serve pattern for Supabase Functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, subject, html, application, validUntil } = await req.json();

    if (!to || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters (to, html)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY =
      Deno.env.get("RESEND_API_KEY") ||
      Deno.env.get("VITE_RESEND_API_KEY") ||
      "";

    const FROM_EMAIL =
      Deno.env.get("RESEND_FROM_EMAIL") ||
      "AP SIWA Secretariat <onboarding@resend.dev>";

    // Dispatch to Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject: subject || `APSIWA Membership Certificate & Identity Card - ${application?.fullName || 'Member'}`,
        html: html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // If custom domain fails, fallback to onboarding@resend.dev
      if (FROM_EMAIL !== "AP SIWA Secretariat <onboarding@resend.dev>") {
        const retryRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "AP SIWA Secretariat <onboarding@resend.dev>",
            to: Array.isArray(to) ? to : [to],
            subject: subject || `APSIWA Membership Certificate & Identity Card - ${application?.fullName || 'Member'}`,
            html: html,
          }),
        });
        const retryData = await retryRes.json();
        return new Response(JSON.stringify(retryData), {
          status: retryRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
