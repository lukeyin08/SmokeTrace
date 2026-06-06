import { Logo } from "@/components/logo";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-app-gradient">
      <header className="flex h-16 items-center px-4 md:px-8">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-6">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
