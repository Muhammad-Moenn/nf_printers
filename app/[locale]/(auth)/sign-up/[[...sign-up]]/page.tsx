import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Link } from "@/i18n/navigation";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Get started with your printing orders and account tools."
      footer={
        <>
          Already registered?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
      <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
        We will email you a verification code before your account can sign in.
      </p>
    </AuthShell>
  );
}
