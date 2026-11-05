-- Remove any legacy orphaned chat records before enforcing the delete rules.
DELETE FROM "Message" AS message
WHERE NOT EXISTS (
  SELECT 1
  FROM "Conversation" AS conversation
  WHERE conversation."id" = message."conversationId"
);

DELETE FROM "Message" AS message
WHERE EXISTS (
  SELECT 1
  FROM "Conversation" AS conversation
  WHERE conversation."id" = message."conversationId"
    AND NOT EXISTS (
      SELECT 1
      FROM "User" AS app_user
      WHERE app_user."id" = conversation."userId"
    )
);

DELETE FROM "Conversation" AS conversation
WHERE NOT EXISTS (
  SELECT 1
  FROM "User" AS app_user
  WHERE app_user."id" = conversation."userId"
);

ALTER TABLE "Conversation"
DROP CONSTRAINT IF EXISTS "Conversation_userId_fkey";

ALTER TABLE "Conversation"
ADD CONSTRAINT "Conversation_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message"
DROP CONSTRAINT IF EXISTS "Message_conversationId_fkey";

ALTER TABLE "Message"
ADD CONSTRAINT "Message_conversationId_fkey"
FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message"
DROP CONSTRAINT IF EXISTS "Message_senderId_fkey";

ALTER TABLE "Message"
ADD CONSTRAINT "Message_senderId_fkey"
FOREIGN KEY ("senderId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Give existing customer accounts a conversation once; accounts created after
-- this migration receive one during user synchronization.
INSERT INTO "Conversation" ("id", "userId", "isActive", "createdAt", "updatedAt")
SELECT
  'c' || md5(random()::text || clock_timestamp()::text || app_user."id"),
  app_user."id",
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User" AS app_user
WHERE app_user."role" = 'CUSTOMER'
  AND NOT EXISTS (
    SELECT 1
    FROM "Conversation" AS conversation
    WHERE conversation."userId" = app_user."id"
  );
