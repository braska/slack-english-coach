# James The English Coach

Small Slack bot that enforces your team to use English.

## Development

There is no way to run this app locally due to the use of AWS as framework. That means even while development you have to deploy the app to AWS, but to special sandbox environment.

Requirements:
1. AWS CLI
2. Your personal isolated AWS account for development (sandbox)
3. Configured AWS profile for AWS CLI
4. `nvm` installed and configured

How to run the app:

1. Put Slack API credentials to AWS Secrets Manager:
   ```bash
   aws secretsmanager create-secret --profile {{your_profile_name_goes_here}} --name Slack --secret-string '{"BotToken": "xoxp-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX", "SigningSecret": "32-character-long-secret"}'
   ```
1. Select node version:
   ```bash
   nvm use
   ```
1. Enable corepack:
   ```bash
   corepack enable
   ```
1. Install dependencies:
   ```bash
   pnpm install
   ```
1. Deploy the app to AWS:
   ```bash
   pnpn cdk watch sandbox --profile {{your_profile_name_goes_here}}
   ```
1. Specify API Gateway URL (from the previous command output) in Slack bot settings page: https://api.slack.com/apps/A01NU6BDDV0/event-subscriptions
