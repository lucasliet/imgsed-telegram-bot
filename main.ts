import * as Telegram from 'https://deno.land/x/telegram@v0.1.1/mod.ts';
import { replyMediaContent } from './service.ts';

const TOKEN: string = Deno.env.get('BOT_TOKEN') as string;
const PORT: number = parseInt(Deno.env.get('PORT') as string) || 80;

const BOT = new Telegram.Bot(TOKEN);

BOT.on('text', async (ctx) => {
  const link: string | undefined = ctx.message?.text;
  await replyMediaContent(ctx, link);
});

BOT.use(async (ctx, next) => {
  try {
    await next(ctx);
  } catch (err) {
    ctx.reply(`Algo deu errado: ${err.message}`);
    console.error(err.message, ctx.message);
  }
});

BOT.launch({
  webhook: {
    domain: 'imgsed-telegram-bot.deno.dev',
    path: `/${TOKEN}`,
    port: PORT,
  },
});