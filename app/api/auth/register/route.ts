import { NextResponse } from "next/server";
import { z } from "zod";
import { syncUserToPrisma } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = schema.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name ?? email.split("@")[0] },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message, code: "REGISTER_FAILED" },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Registration failed", code: "REGISTER_FAILED" },
        { status: 400 }
      );
    }

    if (data.session) {
      await syncUserToPrisma(data.user);
      return NextResponse.json({ success: true, redirect: "/dashboard" });
    }

    return NextResponse.json({
      success: true,
      message: "Check your email to confirm your account, then sign in.",
      redirect: "/login",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid input", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Registration failed", code: "REGISTER_FAILED" },
      { status: 500 }
    );
  }
}
