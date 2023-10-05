import type { PlasmoCSConfig } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"

import { title } from "process";
import type { DOMElement } from "react";

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*","https://twitter.com/*"],
}

let body = document.querySelector('body');
let theme = 'light';
switch(body.style.backgroundColor) {
  case 'rgb(0, 0, 0)':
    theme = 'dark';
    break;
  case 'rgb(21, 32, 43)':
    theme = 'dim';
    break;
  case 'rgb(255, 255, 255)':
    theme = 'light';
    break;

}

// Credits for the general tweet tracking structure to wseager's work on eight-dollars extension.
// https://github.com/wseagar/eight-dollars/blob/main/script.js

function querySelectorAllIncludingMe(node, selector) {
  if (node.matches(selector)) {
    return [node];
  }
  return [...node.querySelectorAll(selector)];
}

const trackingLinks = new Set<HTMLElement>();

function collectAndTrackElements(node) {
  const links = querySelectorAllIncludingMe(node, '[data-testid="card.layoutLarge.media"]');
  for (const tweet of links) {
    trackingLinks.add(tweet);
  }
}

async function handleModification(
  containerElement: HTMLElement,
) {
  let link = containerElement.querySelectorAll('a')[0];
  let url = link.href;
  let components = link.querySelectorAll('div + div');
  let urlPreview = components[1].textContent;

  let metadata = await sendToBackground({
    name: "getMetadata",
    body: {
      url
    }
  });

  components[1].remove();

  let metadataElement = document.createElement('div');
  metadataElement.style.fontFamily = '"TwitterChirp",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  metadataElement.style.padding = '10px 20px 20px 20px';
  metadataElement.style.fontSize = '15px';

  let urlElement = document.createElement('div');
  urlElement.style.paddingBottom = '5px';
  urlElement.textContent = urlPreview;

  let titleElement = document.createElement('div');
  titleElement.style.color = 'rgb(15, 20, 25)';
  titleElement.style.paddingBottom = '5px';
  titleElement.textContent = metadata.title;

  let descElement = document.createElement('div');
  descElement.style.color = 'rgb(83, 100, 113)';
  descElement.style.paddingBottom = '5px';
  descElement.textContent = metadata.description;

  if (theme === 'light') {
    urlElement.style.color = 'rgb(83, 100, 113)';
    titleElement.style.color = 'rgb(15, 20, 25)';
    descElement.style.color = 'rgb(83, 100, 113)';
  }
  else if (theme === 'dim') {
    urlElement.style.color = 'rgb(139, 152, 165)';
    titleElement.style.color = 'rgb(247, 249, 249)';
    descElement.style.color = 'rgb(139, 152, 165)';
  }
  else if (theme === 'dark') {
    urlElement.style.color = 'rgb(113, 118, 123)';
    titleElement.style.color = 'rgb(231, 233, 234)';
    descElement.style.color = 'rgb(113, 118, 123)';
  }

  metadataElement.appendChild(urlElement);
  metadataElement.appendChild(titleElement);
  metadataElement.appendChild(descElement);
  link.appendChild(metadataElement);

}

async function main() {
  const observer = new MutationObserver(async function (mutations, observer) {
    try {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          collectAndTrackElements(mutation.target);
        }
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            collectAndTrackElements(node);
          }
        }
      }

      for (const link of trackingLinks) {
        if (!link.dataset.processed) {
          link.dataset.processed = "true";
          await handleModification(link);
        }
      }
    } catch (error) {
      console.log("uncaught mutation error", error);
    }
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
  });
};

main();