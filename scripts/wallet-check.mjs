import { createPublicClient, formatEther, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { loadDotEnv, normalizeAddress, normalizePrivateKey, requiredEnv } from "./env-utils.mjs";

const DEFAULT_POOL_MANAGER = "0x360e68faccca8ca495c1b759fd9eee466db9fb32";

try {
  loadDotEnv(".env");

  const rpcUrl = requiredEnv("XLAYER_MAINNET_RPC_URL");
  const privateKey = normalizePrivateKey(requiredEnv("PRIVATE_KEY"));
  const owner = normalizeAddress("OWNER_ADDRESS", requiredEnv("OWNER_ADDRESS"));
  const poolManager = normalizeAddress(
    "XLAYER_MAINNET_POOL_MANAGER",
    process.env.XLAYER_MAINNET_POOL_MANAGER || DEFAULT_POOL_MANAGER,
  );
  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({
    transport: http(rpcUrl),
  });

  const chainId = await publicClient.getChainId();
  const balance = await publicClient.getBalance({ address: account.address });
  const ownerMatchesPrivateKey = account.address.toLowerCase() === owner.toLowerCase();

  console.log(
    JSON.stringify(
      {
        rpcUrl,
        chainId,
        expectedChainId: 196,
        deployerAddress: account.address,
        ownerAddress: owner,
        ownerMatchesPrivateKey,
        poolManager,
        balanceWei: balance.toString(),
        balanceNative: formatEther(balance),
        ready: chainId === 196 && ownerMatchesPrivateKey && balance > 0n,
        notes: [
          chainId === 196 ? "RPC is on X Layer mainnet." : "RPC chain id is not X Layer mainnet.",
          ownerMatchesPrivateKey
            ? "OWNER_ADDRESS matches PRIVATE_KEY."
            : "OWNER_ADDRESS does not match PRIVATE_KEY. This is allowed only if owner should be a different policy admin.",
          balance > 0n ? "Wallet has native gas balance." : "Wallet has no native gas balance.",
        ],
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`wallet:check failed: ${error.message}`);
  console.error("Create .env from .env.example and fill XLAYER_MAINNET_RPC_URL, PRIVATE_KEY, and OWNER_ADDRESS.");
  process.exit(1);
}
