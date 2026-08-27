const { SlashCommandBuilder } = require("discord.js");

function getDeathMessage(ping) {
  if (ping < 80) return `I'm not dying 💀 I'm at ${ping}ms.`;
  if (ping < 150) return `I'm starting to feel it... ${ping}ms.`;
  if (ping < 250) return `I'm dying 💀 I'm at ${ping}ms.`;
  return `HELP I'M ACTUALLY DYING 💀 ${ping}ms.`;
}

module.exports = {
  name: "death",
  data: new SlashCommandBuilder()
    .setName("death")
    .setDescription("Check the bot's latency and get a funny status message"),
  async execute(interaction) {
    const sent = await interaction.reply({ content: "Pinging...", fetchReply: true });
    const ping = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(getDeathMessage(ping));
  },
};
