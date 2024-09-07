import getTags from "../../service/getTags";

export async function GET() {
  const tags = await getTags();
  return new Response(JSON.stringify({ tags }), {
    headers: { "Content-Type": "application/json" },
  });
}
