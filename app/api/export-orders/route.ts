import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date"); // optional: ?date=YYYY-MM-DD

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: true });

  if (date) {
    query = query.eq("booking_date", date);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return new NextResponse("No data", {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // --- CSV ---
  const headers = Object.keys(data[0]);
  const headerLine = headers.join(",");

  const rows = data.map((row) =>
    headers
      .map((h) => {
        const v = row[h as keyof typeof row];
        const s = String(v ?? "");
        // escape quotes + wrap in quotes
        return `"${s.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csv = [headerLine, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders${date ? `-${date}` : ""}.csv"`,
    },
  });
}