const afkManager = require("../../utils/afkManager");

module.exports = {
  name: "afk",
  description: "Set your AFK status with an optional reason",
  async execute(message, args) {
    if (!afkManager.isReady()) {
      return message.reply("AFK feature is currently unavailable. Please try again later.");
    }

    const guildId = message.guild.id;
    const userId = message.author.id;
    const reason = args.length > 0 ? args.join(" ").trim() : null;

    const result = await afkManager.setAfk(guildId, userId, reason);

    if (!result) {
      return message.reply("Something went wrong while setting your AFK status. Please try again.");
    }

    if (reason) {
      return message.reply(`\u00ab\u{1F4A4} You are now AFK: ${reason}\u00bb`);
    }
    return message.reply("\u00ab\u{1F4A4} You are now AFK.\u00bb");
  },
};
