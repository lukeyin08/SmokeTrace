import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-app-gradient">
      <header className="flex h-16 items-center px-4 md:px-8">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </main>
      <footer className="px-4 py-6 text-center text-xs text-muted-foreground">
        <Link href="/privacy" className="hover:underline">
          Privacy & disclaimer
        </Link>{" "}
        · SmokeTrace provides behavioral support, not medical advice.
      </footer>
    </div>
  );
}
