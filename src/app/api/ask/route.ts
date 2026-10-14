// The database assistant runs on the separately hosted backend.
// GitHub Pages cannot execute server-side route handlers.
export const dynamic = "force-static";

export async function GET() {
  return Response.json(
    { detail: "Assistant API is hosted separately; see the repository README." },
    { status: 501 }
  );
}
