import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

type LogBody = {
  phase?: string;
  details?: Record<string, unknown>;
  at?: string;
};

/** Dev-only: echo image pipeline logs from mobile browsers to the Next terminal. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  let body: LogBody;
  try {
    body = (await request.json()) as LogBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const authState = await auth();
  const phase = body.phase ?? "unknown";
  const at = body.at ?? new Date().toISOString();
  const details = body.details ?? {};

  console.info(
    `[image][client→server] ${phase}`,
    JSON.stringify(
      {
        at,
        userId: authState.userId ?? "anonymous",
        userAgent: request.headers.get("user-agent"),
        ...details,
      },
      null,
      2,
    ),
  );

  return Response.json({ ok: true });
}
