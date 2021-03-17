# James The English Coach

## Local development

We are using Docker to provide development environment.

To start working you need to:

1. Copy `.env.example` to `.env` and fill values
2. Run `docker-compose up -d`
3. We are using `localtunnel` to get internet-accessible address. See exposed subdomain in `docker-compose logs localtunnel` output.
4. Specify bot address using this subdomain on bot settings page: `https://api.slack.com/apps/A01NU6BDDV0/event-subscriptions`
