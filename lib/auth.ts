import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function syncUserToPrisma(user: {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
}) {
  const email = user.email;
  if (!email) {
    throw new Error("User email is required");
  }

  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    email.split("@")[0];
  const avatar =
    user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

  return prisma.user.upsert({
    where: { id: user.id },
    update: { email, name, avatar },
    create: { id: user.id, email, name, avatar },
  });
}

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  await syncUserToPrisma(user);
  return user;
}
