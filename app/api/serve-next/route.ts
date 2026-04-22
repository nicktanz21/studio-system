import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  // 🔐 CREATE SERVER CLIENT (SAFE)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 🔐 GET TOKEN FROM FRONTEND
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  // 🔐 GET USER
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🔐 CHECK ROLE
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 🔄 STEP 1: FINISH CURRENT SERVING
  const { data: current } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "serving")
    .limit(1)
    .single();

  if (current) {
    await supabase
      .from("orders")
      .update({ status: "done" })
      .eq("id", current.id);
  }

  // 🔄 STEP 2: GET NEXT WAITING
  const { data: next } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "waiting")
    .order("queue_number", { ascending: true })
    .limit(1)
    .single();

  if (next) {
    await supabase
      .from("orders")
      .update({ status: "serving" })
      .eq("id", next.id);
  }

  return NextResponse.json({ success: true });
}