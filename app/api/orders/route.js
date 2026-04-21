import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import * as QRCode from "qrcode"; // <-- IMPORTANT: use * as

// ✅ CREATE ORDER (WITH SAFE QR)
export async function POST(req) {
  try {
    const body = await req.json();

    const orderId = `GRAD2026-${Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0")}`;

    const url = `http://localhost:3000/o/${orderId}`;

    // 🔥 SAFE QR GENERATION
    let qr = null;
    try {
      qr = await QRCode.toDataURL(url, { width: 300 });
    } catch (qrErr) {
      console.log("QR ERROR:", qrErr);
      return NextResponse.json({
        error: "QR generation failed",
        details: qrErr.message
      });
    }

    // 🔥 INSERT TO DATABASE
    const { error } = await supabase.from("orders").insert([
      {
        id: orderId,
        name: body.name,
        school: body.school,
        course: body.course,
        package: body.package,
        contact: body.contact,
        status: "PENDING",

        // DONE FLAGS
        toga_done: false,
        casual_done: false,
        family_done: false,
        alampay_done: false,

        // READY FLAGS
        toga_ready: false,
        casual_ready: false,
        family_ready: false,
        alampay_ready: false
      }
    ]);

    if (error) {
      console.log("SUPABASE ERROR:", error);
      return NextResponse.json({
        error: "Database insert failed",
        details: error.message
      });
    }

    // ✅ SUCCESS
    return NextResponse.json({
      order_id: orderId,
      qr_code: qr
    });

  } catch (err) {
    console.log("SERVER ERROR:", err);
    return NextResponse.json({
      error: "Server crashed",
      details: err.message
    });
  }
}

// ✅ GET
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    return NextResponse.json({ data });
  }

  const { data } = await supabase.from("orders").select("*");
  return NextResponse.json({ data });
}

// ✅ UPDATE
export async function PUT(req) {
  const { id, field } = await req.json();

  await supabase
    .from("orders")
    .update({ [field]: true })
    .eq("id", id);

  return NextResponse.json({ success: true });
}