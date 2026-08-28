require("dotenv").config();

const { Client, GatewayIntentBits, Collection, Events, Partials, ActivityType, Status } = require("discord.js");
const fs = require("fs");
const path = require("path");
const afkManager = require("./utils/afkManager");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.slashCommands = new Collection();

const prefixCommandsPath = path.join(__dirname, "commands", "prefix");
const slashCommandsPath = path.join(__dirname, "commands", "slash");

function loadCommandsFromDir(dir, collection) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".js"))) {
    const filePath = path.join(dir, file);
    const command = require(filePath);
    if (command.name) collection.set(command.name, command);
  }
}

loadCommandsFromDir(prefixCommandsPath, client.commands);
loadCommandsFromDir(slashCommandsPath, client.slashCommands);

const ACTIVITIES = ["/help", "your server", "with commands"];
let activityInterval = null;

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
  c.application.commands.set(client.slashCommands.map((cmd) => cmd.data)).catch(console.error);

  c.user.setPresence({ status: Status.DoNotDisturb, activities: [{ name: ACTIVITIES[0], type: ActivityType.Playing }] });

  if (activityInterval) clearInterval(activityInterval);
  let index = 0;
  activityInterval = setInterval(() => {
    index = (index + 1) % ACTIVITIES.length;
    c.user.setPresence({
      status: Status.DoNotDisturb,
      activities: [{ name: ACTIVITIES[index], type: ActivityType.Playing }],
    });
  }, 30000);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefix = "'";

  const isPrefixMessage = message.content.startsWith(prefix);
  const commandName = isPrefixMessage ? message.content.slice(prefix.length).trim().split(/\s+/)[0]?.toLowerCase() : null;
  const isAfkCommand = commandName === "afk";

  if (afkManager.isReady() && !isAfkCommand) {
    const afkStatus = await afkManager.getAfk(message.guild.id, message.author.id);
    if (afkStatus) {
      await afkManager.removeAfk(message.guild.id, message.author.id);
      message.reply("\u00ab\u{1F44B} Welcome back! Your AFK status has been removed.\u00bb").catch(console.error);
    }
  }

  if (isPrefixMessage) {
    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    args.shift();

    const command = client.commands.get(commandName);
    if (command) {
      try {
        await command.execute(message, args);
      } catch (error) {
        console.error(error);
        message.reply("Something went wrong while running that command. Please try again.");
      }
      return;
    }

    return message.reply(`Unknown command \`${prefix}${commandName}\`. Type \`/help\` to see what I can do.`);
  }

  if (afkManager.isReady() && message.mentions.users.size > 0) {
    const mentionedIds = [...message.mentions.users.keys()].filter((id) => id !== message.author.id);
    if (mentionedIds.length > 0) {
      const afkUsers = await afkManager.getAfkUsers(message.guild.id, mentionedIds);
      for (const afkUser of afkUsers) {
        const discordUser = message.mentions.users.get(afkUser.user_id);
        if (!discordUser) continue;
        const displayName = discordUser.displayName || discordUser.username;
        const duration = afkManager.formatDuration(Date.now() - new Date(afkUser.created_at).getTime());
        let response = `\u00ab\u{1F4A4} ${displayName} is AFK`;
        if (afkUser.reason) {
          response += `\nReason: ${afkUser.reason}`;
        }
        response += `\nAFK for: ${duration}\u00bb`;
        message.reply(response).catch(console.error);
      }
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const payload = { content: "Something went wrong while running that command. Please try again.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.on(Events.GuildMemberRemove, async (member) => {
  if (afkManager.isReady()) {
    await afkManager.removeAfk(member.guild.id, member.id);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
