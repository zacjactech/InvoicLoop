import { cookies } from "next/headers";
import { db } from "./db";
import { nanoid } from "nanoid";
import { ensureRuntimeEnv } from "./env";

const SESSION_COOKIE_NAME = "auth_session";
const SESSION_DURATION_DAYS = 7;

export async function createSession(userId: string) {
  await ensureRuntimeEnv();
  const token = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await db.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function getSession() {
  await ensureRuntimeEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (new Date() > session.expiresAt) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}

export async function destroySession() {
  await ensureRuntimeEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db.session.deleteMany({ where: { token } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
