const fs = require("fs");
const path = require("path");

const AFK_FILE_PATH = process.env.AFK_FILE_PATH || path.join(__dirname, "..", "afk_data.json");

let afkData = {};
let writeLock = Promise.resolve();

function loadAfkData() {
  try {
    if (fs.existsSync(AFK_FILE_PATH)) {
      const raw = fs.readFileSync(AFK_FILE_PATH, "utf8");
      afkData = JSON.parse(raw);
    } else {
      afkData = {};
    }
  } catch (error) {
    console.error("[AFK] Failed to load AFK data file, starting fresh:", error);
    afkData = {};
  }
}

function persistAfkData() {
  writeLock = writeLock
    .then(() => {
      const dir = path.dirname(AFK_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(AFK_FILE_PATH, JSON.stringify(afkData, null, 2), "utf8");
    })
    .catch((error) => {
      console.error("[AFK] Failed to persist AFK data file:", error);
    });
  return writeLock;
}

loadAfkData();

function isReady() {
  return true;
}

function getKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

async function setAfk(guildId, userId, reason) {
  try {
    const key = getKey(guildId, userId);
    const record = {
      guild_id: guildId,
      user_id: userId,
      reason: reason || null,
      created_at: new Date().toISOString(),
    };
    afkData[key] = record;
    await persistAfkData();
    return record;
  } catch (error) {
    console.error("[AFK] Error setting AFK:", error);
    return null;
  }
}

async function getAfk(guildId, userId) {
  try {
    const key = getKey(guildId, userId);
    return afkData[key] || null;
  } catch (error) {
    console.error("[AFK] Error getting AFK:", error);
    return null;
  }
}

async function removeAfk(guildId, userId) {
  try {
    const key = getKey(guildId, userId);
    if (afkData[key]) {
      delete afkData[key];
      await persistAfkData();
    }
    return true;
  } catch (error) {
    console.error("[AFK] Error removing AFK:", error);
    return false;
  }
}

async function getAfkUsers(guildId, userIds) {
  if (!userIds.length) return [];
  try {
    const results = [];
    for (const userId of userIds) {
      const key = getKey(guildId, userId);
      if (afkData[key]) {
        results.push(afkData[key]);
      }
    }
    return results;
  } catch (error) {
    console.error("[AFK] Error getting AFK users:", error);
    return [];
  }
}

async function removeAfkByUser(userId) {
  try {
    let changed = false;
    for (const key of Object.keys(afkData)) {
      if (afkData[key].user_id === userId) {
        delete afkData[key];
        changed = true;
      }
    }
    if (changed) await persistAfkData();
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

module.exports = { setAfk, getAfk, removeAfk, getAfkUsers, removeAfkByUser, formatDuration, isReady };
