import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  console.log("RESEND_API_KEY present:", !!process.env.RESEND_API_KEY)
  console.log("RESEND_API_KEY prefix:", process.env.RESEND_API_KEY?.slice(0, 8))
  console.log("APP_URL:", process.env.NEXT_PUBLIC_APP_URL)
  try {
    let body: { email?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }

    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    // Always return 200 — don't reveal whether the email exists
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (emailErr) {
      console.error("[POST /api/auth/forgot-password] email send failed:", emailErr);
      // Still return 200 — token is saved, user can retry or check spam
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/auth/forgot-password] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
