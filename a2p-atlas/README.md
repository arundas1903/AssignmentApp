# A2P Atlas

Single-page world map of **Application-to-Person (A2P) SMS** sender support by country.

Filter and click countries to see support for:

- Alphanumeric sender IDs
- Short codes
- Long codes
- Toll-free
- 10DLC
- Two-way SMS
- International sending

## Data source

Country capability data comes from AWS SMS documentation:

- GitHub: [awsdocs/amazon-pinpoint-user-guide](https://github.com/awsdocs/amazon-pinpoint-user-guide) (`doc-source/channels-sms-countries.md`)
- Published table: [Supported countries and regions for SMS messaging](https://docs.aws.amazon.com/sms-voice/latest/userguide/phone-numbers-sms-by-country.html)

Dedicated **toll-free** (US / Canada / Puerto Rico) and **10DLC** (US) flags are inferred from AWS origination-identity guidance, because those columns are not in the country matrix.

Refresh the bundled dataset:

```bash
npm run data:build
```

## Live site

GitHub Pages: https://arundas1903.github.io/AssignmentApp/

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

Deployments are published by `.github/workflows/deploy-a2p-atlas.yml`.
