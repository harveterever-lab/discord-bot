const { PermissionsBitField } = require("discord.js");

const VALID_STICKER_NAME = /^[a-zA-Z0-9_]{2,30}$/;
const SUPPORTED_TYPES = ["image/png", "image/apng", "image/gif", "image/webp"];

module.exports = {
  name: "sticker",
  description: "Add a sticker from an attached image",
  async execute(message, args) {
    if (args[0] !== "add" || !args[1]) {
      return message.reply("Usage: `'sticker add (name)` — attach an image and provide a name.");
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
      return message.reply("You need the **Manage Emojis and Stickers** permission to use this command.");
    }

    const name = args[1];

    if (!VALID_STICKER_NAME.test(name)) {
      return message.reply("Invalid sticker name. Use 2-30 characters: letters, numbers, and underscores only.");
    }

    const attachment = message.attachments.first();
    if (!attachment) {
      return message.reply("Attach an image to add as a sticker.");
    }

    if (!SUPPORTED_TYPES.includes(attachment.contentType)) {
      return message.reply("Unsupported file type. Use PNG, APNG, GIF, or WebP images only.");
    }

    const isGif = attachment.contentType === "image/gif";
    if (isGif && !message.guild.premiumTier) {
      return message.reply("Animated stickers require server boosts.");
    }

    if (attachment.size > 512000) {
      return message.reply("Image is too large. Discord sticker images must be under 512 KB.");
    }

    try {
      const sticker = await message.guild.stickers.create({
        file: attachment.url,
        name,
        tags: "discord",
      });
      message.reply(`Sticker added: **${sticker.name}**`);
    } catch (error) {
      console.error(error);
      message.reply("Failed to add the sticker. The server may have reached its sticker slot limit.");
    }
  },
};
