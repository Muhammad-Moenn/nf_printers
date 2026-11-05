"use client";

import { useSignUp } from "@clerk/nextjs";
import { LoaderCircle, LockKeyhole, MailCheck } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/lib/clerk-errors";

type Step = "details" | "verify";

export function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const locale = useLocale();
  const [step, setStep] = useState<Step>("details");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dashboardPath =
    locale === "en" ? "/user-dashboard" : `/${locale}/user-dashboard`;

  async function finalizeSession(sessionId: string) {
    if (!setActive) return;
    await setActive({ session: sessionId });
    router.replace(dashboardPath);
  }

  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoaded || pending) return;

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const attempt = await signUp.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailAddress: email.trim(),
        password,
      });

      if (attempt.status === "complete" && attempt.createdSessionId) {
        await finalizeSession(attempt.createdSessionId);
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
      setInfo(`We sent a verification code to ${email.trim()}.`);
    } catch (caught) {
      setError(getAuthErrorMessage(caught, "signUp"));
    } finally {
      setPending(false);
    }
  }

  async function verifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoaded || pending) return;

    setPending(true);
    setError(null);

    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: code.trim() });

      if (attempt.status === "complete" && attempt.createdSessionId) {
        await finalizeSession(attempt.createdSessionId);
        return;
      }

      setError("That verification code is incorrect or has expired. Try again.");
    } catch (caught) {
      setError(getAuthErrorMessage(caught, "signUp"));
    } finally {
      setPending(false);
    }
  }

  async function resendCode() {
    if (!isLoaded || pending) return;

    setPending(true);
    setError(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setInfo(`A new verification code was sent to ${email.trim()}.`);
    } catch (caught) {
      setError(getAuthErrorMessage(caught, "signUp"));
    } finally {
      setPending(false);
    }
  }

  if (step === "verify") {
    return (
      <form className="space-y-4" onSubmit={verifyEmail}>
        <div className="rounded-lg bg-primary-soft p-3 text-sm text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground">
          {info ?? "Check your email for a verification code."}
        </div>

        <div className="space-y-2">
          <Label htmlFor="verificationCode">Verification code</Label>
          <Input
            id="verificationCode"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            maxLength={12}
            disabled={pending}
            required
            autoFocus
          />
        </div>

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
              Verifying…
            </>
          ) : (
            <>
              <MailCheck className="mr-2 size-4" />
              Verify email
            </>
          )}
        </Button>

        <div className="flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            onClick={resendCode}
            disabled={pending}
          >
            Resend code
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              setStep("details");
              setCode("");
              setError(null);
              setInfo(null);
            }}
            disabled={pending}
          >
            Edit details
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={submitDetails}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            maxLength={80}
            disabled={pending}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            maxLength={80}
            disabled={pending}
            required
          />
        </div>
      </div>

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
        autoComplete="new-password"
        disabled={pending}
      />

      <PasswordField
        id="confirmPassword"
        label="Confirm password"
        value={confirmation}
        onChange={setConfirmation}
        autoComplete="new-password"
        disabled={pending}
      />

      <p className="text-xs leading-5 text-muted-foreground">
        Use at least 8 characters and do not reuse a password from another site.
      </p>

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
            Creating account…
          </>
        ) : (
          <>
            <LockKeyhole className="mr-2 size-4" />
            Create account
          </>
        )}
      </Button>
    </form>
  );
}
