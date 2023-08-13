import * as Telegram from 'https://deno.land/x/telegram@v0.1.1/mod.ts';
import { DOMParser, Element } from 'https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts';

const BOT = new Telegram.Bot(Deno.env.get('BOT_TOKEN') as string);
const DOM_PARSER = new DOMParser();

BOT.on('message', async (ctx) => {
  const link: string = ctx.message!.text!;
  if (link.includes('instagram.com/reel') || link.includes('instagram.com/p')) {
    const mediaLink: string = await convertTelegramLink(link);
    ctx.reply(mediaLink);
  } else {
    ctx.reply('Please send me a instagram reel/picture link');
  }
});

async function convertTelegramLink(url:string): Promise<string> {
    const mediaId = url.split('instagram.com')[1].split('/')[2];
    const response = 
      await fetch(`https://imgsed.com/p/${mediaId}`).then((res) => res.text());

    return parseElement(response, '.media-wrap').getAttribute('data-video')!;
}

function parseElement(html: string, selector: string): Element {
  return DOM_PARSER.parseFromString(html, 'text/html')
    ?.querySelector(selector)!;
}

BOT.launch();