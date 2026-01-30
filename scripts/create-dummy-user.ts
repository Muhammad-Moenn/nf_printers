import "dotenv/config";
import { createClerkClient } from "@clerk/backend";

const secretKey = process.env.CLERK_SECRET_KEY;
const email = process.env.DUMMY_USER_EMAIL;
const password = process.env.DUMMY_USER_PASSWORD;
const firstName = process.env.DUMMY_USER_FIRST_NAME || "Dummy";
const lastName = process.env.DUMMY_USER_LAST_NAME || "User";

if (!secretKey) {
  console.error("Missing CLERK_SECRET_KEY in env.");
  process.exit(1);
}

if (!email || !password) {
  console.error("Missing DUMMY_USER_EMAIL or DUMMY_USER_PASSWORD in env.");
  process.exit(1);
}

const clerk = createClerkClient({ secretKey });

async function ensureDummyUser() {
  const existing = await clerk.users.getUserList({ emailAddress: [email] });
  let user = existing.data[0];

  if (!user) {
    user = await clerk.users.createUser({
      emailAddress: [email],
      password,
      firstName,
      lastName,
      skipPasswordChecks: true,
      skipPasswordRequirement: true,
    });
  } else {
    user = await clerk.users.updateUser(user.id, {
      firstName,
      lastName,
      password,
      skipPasswordChecks: true,
    });
  }

  const emailAddress = user.emailAddresses.find(
    (addr) => addr.emailAddress.toLowerCase() === email.toLowerCase()
  );

  if (emailAddress) {
    if (emailAddress.verification?.status !== "verified") {
      await clerk.emailAddresses.updateEmailAddress(emailAddress.id, {
        verified: true,
        primary: true,
      });
    }
  } else {
    await clerk.emailAddresses.createEmailAddress({
      userId: user.id,
      emailAddress: email,
      verified: true,
      primary: true,
    });
  }

  console.log(`Dummy user ready: ${email} (id: ${user.id})`);
}

ensureDummyUser().catch((err) => {
  console.error(err);
  process.exit(1);
});
