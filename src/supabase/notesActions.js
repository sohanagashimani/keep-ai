import { vertexClient } from "./vertexClient.js";

// --- Helper: Create Note ---
async function createNote(supabase, session, { title, content }) {
  title = (title || "").trim();
  if (!title || title.length > 50 || /^\s+$/.test(title)) {
    return { error: "Cannot create note: Invalid title." };
  }
  const { error } = await supabase.from("notes").insert({
    title,
    content: content || "",
    user_id: session.user.id,
    completed: false,
    lastModified: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });
  return error
    ? { error: `Failed to create note: ${error.message}` }
    : { message: `Note created with title "${title}".` };
}

// --- Helper: Search Notes (robust, Typesense-style) ---
async function searchNotes(
  supabase,
  session,
  query,
  { limit = 10, isDeleted = false } = {}
) {
  if (!query) return { matches: [] };

  // 1. Exact match (case-insensitive, title only)
  let { data: exact, error: exactErr } = await supabase
    .from("notes")
    .select("id, title, content")
    .eq("user_id", session.user.id)
    .eq("is_deleted", isDeleted)
    .or(`title.ilike.${query}`)
    .limit(limit);

  if (exactErr) {
    return { error: exactErr.message };
  }

  const normQuery = (query || "").trim().toLowerCase();

  if (exact && exact.length > 0) {
    const trueExact = exact.filter(
      (note) => (note.title || "").trim().toLowerCase() === normQuery
    );
    if (trueExact.length > 0) {
      return { matches: trueExact, type: "exact" };
    } else {
      return {
        matches: [],
        type: "exact",
      };
    }
  }

  // 2. Substring match (ilike with wildcards, title only)
  let { data: sub, error: subErr } = await supabase
    .from("notes")
    .select("id, title, content")
    .eq("user_id", session.user.id)
    .eq("is_deleted", isDeleted)
    .or(`title.ilike.%${query}%`)
    .limit(limit);

  if (subErr) {
    return { error: subErr.message };
  }

  if (sub && sub.length > 0) {
    // Filter out any exact matches that might have been missed
    const filteredSub = sub.filter(
      (note) => !exact?.some((e) => e.id === note.id)
    );
    return { matches: filteredSub, type: "substring" };
  }

  // 3. Fuzzy match (JS fallback, Levenshtein, title only)
  let { data: allNotes, error: allNotesErr } = await supabase
    .from("notes")
    .select("id, title, content")
    .eq("user_id", session.user.id)
    .eq("is_deleted", isDeleted);

  if (allNotesErr) {
    return { error: allNotesErr.message };
  }

  if (!allNotes) return { matches: [] };

  function levenshtein(a, b) {
    if (!a || !b) return Infinity;
    if (a === b) return 0;
    const matrix = Array.from({ length: a.length + 1 }, () => []);
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return matrix[a.length][b.length];
  }

  const fuzzy = allNotes
    .map((note) => ({
      ...note,
      distance: levenshtein(
        (note.title || "").toLowerCase(),
        query.toLowerCase()
      ),
    }))
    .filter((note) => note.distance <= 2)
    .sort((a, b) => a.distance - b.distance)
    .map(({ distance, ...note }) => note);

  if (fuzzy.length > 0) return { matches: fuzzy, type: "fuzzy" };
  return { matches: [] };
}

