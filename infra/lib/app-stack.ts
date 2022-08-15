import { URL } from "node:url";
import type { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apigwv2Integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new NodejsFunction(this, "app", {
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "handler",
      entry: new URL("../../src/index.ts", import.meta.url).pathname,
      bundling: {
        // required for top-level await
        format: OutputFormat.ESM,
        // dirty hack to get ESM up and running: https://github.com/evanw/esbuild/issues/1921#issuecomment-1152887672
        banner:
          "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
      },
    });

    const slackSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "slack",
      "Slack"
    );
    slackSecret.grantRead(fn);

    const httpApi = new apigwv2.HttpApi(this, "api");

    const path = "/slack/events";

    httpApi.addRoutes({
      path,
      methods: [apigwv2.HttpMethod.POST],
      integration: new apigwv2Integrations.HttpLambdaIntegration(
        "integration",
        fn
      ),
    });

    new cdk.CfnOutput(this, "slackEventsUrl", {
      value: httpApi.apiEndpoint + path,
    });
  }
}
