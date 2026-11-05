import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

type AuthContext = "signIn" | "signUp" | "reset";

const genericMessage = "Something went wrong. Please try again.";

export function isIdentifierNotFoundError(error: unknown) {
  return (
    isClerkAPIResponseError(error) &&
    error.errors.some((item) => item.code === "form_identifier_not_found")
  );
}

export function getAuthErrorMessage(
  error: unknown,
  context: AuthContext = "signIn",
) {
  if (!isClerkAPIResponseError(error)) {
    return "We could not reach the authentication service. Check your connection and try again.";
  }

  const clerkError = error.errors[0];
  if (!clerkError) return genericMessage;

  switch (clerkError.code) {
    case "form_identifier_not_found":
      return context === "signIn"
        ? "Email or password is incorrect."
        : context === "reset"
          ? "If an account exists with that email, we sent a reset code."
          : "We could not complete this request with that email address.";
    case "form_password_incorrect":
      return "Email or password is incorrect.";
    case "form_identifier_exists":
      return "An account already uses this email. Sign in or reset its password.";
    case "form_param_format_invalid":
      return "Enter a valid email address.";
    case "form_password_length_too_short":
      return "Use a longer password that meets the password requirements.";
    case "form_password_pwned":
      return "This password has appeared in a data breach. Choose a different password.";
    case "form_password_not_strong_enough":
      return "Choose a stronger password.";
    case "form_code_incorrect":
      return "The verification code is incorrect. Check the code and try again.";
    case "verification_expired":
      return "That verification code has expired. Request a new one.";
    case "verification_failed":
      return "Verification failed. Request a new code and try again.";
    default:
      return clerkError.longMessage || clerkError.message || genericMessage;
  }
}
