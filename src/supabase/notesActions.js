import { vertexClient } from "./vertexClient.js";
import Fuse from "fuse.js";

// --- Helper: Create Note ---
async function createNote(supabase, { title, content }) {
  title = (title || "").trim();
  if (!title || title.length > 50 || /^\s+$/.test(title)) {
    return { error: "Cannot create note: Invalid title." };
  }
  const { error } = await supabase.from("notes").insert({
    title,
    content: content || "",
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
  query,
  { limit = 10, isDeleted = false } = {}
) {
  if (!query) return { matches: [] };

  // Get all notes
  let { data: allNotes, error: allNotesErr } = await supabase
    .from("notes")
    .select("id, title, content")
    .eq("is_deleted", isDeleted);

  if (allNotesErr) {
    return { error: allNotesErr.message };
  }

  if (!allNotes) return { matches: [] };

  // Configure Fuse.js options
  const options = {
    keys: ["title"], // Search in title field
    threshold: 0.2, // Lower threshold means more strict matching
    distance: 100, // Maximum distance between characters
    includeScore: true, // Include match score in results
    minMatchCharLength: 2, // Minimum length of pattern that can be matched
    shouldSort: true, // Sort results by score
    findAllMatches: true, // Find all matches
    location: 0, // Start matching from the beginning
    ignoreLocation: false, // Don't ignore location
    useExtendedSearch: true, // Enable extended search features
  };

  // Create Fuse instance
  const fuse = new Fuse(allNotes, options);

  // Perform search
  const results = fuse.search(query);

  // Format results
  const matches = results.slice(0, limit).map(result => ({
    ...result.item,
    score: result.score,
  }));

  return {
    matches,
    type: matches.length > 0 ? "fuzzy" : "none",
  };
}

// --- Helper: Update Note ---
async function updateNote(supabase, { id, title, content }) {
  if (!id) return { error: "Missing note id." };
  const { error } = await supabase
    .from("notes")
    .update({
      title: title || undefined,
      content: content || undefined,
      lastModified: new Date().toISOString(),
    })
    .eq("id", id);
  return error
    ? { error: `Failed to update note: ${error.message}` }
    : { message: "Note updated." };
}

// --- Helper: Complete/Uncomplete Note ---
async function completeNote(supabase, { id, completed }) {
  if (!id) return { error: "Missing note id." };
  const { error } = await supabase
    .from("notes")
    .update({ completed, lastModified: new Date().toISOString() })
    .eq("id", id);

  return error
    ? {
        error: `Failed to mark note as ${
          completed ? "completed" : "uncompleted"
        }: ${error.message}`,
      }
    : { message: `Note marked as ${completed ? "completed" : "uncompleted"}.` };
}

// --- Helper: Delete All Notes ---
// async function deleteAllNotes(supabase) {
//   const { error } = await supabase.from("notes").update({
//     is_deleted: true,
//     lastModified: new Date().toISOString(),
//   });

//   return error
//     ? { error: `Failed to delete all notes: ${error.message}` }
//     : { message: "All notes deleted." };
// }

// --- Helper: Count Notes (enhanced with multiple counting options) ---
export async function countNotes(supabase, { match, status } = {}) {
  let query = supabase.from("notes").select("id", { count: "exact" });

  // Apply filters based on parameters
  if (match) {
    // Count by title (case-insensitive, trimmed)
    const normTitle = match.trim().toLowerCase();
    const { data, error } = await query;
    if (error || !data) return 0;
    return data.filter(
      note => (note.title || "").trim().toLowerCase() === normTitle
    ).length;
  }

  if (status === "completed") {
    query = query.eq("completed", true);
  } else if (status === "uncompleted") {
    query = query.eq("completed", false);
  }

  // Exclude deleted notes
  query = query.eq("is_deleted", false);

  const { count, error } = await query;
  if (error) return 0;
  return count || 0;
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

// --- Helper: List Completed Notes ---
async function listCompletedNotes(supabase) {
  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, title, content, completed, lastModified")
    .eq("completed", true)
    .eq("is_deleted", false)
    .order("lastModified", { ascending: false });

  if (error) {
    return { error: `Failed to fetch completed notes: ${error.message}` };
  }

  if (!notes || notes.length === 0) {
    return { message: "No completed notes found." };
  }

  return {
    message: `Completed notes:\n${notes
      .map((n, index) => `${index + 1}. ${n.title}`)
      .join("\n")}`,
    notes,
  };
}

// --- Main Handler ---
export async function handleNoteAction(supabase, actionObj, aiMessage) {
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
    const res = await createNote(supabase, actionObj);
    return { finalMessage: res.error || res.message, actionResult: action };
  } else if (action === "update_note") {
    if (actionObj.id) {
      const res = await updateNote(supabase, actionObj);
      return { finalMessage: res.error || res.message, actionResult: action };
    } else if (actionObj.match) {
      const search = await searchNotes(supabase, actionObj.match);
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
        const res = await updateNote(supabase, {
          ...actionObj,
          id: noteToUpdate.id,
        });
        return { finalMessage: res.error || res.message, actionResult: action };
      } else if (search.type === "fuzzy" && search.matches.length >= 1) {
        // Pick the closest fuzzy match automatically
        const noteToUpdate = search.matches[0];
        const res = await updateNote(supabase, {
          ...actionObj,
          id: noteToUpdate.id,
        });
        return { finalMessage: res.error || res.message, actionResult: action };
      } else if (search.matches.length === 1) {
        // Only one match (substring)
        const noteToUpdate = search.matches[0];
        const res = await updateNote(supabase, {
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
        .eq("id", actionObj.id);

      return {
        finalMessage: res.error || "Note deleted.",
        actionResult: action,
      };
    } else if (actionObj.match) {
      const search = await searchNotes(supabase, actionObj.match);
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
          .eq("id", noteToDelete.id);

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
      const res = await completeNote(supabase, {
        id: actionObj.id,
        completed,
      });
      return { finalMessage: res.error || res.message, actionResult: action };
    } else if (actionObj.match) {
      const search = await searchNotes(supabase, actionObj.match);
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
        const res = await completeNote(supabase, {
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
    const search = await searchNotes(supabase, actionObj.query);
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
        `Found notes:\n` + search.matches.map(n => `- ${n.title}`).join("\n"),
      actionResult: action,
    };
  } else if (action === "delete_all_notes") {
    return {
      finalMessage: "Sorry cant perform that action right now.",
      actionResult: null,
    };
  } else if (action === "count_notes") {
    const count = await countNotes(supabase, {
      match: actionObj.match,
      status: actionObj.status,
    });

    let message;
    if (actionObj.match) {
      message = `There ${count === 1 ? "is" : "are"} ${count} note${
        count === 1 ? "" : "s"
      } titled "${actionObj.match}".`;
    } else if (actionObj.status === "completed") {
      message = `You have ${count} completed note${count === 1 ? "" : "s"}.`;
    } else if (actionObj.status === "uncompleted") {
      message = `You have ${count} uncompleted note${count === 1 ? "" : "s"}.`;
    } else {
      message = `You have ${count} note${count === 1 ? "" : "s"} in total.`;
    }

    return {
      finalMessage: message,
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
      .select("id, title, content");

    if (error || !notes) {
      return {
        finalMessage: "Failed to search notes.",
        actionResult: null,
      };
    }
    const normMatch = actionObj.match.trim().toLowerCase();
    const found = notes.find(
      n => (n.title || "").trim().toLowerCase() === normMatch
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
    const search = await searchNotes(supabase, actionObj.match, {
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
  } else if (action === "list_completed_notes") {
    const res = await listCompletedNotes(supabase);
    return {
      finalMessage: res.error || res.message,
      actionResult: action,
    };
  }

  return { finalMessage: "Unknown action.", actionResult: null };
}
