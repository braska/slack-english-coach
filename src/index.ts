import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { App, AwsLambdaReceiver, GenericMessageEvent } from "@slack/bolt";
import LanguageDetect from "languagedetect";

const secretsManagerClient = new SecretsManagerClient({});
const getSecretValueCommand = new GetSecretValueCommand({ SecretId: "Slack" });
const { SecretString } = await secretsManagerClient.send(getSecretValueCommand);
const { BotToken, SigningSecret } = JSON.parse(SecretString!);

const lngDetector = new LanguageDetect();

const receiver = new AwsLambdaReceiver({
  signingSecret: SigningSecret,
});

const app = new App({
  token: BotToken,
  receiver: receiver,
});

app.message(async ({ message, client }) => {
  if (message.subtype === undefined) {
    const msg = message as GenericMessageEvent;

    if (!msg.text) {
      return;
    }

    const plainText = msg.text.replace(/```.*?```/g, "");

    const probabilities = lngDetector.detect(plainText, 10);

    if (probabilities.length === 0) {
      return;
    }

    const engProbability =
      probabilities.find(([lang]) => lang === "english")?.[1] ?? 0;

    if (engProbability <= 0.1 && probabilities[0]![0] !== "english") {
      await client.chat.postMessage({
        channel: msg.user,
        text: `Hm, it doesn't seem like you're speaking English. I think you are using ${
          probabilities[0]![0]
        }${
          probabilities[1] ? ` or ${probabilities[1]![0]}` : ""
        }. I know it is difficult to use a language that is not native to you, but keep trying! You will rock it!`,
      });
    }
  }
});

type HandlerType = Awaited<ReturnType<typeof receiver.start>>;

export const handler: HandlerType = async (event, context, callback) => {
  const handler = await receiver.start();
  return handler(event, context, callback);
};
