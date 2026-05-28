# Tonight Submission Checklist

Use this checklist to finish the OKX Hook the Future submission before the deadline.

## Current Project Status

- Project name: AI Risk Guard Hook.
- Local verification: passing with `npm run verify`.
- Contracts, tests, demo app, deployment scripts, and submission copy are ready.
- GitHub remote is not configured yet.
- Live X Layer deployment is not done yet.
- Demo video is not recorded yet.
- X announcement is not posted yet.

## Important Decision

Do not submit only the local files unless there is no time left. The safer competition submission needs:

- a public GitHub repository;
- live X Layer Hook deployment evidence;
- demo token or pool evidence;
- a demo video link;
- an X announcement link;
- final OKX form submission.

## Step 1 - Wallet Environment

User action:

- Export the OKX wallet private key locally.
- Do not paste the private key into chat.
- Make sure the wallet has X Layer mainnet gas.

Local file to create:

```bash
cp .env.example .env
```

Fill `.env`:

```text
XLAYER_MAINNET_RPC_URL=https://rpc.xlayer.tech
PRIVATE_KEY=your_private_key_here
OWNER_ADDRESS=your_wallet_address_here
XLAYER_MAINNET_POOL_MANAGER=0x360e68faccca8ca495c1b759fd9eee466db9fb32
```

Check:

```bash
npm run wallet:check
```

Success condition:

- chain id is `196`;
- balance is non-zero;
- `ready` is `true`.

## Step 2 - Publish GitHub Repository

User action on GitHub:

- Create a new public repository named `ai-risk-guard-hook`.
- Do not initialize it with README, .gitignore, or license.

Local commands:

```bash
git remote add origin https://github.com/<your-user>/ai-risk-guard-hook.git
git branch -M main
git push -u origin main
```

Save:

```text
GITHUB_URL=https://github.com/<your-user>/ai-risk-guard-hook
```

## Step 3 - Deploy On X Layer

Run:

```bash
npm run wallet:check
npm run deploy:xlayer
npm run deploy:demo-tokens
npm run pool:configure
```

Generated evidence:

- `deployments/xlayer-mainnet-latest.json`
- `deployments/xlayer-demo-tokens-latest.json`
- `deployments/xlayer-demo-pool-latest.json`

Check next state:

```bash
npm run operator:next
```

## Step 4 - Verify Contract And Generate Public Evidence

Generate OKLink verification commands:

```bash
npm run submission:verify-commands
```

Open `deployments/verification-commands.md` and run the printed `forge verify-contract` commands.

Save:

```text
CONTRACT_VERIFICATION_URL=https://www.oklink.com/xlayer/address/<hook-address>
```

Generate explorer links:

```bash
npm run submission:links
```

## Step 5 - Record Demo Video

Run:

```bash
npm run app:dev
```

Open the Vite URL and record a 90-120 second video using `docs/demo-video-script.md`.

Video must show:

- app title and prompt compiler;
- normal mode allows swap;
- elevated mode raises fee;
- oversized swap is rejected;
- blocked mode rejects all swaps;
- terminal showing `forge test` or `npm run verify` passing;
- mention X Layer deployment evidence.

Upload video and save:

```text
DEMO_VIDEO_URL=<public video URL>
```

## Step 6 - Generate And Publish X Post

Generate copy:

```bash
npm run submission:social -- \
  --github "$GITHUB_URL" \
  --demo "$DEMO_VIDEO_URL" \
  --public "$GITHUB_URL/blob/main/PUBLIC_SUBMISSION.md"
```

Post from the dedicated X account and include:

- `@XLayerOfficial`
- `@Uniswap`
- `@flapdotsh`

Save:

```text
X_ANNOUNCEMENT_URL=<public X post URL>
```

## Step 7 - Generate Final Submission Files

Run:

```bash
npm run submission:finalize -- \
  --github "$GITHUB_URL" \
  --verify "$CONTRACT_VERIFICATION_URL" \
  --demo "$DEMO_VIDEO_URL" \
  --x "$X_ANNOUNCEMENT_URL"

npm run submission:public -- \
  --github "$GITHUB_URL" \
  --verify "$CONTRACT_VERIFICATION_URL" \
  --demo "$DEMO_VIDEO_URL" \
  --x "$X_ANNOUNCEMENT_URL" \
  --out PUBLIC_SUBMISSION.md
```

Commit and push public evidence:

```bash
git add PUBLIC_SUBMISSION.md
git commit -m "docs: add public deployment evidence"
git push
```

## Step 8 - Final Readiness Check

Run:

```bash
npm run submission:check -- \
  --github "$GITHUB_URL" \
  --verify "$CONTRACT_VERIFICATION_URL" \
  --demo "$DEMO_VIDEO_URL" \
  --x "$X_ANNOUNCEMENT_URL"
```

Success condition:

```text
"status": "ready"
```

## Step 9 - Submit OKX Form

Use:

- `docs/okx-form.md`
- `deployments/submission-summary.md`
- `PUBLIC_SUBMISSION.md`
- `deployments/explorer-links.md`

Submit these links:

- GitHub repository URL;
- Hook contract OKLink URL;
- PoolId / pool evidence;
- demo video URL;
- X announcement URL.

## Emergency Fallback

If live deployment fails and the deadline is near:

- publish GitHub repo;
- record demo video with local app and tests;
- post X announcement;
- submit the form with a note that the Hook is locally verified and X Layer deployment is pending.

This is weaker than live deployment, but better than missing the deadline.
