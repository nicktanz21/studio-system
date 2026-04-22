import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const {
    name,
    email,
    phone,
    package: pkg,
    queue_number,
    slot_time,
    booking_date,
  } = body;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      name,
      email,
      phone,
      package: pkg,
      queue_number,
      step: "intake",
      status: "waiting",
      slot_time,
      booking_date,
      payment_status: "pending",
      selected: false,
      edited: false,
      printed: false,
      emailed: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message });
  }

  return NextResponse.json(data);
}