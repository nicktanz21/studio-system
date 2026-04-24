import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";

console.log("COOKIE HEADER:", cookieHeader);

// ✅ SAFE PARSE (DO NOT USE .includes blindly)
const hasSession = cookieHeader
  .split(";")
  .map(c => c.trim())
  .some(c => c.startsWith("admin_session="));

if (!hasSession) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}