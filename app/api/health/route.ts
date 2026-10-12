export async function GET() {
  return Response.json({ ok: true }, { status: 200 });
}

export async function POST() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function PUT() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function PATCH() {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}
