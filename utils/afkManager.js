const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.warn("[AFK] Supabase credentials not found in environment. AFK feature will be disabled.");
  }
} catch (error) {
  console.error("[AFK] Failed to initialize Supabase client:", error);
}

async function setAfk(guildId, userId, reason) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("afk_statuses")
      .upsert(
        { guild_id: guildId, user_id: userId, reason: reason || null, created_at: new Date().toISOString() },
        { onConflict: "guild_id,user_id" }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[AFK] Error setting AFK:", error);
    return null;
  }
}

async function getAfk(guildId, userId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("afk_statuses")
      .select("reason, created_at")
      .eq("guild_id", guildId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("[AFK] Error getting AFK:", error);
    return null;
  }
}

async function removeAfk(guildId, userId) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("afk_statuses")
      .delete()
      .eq("guild_id", guildId)
      .eq("user_id", userId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[AFK] Error removing AFK:", error);
    return false;
  }
}

async function getAfkUsers(guildId, userIds) {
  if (!supabase || !userIds.length) return [];
  try {
    const { data, error } = await supabase
      .from("afk_statuses")
      .select("user_id, reason, created_at")
      .eq("guild_id", guildId)
      .in("user_id", userIds);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("[AFK] Error getting AFK users:", error);
    return [];
  }
}

async function removeAfkByUser(userId) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("afk_statuses")
      .delete()
      .eq("user_id", userId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[AFK] Error removing AFK by user:", error);
    return false;
  }
}

function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  if (secs > 0 && days === 0 && hours === 0 && minutes === 0) parts.push(`${secs} second${secs !== 1 ? "s" : ""}`);

  if (parts.length === 0) return "0 seconds";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts.join(", ");
  return parts.slice(0, 2).join(", ");
}

module.exports = { setAfk, getAfk, removeAfk, getAfkUsers, removeAfkByUser, formatDuration, isReady: () => !!supabase };
