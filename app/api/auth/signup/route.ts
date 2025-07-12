import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/schema/zodSchema";
import { ActivityType } from "@prisma/client";
import { assignJp } from "@/lib/utils/jp";
import { sign } from "jsonwebtoken";
import { sendEmailUsingTemplate } from "@/utils/sendEmail";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    const { email, password, name } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationToken = sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: "24h",
    });

    // Send verification email

    const verificationUrl = `${process.env.NEXT_URL}/verify-email?token=${verificationToken}`;

    await sendEmailUsingTemplate({
      toEmail: email,
      toName: name,
      templateId: "verification-mail",
      templateData: {
        username: name,
        verificationUrl,
      },
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: process.env.ADMIN_EMAIL === email ? "ADMIN" : "USER",
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ),
      },
      omit: { password: true },
      include: { plan: true },
    });

    //  * assign JP as signup reward
    assignJp(user, ActivityType.SIGNUP);

    return NextResponse.json({
      message:
        "User created successfully. Please check your email to verify your account.",
      user: user,
      userId: user.id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error instanceof axios.AxiosError) {
      console.error("Signup error:", error?.response); //! only meant for debuggin in prodction
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
