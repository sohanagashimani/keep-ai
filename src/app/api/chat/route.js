import { headers, cookies } from "next/headers";
import { NextResponse } from "next/server";
import createSupabase from "../../../utils/CreateSupabase";
import { VertexAI } from "@google-cloud/vertexai";

export async function POST(request) {
  try {
    const supabase = createSupabase(headers, cookies);
    const { message } = await request.json();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: notes } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    const systemMessage = `
You are an AI assistant for a note-taking application. 
When you want to perform an action (create, update, delete, mark as completed, mark as uncompleted, or search notes), respond ONLY with a JSON object in this format:
{"action": "create_note", "title": "...", "content": "..."}
{"action": "update_note", "id": "...", "title": "...", "content": "..."}
{"action": "delete_note", "id": "..."}
{"action": "complete_note", "id": "..."}
{"action": "uncomplete_note", "id": "..."}
{"action": "search_notes", "query": "..."}
{"action": "delete_all_notes"}
Otherwise, just reply with a helpful message.
Here are the user's current notes:
${JSON.stringify(notes)}

Example: {"action": "search_notes", "query": "video"}
Example: {"action": "create_note", "title": "Buy milk", "content": "From the store"}
Example: {"action": "update_note", "id": "1", "title": "Buy milk", "content": "From the store"}
Example: {"action": "delete_note", "id": "1"}
Example: {"action": "complete_note", "id": "1"}
Example: {"action": "uncomplete_note", "id": "1"}
Example: {"action": "delete_all_notes"}
`;

    const { data: chatHistory } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true });

    const history = chatHistory
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    const prompt = `${systemMessage}\n${history}\nUser: ${message}\nAssistant:`;

    await supabase.from("chat_messages").insert({
      role: "user",
      content: message,
    });
    const credential = JSON.parse(
      Buffer.from(
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
        "base64"
      ).toString()
    );

    const vertex_ai = new VertexAI({
      project: process.env.PROJECT_ID,
      location: "us-central1",
      googleAuthOptions: {
        credentials: credential,
      },
    });

    const model = "gemini-2.0-flash-lite-001";

    const generativeModel = vertex_ai.preview.getGenerativeModel({
      model,
      generation_config: { max_output_tokens: 512 },
    });

    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let aiMessage = result.response.candidates[0].content.parts[0].text;
    let actionObj;
    try {
      const match = aiMessage.match(/{[\s\S]*}/);
      actionObj = match ? JSON.parse(match[0]) : JSON.parse(aiMessage);
    } catch (e) {
      actionObj = null;
    }

    let actionResult = null;
    if (actionObj && actionObj.action) {
      if (actionObj.action === "create_note") {
        const title = (actionObj.title || "").trim();
        if (!title || title.length > 50 || /^\s+$/.test(title)) {
          aiMessage = `Cannot create note: Invalid title.`;
        } else {
          const { error } = await supabase.from("notes").insert({
            title,
            content: actionObj.content || "",
            user_id: session.user.id,
            completed: false,
            lastModified: new Date().toISOString(),
            created_at: new Date().toISOString(),
          });
          aiMessage = error
            ? `Failed to create note: ${error.message}`
            : `Note created with title "${title}".`;
        }
      } else if (actionObj.action === "update_note") {
        const { id, title, content } = actionObj;
        if (!id) {
          aiMessage = `Cannot update note: Missing id.`;
        } else {
          const { error } = await supabase
            .from("notes")
            .update({
              title: title || undefined,
              content: content || undefined,
              lastModified: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", session.user.id);
          aiMessage = error
            ? `Failed to update note: ${error.message}`
            : `Note updated.`;
        }
      } else if (actionObj.action === "delete_note") {
        const { id } = actionObj;
        if (!id) {
          aiMessage = `Cannot delete note: Missing id.`;
        } else {
          const { error } = await supabase
            .from("notes")
            .delete()
            .eq("id", id)
            .eq("user_id", session.user.id);
          aiMessage = error
            ? `Failed to delete note: ${error.message}`
            : `Note deleted.`;
        }
      } else if (actionObj.action === "complete_note") {
        const { id } = actionObj;
        if (!id) {
          aiMessage = `Cannot complete note: Missing id.`;
        } else {
          const { error } = await supabase
            .from("notes")
            .update({ completed: true, lastModified: new Date().toISOString() })
            .eq("id", id)
            .eq("user_id", session.user.id);
          aiMessage = error
            ? `Failed to mark note as completed: ${error.message}`
            : `Note marked as completed.`;
        }
      } else if (actionObj.action === "uncomplete_note") {
        const { id } = actionObj;
        if (!id) {
          aiMessage = `Cannot uncomplete note: Missing id.`;
        } else {
          const { error } = await supabase
            .from("notes")
            .update({
              completed: false,
              lastModified: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", session.user.id);
          aiMessage = error
            ? `Failed to mark note as uncompleted: ${error.message}`
            : `Note marked as uncompleted.`;
        }
      } else if (actionObj.action === "search_notes") {
        const { query } = actionObj;
        if (!query) {
          aiMessage = `Cannot search notes: Missing query.`;
        } else {
          const { data: foundNotes, error } = await supabase
            .from("notes")
            .select("*")
            .ilike("title", `%${query}%`)
            .eq("user_id", session.user.id);
          if (error) {
            aiMessage = `Failed to search notes: ${error.message}`;
          } else if (!foundNotes || foundNotes.length === 0) {
            aiMessage = `No notes found containing "${query}".`;
          } else {
            aiMessage =
              `Found notes:\n` +
              foundNotes.map((n) => `- ${n.title}: ${n.content}`).join("\n");
          }
        }
      } else if (actionObj.action === "delete_all_notes") {
        const { error } = await supabase
          .from("notes")
          .delete()
          .eq("user_id", session.user.id);
        aiMessage = error
          ? `Failed to delete all notes: ${error.message}`
          : `All notes deleted.`;
      }
      actionResult = actionObj.action;
    }

    await supabase.from("chat_messages").insert({
      role: "assistant",
      content: aiMessage,
    });

    return NextResponse.json({ content: aiMessage, action: actionResult });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
        details: error,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = createSupabase(headers, cookies);

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }

  return NextResponse.json(messages);
}
