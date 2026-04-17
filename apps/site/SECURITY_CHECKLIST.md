# Qubi LLC — Security, SEO & Launch Checklist

## 1. Secrets

- Do not place API keys, private tokens, admin credentials or mail service secrets in frontend code.
- Do not commit real `.env` files.
- Only public values may use `VITE_` prefixes.

## 2. Build checks

Run:

```bash
npm run build
npm run security:prod
```
