require("dotenv").config({ quiet: true });
const { Client } = require("pg");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const result = await client.query(`
      SELECT
        (SELECT count(*) FROM "Conversation" c
         WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u."id" = c."userId"))::int AS orphan_conversations,
        (SELECT count(*) FROM "Message" m
         WHERE NOT EXISTS (SELECT 1 FROM "Conversation" c WHERE c."id" = m."conversationId"))::int AS messages_without_conversation,
        (SELECT count(*) FROM "Message" m
         JOIN "Conversation" c ON c."id" = m."conversationId"
         WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u."id" = c."userId"))::int AS messages_with_orphan_conversation_user,
        (SELECT count(*) FROM "Message" m
         WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u."id" = m."senderId"))::int AS messages_without_sender
    `);
    console.log(JSON.stringify(result.rows[0], null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Auth migration preflight failed:", error.code || error.message);
  process.exitCode = 1;
});
