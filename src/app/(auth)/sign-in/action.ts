"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verify } from "@node-rs/argon2";
import { actionClient } from "@/lib/safe-action";
import { db, UsersTable } from "@/lib/db/drizzle";
import { signInSchema } from "./schema";

export const signInAction = actionClient
  .inputSchema(signInSchema)
  .action(async ({ parsedInput }) => {
    const { email, password } = parsedInput;

    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, email))
      .limit(1);

    if (!user) {
      return { failure: "Invalid email or password" };
    }

    const passwordValid = await verify(user.password_hash, password);

    if (!passwordValid) {
      return { failure: "Invalid email or password" };
    }

    // ⚠️ SECURITY TODO (BLOCKING): Replace this placeholder with a real random session token
    // before wiring up any route protection. The stub verifier in src/data/session.ts
    // grants access to anyone with "valid_session_cookie_value" — this MUST NOT reach production.
    const cookieStore = await cookies();
    cookieStore.set("cfl_session", "valid_session_cookie_value", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    redirect("/dashboard");
  });
