import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";

import axios from 'axios';
import * as cheerio from 'cheerio';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  let url = req.body.url;

  getUrl(url).then((response) => {
    console.log(response);
    res.send(response);
  });
}

async function getUrl(url: string, urls: string[] = []) {
  urls.push(url);

  const storage = new Storage({
    area: 'local',
  });

  let cache = await storage.get(url);
  if (cache) {
    console.log('cache hit', url);
    return cache;
  }

  let response = await axios.get(url, {
    headers: {
      'Content-Type': 'text/html',
      Accept: 'text/html'
    }
  });

  let $ = cheerio.load(response.data);

  // meta refresh, grab url
  let matches = response.data?.match(/<META http-equiv="refresh" content="0;URL=(.*?)">/);
  if (matches && matches.length > 1) {
    url = matches[1];
    return getUrl(url, urls);
  }

  var title = $('meta[property="og:title"]').attr('content');
  var description = $('meta[property="og:description"]').attr('content');
  var image = $('meta[property="og:image"]').attr('content');

  let entry = {
    urls,
    title,
    description,
    image
  };

  for (let url of urls) {
    storage.set(url, entry);
  }

  return entry;
}

export default handler;