import { headers, cookies } from "next/headers";
import { NextResponse } from "next/server";
import createSupabase from "../../../utils/CreateSupabase";

export async function GET() {
  const supabase = createSupabase(headers, cookies);

  const { data, error } = await supabase.from("notes").select("*");
  if (error) {
    return NextResponse.error("Failed to fetch notes", { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = createSupabase(headers, cookies);
  const newNote = await request.json();
  const { data, error } = await supabase.from("notes").insert(newNote);

  if (error) {
    return NextResponse.error("Failed to add note", { status: 500 });
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
    return NextResponse.error("Failed to update note", { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
