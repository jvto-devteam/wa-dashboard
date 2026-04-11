import { cookies } from "next/headers";
import { verifyToken, type JwtPayload } from "./jwt";

export { signToken, verifyToken, type JwtPayload } from "./jwt";

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession(): Promise<JwtPayload> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
