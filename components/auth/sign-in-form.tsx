"use client";

import { useSignIn } from "@clerk/nextjs";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/lib/clerk-errors";

function safeRedirect(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value.startsWith("/") ? value : fallback;
  }
}

export function SignInForm({ redirectUrl }: { redirectUrl?: string }) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dashboardPath =
    locale === "en" ? "/user-dashboard" : `/${locale}/user-dashboard`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoaded || pending) return;

    setPending(true);
    setError(null);

    try {
      const attempt = await signIn.create({
        strategy: "password",
        identifier: email.trim(),
        password,
      });

      if (attempt.status === "complete" && attempt.createdSessionId && setActive) {
        await setActive({ session: attempt.createdSessionId });
        router.replace(safeRedirect(redirectUrl, dashboardPath));
        return;
      }

      if (attempt.status === "needs_second_factor") {
        setError(
          "This account requires a second verification step. Please complete it from your account portal.",
        );
      } else if (attempt.status === "needs_new_password") {
        setError("Your password must be reset before you can sign in.");
      } else {
        setError("We could not complete sign-in. Please try again.");
      }
    } catch (caught) {
      setError(getAuthErrorMessage(caught, "signIn"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          maxLength={254}
          disabled={pending}
          required
        />
      </div>

      <PasswordField
        id="password"
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        minLength={1}
        disabled={pending}
      />

      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Button className="h-11 w-full" disabled={pending || !isLoaded} type="submit">
        {pending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Please wait…
          </>
        ) : (
          <>
            <LockKeyhole className="mr-2 size-4" />
            Sign in
          </>
        )}
      </Button>
    </form>
  );
}
