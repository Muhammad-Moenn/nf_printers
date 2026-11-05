require("dotenv").config();
require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");
const { createClient } = require("@supabase/supabase-js");

const pg = new Client({ connectionString: process.env.DATABASE_URL });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const t = Date.now();
const uid = "tmp_" + t;
const cid = "tmpc_" + t;
const mid = "tmpm_" + t;

(async () => {
  await pg.connect();
  const ch = supabase
    .channel("tmp-msg-" + t)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "Message" },
      (payload) => console.log("MSG EVENT:", JSON.stringify(payload).slice(0, 500))
    )
    .subscribe((s) => console.log("SUB:", s));

  await new Promise((r) => setTimeout(r, 4000));

  await pg.query(
    'insert into "User" (id, "clerkUserId", email, role, "createdAt", "updatedAt") values ($1,$2,$3,$4,now(),now())',
    [uid, uid, uid + "@example.com", "CUSTOMER"]
  );
  await pg.query(
    'insert into "Conversation" (id, "userId", "createdAt", "updatedAt") values ($1,$2,now(),now())',
    [cid, uid]
  );
  await pg.query(
    'insert into "Message" (id, "conversationId", "senderId", "receiverId", text, seen, "createdAt", "updatedAt") values ($1,$2,$3,$3,$4,false,now(),now())',
    [mid, cid, uid, "hello"]
  );
  console.log("INSERTED");

  await new Promise((r) => setTimeout(r, 10000));

  await pg.query('delete from "Message" where id=$1', [mid]);
  await pg.query('delete from "Conversation" where id=$1', [cid]);
  await pg.query('delete from "User" where id=$1', [uid]);
  await supabase.removeChannel(ch);
  await pg.end();
  process.exit(0);
})().catch(async (e) => {
  console.error("ERR", e.message);
  try {
    await pg.query('delete from "Message" where id=$1', [mid]);
    await pg.query('delete from "Conversation" where id=$1', [cid]);
    await pg.query('delete from "User" where id=$1', [uid]);
  } catch {}
  process.exit(1);
});
