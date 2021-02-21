import { App, ExpressReceiver, GenericMessageEvent } from "@slack/bolt";
import serverless from "serverless-http";

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

    await client.chat.postMessage({
      channel: msg.user,
      text: msg.text,
    });
  }
});

if (process.env.NODE_ENV !== "production") {
  (async () => {
    await app.start(+process.env.PORT || 8080);
    console.log("app is running");
  })();
}

module.exports.handler = serverless(expressReceiver.app);
