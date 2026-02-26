"use client";

import { useEffect, useState } from "react";

interface Coin {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const COINS = "bitcoin,ethereum,ripple,cardano,solana,dogecoin,binancecoin,polkadot";

export default function CryptoTicker() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [error, setError] = useState(false);

  const fetchPrices = async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS}&order=market_cap_desc&sparkline=false`,
        { next: { revalidate: 60 } }
      );
      if (!res.ok) throw new Error();
      const data: Coin[] = await res.json();
      setCoins(data);
      setError(false);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    fetchPrices();
    // Alle 60 Sekunden aktualisieren
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toLocaleString("de-DE", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  if (error || coins.length === 0) {
    // Fallback mit statischen Werten während Laden
    const fallback = [
      { symbol: "btc", current_price: 84000, price_change_percentage_24h: 1.2 },
      { symbol: "eth", current_price: 3200, price_change_percentage_24h: 0.8 },
      { symbol: "xrp", current_price: 1.44, price_change_percentage_24h: -0.5 },
      { symbol: "ada", current_price: 0.30, price_change_percentage_24h: 15.2 },
      { symbol: "sol", current_price: 142, price_change_percentage_24h: 2.1 },
    ] as Coin[];
    return <TickerBar coins={fallback} formatPrice={formatPrice} formatChange={formatChange} live={false} />;
  }

  return <TickerBar coins={coins} formatPrice={formatPrice} formatChange={formatChange} live={true} />;
}

function TickerBar({
  coins,
  formatPrice,
  formatChange,
  live,
}: {
  coins: Coin[];
  formatPrice: (p: number) => string;
  formatChange: (c: number) => string;
  live: boolean;
}) {
  // Doppelter Content für nahtlose Loop-Animation
  const items = [...coins, ...coins];

  return (
    <div
      style={{
        background: "#0f3d6e",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        position: "relative",
        height: "36px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Live-Indikator */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "70px",
          background: "linear-gradient(90deg, #0f3d6e 60%, transparent)",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          paddingLeft: "12px",
          gap: "6px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: live ? "#22c55e" : "#f97316",
            display: "inline-block",
            animation: live ? "pulse 1.5s infinite" : "none",
          }}
        />
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "1px" }}>
          LIVE
        </span>
      </div>

      {/* Scrollende Preise */}
      <div
        style={{
          display: "flex",
          gap: "0",
          animation: "tickerScroll 35s linear infinite",
          paddingLeft: "80px",
          whiteSpace: "nowrap",
        }}
      >
        {items.map((coin, i) => {
          const up = coin.price_change_percentage_24h >= 0;
          return (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "0 24px",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                fontSize: "12px",
                color: "white",
              }}
            >
              <span style={{ fontWeight: 700, textTransform: "uppercase", color: "#93c5fd" }}>
                {coin.symbol.toUpperCase()}
              </span>
              <span style={{ fontWeight: 600 }}>{formatPrice(coin.current_price)}</span>
              <span style={{ color: up ? "#4ade80" : "#f87171", fontWeight: 600, fontSize: "11px" }}>
                {up ? "▲" : "▼"} {formatChange(coin.price_change_percentage_24h)}
              </span>
            </span>
          );
        })}
      </div>

      {/* Rechter Fade */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "40px",
          background: "linear-gradient(270deg, #0f3d6e 40%, transparent)",
          zIndex: 2,
        }}
      />

      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}