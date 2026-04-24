import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: true });

    // ✅ FILTER BY DATE IF PROVIDED
    if (date) {
      query = query.eq("booking_day", date);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error.message);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // ✅ ALWAYS RETURN ARRAY
    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error("API crash:", err);

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}