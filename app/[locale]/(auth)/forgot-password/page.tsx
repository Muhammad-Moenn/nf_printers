import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Link } from "@/i18n/navigation";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email and we will send a secure reset code."
    >
      <ForgotPasswordForm />
      <div className="mt-5 text-center">
        <Link
          className="text-sm font-medium text-primary hover:underline"
          href="/sign-in"
        >
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
