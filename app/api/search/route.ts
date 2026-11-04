import { NextResponse, type NextRequest } from "next/server";
import { getSearchSuggestions } from "@/lib/products";

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 80);
  const suggestions = await getSearchSuggestions(q);
  return NextResponse.json({ suggestions });
}
