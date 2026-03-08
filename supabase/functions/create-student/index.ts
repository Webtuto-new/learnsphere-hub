import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization")!;
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    const { data: { user: caller } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!caller) throw new Error("Not authenticated");

    const { data: roleCheck } = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    if (!roleCheck) throw new Error("Not authorized");

    const { email, password, full_name, phone, address } = await req.json();
    if (!email || !password) throw new Error("Email and password required");

    // Use service role to create user
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || "", phone: phone || "", address: address || "" },
    });

    if (createErr) throw createErr;

    // Fetch the created profile (trigger should have created it)
    const { data: profile } = await adminClient
      .from("profiles")
      .select("admission_number")
      .eq("id", newUser.user!.id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUser.user!.id,
        admission_number: profile?.admission_number || "",
        email,
        full_name: full_name || "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
