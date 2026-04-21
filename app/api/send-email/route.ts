import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email, name, queue } = await req.json();

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Streams Studio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Photos Are Ready 🎓",
      html: `
        <h2>Hello ${name}</h2>
        <p>Your graduation photos are ready.</p>
        <p>Queue #: ${queue}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}