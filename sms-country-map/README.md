# SMS Country Map

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

- https://arundas.me/a2patlas/
- Fallback project Pages: https://arundas1903.github.io/AssignmentApp/ (uses a different `base`; prefer arundas.me)

Publish into the portfolio repo (CRA copies `public/a2patlas` into the site build):

```bash
npm run publish:arundas -- /path/to/portfolio
cd /path/to/portfolio
git add public/a2patlas
git commit -m "Add SMS Country Map at /a2patlas"
git push
```

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

Deployments are published by `.github/workflows/deploy-sms-country-map.yml`.
