import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";
import * as pipelines from "aws-cdk-lib/pipelines";
import { AppStack } from "./app-stack.js";

interface Environments {
  staging: Required<cdk.Environment>;
  production: Required<cdk.Environment>;
}

interface AppPipelineStackProps extends cdk.StackProps {
  envs: Environments;
  source: {
    repo: string;
    branch: string;
    codesStarConnectionArn: string;
  };
}

class CodeBuildStepWithPrimarySource extends pipelines.CodeBuildStep {
  override get primaryOutput(): pipelines.FileSet {
    return super.primaryOutput!;
  }
}

abstract class CodePipelineSourceWithPrimarySource extends pipelines.CodePipelineSource {
  override get primaryOutput(): pipelines.FileSet {
    return super.primaryOutput!;
  }

  static override connection(
    repoString: string,
    branch: string,
    props: pipelines.ConnectionSourceOptions
  ): CodePipelineSourceWithPrimarySource {
    return pipelines.CodePipelineSource.connection(
      repoString,
      branch,
      props
    ) as CodePipelineSourceWithPrimarySource;
  }
}

export class AppPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppPipelineStackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, "AppPipeline", {
      crossAccountKeys: true,
      dockerEnabledForSynth: true,
      synth: new CodeBuildStepWithPrimarySource("Synth", {
        input: CodePipelineSourceWithPrimarySource.connection(
          props.source.repo,
          props.source.branch,
          {
            connectionArn: props.source.codesStarConnectionArn,
            triggerOnPush: true,
          }
        ),
        commands: [
          "n auto",
          "corepack enable",
          "pnpm install",
          `REPO='${props.source.repo}' BRANCH='${props.source.branch}' CODESTAR_CONNECTION_ARN='${props.source.codesStarConnectionArn}' STAGING_ACCOUNT_ID='${props.envs.staging.account}' STAGING_REGION='${props.envs.staging.region}' PRODUCTION_ACCOUNT_ID='${props.envs.production.account}' PRODUCTION_REGION='${props.envs.production.region}' pnpm cdk synth -a 'pnpm ts-node --esm infra/bin/ci-cd.ts'`,
        ],
      }),
    });

    pipeline.addStage(
      new DeployStage(this, "Staging", { env: props.envs.staging })
    );
    pipeline.addStage(
      new DeployStage(this, "Production", { env: props.envs.production })
    );
  }
}

class DeployStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new AppStack(this, "App");
  }
}
