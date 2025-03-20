import { useQuery } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import IcWebSocket, { createWsConfig, generateRandomIdentity } from "ic-websocket-js";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AppMessage as FeedsAppMessage,
  News as FeedsCanister,
  NewsResponse as FeedsResponseCanister,
} from "../canister/ic.news.feeds";
import { Category, _SERVICE as FeedsService, idlFactory, Value } from "../canister/ic.news.feeds";

import type {
  AppMessage as NewsAppMessage,
  FullNews as NewsCanister,
  FullNewsResponse as NewsResponseCanister,
} from "../canister/ic.news.news";
import { idlFactory as NewsIdlFactory, _SERVICE as NewsService } from "../canister/ic.news.news";
import useActor from "./useActor";

interface Metadata {
  // Platform identifier (telegram/twitter/x)
  platform: string;
  // Original message URL for content retrieval
  url: string;
  // Channel or account username
  channel: string;
  // Original message identifier from the platform
  messageId: string;
  // Raw source content/text from original message
  source: string;
  // Channel/Account profile picture URL
  profilePic: string;
  // Unique identifier for the content author
  authorId: string;
  // Display name of the content author/channel
  authorName: string;
  // Verification status of the author/channel
  verified: boolean;

  sender: string;
  podcastDuration: string;
  podcastExplicit: boolean;
  podcastSubtitle: string;
  podcastEpisodeType: string;
  podcastTitle: string;
  description: string;
  website: string;
  contentSnippet: string;
  language: string;
  weight: string;
  sign: string;
  appPush: boolean;
  atomUpdated: string;
}
interface Provider {
  pid: string;
  alias: string;
}
export type Feeds = Omit<FeedsCanister, "metadata" | "created_at" | "provider"> & {
  created_at: number;
  metadata: Metadata;
  provider: Provider;
};
export type FeedsResponse = Omit<FeedsResponseCanister, "news"> & {
  news: Array<Feeds>;
};

export type News = Omit<NewsCanister, "metadata" | "created_at" | "provider"> & {
  created_at: number;
  metadata: Metadata;
  provider: Provider;
};
export type NewsResponse = Omit<NewsResponseCanister, "news"> & {
  news: Array<News>;
};
// Helper function to extract text from Value type
const getValueText = (value: Value | undefined): string => {
  if (!value || !("Text" in value)) {
    return "";
  }
  return value.Text;
};
const getValuePrincipal = (value: Value | undefined): string => {
  if (!value || !("Principal" in value)) {
    return "";
  }
  return value.Principal.toString();
};

// Helper function to extract boolean from Value type
const getValueBool = (value: Value | undefined): boolean => {
  if (!value || !("Bool" in value)) {
    return false;
  }
  return value.Bool;
};

const convertMetadata = (value: Value): Metadata => {
  if ("Map" in value) {
    const metadataMap = new Map(value.Map);
    console.log(metadataMap, "-metadataMap");
    let map: Record<string, any> = {};
    metadataMap.forEach((value: any, key: string) => {
      if (value.Text) {
        if (value.Text === "undefined") {
          map[key] = undefined;
        } else {
          map[key] = value.Text;
        }
      }
      if (value.Bool) {
        map[key] = value.Bool;
      }
      if (value.Principal) {
        map[key] = value.Principal.toString();
      }
    });
    return map as Metadata;
  }
  throw new Error("Invalid metadata format");
};
const convertProvider = (
  provider: Value
): {
  pid: string;
  alias: string;
} => {
  if ("Map" in provider) {
    const providerMap = new Map(provider.Map);
    return {
      pid: getValuePrincipal(providerMap.get("pid")),
      alias: getValueText(providerMap.get("alias")),
    };
  }
  throw new Error("Invalid provider format");
};
const convertFeeds = (news: FeedsCanister): Feeds => ({
  ...news,
  created_at: new BigNumber(Number(news.created_at)).toNumber(),
  metadata: convertMetadata(news.metadata),
  provider: convertProvider(news.provider),
});
const convertNews = (news: NewsCanister): News => ({
  ...news,
  created_at: new BigNumber(Number(news.created_at)).toNumber(),
  metadata: convertMetadata(news.metadata),
  provider: convertProvider(news.provider),
});

type TaskStatus = [boolean, string];

