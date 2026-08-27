const { PermissionsBitField, Attachment } = require("discord.js");

const VALID_EMOJI_NAME = /^[a-zA-Z0-9_]{2,32}$/;
const SUPPORTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];

module.exports = {
  name: "emoji",
  description: "Add an emoji from an attached image",
  async execute(message, args) {
    if (args[0] !== "add" || !args[1]) {
      return message.reply("Usage: `'emoji add (name)` — attach an image and provide a name.");
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
      return message.reply("You need the **Manage Emojis and Stickers** permission to use this command.");
    }

    const name = args[1];

    if (!VALID_EMOJI_NAME.test(name)) {
      return message.reply("Invalid emoji name. Use 2-32 characters: letters, numbers, and underscores only.");
    }

    const attachment = message.attachments.first();
    if (!attachment) {
      return message.reply("Attach an image to add as an emoji.");
    }

    if (!SUPPORTED_TYPES.includes(attachment.contentType)) {
      return message.reply("Unsupported file type. Use PNG, JPEG, GIF, or WebP images only.");
    }

    if (attachment.size > 256000) {
      return message.reply("Image is too large. Discord emoji images must be under 256 KB.");
    }

    try {
      const emoji = await message.guild.emojis.create({ attachment: attachment.url, name });
      message.reply(`Emoji added: ${emoji} (\`${name}\`)`);
    } catch (error) {
      console.error(error);
      message.reply("Failed to add the emoji. The server may have reached its emoji slot limit.");
    }
  },
};
