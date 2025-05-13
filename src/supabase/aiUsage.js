export async function checkUserLimits(
  supabase,
  userId,
  today,
  messageLimit,
  tokenLimit
) {
  const { data: usage, error } = await supabase
    .from("ai_usage")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();
  if (error && error.code !== "PGRST116") {
    return { allowed: false, usage: null, error };
  }
  if (usage && usage.message_count >= messageLimit) {
    return {
      allowed: false,
      usage,
      error: "Daily AI chat message limit reached.",
    };
  }
  if (usage && usage.token_count >= tokenLimit) {
    return {
      allowed: false,
      usage,
      error: "Daily AI chat token limit reached.",
    };
  }
  return { allowed: true, usage, error: null };
}

export async function incrementUserUsage(supabase, userId, today, tokens) {
  const { data: usage } = await supabase
    .from("ai_usage")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();
  if (usage) {
    await supabase
      .from("ai_usage")
      .update({
        message_count: usage.message_count + 1,
        token_count: usage.token_count + tokens,
      })
      .eq("id", usage.id);
  } else {
    await supabase.from("ai_usage").insert({
      user_id: userId,
      date: today,
      message_count: 1,
      token_count: tokens,
    });
  }
}
