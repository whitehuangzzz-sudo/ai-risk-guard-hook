import { AlertTriangle, Brain, CheckCircle2, Gauge, Shield, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

type RiskMode = "Normal" | "Elevated" | "Blocked";

type Policy = {
  maxSwap: number;
  normalFee: number;
  elevatedFee: number;
  mode: RiskMode;
  hash: string;
};

const examples = [
  "Keep swaps small and raise fees when volatility spikes.",
  "I want normal swaps under 500 USDT, but block the pool during panic moves.",
  "Allow larger trades, but charge more when risk is elevated.",
];

function compilePolicy(prompt: string, mode: RiskMode): Policy {
  const lower = prompt.toLowerCase();
  const maxSwap = lower.includes("500") ? 500 : lower.includes("larger") ? 2500 : 1000;
  const elevatedFee = lower.includes("charge more") || lower.includes("volatility") ? 3000 : 1500;
  const normalFee = maxSwap > 1000 ? 800 : 500;
  const hash = Array.from(prompt).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);

  return {
    maxSwap,
    normalFee,
    elevatedFee,
    mode,
    hash: `0x${hash.toString(16).padStart(8, "0")}...policy`,
  };
}

function decisionFor(policy: Policy, swapAmount: number) {
  if (policy.mode === "Blocked") {
    return {
      label: "Blocked",
      tone: "danger",
      detail: "beforeSwap reverts because circuit breaker mode is active.",
      icon: XCircle,
    };
  }

  if (swapAmount > policy.maxSwap) {
    return {
      label: "Rejected",
      tone: "danger",
      detail: `beforeSwap reverts because ${swapAmount} exceeds the ${policy.maxSwap} max input.`,
      icon: AlertTriangle,
    };
  }

  const fee = policy.mode === "Elevated" ? policy.elevatedFee : policy.normalFee;
  return {
    label: "Allowed",
    tone: "success",
    detail: `beforeSwap returns a dynamic LP fee override of ${fee / 10000}%.`,
    icon: CheckCircle2,
  };
}

export function App() {
  const [prompt, setPrompt] = useState(examples[0]);
  const [mode, setMode] = useState<RiskMode>("Normal");
  const [swapAmount, setSwapAmount] = useState(750);
  const policy = useMemo(() => compilePolicy(prompt, mode), [prompt, mode]);
  const decision = useMemo(() => decisionFor(policy, swapAmount), [policy, swapAmount]);
  const DecisionIcon = decision.icon;

  return (
    <main className="shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">OKX Hook the Future · X Layer · Uniswap v4</p>
            <h1>AI Risk Guard Hook</h1>
          </div>
          <div className="status">
            <Shield size={18} />
            beforeSwap policy engine
          </div>
        </header>

        <div className="grid">
          <section className="panel composer">
            <div className="panelTitle">
              <Brain size={20} />
              AI Policy Compiler
            </div>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
            <div className="chips">
              {examples.map((example) => (
                <button key={example} type="button" onClick={() => setPrompt(example)}>
                  {example}
                </button>
              ))}
            </div>
          </section>

          <section className="panel policy">
            <div className="panelTitle">
              <Gauge size={20} />
              On-chain Parameters
            </div>
            <dl>
              <div>
                <dt>Max exact input</dt>
                <dd>{policy.maxSwap.toLocaleString()} USDT</dd>
              </div>
              <div>
                <dt>Normal fee</dt>
                <dd>{policy.normalFee / 10000}%</dd>
              </div>
              <div>
                <dt>Elevated fee</dt>
                <dd>{policy.elevatedFee / 10000}%</dd>
              </div>
              <div>
                <dt>AI policy hash</dt>
                <dd>{policy.hash}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="simulator">
          <div className="control">
            <span>Risk mode</span>
            <div className="segments">
              {(["Normal", "Elevated", "Blocked"] as RiskMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={mode === item ? "active" : ""}
                  onClick={() => setMode(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <label className="slider">
            <span>Swap input: {swapAmount.toLocaleString()} USDT</span>
            <input
              type="range"
              min="100"
              max="3000"
              step="50"
              value={swapAmount}
              onChange={(event) => setSwapAmount(Number(event.target.value))}
            />
          </label>

          <div className={`decision ${decision.tone}`}>
            <DecisionIcon size={28} />
            <div>
              <strong>{decision.label}</strong>
              <p>{decision.detail}</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
