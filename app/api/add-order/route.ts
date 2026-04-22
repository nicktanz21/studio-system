import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

let lastCall = 0;

export async function POST(req: Request) {
  // 🚫 rate limit
  if (Date.now() - lastCall < 1000) {
    return NextResponse.json({ error: "Too fast" });
  }
  lastCall = Date.now();

  const body = await req.json();

  const {
    name,
    email,
    phone,
    package: pkg,
    queue_number,
    slot_time,
    booking_date,
  } = body;

  if (!name) {
    return NextResponse.json({ error: "Missing name" });
  }

  // ✅ CREATE SERVER CLIENT (IMPORTANT)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 🔢 get next queue (SAFE per day)
  const { data: last } = await supabase
    .from("orders")
    .select("queue_number")
    .eq("booking_date", booking_date)
    .order("queue_number", { ascending: false })
    .limit(1);

  const nextNumber = (last?.[0]?.queue_number || 0) + 1;

  // ✅ INSERT (NOW BYPASSES RLS SAFELY)
  const { data, error } = await supabase
    .from("orders")
    .insert({
      name,
      email,
      phone,
      package: pkg,
      queue_number: queue_number || nextNumber,
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