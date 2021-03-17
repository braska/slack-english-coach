import { App, ExpressReceiver, GenericMessageEvent } from "@slack/bolt";
import serverless from "serverless-http";
import LanguageDetect from "languagedetect";

const lngDetector = new LanguageDetect();

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver,
});

app.message(async ({ message, client }) => {
  if (message.subtype === undefined) {
    const msg = message as GenericMessageEvent;

    const probabilities = lngDetector.detect(msg.text, 10);

    if (probabilities.length > 0) {
      const engProbability = probabilities.find(([lang]) => lang === 'english')?.[1] ?? 0;

      if (engProbability > 0) {
        await client.chat.postMessage({
          channel: msg.user,
          text: `+${engProbability}`,
        });
      } else {
        const [[,mostLikelyLangProbability]] = probabilities;

        await client.chat.postMessage({
          channel: msg.user,
          text: `-${mostLikelyLangProbability}`,
        });
      }
    }
  }
});

if (process.env.NODE_ENV !== "production") {
  (async () => {
    await app.start(+process.env.PORT || 8080);
    console.log("app is running");
  })();
}

module.exports.handler = serverless(expressReceiver.app);
