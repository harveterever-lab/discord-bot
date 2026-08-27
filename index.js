require("dotenv").config();

const { Client, GatewayIntentBits, Collection, Events, Partials } = require("discord.js");
const fs = require("fs");
const path = require("path");

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

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
  c.application.commands.set(client.slashCommands.map((cmd) => cmd.data)).catch(console.error);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;

  const prefix = "'";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) {
    return message.reply(`Unknown command \`${prefix}${commandName}\`. Type \`/help\` to see what I can do.`);
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("Something went wrong while running that command. Please try again.");
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

client.login(process.env.DISCORD_BOT_TOKEN);
