const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require("discord.js");

const CATEGORIES = {
  General: {
    description: "General commands",
    color: 0x5865f2,
    commands: [
      { name: "/help", description: "Show all commands" },
      { name: "/death", description: "Check bot latency" },
      { name: "'afk", description: "Set your AFK status" },
    ],
  },
  Expressions: {
    description: "Emoji & sticker management",
    color: 0x57f287,
    commands: [
      { name: "'emoji add", description: "Add an emoji" },
      { name: "'sticker add", description: "Add a sticker" },
    ],
  },
};

module.exports = {
  name: "help",
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available commands and how to use them"),
  async execute(interaction) {
    const categoryNames = Object.keys(CATEGORIES);
    const buildEmbed = (categoryName) => {
      const cat = CATEGORIES[categoryName];
      const embed = new EmbedBuilder()
        .setTitle("Bot Commands")
        .setColor(cat.color)
        .setDescription(`**${categoryName}** — ${cat.description}`)
        .addFields(
          cat.commands.map((cmd) => ({
            name: cmd.name,
            value: cmd.description,
            inline: false,
          }))
        )
        .setFooter({ text: "Select a category from the menu below" })
        .setTimestamp();
      return embed;
    };

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("help-category")
      .setPlaceholder("Select a category")
      .addOptions(
        categoryNames.map((name) => ({
          label: name,
          description: CATEGORIES[name].description,
          value: name,
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const response = await interaction.reply({
      embeds: [buildEmbed(categoryNames[0])],
      components: [row],
      withResponse: true,
    });

    const message = response.resource.message;

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
    });

    collector.on("collect", async (selectInteraction) => {
      const selected = selectInteraction.values[0];
      await selectInteraction.update({ embeds: [buildEmbed(selected)] });
    });

    collector.on("end", async () => {
      try {
        await message.edit({ components: [] });
      } catch {}
    });
  },
};
