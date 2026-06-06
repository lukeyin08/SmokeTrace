import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Start your quit journey</CardTitle>
        <CardDescription>
          Create your free account. It only takes a minute.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree that SmokeTrace provides behavioral support,
          not medical advice. See our{" "}
          <Link href="/privacy" className="underline">
            privacy & disclaimer
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
