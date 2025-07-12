import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { sendEmailUsingTemplate } from "@/utils/sendEmail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check if user registered with Google
    if (user.authMethod === "GOOGLE") {
      return NextResponse.json(
        {
          error:
            "This email is registered with Google. Please use Google Sign-in instead.",
        },
        { status: 400 }
      );
    }

    const resetToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const resetUrl = `${process.env.NEXT_URL}/reset-password?token=${resetToken}`;

    // Prepare email configuration
    await sendEmailUsingTemplate({
      toEmail: user.email,
      toName: user.name,
      templateId: "forget-password",
      templateData: { resetUrl },
    });

    return NextResponse.json(
      { message: "Password reset link sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
