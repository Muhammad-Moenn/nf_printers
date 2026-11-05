import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Link } from "@/i18n/navigation";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your NF Printers account."
      footer={
        <>
          New to NF Printers?{" "}
          <Link href="/sign-up" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm redirectUrl={redirect_url} />
      <div className="mt-4 text-right">
        <Link
          className="text-sm font-medium text-primary hover:underline"
          href="/forgot-password"
        >
          Forgot password?
        </Link>
      </div>
    </AuthShell>
  );
}
