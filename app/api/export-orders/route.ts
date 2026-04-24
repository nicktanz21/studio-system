import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  let query = supabase.from("orders").select("*");

  if (date) {
  query = query.eq("booking_day", date);
}

  const { data, error } = await query.order("queue_number", {
    ascending: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convert to CSV
  const csv = [
  [
    "Order ID",
    "Queue",
    "Name",
    "Email",
    "Phone",
    "Package",
    "Slot",
    "Status",
    "Payment",
    "Date",
  ],

  ...data.map((o) => [
    `ORD-${String(o.queue_number).padStart(3, "0")}`, // ✅ readable ID
    o.queue_number,
    o.name,
    o.email,
    o.contact,
    o.package,
    o.slot_time,
    o.status,
    o.payment_status,
    o.created_at_ts?.split("T")[0],
  ]),
]
    .map((row) => row.join(","))
    .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=orders.csv",
    },
  });
}