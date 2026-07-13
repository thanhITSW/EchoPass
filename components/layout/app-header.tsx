"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader({ showNav = true }: { showNav?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          EchoPass
        </Link>
        <div className="flex items-center gap-2">
          {showNav && (
            <>
              <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
                Dashboard
              </Link>
              <Link href="/capsule/new" className={buttonVariants()}>
                Create Capsule
              </Link>
            </>
          )}
          <ThemeToggle />
          {showNav && (
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
