import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization")!;
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    const { data: { user: caller } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!caller) throw new Error("Not authenticated");

    const { data: roleCheck } = await anonClient.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    if (!roleCheck) throw new Error("Not authorized");

    const { email, password, teacher_id, full_name } = await req.json();
    if (!email || !password || !teacher_id) throw new Error("Email, password, and teacher_id required");

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create auth user
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || "" },
    });
    if (createErr) throw createErr;

    const userId = newUser.user!.id;

    // Assign tutor role
    await adminClient.from("user_roles").insert({ user_id: userId, role: "tutor" });

    // Link user to teacher record
    await adminClient.from("teachers").update({ user_id: userId }).eq("id", teacher_id);

    // Update profile name to match teacher
    await adminClient.from("profiles").update({ full_name: full_name || "" }).eq("id", userId);

    return new Response(
      JSON.stringify({ success: true, user_id: userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