interface Archive {
  end: bigint;
  stored_news: bigint;
  start: bigint;
  canister: any; // Define specific canister interface if needed
}

// WebSocket configuration constants
const WS_GATEWAY_ADDRESS = "wss://api.ic.news/ws/";
const IC_URL = "https://icp-api.io";

/**
 * Hook for managing WebSocket connection to the news canister
 */
export function useFeedsWebSocket() {
  const actor = useActor<FeedsService>({
    canisterId: process.env.REACT_APP_FEEDS_CANISTER_ID as string,
    interfaceFactory: idlFactory,
  });

  const wsRef = useRef<IcWebSocket<FeedsService, FeedsAppMessage> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestNews, setLatestNews] = useState<Feeds[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize WebSocket on component mount
  useEffect(() => {
    let mounted = true;

    const initWs = async () => {
      if (!actor) {
        setError("Actor not initialized");
        return;
      }

      // Check if we already have an active connection
      if (wsRef.current?.readyState === 1) {
        console.log("WebSocket already connected");
        return;
      }

      try {
        // Create WebSocket configuration
        const wsConfig = createWsConfig({
          canisterId: process.env.REACT_APP_FEEDS_CANISTER_ID as string,
          canisterActor: actor,
          networkUrl: IC_URL,
          identity: generateRandomIdentity(),
        });

        // Create WebSocket instance
        const ws = new IcWebSocket(WS_GATEWAY_ADDRESS, undefined, wsConfig);

        // Setup event handlers
        ws.onopen = () => {
          if (!mounted) return;
          console.log("WebSocket connection established");
          setIsConnected(true);
          setError(null);

          // Subscribe to latest news updates
          const subscribeMessage: FeedsAppMessage = {
            topic: "get_latest_news",
            args: [],
            result: { Common: { Text: "" } },
            timestamp: BigInt(Date.now()),
          };
          ws.send(subscribeMessage);
        };

        ws.onmessage = (event) => {
          if (!mounted) return;
          const message = event.data;
          console.log("Received message:", message);

          if (message.result) {
            // Process received news data
            try {
              // Handle different types of WebSocketValue
              if ("LatestNews" in message.result) {
                const newsItems = message.result.LatestNews.map(convertFeeds);
                setLatestNews(newsItems);
              } else if ("NewsByHash" in message.result) {
                const newsItem = convertFeeds(message.result.NewsByHash);
                setLatestNews([newsItem]);
              } else if ("NewsByIndex" in message.result) {
                const newsItem = convertFeeds(message.result.NewsByIndex);
                setLatestNews([newsItem]);
              } else if ("NewsByTime" in message.result) {
                const newsItems = message.result.NewsByTime.map(convertFeeds);
                setLatestNews(newsItems);
              }
            } catch (err) {
              console.error("Error processing news data:", err);
            }
          }
        };

        ws.onerror = (event) => {
          if (!mounted) return;
          console.error("WebSocket error:", event.error);
          setError("WebSocket connection error");
        };

        ws.onclose = () => {
          if (!mounted) return;
          console.log("WebSocket connection closed");
          setIsConnected(false);
        };

        // Store WebSocket reference
        wsRef.current = ws;
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to initialize WebSocket:", err);
        setError("Failed to initialize WebSocket connection");
      }
    };

    initWs();

    // Cleanup function
    return () => {
      mounted = false;
      // Close and cleanup WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [actor]);

  // Request latest news manually
  const requestLatestNews = useCallback(() => {
    if (wsRef.current && isConnected) {
      const requestMessage: FeedsAppMessage = {
        topic: "get_latest_news",
        args: [],
        result: { Common: { Text: "" } },
        timestamp: BigInt(Date.now()),
      };
      wsRef.current.send(requestMessage);
    }
  }, [isConnected]);

  return {
    isConnected,
    latestNews,
    error,
    requestLatestNews,
  };
}

export const useFeedsCanister = () => {
  const actor = useActor<FeedsService>({
    canisterId: process.env.REACT_APP_FEEDS_CANISTER_ID as string,
    interfaceFactory: idlFactory,
  });

  // Get all categories
  const getCategories = useCallback(async (): Promise<Category[]> => {
    if (!actor) throw new Error("Actor not initialized");
    const response = await actor.get_categories();
    if ("err" in response) {
      throw new Error(JSON.stringify(response.err));
    }
    return response.ok;
  }, [actor]);

  // Get archives
  const getArchives = useCallback(async (): Promise<Archive[]> => {
    if (!actor) throw new Error("Actor not initialized");
    const response = await actor.get_archives();
    if ("err" in response) {
      throw new Error(JSON.stringify(response.err));
    }
    return response.ok;
  }, [actor]);

  // Get news by hash
  const getNewsByHash = useCallback(
    async (hash: string): Promise<Feeds> => {
      if (!actor) throw new Error("Actor not initialized");
      const response = await actor.get_news_by_hash(hash);
      if ("err" in response) {
        throw new Error(JSON.stringify(response.err));
      }
      return convertFeeds(response.ok);
    },
    [actor]
  );

  // Get news by index
  const getNewsByIndex = useCallback(
    async (index: bigint): Promise<Feeds> => {
      if (!actor) throw new Error("Actor not initialized");
      const response = await actor.get_news_by_index(index);
      if ("err" in response) {
        throw new Error(JSON.stringify(response.err));
      }
      return convertFeeds(response.ok);
    },
    [actor]
  );

  // Get news by time range
  const getNewsByTime = useCallback(
    async (start: bigint, end: bigint): Promise<Feeds[]> => {
      if (!actor) throw new Error("Actor not initialized");
      const response = await actor.get_news_by_time(start, end);
      if ("err" in response) {
        throw new Error(JSON.stringify(response.err));
      }
      return response.ok.map(convertFeeds) || [];
    },
    [actor]
  );

  // Get all tags
  const getTags = useCallback(async (): Promise<Category[]> => {
    if (!actor) throw new Error("Actor not initialized");
    const response = await actor.get_tags();
    if ("err" in response) {
      throw new Error(JSON.stringify(response.err));
    }
    return response.ok || [];
  }, [actor]);

  // Get task status
  const getTaskStatus = useCallback(async (): Promise<TaskStatus> => {
    if (!actor) throw new Error("Actor not initialized");
    const response = await actor.get_task_status();
    if ("err" in response) {
      throw new Error(JSON.stringify(response.err));
    }
    return response.ok!;
  }, [actor]);

  // Query latest news
  const queryLatestNews = useCallback(
    async (count: bigint): Promise<Feeds[]> => {
      if (!actor) throw new Error("Actor not initialized");
      const response = await actor.query_latest_news(count);
      if ("err" in response) {
        throw new Error(JSON.stringify(response.err));
      }
      return response.ok.map(convertFeeds) || [];
    },
    [actor]
  );

  // Query news with pagination
  const queryNews = useCallback(
    async (start: bigint, length: bigint): Promise<FeedsResponse> => {
      if (!actor) throw new Error("Actor not initialized");
      const response = await actor.query_news({ start, length });
      return {
        ...response,
        news: response.news.map(convertFeeds).sort((a, b) => b.created_at - a.created_at),
      };
    },
    [actor]
  );

  // Get total news count
  const getTotalNews = useCallback(async (): Promise<bigint> => {
    if (!actor) throw new Error("Actor not initialized");
    const response = await actor.total_news();
    if ("err" in response) {
      throw new Error(JSON.stringify(response.err));
    }
    return response.ok!;
  }, [actor]);

  // React Query hooks
  const useCategories = () =>
    useQuery({
      queryKey: ["categories"],
      queryFn: getCategories,
    });

  const useTags = () =>
    useQuery({
      queryKey: ["tags"],
      queryFn: getTags,
    });

  const useTaskStatus = () =>
    useQuery({
      queryKey: ["taskStatus"],
      queryFn: getTaskStatus,
    });

  const useTotalNews = () =>
    useQuery({
      queryKey: ["totalNews"],
      queryFn: getTotalNews,
    });

  return {
    getArchives,
    getCategories,
    getNewsByHash,
    getNewsByIndex,
    getNewsByTime,
    getTags,
    getTaskStatus,
    queryLatestNews,
    queryNews,
    getTotalNews,
    // React Query hooks
    useCategories,
    useTags,
    useTaskStatus,
    useTotalNews,
  };
};
export function useFeeds(limit: bigint = BigInt(20)) {
  const { queryLatestNews, queryNews, getTotalNews } = useFeedsCanister();
  const {
    latestNews: wsLatestNews,
    isConnected: wsConnected,
    requestLatestNews,
  } = useFeedsWebSocket();

  const [news, setNews] = useState<Feeds[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState<bigint>(BigInt(0));
  const [newNewsCount, setNewNewsCount] = useState<number>(0);

  // Initialize with latest news and setup pagination
  useEffect(() => {
    const init = async () => {
      try {
        const [totalCount, latestNews] = await Promise.all([
          getTotalNews(),
          queryLatestNews(limit),
        ]);

        setTotal(totalCount);
        setNews(latestNews);
        // Calculate if there are more pages based on total count
        setHasNextPage(totalCount > limit);
      } catch (error) {
        console.error("Failed to initialize news flash:", error);
      }
    };
    init();
  }, []);

  // Update news when WebSocket provides new data
  useEffect(() => {
    if (wsConnected && wsLatestNews.length > 0) {
      setNews((prevNews) => {
        // Only update if we have new content
        if (wsLatestNews[0]?.hash !== prevNews[0]?.hash) {
          const existingHashes = new Set(prevNews.map((n) => n.hash));
          const uniqueNewNews = wsLatestNews.filter((n) => !existingHashes.has(n.hash));

          // Update new news count and total count
          const newCount = uniqueNewNews.length;
          setNewNewsCount((prev) => prev + newCount);
          setTotal((prev) => prev + BigInt(newCount));

          return [...uniqueNewNews, ...prevNews];
        }
        return prevNews;
      });
    }
  }, [wsLatestNews, wsConnected]);

  // Fallback to polling if WebSocket is not connected
  useEffect(() => {
    if (!wsConnected) {
      const updateNews = async () => {
        try {
          const latestNews = await queryLatestNews(limit);
          setNews((prevNews) => {
            // Only update if we have new content
            if (latestNews[0]?.hash !== prevNews[0]?.hash) {
              const existingHashes = new Set(prevNews.map((n) => n.hash));
              const uniqueNewNews = latestNews.filter((n) => !existingHashes.has(n.hash));

              // Update new news count and total count
              const newCount = uniqueNewNews.length;
              setNewNewsCount((prev) => prev + newCount);
              setTotal((prev) => prev + BigInt(newCount));

              return [...uniqueNewNews, ...prevNews];
            }
            return prevNews;
          });
        } catch (error) {
          console.error("Failed to fetch latest news:", error);
        }
      };

      const intervalId = setInterval(updateNews, 10000);
      return () => clearInterval(intervalId);
    }
  }, [wsConnected]);

  // Create a function to refresh news
  const refreshNews = useCallback(() => {
    if (wsConnected && requestLatestNews) {
      // If we're using WebSocket, request latest news
      requestLatestNews();
    } else {
      // Fallback to traditional fetch
      queryLatestNews(limit)
        .then((latestNews) => {
          setNews((prevNews) => {
            if (latestNews[0]?.hash !== prevNews[0]?.hash) {
              const existingHashes = new Set(prevNews.map((n) => n.hash));
              const uniqueNewNews = latestNews.filter((n) => !existingHashes.has(n.hash));

              // Update counts
              const newCount = uniqueNewNews.length;
              setNewNewsCount((prev) => prev + newCount);
              setTotal((prev) => prev + BigInt(newCount));

              return [...uniqueNewNews, ...prevNews];
            }
            return prevNews;
          });
        })
        .catch((err) => {
          console.error("Failed to refresh news:", err);
        });
    }
  }, [wsConnected, requestLatestNews, queryLatestNews, limit]);

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isLoading) return;

    setIsLoading(true);
    try {
      // Calculate the start position from the end
      // total - (current news length) - limit = start position for next page
      const currentNewsLength = BigInt(news.length);
      const start = total - currentNewsLength - limit;

      const response = await queryNews(start >= BigInt(0) ? start : BigInt(0), limit);

      // Only update if we got new news
      if (response.news.length > 0) {
        setNews((prevNews) => [...prevNews, ...response.news]);
        setPage((prev) => prev + 1);

        // Check if we have more pages
        // We have more pages if start position > 0
        setHasNextPage(start - limit >= BigInt(0));
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Failed to load next page:", error);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasNextPage, isLoading, limit, news.length, total]);

  return {
    news,
    loadNextPage,
    hasNextPage,
    isLoading,
    // WebSocket related states
    wsConnected,
    newNewsCount,
    refreshNews,
  };
}

/**
 * Hook for managing WebSocket connection to the news canister
 */
export function useNewsWebSocket() {
  const actor = useActor<NewsService>({
    canisterId: process.env.REACT_APP_FEEDS_CANISTER_ID as string,
    interfaceFactory: NewsIdlFactory,
  });

  const wsRef = useRef<IcWebSocket<NewsService, NewsAppMessage> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize WebSocket on component mount
  useEffect(() => {
    let mounted = true;

    const initWs = async () => {
      if (!actor) {
        setError("Actor not initialized");
        return;
      }

      // Check if we already have an active connection
      if (wsRef.current?.readyState === 1) {
        console.log("WebSocket already connected");
        return;
      }

      try {
        // Create WebSocket configuration
        const wsConfig = createWsConfig({
          canisterId: process.env.REACT_APP_FEEDS_CANISTER_ID as string,
          canisterActor: actor,
          networkUrl: IC_URL,
          identity: generateRandomIdentity(),
        });

        // Create WebSocket instance
        const ws = new IcWebSocket(WS_GATEWAY_ADDRESS, undefined, wsConfig);

        // Setup event handlers
        ws.onopen = () => {
          if (!mounted) return;
          console.log("WebSocket connection established");
          setIsConnected(true);
          setError(null);

          // Subscribe to latest news updates
          const subscribeMessage: NewsAppMessage = {
            topic: "get_latest_news",
            args: [],
            result: { Common: { Text: "" } },
            timestamp: BigInt(Date.now()),
          };
          ws.send(subscribeMessage);
        };

        ws.onmessage = (event) => {
          if (!mounted) return;
          const message = event.data;
          console.log("Received message:", message);

          if (message.result) {
            // Process received news data
            try {
              // Handle different types of WebSocketValue
              if ("LatestNews" in message.result) {
                const newsItems = message.result.LatestNews.map(convertNews);
                setLatestNews(newsItems);
              } else if ("NewsByHash" in message.result) {
                const newsItem = convertNews(message.result.NewsByHash);
                setLatestNews([newsItem]);
              } else if ("NewsByIndex" in message.result) {
                const newsItem = convertNews(message.result.NewsByIndex);
                setLatestNews([newsItem]);
              } else if ("NewsByTime" in message.result) {
                const newsItems = message.result.NewsByTime.map(convertNews);
                setLatestNews(newsItems);
              }
            } catch (err) {
              console.error("Error processing news data:", err);
            }
          }
        };

        ws.onerror = (event) => {
          if (!mounted) return;
          console.error("WebSocket error:", event.error);
          setError("WebSocket connection error");
        };

        ws.onclose = () => {
          if (!mounted) return;
          console.log("WebSocket connection closed");
          setIsConnected(false);
        };

        // Store WebSocket reference
        wsRef.current = ws;
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to initialize WebSocket:", err);
        setError("Failed to initialize WebSocket connection");
      }
    };

    initWs();

    // Cleanup function
    return () => {
      mounted = false;
      // Close and cleanup WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [actor]);

  // Request latest news manually
  const requestLatestNews = useCallback(() => {
    if (wsRef.current && isConnected) {
      const requestMessage: NewsAppMessage = {
        topic: "get_latest_news",
        args: [],
        result: { Common: { Text: "" } },
        timestamp: BigInt(Date.now()),
      };
      wsRef.current.send(requestMessage);
    }
  }, [isConnected]);

  return {
    isConnected,
    latestNews,
    error,
    requestLatestNews,
  };
}
export const useNewsCanister = () => {
  const actor = useActor<NewsService>({
    canisterId: process.env.REACT_APP_NEWS_CANISTER_ID as string,
    interfaceFactory: NewsIdlFactory,
  });

  // Get all categories
  const getCategories = useCallback(async (): Promise<Category[]> => {
    if (!actor) throw new Error("Actor not initialized");
    const response = await actor.get_categories();
    if ("err" in response) {
      throw new Error(JSON.stringify(response.err));
    }
    return response.ok;
  }, [actor]);

  // Get archives
  const getArchives = useCallback(async (): Promise<Archive[]> => {
    if (!actor) throw new Error("Actor not initialized");
    const response = await actor.get_archives();
    if ("err" in response) {
      throw new Error(JSON.stringify(response.err));
    }
    return response.ok;
  }, [actor]);

  // Get news by hash
  const getNewsByHash = useCallback(
    async (hash: string): Promise<News> => {
      if (!actor) throw new Error("Actor not initialized");
      const response = await actor.get_news_by_hash(hash);
      if ("err" in response) {
        throw new Error(JSON.stringify(response.err));
      }
      return convertNews(response.ok);
    },
    [actor]
  );

  // Get news by index
  const getNewsByIndex = useCallback(
    async (index: bigint): Promise<News> => {
      if (!actor) throw new Error("Actor not initialized");
      const response = await actor.get_news_by_index(index);
      if ("err" in response) {
        throw new Error(JSON.stringify(response.err));
      }
      return convertNews(response.ok);
    },
    [actor]
  );

  // Get news by time range
  const getNewsByTime = useCallback(
    async (start: bigint, end: bigint): Promise<News[]> => {
      if (!actor) throw new Error("Actor not initialized");
      const response = await actor.get_news_by_time(start, end);
      if ("err" in response) {
        throw new Error(JSON.stringify(response.err));
      }
      return response.ok.map(convertNews) || [];
    },
    [actor]
  );

  // Get all tags
  const getTags = useCallback(async (): Promise<Category[]> => {
    if (!actor) throw new Error("Actor not initialized");
    const response = await actor.get_tags();
    if ("err" in response) {
      throw new Error(JSON.stringify(response.err));
    }
    return response.ok || [];
  }, [actor]);

  // Get task status
  const getTaskStatus = useCallback(async (): Promise<TaskStatus> => {
    if (!actor) throw new Error("Actor not initialized");
    const response = await actor.get_task_status();
    if ("err" in response) {
      throw new Error(JSON.stringify(response.err));
    }
    return response.ok!;
  }, [actor]);

  // Query latest news
  const queryLatestNews = useCallback(
    async (count: bigint): Promise<News[]> => {
      if (!actor) throw new Error("Actor not initialized");
      const response = await actor.query_latest_news(count);
      if ("err" in response) {
        throw new Error(JSON.stringify(response.err));
      }
      return response.ok.map(convertNews) || [];
    },
    [actor]
  );

  // Query news with pagination
  const queryNews = useCallback(
    async (start: bigint, length: bigint): Promise<NewsResponse> => {
      if (!actor) throw new Error("Actor not initialized");
      const response = await actor.query_news({ start, length });
      return {
        ...response,
        news: response.news.map(convertNews).sort((a, b) => b.created_at - a.created_at),
      };
    },
    [actor]
  );

  // Get total news count
  const getTotalNews = useCallback(async (): Promise<bigint> => {
    if (!actor) throw new Error("Actor not initialized");
    const response = await actor.total_news();
    if ("err" in response) {
      throw new Error(JSON.stringify(response.err));
    }
    return response.ok!;
  }, [actor]);

  // React Query hooks
  const useCategories = () =>
    useQuery({
      queryKey: ["categories"],
      queryFn: getCategories,
    });

  const useTags = () =>
    useQuery({
      queryKey: ["tags"],
      queryFn: getTags,
    });

  const useTaskStatus = () =>
    useQuery({
      queryKey: ["taskStatus"],
      queryFn: getTaskStatus,
    });

  const useTotalNews = () =>
    useQuery({
      queryKey: ["totalNews"],
      queryFn: getTotalNews,
    });

  return {
    getArchives,
    getCategories,
    getNewsByHash,
    getNewsByIndex,
    getNewsByTime,
    getTags,
    getTaskStatus,
    queryLatestNews,
    queryNews,
    getTotalNews,
    // React Query hooks
    useCategories,
    useTags,
    useTaskStatus,
    useTotalNews,
  };
};
export function useNews(limit: bigint = BigInt(20)) {
  const { queryLatestNews, queryNews, getTotalNews } = useNewsCanister();
  const {
    latestNews: wsLatestNews,
    isConnected: wsConnected,
    requestLatestNews,
  } = useNewsWebSocket();

  const [news, setNews] = useState<News[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState<bigint>(BigInt(0));
  const [newNewsCount, setNewNewsCount] = useState<number>(0);

  // Initialize with latest news and setup pagination
  useEffect(() => {
    const init = async () => {
      try {
        const [totalCount, latestNews] = await Promise.all([
          getTotalNews(),
          queryLatestNews(limit),
        ]);

        setTotal(totalCount);
        setNews(latestNews);
        // Calculate if there are more pages based on total count
        setHasNextPage(totalCount > limit);
      } catch (error) {
        console.error("Failed to initialize news flash:", error);
      }
    };
    init();
  }, []);

  // Update news when WebSocket provides new data
  useEffect(() => {
    if (wsConnected && wsLatestNews.length > 0) {
      setNews((prevNews) => {
        // Only update if we have new content
        if (wsLatestNews[0]?.hash !== prevNews[0]?.hash) {
          const existingHashes = new Set(prevNews.map((n) => n.hash));
          const uniqueNewNews = wsLatestNews.filter((n) => !existingHashes.has(n.hash));

          // Update new news count and total count
          const newCount = uniqueNewNews.length;
          setNewNewsCount((prev) => prev + newCount);
          setTotal((prev) => prev + BigInt(newCount));

          return [...uniqueNewNews, ...prevNews];
        }
        return prevNews;
      });
    }
  }, [wsLatestNews, wsConnected]);

  // Fallback to polling if WebSocket is not connected
  useEffect(() => {
    if (!wsConnected) {
      const updateNews = async () => {
        try {
          const latestNews = await queryLatestNews(limit);
          setNews((prevNews) => {
            // Only update if we have new content
            if (latestNews[0]?.hash !== prevNews[0]?.hash) {
              const existingHashes = new Set(prevNews.map((n) => n.hash));
              const uniqueNewNews = latestNews.filter((n) => !existingHashes.has(n.hash));

              // Update new news count and total count
              const newCount = uniqueNewNews.length;
              setNewNewsCount((prev) => prev + newCount);
              setTotal((prev) => prev + BigInt(newCount));

              return [...uniqueNewNews, ...prevNews];
            }
            return prevNews;
          });
        } catch (error) {
          console.error("Failed to fetch latest news:", error);
        }
      };

      const intervalId = setInterval(updateNews, 10000);
      return () => clearInterval(intervalId);
    }
  }, [wsConnected]);

  // Create a function to refresh news
  const refreshNews = useCallback(() => {
    if (wsConnected && requestLatestNews) {
      // If we're using WebSocket, request latest news
      requestLatestNews();
    } else {
      // Fallback to traditional fetch
      queryLatestNews(limit)
        .then((latestNews) => {
          setNews((prevNews) => {
            if (latestNews[0]?.hash !== prevNews[0]?.hash) {
              const existingHashes = new Set(prevNews.map((n) => n.hash));
              const uniqueNewNews = latestNews.filter((n) => !existingHashes.has(n.hash));

              // Update counts
              const newCount = uniqueNewNews.length;
              setNewNewsCount((prev) => prev + newCount);
              setTotal((prev) => prev + BigInt(newCount));

              return [...uniqueNewNews, ...prevNews];
            }
            return prevNews;
          });
        })
        .catch((err) => {
          console.error("Failed to refresh news:", err);
        });
    }
  }, [wsConnected, requestLatestNews, queryLatestNews, limit]);

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isLoading) return;

    setIsLoading(true);
    try {
      // Calculate the start position from the end
      // total - (current news length) - limit = start position for next page
      const currentNewsLength = BigInt(news.length);
      const start = total - currentNewsLength - limit;

      const response = await queryNews(start >= BigInt(0) ? start : BigInt(0), limit);

      // Only update if we got new news
      if (response.news.length > 0) {
        setNews((prevNews) => [...prevNews, ...response.news]);
        setPage((prev) => prev + 1);

        // Check if we have more pages
        // We have more pages if start position > 0
        setHasNextPage(start - limit >= BigInt(0));
      } else {
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Failed to load next page:", error);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasNextPage, isLoading, limit, news.length, total]);

  return {
    news,
    loadNextPage,
    hasNextPage,
    isLoading,
    // WebSocket related states
    wsConnected,
    newNewsCount,
    refreshNews,
  };
}
