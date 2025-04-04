import { Bot, webhookCallback } from 'grammy'

// eslint-disable-next-line node/no-process-env
const token = process.env.BOT_TOKEN
if (!token)
  throw new Error('BOT_TOKEN is unset')

const bot = new Bot(token)

bot.on('message', ctx => ctx.reply('Heeey!'))

export const config = {
  runtime: 'edge',
}

export default webhookCallback(bot, 'hono')
