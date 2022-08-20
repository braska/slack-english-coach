import * as cdk from "aws-cdk-lib";
import { AppPipelineStack } from "../lib/app-pipeline-stack.js";

const app = new cdk.App();

if (
  !process.env["REPO"] ||
  !process.env["BRANCH"] ||
  !process.env["CODESTAR_CONNECTION_ARN"] ||
  !process.env["STAGING_ACCOUNT_ID"] ||
  !process.env["STAGING_REGION"] ||
  !process.env["PRODUCTION_ACCOUNT_ID"] ||
  !process.env["PRODUCTION_REGION"]
) {
  throw new Error(
    "Missing environment variables. Please set REPO, BRANCH, CODESTAR_CONNECTION_ARN, STAGING_ACCOUNT_ID, STAGING_REGION, PRODUCTION_ACCOUNT_ID, PRODUCTION_REGION"
  );
}

new AppPipelineStack(app, "AppPipeline", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"]!,
    region: process.env["CDK_DEFAULT_REGION"]!,
  },
  source: {
    repo: process.env["REPO"],
    branch: process.env["BRANCH"],
    codesStarConnectionArn: process.env["CODESTAR_CONNECTION_ARN"],
  },
  envs: {
    staging: {
      account: process.env["STAGING_ACCOUNT_ID"],
      region: process.env["STAGING_REGION"],
    },
    production: {
      account: process.env["PRODUCTION_ACCOUNT_ID"],
      region: process.env["PRODUCTION_REGION"],
    },
  },
});
