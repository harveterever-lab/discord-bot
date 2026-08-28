const { SlashCommandBuilder } = require("discord.js");

function getDeathMessage(ping) {
  if (ping < 80) return `I'm not dying \u{1F480} I'm at ${ping}ms.`;
  if (ping < 150) return `I'm starting to feel it... ${ping}ms.`;
  if (ping < 250) return `I'm dying \u{1F480} I'm at ${ping}ms.`;
  return `HELP I'M ACTUALLY DYING \u{1F480} ${ping}ms.`;
}

module.exports = {
  name: "death",
  data: new SlashCommandBuilder()
    .setName("death")
    .setDescription("Am I dying?"),
  async execute(interaction) {
    const response = await interaction.reply({ content: "Pinging...", withResponse: true });
    const ping = response.resource.message.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(getDeathMessage(ping));
  },
};
