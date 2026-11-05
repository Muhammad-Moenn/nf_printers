-- Clerk is the single source of truth for authentication. Remove the local
-- credential/session storage introduced by the custom auth implementation.
DROP TABLE IF EXISTS "EmailVerificationToken";
DROP TABLE IF EXISTS "PasswordResetToken";
DROP TABLE IF EXISTS "Session";
DROP TABLE IF EXISTS "AuthRateLimit";

ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerifiedAt";
