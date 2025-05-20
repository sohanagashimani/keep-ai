import { headers, cookies } from "next/headers";
import { NextResponse } from "next/server";
import createSupabase from "../../../utils/CreateSupabase";
import { estimateTokens } from "../../../utils/tokens";
import { checkUserLimits, incrementUserUsage } from "../../../supabase/aiUsage";
import { handleNoteAction } from "../../../supabase/notesActions";
import systemMessage from "@/supabase/prompt";
import { vertexClient } from "@/supabase/vertexClient";

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
    // --- DAILY USAGE LIMIT LOGIC ---
    const today = new Date().toISOString().slice(0, 10);
    const DAILY_LIMIT = 50; // message limit
    const DAILY_TOKEN_LIMIT = 10000; // token limit

    const isUnlimited = session.user.app_metadata?.unlimited === true;
    if (!isUnlimited) {
      const { allowed, error: limitError } = await checkUserLimits(
        supabase,
        session.user.id,
        today,
        DAILY_LIMIT,
        DAILY_TOKEN_LIMIT
      );

      if (!allowed) {
        return NextResponse.json({ error: limitError }, { status: 429 });
      }
    }
    // --- END USAGE LIMIT LOGIC ---

    const { data: notes } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: chatHistory } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true });

    const history = chatHistory
      .map(
        msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    const prompt = `${systemMessage(
      notes
    )}\n${history}\nUser: ${message}\nAssistant:`;

    await supabase.from("chat_messages").insert({
      role: "user",
      content: message,
    });

    const vertexAi = vertexClient();

    const generativeModel = vertexAi.preview.getGenerativeModel({
      model: "gemini-2.0-flash-lite-001",
      generation_config: { max_output_tokens: 512 },
    });

    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let aiMessage = result.response.candidates[0].content.parts[0].text;
    let actionObj;
    try {
      // Clean the message by removing markdown code blocks and extra whitespace
      const cleanMessage = aiMessage
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // Try to parse as array first
      const arrayMatch = cleanMessage.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        actionObj = JSON.parse(arrayMatch[0]);
      } else {
        // Try to parse as single object
        const objectMatch = cleanMessage.match(/{[\s\S]*}/);
        if (objectMatch) {
          actionObj = JSON.parse(objectMatch[0]);
        } else {
          actionObj = null;
        }
      }
    } catch (e) {
      actionObj = null;
    }

    const { finalMessage, actionResult } = await handleNoteAction(
      supabase,
      actionObj,
      aiMessage
    );

    await supabase.from("chat_messages").insert({
      role: "assistant",
      content: finalMessage,
    });

    // --- INCREMENT USAGE ---
    const promptTokens = estimateTokens(prompt);
    const responseTokens = estimateTokens(finalMessage);
    const totalTokens = promptTokens + responseTokens;

    await incrementUserUsage(supabase, session.user.id, today, totalTokens);
    // --- END INCREMENT USAGE ---

    return NextResponse.json({ content: finalMessage, action: actionResult });
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
