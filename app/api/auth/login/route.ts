import { NextResponse } from "next/server";
import { z } from "zod";
import { syncUserToPrisma } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = schema.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message, code: "LOGIN_FAILED" },
        { status: 401 }
      );
    }

    if (data.user) {
      await syncUserToPrisma(data.user);
    }

    return NextResponse.json({ success: true, redirect: "/dashboard" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email or password", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed", code: "LOGIN_FAILED" },
      { status: 500 }
    );
  }
}
