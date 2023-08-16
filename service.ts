import { DOMParser, Element, HTMLDocument, Node, NodeList } from 'https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts';
import { Context } from "https://deno.land/x/grammy@v1.17.2/context.ts";
import { InputMediaBuilder } from "https://deno.land/x/grammy@v1.17.2/mod.ts";

const DOM_PARSER = new DOMParser();

export async function replyMediaContent(ctx: Context, link: string | undefined) {
  if (!link?.includes('instagram.com/reel') && !link?.includes('instagram.com/p')) {
    ctx.reply('Por favor me envie um link de foto ou reel do instagram',
      { reply_to_message_id: ctx.message?.message_id });
    return;
  }
  const imgsedDom: HTMLDocument = await convertTelegramLink(link);
  const mediaWrap: Element = imgsedDom.querySelector('.media-wrap')!;
  if(!mediaWrap) throw Error('layout alterado, contatar administrador @lucasliet')
  
  const description: string | undefined = imgsedDom.querySelector('.desc')?.textContent;
  const videoLink: string | null = mediaWrap.getAttribute('data-video');

  if (videoLink) {
    replyVideo(ctx, videoLink, description);
  } else {
    replyImage(ctx, mediaWrap, description);
  }
}

async function convertTelegramLink(url: string): Promise<HTMLDocument> {
  const mediaId = url.split('instagram.com')[1].split('/')[2];
  const response =
    await fetch(`https://imgsed.com/p/${mediaId}`).then((res) => res.text());

  if(!response) throw Error('servidor fora do ar, tente novamente mais tarde')

  return DOM_PARSER.parseFromString(response, 'text/html')!
}

function replyVideo(ctx: Context, url: string, caption: string | undefined) {
  ctx.replyWithVideo(url,
    { reply_to_message_id: ctx.message?.message_id, caption });
}

function replyImage(ctx: Context, mediaWrap: Element, caption: string | undefined) {
  const imageLinks: string[] =
    Array.from(mediaWrap.querySelectorAll('img'))
      .map((element: Node) => (element as Element))
      .map((element: Element) => element.getAttribute('src')!)

  switch (imageLinks.length) {
    case 0:
      ctx.reply('Não foi possível encontrar a mídia',
        { reply_to_message_id: ctx.message?.message_id });
      return;
    case 1:
      ctx.replyWithPhoto(
        imageLinks[0],
        { reply_to_message_id: ctx.message?.message_id, caption }
      );
      return;
    default:
      ctx.replyWithMediaGroup(
        imageLinks.map((link) => InputMediaBuilder.photo(link, { caption })),
        { reply_to_message_id: ctx.message?.message_id }
      );
      return;
  }
}