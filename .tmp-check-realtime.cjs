require("dotenv").config();
const { Client } = require("pg");
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect()
  .then(async () => {
    const g = await c.query(
      "select table_name, grantee, string_agg(privilege_type, ',') as privs from information_schema.role_table_grants where table_schema='public' and table_name in ('Conversation','Message','User') and grantee in ('anon','authenticated') group by table_name, grantee order by table_name, grantee"
    );
    const roles = await c.query(
      "select rolname, rolcanlogin from pg_roles where rolname in ('anon','authenticated','service_role','postgres','authenticator')"
    );
    const schemaGrants = await c.query(
      "select nspname, nspacl from pg_namespace where nspname in ('public','realtime')"
    );
    const rtPol = await c.query(
      "select schemaname, tablename, policyname, cmd, roles, qual from pg_policies where schemaname='realtime'"
    );
    console.log("GRANTS:", JSON.stringify(g.rows, null, 2));
    console.log("ROLES:", JSON.stringify(roles.rows, null, 2));
    console.log("SCHEMA ACL:", JSON.stringify(schemaGrants.rows, null, 2));
    console.log("REALTIME POLICIES:", JSON.stringify(rtPol.rows, null, 2));
    await c.end();
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
