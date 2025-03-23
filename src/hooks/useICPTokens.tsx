import { useEffect, useState } from "react";

interface Chart {
  name: string;
  price: number;
}

export interface TOKEN {
  id: number;
  canister_id: string;
  token_standard_id: number;
  symbol: string;
  name: string;
  display_name: null;
  logo: string;
  decimals: number;
  total_supply: string;
  fee: string;
  price: string;
  rank: number;
  fully_diluted_market_cap: string;
  is_published: number;
  is_sns: number;
  is_deprecated: number;
  metrics: {
    price: {
      icp: number;
      usd: string;
    };
    fully_diluted_market_cap: {
      icp: number;
      usd: string;
    };
    volume: {
      usd: {
        "24h": number;
        "7d": number;
        "30d": number;
      };
      icp: {
        "24h": number;
        "7d": number;
        "30d": number;
      };
    };
    change: {
      "24h": {
        icp: number;
        usd: number;
      };
      "7d": {
        icp: number;
        usd: number;
      };
      "30d": {
        icp: number;
        usd: number;
      };
      "90d": {
        icp: number;
        usd: number;
      };
    };
    chartLast7Days: {
      USD: Chart[];
      ICP: Chart[];
    };
  };
}
const cacheTime = 60000;
export function useICPTokens() {
  const [tokens, setTokens] = useState<TOKEN[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Define data fetching function
    const fetchTokens = async () => {
      try {
        // Only fetch if cache is older than 1 minute
        const response = await fetch("https://web2.icptokens.net/api/tokens");
        const data = (await response.json()).sort((a: TOKEN, b: TOKEN) => a.rank - b.rank);
        setTokens(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setLoading(false);
      }
    };

    // Then fetch fresh data
    fetchTokens();

    // Set up polling interval (1 minute)
    const interval = setInterval(fetchTokens, cacheTime);

    // Cleanup function
    return () => clearInterval(interval);
  }, []);

  return {
    tokens,
    loading,
  };
}
