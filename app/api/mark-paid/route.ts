import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { id } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",

      // 🔥 force to EDIT stage
      selected: true,
      edited: false,
      printed: false,
    })
    .eq("id", id);

  if (error) {
    console.error("DB ERROR:", error);
    return NextResponse.json({ error: error.message });
  }

  return NextResponse.json({ success: true });
}