# James The English Coach

Small Slack bot that enforces your team to use English.

## Development

There is no way to run this app locally due to the use of AWS as framework. That means even while development you have to deploy the app to AWS, but to special sandbox environment.

Prerequisites:
1. AWS CLI
2. Your personal isolated AWS account for development (sandbox)
3. Configured AWS profile for AWS CLI
4. `nvm` installed and configured

How to run the app:

1. Put Slack API credentials to AWS Secrets Manager:
   ```bash
   aws secretsmanager create-secret --profile {{your_profile_name_goes_here}} --name Slack --secret-string '{"BotToken": "xoxp-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX", "SigningSecret": "32-character-long-secret"}'
   ```
2. Select node version:
   ```bash
   nvm use
   ```
3. Enable corepack:
   ```bash
   corepack enable
   ```
4. Install dependencies:
   ```bash
   pnpm install
   ```
5. Bootstrap your AWS account:
   ```bash
   pnpm cdk bootstrap aws://{{your_account_id}}/{{your_region}} --profile {{your_profile_name}}
   ```
6. Deploy the app to AWS:
   ```bash
   pnpn cdk watch sandbox --profile {{your_profile_name}}
   ```
7. Specify API Gateway URL (from the previous command output) in Slack bot settings page. Here is original bot settings page: https://api.slack.com/apps/A01NU6BDDV0/event-subscriptions but you can create your Slack bot here: https://api.slack.com/apps?new_app=1

## CI/CD

```mermaid
flowchart
  subgraph deployment [deployment account]
  pipeline
  end

  subgraph staging [staging account]
  end

  subgraph production [production account]
  end

  pipeline -- do deployment to ... --> staging
  pipeline -- do deployment to ... --> production
```

Prerequisites:
1. AWS Accounts:
   - account to host deployment pipeline
   - account to host staging workload
   - account to host production workload
2. Configured AWS profiles for AWS CLI for all accounts

How to deploy pipeline:
1. Bootstrap deployment account:
   ```bash
   pnpm cdk bootstrap aws://{{deployment_account_id}}/{{region}} --profile {{aws_cli_profile_name_for_deployment_account}}
   ```
2. Bootstrap staging and production accounts:
   ```bash
   pnpm cdk bootstrap aws://{{staging_acccount_id}}/{{region}} --profile {{aws_cli_profile_name_for_staging}} --trust {{deployment_account_id}} --cloudformation-execution-policies {{arn_of_policy_to_be_used_by_pipeline}}
   pnpm cdk bootstrap aws://{{production_acccount_id}}/{{region}} --profile {{aws_cli_profile_name_for_production}} --trust {{deployment_account_id}} --cloudformation-execution-policies {{arn_of_policy_to_be_used_by_pipeline}}
   ```
   Note: provided policy should have enough permissions to deploy to staging/production account. You can use `arn:aws:iam::aws:policy/AdministratorAccess` (already exists and managed by AWS), but it gives to much permissions. Consider creating custom policy with limited permissions in each target account.
3. Create Github connection in deployment account: https://console.aws.amazon.com/codesuite/settings/connections?region={{region_where_you_host_pipeline}}
4. Deploy pipeline:
   ```bash
   REPO='braska/slack-english-coach' BRANCH='main' CODESTAR_CONNECTION_ARN='{{arn_of_github_connection_on_prev_step}}' STAGING_ACCOUNT_ID='...' STAGING_REGION='...' PRODUCTION_ACCOUNT_ID='...' PRODUCTION_REGION='...' pnpm cdk -a "pnpm ts-node --esm infra/bin/ci-cd.ts" deploy --profile {{aws_cli_profile_name_for_deployment_account}}
   ```
