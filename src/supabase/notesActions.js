export async function handleNoteAction(
  supabase,
  session,
  actionObj,
  aiMessage
) {
  let actionResult = null;
  let finalMessage = aiMessage;
  // If no action object or invalid JSON, return the original message
  if (!actionObj || !actionObj.action) {
    return { finalMessage: finalMessage || "", actionResult: null };
  }

  if (actionObj.action === "create_note") {
    const title = (actionObj.title || "").trim();
    if (!title || title.length > 50 || /^\s+$/.test(title)) {
      finalMessage = `Cannot create note: Invalid title.`;
    } else {
      const { error } = await supabase.from("notes").insert({
        title,
        content: actionObj.content || "",
        user_id: session.user.id,
        completed: false,
        lastModified: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
      finalMessage = error
        ? `Failed to create note: ${error.message}`
        : `Note created with title "${title}".`;
    }
  } else if (actionObj.action === "update_note") {
    const { id, title, content } = actionObj;
    if (!id) {
      finalMessage = `Cannot update note: Missing id.`;
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
      finalMessage = error
        ? `Failed to update note: ${error.message}`
        : `Note updated.`;
    }
  } else if (actionObj.action === "delete_note") {
    const { id } = actionObj;
    if (!id) {
      finalMessage = `Cannot delete note: Missing id.`;
    } else {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id)
        .eq("user_id", session.user.id);
      finalMessage = error
        ? `Failed to delete note: ${error.message}`
        : `Note deleted.`;
    }
  } else if (actionObj.action === "complete_note") {
    const { id } = actionObj;
    if (!id) {
      finalMessage = `Cannot complete note: Missing id.`;
    } else {
      const { error } = await supabase
        .from("notes")
        .update({ completed: true, lastModified: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", session.user.id);
      finalMessage = error
        ? `Failed to mark note as completed: ${error.message}`
        : `Note marked as completed.`;
    }
  } else if (actionObj.action === "uncomplete_note") {
    const { id } = actionObj;
    if (!id) {
      finalMessage = `Cannot uncomplete note: Missing id.`;
    } else {
      const { error } = await supabase
        .from("notes")
        .update({
          completed: false,
          lastModified: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", session.user.id);
      finalMessage = error
        ? `Failed to mark note as uncompleted: ${error.message}`
        : `Note marked as uncompleted.`;
    }
  } else if (actionObj.action === "search_notes") {
    const { query } = actionObj;
    if (!query) {
      finalMessage = `Cannot search notes: Missing query.`;
    } else {
      const { data: foundNotes, error } = await supabase
        .from("notes")
        .select("*")
        .ilike("title", `%${query}%`)
        .eq("user_id", session.user.id);
      if (error) {
        finalMessage = `Failed to search notes: ${error.message}`;
      } else if (!foundNotes || foundNotes.length === 0) {
        finalMessage = `No notes found containing "${query}".`;
      } else {
        finalMessage =
          `Found notes:\n` +
          foundNotes.map((n) => `- ${n.title}: ${n.content}`).join("\n");
      }
    }
  } else if (actionObj.action === "delete_all_notes") {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("user_id", session.user.id);
    finalMessage = error
      ? `Failed to delete all notes: ${error.message}`
      : `All notes deleted.`;
  }
  actionResult = actionObj.action;
  return { finalMessage, actionResult };
}
