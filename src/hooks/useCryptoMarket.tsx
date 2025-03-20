import { useCallback, useEffect, useState } from "react";
import {
  getCryptoMarketData,
  getLastFetchTime,
  saveCryptoMarketData,
  STORES,
} from "../services/db";

interface Quote {
  price: number;
  volume_24h: number;
  volume_change_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
  market_cap_dominance: number;
  fully_diluted_market_cap: number;
  last_updated: string;
}

export interface Listing {
  id: number;
  symbol: string;
  name: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  infinite_supply: boolean;
  tags: string[];
  platform: any;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  quote: Quote;
  last_updated: string;
}

interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ListingsResponse {
  data: Listing[];
  pagination: PaginationResponse;
}

interface SearchResponse {
  data: Listing[];
}

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3080/api";

interface UseMarketDataResult {
  loading: boolean;
  error: string | null;
  getListings: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
  }) => Promise<ListingsResponse | null>;
  searchListings: (query: string) => Promise<SearchResponse | null>;
  getListingBySymbol: (symbol: string) => Promise<Listing | null>;
  getTopListings: (limit?: number, stablecoins?: boolean) => Promise<Listing[]>;
}

const CACHE_DURATION = 30000; // 1 minute in milliseconds

export function useCryptoMarket(): UseMarketDataResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (endpoint: string, params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(endpoint, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getListings = useCallback(
    async (params?: { page?: number; limit?: number; sort?: string; order?: "asc" | "desc" }) => {
      return fetchData(`${BASE_URL}/listings`, params);
    },
    [fetchData]
  );

  const searchListings = useCallback(
    async (query: string) => {
      return fetchData(`${BASE_URL}/listings/search`, { q: query });
    },
    [fetchData]
  );

  const getListingBySymbol = useCallback(
    async (symbol: string) => {
      const response = await fetchData(`${BASE_URL}/listings/symbol/${symbol}`);
      return response?.data || null;
    },
    [fetchData]
  );

  const getTopListings = useCallback(
    async (limit: number = 10, stablecoins = true) => {
      try {
        // Get cached data first
        const cachedData = await getCryptoMarketData(STORES.TOP_LISTINGS);

        // Start fetching new data if needed
        const lastUpdate = await getLastFetchTime(STORES.CRYPTO_MARKET);
        const now = Date.now();

        // If cache is expired or empty, fetch new data in background
        if (!cachedData.length || now - lastUpdate > CACHE_DURATION) {
          // Return cached data immediately if available
          if (cachedData.length > 0) {
            // Fetch new data in background
            fetchData(`${BASE_URL}/listings/top/${limit}?stablecoins=${stablecoins}`)
              .then((response) => {
                const data = response?.data || [];
                if (data.length > 0) {
                  saveCryptoMarketData(data, STORES.TOP_LISTINGS);
                }
              })
              .catch((error) => {
                console.error("Background fetch error:", error);
              });

            return cachedData;
          }

          // If no cache, wait for fresh data
          const response = await fetchData(
            `${BASE_URL}/listings/top/${limit}?stablecoins=${stablecoins}`
          );
          const data = response?.data || [];

          if (data.length > 0) {
            await saveCryptoMarketData(data, STORES.TOP_LISTINGS);
          }

          return data;
        }

        // Return cached data if it's still valid
        return cachedData;
      } catch (error) {
        console.error("Error in getTopListings:", error);
        // If fetching fails, try to return cached data as fallback
        return getCryptoMarketData(STORES.TOP_LISTINGS);
      }
    },
    [fetchData]
  );

  return {
    loading,
    error,
    getListings,
    searchListings,
    getListingBySymbol,
    getTopListings,
  };
}

export function useTopCryptoListings(limit: number = 10, stablecoins = true) {
  const { error, getTopListings } = useCryptoMarket();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        // Load cached data immediately
        const cachedData = await getCryptoMarketData(STORES.TOP_LISTINGS);
        if (mounted && cachedData.length > 0) {
          setListings(cachedData);
        }

        // Check if update is needed
        const lastUpdate = await getLastFetchTime(STORES.CRYPTO_MARKET);
        const now = Date.now();

        // If cache is expired or empty, get fresh data
        if (!cachedData.length || now - lastUpdate > CACHE_DURATION) {
          const freshData = await getTopListings(limit, stablecoins);
          if (mounted && freshData.length > 0) {
            setListings(freshData);
          }
        }
      } catch (error) {
        console.error("Error loading top listings:", error);
      } finally {
        if (mounted) {
          setLoadingState(false);
        }
      }
    }

    loadData();

    // Set up refresh interval
    const intervalId = setInterval(loadData, CACHE_DURATION);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [getTopListings, limit, stablecoins]);

  return {
    loading: loadingState,
    error,
    listings,
  };
}
