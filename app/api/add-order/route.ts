import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

let lastCall = 0;
export async function POST(req: Request) {
// 🚫 rate limit
  if (Date.now() - lastCall < 1000) {
    return NextResponse.json({ error: "Too fast" });
  }
  lastCall = Date.now();

  const body = await req.json();
  const { name, email } = body;

  if (!name) {
    return NextResponse.json({ error: "Missing name" });
  }

  // 🔢 get next queue number
  const { data } = await supabase
    .from("orders")
    .select("queue_number")
    .order("queue_number", { ascending: false })
    .limit(1);

  const nextNumber = (data?.[0]?.queue_number || 0) + 1;

  const { error } = await supabase.from("orders").insert({
    name,
    email,
    queue_number: nextNumber,
    step: "intake",
    status: "waiting",
    payment_status: "pending",
    selected: false,
    edited: false,
    printed: false,
    emailed: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message });
  }

  return NextResponse.json({ success: true 

    

});}
