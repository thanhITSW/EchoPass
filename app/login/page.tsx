import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <Link href="/" className="text-lg font-semibold">
          EchoPass
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-12">
        <AuthForm mode="login" />
      </main>
    </div>
  );
}
