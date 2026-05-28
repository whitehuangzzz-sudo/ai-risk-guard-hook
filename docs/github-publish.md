# GitHub Publish Checklist

The OKX event page does not explicitly require a GitHub documentation site. It does require a valid submission through the official form, verifiable X Layer Pool and Hook addresses, and a dedicated X account. A public GitHub repository is still useful because code quality, completion, and demo clarity are part of judging.

## Create Repository

Suggested repo name:

```text
ai-risk-guard-hook
```

Suggested description:

```text
AI-assisted Uniswap v4 beforeSwap risk guard Hook for X Layer.
```

Suggested topics:

```text
okx, x-layer, uniswap-v4, hooks, defi, ai, hackathon
```

## Push

```bash
git remote add origin git@github.com:<your-user>/ai-risk-guard-hook.git
git branch -M main
git push -u origin main
```

If using HTTPS:

```bash
git remote add origin https://github.com/<your-user>/ai-risk-guard-hook.git
git branch -M main
git push -u origin main
```

## Before Sharing

- Confirm `.env` is not committed.
- Confirm `deployments/` is not committed.
- Confirm README shows the demo screenshot.
- Confirm GitHub Actions CI runs successfully.
- Add the final Hook/Pool addresses to `SUBMISSION.md` and `docs/okx-form.md` after deployment.
- Generate and commit `PUBLIC_SUBMISSION.md` after live deployment:

```bash
npm run submission:public -- \
  --github "https://github.com/<your-user>/ai-risk-guard-hook" \
  --verify "$CONTRACT_VERIFICATION_URL" \
  --demo "$DEMO_VIDEO_URL" \
  --x "$X_ANNOUNCEMENT_URL"
git add PUBLIC_SUBMISSION.md
git commit -m "docs: add public deployment evidence"
git push
```

## Links To Submit

- GitHub repository URL.
- Hook contract explorer URL.
- Pool or PoolId evidence.
- Demo video URL.
- X announcement URL.

Use `docs/okx-form.md` for the copy-ready project description, technical highlights, and final form fields.
