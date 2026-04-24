import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

let lastCall = 0;

export async function POST(req: Request) {
  try {
    if (Date.now() - lastCall < 1000) {
      return NextResponse.json({ error: "Too fast" }, { status: 429 });
    }
    lastCall = Date.now();

    const body = await req.json();

    const {
      name,
      email,
      phone,
      package: pkg,
      slot_time,
      booking_day,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const safeDate =
      booking_day || new Date().toISOString().split("T")[0];

    const { data: existing, error: countError } = await supabase
  .from("orders")
  .select("id")
  .eq("booking_day", safeDate)
  .eq("slot_time", slot_time);

if (countError) {
  return NextResponse.json({ error: countError.message }, { status: 500 });
}

if (existing.length >= 5) {
  return NextResponse.json(
    { error: "This time slot is already full" },
    { status: 400 }
  );
}

const { data: lastInSlot } = await supabase
  .from("orders")
  .select("queue_number")
  .eq("booking_day", safeDate)
  .eq("slot_time", slot_time)
  .order("queue_number", { ascending: false })
  .limit(1);

const nextNumber = (lastInSlot?.[0]?.queue_number || 0) + 1;

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          name,
          email,
          contact: phone,
          package: pkg,
          slot_time,
          queue_number: nextNumber,
          status: "waiting",
          booking_day: safeDate,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
