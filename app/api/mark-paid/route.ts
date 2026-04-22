import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  // 🔐 AUTH CHECK
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🔒 ADMIN CHECK
  if (user.email !== "admin@streamsstudio.com") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing ID" });
  }

  await supabase
    .from("orders")
    .update({ payment_status: "paid" })
    .eq("id", id);

  return NextResponse.json({ success: true });
}