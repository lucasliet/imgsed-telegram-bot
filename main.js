import { Telegraf } from 'telegraf';
import DomParser from 'dom-parser';

const BOT = new Telegraf(process.env.BOT_TOKEN);
const DOM_PARSER = new DomParser();

BOT.start((ctx) => ctx.reply(
  'Welcome to Instagram Media Downloader Bot!, send me the link of a picture or reel from instagram'
));

BOT.on('message', async (ctx) => {
  const link = ctx.message.text;
  if (link.includes('instagram.com/reel')) {
    const mediaLink = await convertTelegramLink(link);
    ctx.replyWithVideo({ source: mediaLink });
  } else if(link.includes('instagram.com/p')) {
    const mediaLink = await convertTelegramLink(link);
    ctx.replyWithPhoto({ source: mediaLink });
  } else {
    ctx.reply('Please send me a instagram reel/picture link');
  }
});

/**
 * @param {string} url 
 */
async function convertTelegramLink(url) {
    const mediaId = url.split('instagram.com')[1].split('/')[2];
    const response = 
      await fetch(`https://imgsed.com/p/${mediaId}`).then((res) => res.text());

    return parseElement(response, '.media-wrap').getAttribute('data-video');
}

/**
 * @param {string} html 
 * @param {string} selector 
 */
function parseElement(html, selector) {
  return DOM_PARSER.parseFromString(html, 'text/html')
    .querySelector(selector);
}

BOT.launch();