import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 🔒 CHECK ADMIN SESSION
    const cookie = req.headers.get("cookie") || "";

    if (!cookie.includes("admin_session=valid")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const today = new Date().toISOString().split("T")[0];

    // 1. get next waiting
    const { data: next } = await supabase
      .from("orders")
      .select("*")
      .eq("booking_day", today)
      .eq("status", "waiting")
      .order("queue_number", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!next) {
      return NextResponse.json({ message: "No customers" });
    }

    // 2. reset current
    await supabase
      .from("orders")
      .update({ status: "waiting" })
      .eq("status", "serving")
      .eq("booking_day", today);

    // 3. set next
    await supabase
      .from("orders")
      .update({ status: "serving" })
      .eq("id", next.id);

    return NextResponse.json({ success: true, next });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}