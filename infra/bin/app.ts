#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/app-stack.js";

const app = new cdk.App();

new AppStack(app, "sandbox", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"]!,
    region: process.env["CDK_DEFAULT_REGION"]!,
  },
});
