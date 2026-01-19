// app/api/auth/login/route.ts
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return new Response("Unauthorized", { status: 401 });
  }
  const data = await res.json();

  (await cookies()).set("jwt", data.token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return Response.json({ ok: true });
}
