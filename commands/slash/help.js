const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available commands and how to use them"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Bot Commands")
      .setColor(0x5865f2)
      .addFields(
        {
          name: "Prefix Commands  ('  )",
          value: [
            "**'emoji add (name)**",
            "Add an emoji from an attached image. Requires *Manage Emojis* permission.",
            "",
            "**'sticker add (name)**",
            "Add a sticker from an attached image. Requires *Manage Stickers* permission.",
          ].join("\n"),
        },
        {
          name: "Slash Commands  (/)",
          value: [
            "**/help**",
            "Show this help message.",
            "",
            "**/death**",
            "Check the bot's latency and get a funny status message.",
          ].join("\n"),
        }
      )
      .setFooter({ text: "Tip: attach an image when using 'emoji add or 'sticker add" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
