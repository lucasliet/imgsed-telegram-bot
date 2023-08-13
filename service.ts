import { DOMParser, Element } from 'https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts';
import { Context } from "https://deno.land/x/grammy@v1.9.1/context.ts";

const DOM_PARSER = new DOMParser();

export async function replyMediaContent(ctx: Context, link: string | undefined) {
  if (link?.includes('instagram.com/reel')) {
    const mediaLink: string = await convertTelegramLink(link);
    ctx.replyWithVideo(mediaLink);
  } else if(link?.includes('instagram.com/p')){
    const mediaLink: string = await convertTelegramLink(link);
    ctx.replyWithPhoto(mediaLink);
  } else {
    ctx.reply('Por favor me envie um link de foto ou reel do instagram');
  }
}

async function convertTelegramLink(url: string): Promise<string> {
  const mediaId = url.split('instagram.com')[1].split('/')[2];
  const response =
    await fetch(`https://imgsed.com/p/${mediaId}`).then((res) => res.text());

  return parseElement(response, '.media-wrap').getAttribute('data-video')!;
}

function parseElement(html: string, selector: string): Element {
  return DOM_PARSER.parseFromString(html, 'text/html')
    ?.querySelector(selector)!;
}