# Maison Scent — Perfume E-commerce Starter

A clean static perfume store with:

- Original and Inspired / Clone categories
- 100ml and 10ml options
- Cart with quantity controls
- Customer checkout form
- Optional notes
- Browser geolocation -> Google Maps link
- Telegram order notification
- No Telegram bot token exposed in frontend code

## Recommended hosting

Use **GitHub + Vercel**:

1. Create a GitHub repository and upload all files in this folder.
2. Import the repository into Vercel.
3. Add these Vercel Environment Variables:
   - `TELEGRAM_BOT_TOKEN` = your Telegram bot token
   - `TELEGRAM_CHAT_ID` = the chat/group/channel ID where orders should arrive
4. Deploy.
5. The website will be live on your Vercel URL.

### Important

Do NOT put the Telegram bot token in `app.js`, `index.html`, or any public GitHub file.

GitHub Pages alone is fine for the static frontend, but it cannot safely keep a private Telegram bot token. The included `/api/order` serverless function is why Vercel (or another serverless backend) is recommended.

## Products

Edit the `PRODUCTS` array near the top of `app.js` to change:

- product names
- original / clone category
- brand text
- 100ml price
- 10ml price

## Product images

The current prototype uses CSS bottle artwork so it works immediately without image files. You can later replace the `.product-visual` blocks with real product images.

## Telegram setup

Create a bot with Telegram's official bot tooling, then add the bot to the destination chat and obtain the appropriate chat ID. Put the secret token only in Vercel Environment Variables.

The backend sends orders through Telegram's Bot API `sendMessage` method.
