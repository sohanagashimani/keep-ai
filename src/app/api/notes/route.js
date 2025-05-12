import { headers, cookies } from "next/headers";
import { NextResponse } from "next/server";
import createSupabase from "../../../utils/CreateSupabase";

export async function GET(request) {
  const supabase = createSupabase(headers, cookies);
  const length = parseInt(request.nextUrl.searchParams.get("length"));
  const pageSize = parseInt(request.nextUrl.searchParams.get("pageSize"));
  const start = length * pageSize;
  const end = start + pageSize - 1;

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false })
    .range(start, end);
  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = createSupabase(headers, cookies);
  const newNote = await request.json();
  const { data, error } = await supabase.from("notes").insert(newNote);

  if (error) {
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function PUT(request) {
  const supabase = createSupabase(headers, cookies);

  const noteData = await request.json();
  const { data, error } = await supabase
    .from("notes")
    .update(noteData)
    .eq("id", noteData.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
