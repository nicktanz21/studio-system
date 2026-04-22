import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🔍 get role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { id, field } = await req.json();

  // ✅ ALLOWED FIELDS ONLY
  const allowedFields = ["selected", "edited", "printed"];

  if (!allowedFields.includes(field)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // ✅ STAFF + ADMIN can use this
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase
    .from("orders")
    .update({ [field]: true })
    .eq("id", id);

  return NextResponse.json({ success: true });
}