# Discord Bot

A modular Discord bot built with discord.js v14.

## Features

- **Prefix commands** (prefix: `'`)
  - `'emoji add (name)` — add an emoji from an attached image
  - `'sticker add (name)` — add a sticker from an attached image
- **Slash commands**
  - `/help` — show all commands in a clean embed
  - `/death` — check bot latency with a funny message

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your bot token
4. Start the bot: `npm start`

## Environment Variables

| Variable | Description |
|---|---|
| `DISCORD_BOT_TOKEN` | Your Discord bot token from the Developer Portal |

## Deploy on Railway

1. Push this repository to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Deploy from the GitHub repository
4. Add `DISCORD_BOT_TOKEN` as a Railway variable
5. Railway will run `node index.js` automatically

## Project Structure

```
├── index.js                # Bot entry point
├── commands/
│   ├── prefix/             # Prefix commands
│   │   ├── emoji.js
│   │   └── sticker.js
│   └── slash/              # Slash commands
│       ├── help.js
│       └── death.js
├── railway.json            # Railway deployment config
├── package.json
└── .env                    # Secrets (not committed)
```