// --- Helper: Update Note ---
async function updateNote(supabase, session, { id, title, content }) {
  if (!id) return { error: "Missing note id." };
  const { error } = await supabase
    .from("notes")
    .update({
      title: title || undefined,
      content: content || undefined,
      lastModified: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", session.user.id);
  return error
    ? { error: `Failed to update note: ${error.message}` }
    : { message: "Note updated." };
}

// --- Helper: Delete Note ---
async function deleteNote(supabase, session, { id }) {
  if (!id) return { error: "Missing note id." };
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);
  return error
    ? { error: `Failed to delete note: ${error.message}` }
    : { message: "Note deleted." };
}

// --- Helper: Complete/Uncomplete Note ---
async function completeNote(supabase, session, { id, completed }) {
  if (!id) return { error: "Missing note id." };
  const { error } = await supabase
    .from("notes")
    .update({ completed, lastModified: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", session.user.id);
  return error
    ? {
        error: `Failed to mark note as ${
          completed ? "completed" : "uncompleted"
        }: ${error.message}`,
      }
    : { message: `Note marked as ${completed ? "completed" : "uncompleted"}.` };
}

// --- Helper: Delete All Notes ---
async function deleteAllNotes(supabase, session) {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("user_id", session.user.id);
  return error
    ? { error: `Failed to delete all notes: ${error.message}` }
    : { message: "All notes deleted." };
}

// --- Helper: Count Notes by Title (case-insensitive, trimmed) ---
export async function countNotesByTitle(supabase, session, title) {
  if (!title) return 0;
  const normTitle = title.trim().toLowerCase();
  const { data, error } = await supabase
    .from("notes")
    .select("id, title")
    .eq("user_id", session.user.id);

  if (error || !data) return 0;

  return data.filter(
    (note) => (note.title || "").trim().toLowerCase() === normTitle
  ).length;
}

// --- Helper: Ask Note (LLM Q&A over note content) ---
export async function askNoteLLM(noteContent, question) {
  const prompt = `Here is a note:\n\n${noteContent}\n\nUser question: ${question}\n\nAnswer:`;
  const vertexAi = vertexClient();
  const model = vertexAi.getGenerativeModel({
    model: "gemini-2.0-flash-lite-001",
  });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  return result.response.candidates[0].content.parts[0].text.trim();
}

// --- Main Handler ---
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

  const { action } = actionObj;

  // Handle choose_note first if it's a selection
  if (
    action === "choose_note" &&
    actionObj.options &&
    actionObj.originalAction
  ) {
    const userInput = (aiMessage || "").trim();
    const selected = parseInt(userInput, 10);

    if (
      !isNaN(selected) &&
      selected > 0 &&
      selected <= actionObj.options.length
    ) {
      const note = actionObj.options[selected - 1];
      // Call handleNoteAction recursively with the original action, but with id set
      return await handleNoteAction(
        supabase,
        session,
        { ...actionObj.originalAction, id: note.id },
        aiMessage
      );
    } else {
      return {
        finalMessage: `Please reply with a valid number from the list.`,
        actionResult: null,
      };
    }
  }

  // Handle other actions
  if (action === "create_note") {
    const res = await createNote(supabase, session, actionObj);
    return { finalMessage: res.error || res.message, actionResult: action };
  } else if (action === "update_note") {
    if (actionObj.id) {
      const res = await updateNote(supabase, session, actionObj);
      return { finalMessage: res.error || res.message, actionResult: action };
    } else if (actionObj.match) {
      const search = await searchNotes(supabase, session, actionObj.match);
      if (search.error)
        return {
          finalMessage: `Failed to find notes: ${search.error}`,
          actionResult: null,
        };
      if (search.matches.length === 0) {
        return {
          finalMessage: `No matching notes found to update.`,
          actionResult: null,
        };
      } else if (search.type === "exact" && search.matches.length >= 1) {
        // Pick the first exact match automatically
        const noteToUpdate = search.matches[0];
        const res = await updateNote(supabase, session, {
          ...actionObj,
          id: noteToUpdate.id,
        });
        return { finalMessage: res.error || res.message, actionResult: action };
      } else if (search.type === "fuzzy" && search.matches.length >= 1) {
        // Pick the closest fuzzy match automatically
        const noteToUpdate = search.matches[0];
        const res = await updateNote(supabase, session, {
          ...actionObj,
          id: noteToUpdate.id,
        });
        return { finalMessage: res.error || res.message, actionResult: action };
      } else if (search.matches.length === 1) {
        // Only one match (substring)
        const noteToUpdate = search.matches[0];
        const res = await updateNote(supabase, session, {
          ...actionObj,
          id: noteToUpdate.id,
        });
        return { finalMessage: res.error || res.message, actionResult: action };
      } else {
        // No matches at all
        return {
          finalMessage: `No matching notes found to update.`,
          actionResult: null,
        };
      }
    } else {
      return {
        finalMessage: "Cannot update note: Missing match text.",
        actionResult: null,
      };
    }
  } else if (action === "delete_note") {
    if (actionObj.id) {
      const res = await supabase
        .from("notes")
        .update({
          is_deleted: true,
          lastModified: new Date().toISOString(),
        })
        .eq("id", actionObj.id)
        .eq("user_id", session.user.id);
      return {
        finalMessage: res.error || "Note deleted.",
        actionResult: action,
      };
    } else if (actionObj.match) {
      const search = await searchNotes(supabase, session, actionObj.match);
      if (search.error)
        return {
          finalMessage: `Failed to find notes: ${search.error}`,
          actionResult: null,
        };
      if (search.matches.length === 0) {
        return {
          finalMessage: `No matching notes found to delete.`,
          actionResult: null,
        };
      } else if (search.matches.length === 1) {
        const noteToDelete = search.matches[0];
        const res = await supabase
          .from("notes")
          .update({
            is_deleted: true,
            lastModified: new Date().toISOString(),
          })
          .eq("id", noteToDelete.id)
          .eq("user_id", session.user.id);
        return {
          finalMessage: res.error || "Note deleted.",
          actionResult: action,
        };
      } else {
        finalMessage =
          `Multiple notes match your request:\n` +
          search.matches.map((n, i) => `${i + 1}. ${n.title}`).join("\n") +
          `\nPlease clarify which note you want to delete.`;
        actionResult = {
          action: "choose_note",
          options: search.matches.map((n, i) => ({
            number: i + 1,
            id: n.id,
            title: n.title,
          })),
          originalAction: { ...actionObj, match: undefined },
        };
        return { finalMessage, actionResult };
      }
    } else {
      return {
        finalMessage: "Cannot delete note: Missing id or match text.",
        actionResult: null,
      };
    }
  } else if (action === "complete_note" || action === "uncomplete_note") {
    const completed = action === "complete_note";
    if (actionObj.id) {
      const res = await completeNote(supabase, session, {
        id: actionObj.id,
        completed,
      });
      return { finalMessage: res.error || res.message, actionResult: action };
    } else if (actionObj.match) {
      const search = await searchNotes(supabase, session, actionObj.match);
      if (search.error)
        return {
          finalMessage: `Failed to find notes: ${search.error}`,
          actionResult: null,
        };
      if (search.matches.length === 0) {
        return {
          finalMessage: `No matching notes found to ${
            completed ? "complete" : "uncomplete"
          }.`,
          actionResult: null,
        };
      } else if (search.matches.length === 1) {
        const noteToUpdate = search.matches[0];
        const res = await completeNote(supabase, session, {
          id: noteToUpdate.id,
          completed,
        });
        return { finalMessage: res.error || res.message, actionResult: action };
      } else {
        finalMessage =
          `Multiple notes match your request:\n` +
          search.matches.map((n, i) => `${i + 1}. ${n.title}`).join("\n") +
          `\nPlease clarify which note you want to ${
            completed ? "complete" : "uncomplete"
          }.`;
        actionResult = {
          action: "choose_note",
          options: search.matches.map((n, i) => ({
            number: i + 1,
            id: n.id,
            title: n.title,
          })),
          originalAction: { ...actionObj, match: undefined },
        };
        return { finalMessage, actionResult };
      }
    } else {
      return {
        finalMessage: `Cannot ${
          completed ? "complete" : "uncomplete"
        } note: Missing id or match text.`,
        actionResult: null,
      };
    }
  } else if (action === "search_notes") {
    const search = await searchNotes(supabase, session, actionObj.query);
    if (search.error)
      return {
        finalMessage: `Failed to search notes: ${search.error}`,
        actionResult: null,
      };
    if (!search.matches.length)
      return {
        finalMessage: `No notes found containing "${actionObj.query}".`,
        actionResult: null,
      };
    return {
      finalMessage:
        `Found notes:\n` + search.matches.map((n) => `- ${n.title}`).join("\n"),
      actionResult: action,
    };
  } else if (action === "delete_all_notes") {
    if (!actionObj.confirm) {
      return {
        finalMessage: `Are you sure you want to delete all notes? Please confirm by saying 'yes, delete all'.`,
        actionResult: null,
      };
    }
    const res = await deleteAllNotes(supabase, session);
    return { finalMessage: res.error || res.message, actionResult: action };
  } else if (action === "count_notes") {
    if (!actionObj.match) {
      return {
        finalMessage: "Please specify the note title to count.",
        actionResult: null,
      };
    }
    const count = await countNotesByTitle(supabase, session, actionObj.match);
    return {
      finalMessage: `There ${count === 1 ? "is" : "are"} ${count} note${
        count === 1 ? "" : "s"
      } titled "${actionObj.match}".
`,
      actionResult: action,
    };
  } else if (action === "ask_note") {
    if (!actionObj.match || !actionObj.question) {
      return {
        finalMessage: "Please specify the note title and your question.",
        actionResult: null,
      };
    }
    // Find the note by title (case-insensitive, trimmed)
    const { data: notes, error } = await supabase
      .from("notes")
      .select("id, title, content")
      .eq("user_id", session.user.id);
    if (error || !notes) {
      return {
        finalMessage: "Failed to search notes.",
        actionResult: null,
      };
    }
    const normMatch = actionObj.match.trim().toLowerCase();
    const found = notes.find(
      (n) => (n.title || "").trim().toLowerCase() === normMatch
    );
    if (!found) {
      return {
        finalMessage: `No note found titled "${actionObj.match}".`,
        actionResult: null,
      };
    }
    // Call LLM (or placeholder) with note content and question
    const answer = await askNoteLLM(found.content, actionObj.question);
    return {
      finalMessage: answer,
      actionResult: action,
    };
  } else if (action === "restore_last_deleted_note") {
    // Find the most recently deleted note
    const { data: deletedNote, error } = await supabase
      .from("notes")
      .select("id, title, content")
      .eq("user_id", session.user.id)
      .eq("is_deleted", true)
      .order("lastModified", { ascending: false })
      .limit(1)
      .single();
    if (error || !deletedNote) {
      return {
        finalMessage: "No deleted notes found to restore.",
        actionResult: null,
      };
    }

    // Restore the note
    const res = await supabase
      .from("notes")
      .update({
        is_deleted: false,
        lastModified: new Date().toISOString(),
      })
      .eq("id", deletedNote.id);

    return {
      finalMessage: res.error || `Note "${deletedNote.title}" restored.`,
      actionResult: action,
    };
  } else if (action === "restore_note_from_notes_table") {
    if (!actionObj.match) {
      return {
        finalMessage: "Please specify the note title to restore.",
        actionResult: null,
      };
    }
    // Search for deleted notes using the existing searchNotes function
    const search = await searchNotes(supabase, session, actionObj.match, {
      isDeleted: true,
    });
    if (search.error) {
      return {
        finalMessage: `Failed to search notes: ${search.error}`,
        actionResult: null,
      };
    }
    if (search.matches.length === 0) {
      return {
        finalMessage: `No deleted notes found matching "${actionObj.match}".`,
        actionResult: null,
      };
    } else if (search.matches.length === 1) {
      const noteToRestore = search.matches[0];
      const res = await supabase
        .from("notes")
        .update({
          is_deleted: false,
          lastModified: new Date().toISOString(),
        })
        .eq("id", noteToRestore.id);
      return {
        finalMessage: res.error || `Note "${noteToRestore.title}" restored.`,
        actionResult: action,
      };
    } else {
      // Multiple matches - let user choose
      finalMessage =
        `Multiple deleted notes match your request:\n` +
        search.matches.map((n, i) => `${i + 1}. ${n.title}`).join("\n") +
        `\nPlease clarify which note you want to restore.`;
      actionResult = {
        action: "choose_note",
        options: search.matches.map((n, i) => ({
          number: i + 1,
          id: n.id,
          title: n.title,
        })),
        originalAction: { ...actionObj, match: undefined },
      };
      return { finalMessage, actionResult };
    }
  }

  return { finalMessage: "Unknown action.", actionResult: null };
}
