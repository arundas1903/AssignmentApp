# Publish snapshot for arundas.me/a2patlas

Copy into the portfolio repo:

```bash
cp -R publish/a2patlas /path/to/portfolio/public/
cd /path/to/portfolio
git add public/a2patlas
git commit -m "Add SMS Country Map at /a2patlas"
git push origin main
```

Or rebuild fresh:

```bash
npm run publish:arundas -- /path/to/portfolio
```
