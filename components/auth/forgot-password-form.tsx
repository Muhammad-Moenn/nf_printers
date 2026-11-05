"use client";

import { useSignIn } from "@clerk/nextjs";
import { KeyRound, LoaderCircle, LockKeyhole, MailCheck } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage, isIdentifierNotFoundError } from "@/lib/clerk-errors";

type Step = "email" | "code" | "password";

export function ForgotPasswordForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const locale = useLocale();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
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

  async function sendCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!isLoaded || pending) return;

    setPending(true);
    setError(null);

    try {
      const attempt = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });

      if (attempt.status === "complete" && attempt.createdSessionId) {
        await finalizeSession(attempt.createdSessionId);
        return;
      }

      setStep("code");
      setCode("");
      setInfo(`We sent a password reset code to ${email.trim()}.`);
    } catch (caught) {
      if (isIdentifierNotFoundError(caught)) {
        setStep("code");
        setCode("");
        setInfo("If an account exists with that email, we sent a reset code.");
      } else {
        setError(getAuthErrorMessage(caught, "reset"));
      }
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLoaded || pending) return;

    setPending(true);
    setError(null);

    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
      });

      if (attempt.status === "needs_new_password") {
        setStep("password");
        setInfo("Choose a new password for your account.");
        return;
      }

      if (attempt.status === "complete" && attempt.createdSessionId) {
        await finalizeSession(attempt.createdSessionId);
        return;
      }

      setError("We could not verify that code. Request a new code and try again.");
    } catch (caught) {
      setError(getAuthErrorMessage(caught, "reset"));
    } finally {
      setPending(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
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
      const attempt = await signIn.resetPassword({
        password,
        signOutOfOtherSessions: true,
      });

      if (attempt.status === "complete" && attempt.createdSessionId) {
        await finalizeSession(attempt.createdSessionId);
        return;
      }

      setError("We could not update your password. Request a new reset code.");
    } catch (caught) {
      setError(getAuthErrorMessage(caught, "reset"));
    } finally {
      setPending(false);
    }
  }

  if (step === "code") {
    return (
      <form className="space-y-4" onSubmit={verifyCode}>
        <div className="rounded-lg bg-primary-soft p-3 text-sm text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground">
          {info ?? "Check your email for a password reset code."}
        </div>

        <div className="space-y-2">
          <Label htmlFor="resetCode">Reset code</Label>
          <Input
            id="resetCode"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            maxLength={8}
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
              Verify code
            </>
          )}
        </Button>

        <div className="flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void sendCode()}
            disabled={pending}
          >
            Resend code
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
              setInfo(null);
            }}
            disabled={pending}
          >
            Change email
          </button>
        </div>
      </form>
    );
  }

  if (step === "password") {
    return (
      <form className="space-y-4" onSubmit={resetPassword}>
        <div className="rounded-lg bg-primary-soft p-3 text-sm text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground">
          {info ?? "Choose a new password for your account."}
        </div>

        <PasswordField
          id="newPassword"
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          disabled={pending}
        />

        <PasswordField
          id="confirmNewPassword"
          label="Confirm new password"
          value={confirmation}
          onChange={setConfirmation}
          autoComplete="new-password"
          disabled={pending}
        />

        <p className="text-xs leading-5 text-muted-foreground">
          Use at least 8 characters. You will be signed out of other sessions.
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
              Updating password…
            </>
          ) : (
            <>
              <LockKeyhole className="mr-2 size-4" />
              Save new password
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={sendCode}>
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
            Sending code…
          </>
        ) : (
          <>
            <KeyRound className="mr-2 size-4" />
            Send reset code
          </>
        )}
      </Button>
    </form>
  );
}
