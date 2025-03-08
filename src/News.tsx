import { format, formatDistance } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { ChevronUp } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link } from "react-router-dom";
import ICExplorer from "./assets/images/ic-explorer.svg";
import Telegram from "./assets/images/telegram.svg";
import X from "./assets/images/x.svg";
import IcNews from "./assets/logo.svg";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Copy } from "./components/ui/copy";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./components/ui/hover-card";
import { Loading } from "./components/ui/loading";
import { useNotification } from "./context/NotificationContext";
import type { News } from "./hooks/useNewsCanister";
import { useNews } from "./hooks/useNewsCanister";
import { abbreviateAddress, classNames } from "./utils";

// Container Component
export default function ICNewsAppContainer() {
  const [activeTab, setActiveTab] = useState("For You");

  const tabs = ["Following", "WatchList Updates", "For You", "Trending Today", "Market"];

  return <ICNewsApp tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />;
}
export const platformImages: { [key: string]: string } = {
  telegram: Telegram,
  x: X,
  ICExplorer: ICExplorer,
};
export const alias: { [key: string]: string } = {
  "ic.news": "IC.News",
};
export const verifyChannel: { [key: string]: string } = {
  "ic.news": IcNews,
};
// UI Component
function ICNewsApp({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const { news, loadNextPage, hasNextPage } = useNews();
  const { hasPermission, requestPermission, sendNotification } = useNotification();
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Track if initial load is complete
  const prevNewsHashRef = useRef<string>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    if (news.length > 0) {
      const latestNews = news[0];
      if (!latestNews.title || !latestNews.description) return;

      // If it's initial load, just store the hash and mark initial load as complete
      if (isInitialLoadRef.current) {
        prevNewsHashRef.current = latestNews.hash;
        isInitialLoadRef.current = false;
        return;
      }

      // Only send notification if the hash is different from the previous one
      if (prevNewsHashRef.current !== latestNews.hash) {
        sendNotification(latestNews.title, {
          body: latestNews.description,
          icon: "/icons/icon-192x192.png", // Make sure you have a favicon
          tag: latestNews.hash, // Prevent duplicate notifications
          href: `/news/${latestNews.hash}`, // Store href in data field
        });
        prevNewsHashRef.current = latestNews.hash;
      }
    }
  }, [news, sendNotification]);
  return (
    <div
      className="flex flex-col w-full h-screen flex-1 overflow-auto min-h-0 relative"
      id="scrollableDiv"
    >
      {/* Main Content */}
      {/* Tabs */}
      {/* <div className="flex items-center space-x-8 border-b border-gray-200">
        {tabs.map((tab: string) => (
          <button
            key={tab}
            className={`pb-4 ${
              activeTab === tab ? "border-b-2 border-black font-medium" : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div> */}
      {/* News Feed */}
      {news.length === 0 ? (
        <Loading text="Loading news..." />
      ) : (
        <>
          <div className="flex-none text-lg font-bold text-[var(--text-color-primary)] py-3 px-3 md:py-4 md:px-6">
            {news[0]?.created_at && format(Number(news[0].created_at), "MMMM dd EEEE")}
          </div>
          <InfiniteScroll
            dataLength={news.length}
            next={loadNextPage}
            hasMore={hasNextPage}
            loader={<Loading text="Loading more news..." className="min-h-[100px]" />}
            endMessage={
              <div className="text-center py-4 text-sm text-[var(--text-color-secondary)]">
                No more news to load.
              </div>
            }
            className="px-3 md:px-6 space-y-3 h-full relative"
            scrollableTarget="scrollableDiv"
          >
            {news.map((item: News, itemIdx: number) => {
              const channel = item?.metadata?.channel;
              const sender = item?.provider?.alias || "IC.News";
              const platform = item?.metadata?.platform;
              return (
                <Link
                  to={`/news/${item.hash}`}
                  key={item.hash}
                  className="group relative flex gap-x-3 md:gap-x-4"
                >
                  <div className="relative flex">
                    <div
                      className={classNames(
                        itemIdx === news.length - 1 ? "h-6" : "-bottom-6",
                        itemIdx === 0 ? "mt-5" : "",
                        "absolute left-0 top-0 right-0 m-auto flex w-2 justify-center"
                      )}
                    >
                      <div className="w-px bg-[--border-color]" />
                    </div>
                    <div
                      className={classNames(
                        "relative mt-5 w-[8px] h-[8px] ml-px flex-none rounded-full bg-[--text-color-primary]",
                        itemIdx === 0 ? " ring-2 ring-black ring-offset-2 animate-pulse-ring" : ""
                      )}
                    />
                  </div>
                  <div className="flex-auto rounded-md p-2 flex justify-between gap-x-4 gap-y-1 md:gap-y-2 flex-col">
                    <h3 className="text-xl font-bold font-semibold text-[var(--text-color-primary)] leading-snug group-hover:text-[var(--color-primary)]">
                      {item.title}
                    </h3>
                    <div className="flex gap-1 md:gap-2 flex-wrap">
                      <time
                        dateTime={formatInTimeZone(
                          new Date(item.created_at),
                          "Asia/Shanghai",
                          "MM/dd/yyyy HH:mm:ss zzz"
                        )}
                        className="flex-none py-0.5 text-xs/5 text-[var(--text-color-primary)]"
                      >
                        {item.created_at &&
                          formatInTimeZone(
                            new Date(item.created_at),
                            "Asia/Shanghai",
                            "MM/dd/yyyy HH:mm:ss zzz"
                          )}{" "}
                        (
                        {formatDistance(new Date(item.created_at), new Date(), {
                          addSuffix: true,
                        })}
                        )
                      </time>
                      <div className="flex gap-2">
                        {(channel || platform) && (
                          <Button className="p-0 bg-transparent min-h-0 h-auto hover:bg-transparent">
                            <Badge variant="secondary" translate="no" className="flex gap-1">
                              <img
                                className="w-[16px] rounded-full"
                                src={
                                  item?.metadata?.profilePic ||
                                  (channel && verifyChannel[channel]) ||
                                  (platform && platformImages[platform])
                                }
                                alt={`${platform} icon`}
                              />
                              {channel || platform}
                            </Badge>
                          </Button>
                        )}
                        <div className="relative">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button className="p-0 bg-transparent min-h-0 h-auto hover:bg-transparent">
                                <Badge
                                  variant="secondary"
                                  translate="no"
                                  className="flex gap-1 cursor-pointer"
                                >
                                  {verifyChannel[sender] && (
                                    <img
                                      className="w-[16px] rounded-full"
                                      src={verifyChannel[sender]}
                                      alt={`${sender} icon`}
                                    />
                                  )}
                                  {alias[sender] || sender}
                                </Badge>
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent
                              className="w-50 flex items-center justify-center p-0 rounded cursor-default"
                              onClick={(e: any) => {
                                e.stopPropagation();
                                e.preventDefault();
                                return false;
                              }}
                            >
                              <div className="bg-white rounded overflow-hidden">
                                <span className="w-full flex justify-center pt-2 font-medium text-sm text-gray-600">
                                  Scan to Support Author
                                </span>
                                <div className="p-3">
                                  <QRCodeCanvas
                                    value={item.provider.pid}
                                    size={180}
                                    level="H"
                                    includeMargin={false}
                                  />
                                </div>
                                <Copy
                                  className="flex justify-center items-center pb-2 text-xs text-gray-500 hover:text-[var(--color-primary)]"
                                  text={item.provider.pid}
                                >
                                  {abbreviateAddress(item.provider.pid)}
                                </Copy>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      </div>
                    </div>
                    <div
                      className="text-sm/6 text-[var(--text-color-primary)] whitespace-pre-line [&_a]:text-blue-500 [&_a]:hover:underline line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: item.description.replace(/\n/g, "<br />"),
                      }}
                    />
                    <div className="flex gap-2 w-full flex-wrap">
                      {item?.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </InfiniteScroll>
          <Top id="scrollableDiv" />
        </>
      )}
    </div>
  );
}

function Top({ id }: { id: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollableDiv = document.getElementById(id);
      if (scrollableDiv) {
        setIsVisible(scrollableDiv.scrollTop > 300);
      }
    };

    const scrollableDiv = document.getElementById(id);
    if (scrollableDiv) {
      scrollableDiv.addEventListener("scroll", toggleVisibility);
      return () => {
        scrollableDiv.removeEventListener("scroll", toggleVisibility);
      };
    }
  }, [id]);

  const scrollToTop = () => {
    const scrollableDiv = document.getElementById(id);
    if (scrollableDiv) {
      scrollableDiv.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="sticky w-10 h-10 bottom-4 left-[100%] mr-4 bg-[var(--color-primary)] text-white p-2 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300 z-50"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
}
