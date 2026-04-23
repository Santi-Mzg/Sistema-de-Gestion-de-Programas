export async function POST(req: Request) {
  const body = await req.json();

  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/set-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });


  return Response.json({ ok: true });
}
