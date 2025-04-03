import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN as string);

// Handle messages
bot.on("text", async (ctx) => {
    await ctx.reply(`You said: ${ctx.message.text}`);
});

// Webhook handler
export default async function handler(req: any, res: any) {
    if (req.method === "POST") {
        await bot.handleUpdate(req.body);
        res.status(200).send("OK");
    } else {
        res.status(400).send("Only POST requests allowed");
    }
}
