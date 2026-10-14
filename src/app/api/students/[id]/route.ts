// The interactive CRUD API is hosted separately (backend/app/main.py).
// GitHub Pages cannot execute server-side route handlers.
export const dynamic = "force-static";

export async function GET() {
  return Response.json(
    { detail: "Student API is hosted separately; see the repository README." },
    { status: 501 }
  );
}
