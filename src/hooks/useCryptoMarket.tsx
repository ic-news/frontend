import { useCallback, useEffect, useState } from "react";
import type { Listing, _SERVICE as MarketService } from "../canister/ic.news.market";
import { idlFactory } from "../canister/ic.news.market";
import useActor from "./useActor";

interface SearchResponse {
  data: Listing[];
}

interface UseMarketDataResult {
  loading: boolean;
  error: string | null;
  getListings: (
    limit: number,
    offset: number,
    exclude_stablecoins: boolean
  ) => Promise<Listing[] | null>;
  searchLoading: boolean;
  searchListings: (query: string) => Promise<SearchResponse | null>;
}

const CACHE_DURATION = 30000; // 1 minute in milliseconds

export function useCryptoMarket(): UseMarketDataResult {
  const actor = useActor<MarketService>({
    canisterId: process.env.REACT_APP_MARKET_CANISTER_ID as string,
    interfaceFactory: idlFactory,
  });
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getListings = useCallback(
    async (
      limit: number = 10,
      offset: number = 0,
      exclude_stablecoins: boolean = true
    ): Promise<Listing[] | null> => {
      if (!actor) return null;
      setLoading(true);
      try {
        const result = await actor.get_listings(
          [BigInt(limit)],
          [BigInt(offset)],
          [exclude_stablecoins]
        );
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [actor]
  );

  const searchListings = useCallback(
    async (query: string): Promise<SearchResponse | null> => {
      if (!actor) return null;
      setSearchLoading(true);
      try {
        const result = await actor.get_listing(query);
        return { data: result };
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        return null;
      } finally {
        setSearchLoading(false);
      }
    },
    [actor]
  );

  return {
    loading,
    error,
    getListings,
    searchLoading,
    searchListings,
  };
}

export function useTopCryptoListings(limit: number = 5) {
  const { error, getListings } = useCryptoMarket();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        // If cache is expired or empty, get fresh data
        const freshData = await getListings(limit, 0, true);
        if (mounted && freshData) {
          setListings(freshData.slice(0, limit));
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
  }, [getListings, limit]);

  return {
    loading: loadingState,
    error,
    listings,
  };
}
export { Listing };
