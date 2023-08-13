import { Telegraf } from 'npm:telegraf';
import { DOMParser, Element, Node } from 'https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts';

const BOT = new Telegraf(Deno.env.get('BOT_TOKEN'));
const DOM_PARSER = new DOMParser();

BOT.start((ctx) => ctx.reply('Welcome!, Send me a instagram reel/picture link and I will download it for you'));

BOT.on('message', async (ctx) => {
  const link: string = ctx.message.text;
  if (link.includes('instagram.com/reel')) {
    const reel = await convertTelegramLink(link);
    ctx.replyWithVideo({ source: reel });
  } else if (link.includes('instagram.com/p')) {
    const picture = await convertTelegramLink(link);
    ctx.replyWithPhoto({ source: picture });
  } else {
    ctx.reply('Please send me a instagram reel/picture link');
  }
});

async function convertTelegramLink(url:string) {
    const mediaId = url.split('instagram.com')[1].split('/')[2];
    const response = 
      await fetch(`https://imgsed.com/p/${mediaId}`).then((res) => res.text());

    const mediaLink = parseElement(response, '.media-wrap').getAttribute('data-video');
    return mediaLink;
}

function parseElement(html: string, selector: string): Element {
  return DOM_PARSER.parseFromString(html, 'text/html')
    ?.querySelector(selector)!;
}

BOT.launch();