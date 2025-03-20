import Logo from "@/assets/logo.svg";
import BadgeComponents from "@/components/Badge";
import { Loading } from "@/components/ui/loading";
import { Skeleton } from "@/components/ui/skeleton";
import { Top } from "@/Flash";
import { Feeds, useFeeds } from "@/hooks/useNewsCanister";
import { formatDistance } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { motion } from "motion/react";
import * as React from "react";
import { useCallback, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

interface Theme {
  background: string;
  textColor: string;
  secondaryBackground: string;
  borderColor: string;
  primaryColor: string;
  secondaryTextColor: string;
  badgeBackground: string;
  badgeTextColor: string;
  hoverColor: string;
}

interface ThemeConfig {
  light: Theme;
  dark: Theme;
}
interface Props {
  className?: string;
  draggable?: boolean;
  width?: string;
  height?: string;
  boxHeight?: string;
  theme?: string;
  isCard?: boolean;
  themeConfig?: ThemeConfig;
}
// Default theme configurations
const defaultThemeConfig: ThemeConfig = {
  light: {
    background: "#ffffff",
    textColor: "#333333",
    secondaryBackground: "#f5f5f5",
    borderColor: "#e0e0e0",
    primaryColor: "#3b82f6",
    secondaryTextColor: "#666666",
    badgeBackground: "#f3f4f6",
    badgeTextColor: "#4b5563",
    hoverColor: "#2563eb",
  },
  dark: {
    background: "#1f2937",
    textColor: "#f3f4f6",
    secondaryBackground: "#111827",
    borderColor: "#374151",
    primaryColor: "#60a5fa",
    secondaryTextColor: "#9ca3af",
    badgeBackground: "#374151",
    badgeTextColor: "#d1d5db",
    hoverColor: "#93c5fd",
  },
};

export default function FlashNews({
  className,
  draggable = true,
  width = "600px",
  height = "400px",
  boxHeight = "34px",
  theme = "light",
  isCard = false,
  themeConfig = defaultThemeConfig,
}: Props) {
  const { news, loadNextPage, hasNextPage } = useFeeds();
  const item = news[0];
  const [isHovered, setIsHovered] = React.useState(false);
  // State for tracking position
  const [position, setPosition] = useState(() => {
    const savedPosition = localStorage.getItem("ic-news-feeds-drop-position");
    return savedPosition ? JSON.parse(savedPosition) : { x: 0, y: 0 };
  });
  // State to determine if component is in the top or bottom half of the viewport
  const [isInTopHalf, setIsInTopHalf] = React.useState(true);
  // Reference to constrain drag within window boundaries
  const constraintsRef = React.useRef<HTMLDivElement>(null);
  // Load saved position from localStorage on component mount
  React.useEffect(() => {
    const savedPosition = localStorage.getItem("ic-news-feeds-drop-position");
    if (savedPosition) {
      try {
        const parsedPosition = JSON.parse(savedPosition);
        setPosition(parsedPosition);
      } catch (e) {
        console.error("Failed to parse saved position", e);
      }
    }
  }, []);
  // Function to check if component is in the top or bottom half of the viewport
  const checkPosition = useCallback(() => {
    localStorage.setItem("ic-news-feeds-drop-position", JSON.stringify(position));
    // Get component's current Y position relative to the viewport
    const componentY = position.y;
    // Get the viewport height
    const viewportHeight = window.innerHeight;
    // Calculate the middle point of the viewport
    const viewportMiddle = viewportHeight / 2;
    // Calculate the component's absolute position from the top of the viewport
    const componentAbsoluteY = (80 * viewportHeight) / 100 + componentY; // 80vh + offset
    // If component is in the top half of the viewport, set isInTopHalf to true
    setIsInTopHalf(componentAbsoluteY < viewportMiddle);
  }, [position]);

  const handleDragEnd = useCallback(
    (event: MouseEvent, info: any) => {
      setPosition((prevPosition: { x: number; y: number }) => {
        const newPosition = {
          x: prevPosition.x + info.offset.x,
          y: prevPosition.y + info.offset.y,
        };
        localStorage.setItem("ic-news-feeds-drop-position", JSON.stringify(newPosition));

        return newPosition;
      });
      // Update isInTopHalf after drag ends
      setTimeout(checkPosition, 0);
    },
    [checkPosition]
  );
  // Save position to localStorage when it changes and determine position in viewport
  React.useEffect(() => {
    // Check if component is in the top or bottom half of the viewport
    checkPosition();
    // Also check position on window resize
    window.addEventListener("resize", checkPosition);

    return () => {
      window.removeEventListener("resize", checkPosition);
    };
  }, [checkPosition]);
  // Get the current theme settings
  const currentTheme =
    themeConfig[theme as keyof ThemeConfig] ||
    defaultThemeConfig[theme as keyof ThemeConfig] ||
    defaultThemeConfig.light;

  // Create a CSS variable style object for theming
  const themeStyle = {
    "--flash-background": currentTheme.background,
    "--flash-text-color": currentTheme.textColor,
    "--flash-secondary-background": currentTheme.secondaryBackground,
    "--flash-border-color": currentTheme.borderColor,
    "--flash-primary-color": currentTheme.primaryColor,
    "--flash-secondary-text-color": currentTheme.secondaryTextColor,
    "--flash-badge-background": currentTheme.badgeBackground,
    "--flash-badge-text-color": currentTheme.badgeTextColor,
    "--flash-hover-color": currentTheme.hoverColor,
  } as React.CSSProperties;

  // Effect to update constraints on window resize
  React.useEffect(() => {
    const updateConstraints = () => {
      if (constraintsRef.current) {
        // Update constraints ref dimensions to match window size
        constraintsRef.current.style.width = `${window.innerWidth}px`;
        constraintsRef.current.style.height = `${window.innerHeight}px`;
      }
    };

    // Set initial constraints
    updateConstraints();

    // Update constraints on window resize
    window.addEventListener("resize", updateConstraints);

    return () => {
      window.removeEventListener("resize", updateConstraints);
    };
  }, []);
  const styles = React.useMemo(
    () => (isCard ? {} : { x: position.x, y: position.y, top: "80vh", left: "10vw" }),
    [isCard, position]
  );
  return (
    // Add a container div that will serve as the constraint boundary
    <div
      ref={constraintsRef}
      className={`${isCard ? "relative" : "fixed"} inset-0 pointer-events-none overflow-hidden`}
      style={{ zIndex: 1 }}
    >
      <motion.div
        className={`flash-news-container ${theme} ${className ?? ""} flex ${
          isCard ? "relative" : "fixed cursor-move h-8"
        } z-10 gap-1 items-center pointer-events-auto`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        drag={!isCard && draggable}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={constraintsRef}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        onDragEnd={handleDragEnd}
        style={{
          width,
          ...styles,
          ...themeStyle,
        }}
      >
        <div
          className={`w-full flex rounded-md flex items-center ${
            isCard ? "overflow-hidden" : "px-2"
          }`}
          style={{
            height: isCard ? "auto" : boxHeight,
            background: "var(--flash-background)",
            border: "1px solid var(--flash-border-color)",
          }}
        >
          {!isCard && (
            <a
              href={`https://ic.news/flash/${item?.hash}`}
              className="w-full group relative flex gap-x-3 md:gap-x-4"
              target="_blank"
              rel="noreferrer"
            >
              <div className="w-full flex-auto rounded-md flex justify-between gap-1 flex-col">
                <div className="flex gap-1 items-center w-full">
                  <img src={Logo} alt="IC News" className="w-4 h-4 flex-shrink-0 mr-1" />
                  {!item ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <>
                      <h3
                        className="flex-grow min-w-0 overflow-hidden text-md font-bold font-semibold whitespace-nowrap text-ellipsis leading-snug group-hover:text-[var(--flash-primary-color)]"
                        style={{ color: "var(--flash-text-color)" }}
                        dangerouslySetInnerHTML={{ __html: item?.title }}
                      />
                      <time
                        dateTime={formatInTimeZone(
                          new Date(item?.created_at ?? Date.now()),
                          Intl.DateTimeFormat().resolvedOptions().timeZone,
                          "HH:mm:ss"
                        )}
                        className="flex-shrink-0 py-0.5 text-xs/5"
                        style={{ color: "var(--flash-secondary-text-color)" }}
                      >
                        {formatDistance(new Date(item?.created_at ?? Date.now()), new Date(), {
                          addSuffix: true,
                        })}
                      </time>
                    </>
                  )}
                </div>
              </div>
            </a>
          )}
          <motion.div
            className={`${
              isCard ? "relative" : "absolute"
            } flex flex-col w-full left-0 overflow-auto ${
              isCard ? "top-0" : isInTopHalf ? "top-[100%]" : "bottom-[100%]"
            }`}
            style={{
              background: "var(--flash-background)",
              border: isCard ? "" : "1px solid var(--flash-border-color)",
            }}
            initial={{ height: height, opacity: 1 }}
            animate={{
              height: isHovered || isCard ? height : 0,
              opacity: isHovered || isCard ? 1 : 1,
              display: isHovered || isCard ? "block" : "none",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            id="ic-news-flash"
          >
            <InfiniteScroll
              dataLength={news.length}
              next={loadNextPage}
              hasMore={hasNextPage}
              loader={<Loading text="Loading more news..." className="min-h-[100px]" />}
              endMessage={
                <div
                  className="text-center py-4 text-sm"
                  style={{ color: "var(--flash-secondary-text-color)" }}
                >
                  No more news to load.
                </div>
              }
              className={`space-y-2 h-full relative`}
              scrollableTarget="ic-news-flash"
            >
              {news.map((item: Feeds, itemIdx: number) => {
                const channel = item?.metadata?.channel;
                const sender = item?.provider?.alias || "IC.News";
                const platform = item?.metadata?.platform;
                return (
                  <a
                    href={`https://ic.news/flash/${item.hash}`}
                    key={item.hash}
                    className="w-full group relative flex gap-x-3 md:gap-x-4"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="w-full flex-auto rounded-md p-2 flex justify-between gap-x-4 gap-y-1 md:gap-y-2 flex-col">
                      <h3
                        className="text-lg w-full overflow-hidden font-bold whitespace-nowrap text-ellipsis font-semibold leading-snug group-hover:text-[var(--flash-primary-color)]"
                        style={{ color: "var(--flash-text-color)" }}
                        dangerouslySetInnerHTML={{ __html: item.title }}
                      />
                      <div className="flex gap-1 md:gap-2 flex-wrap">
                        <time
                          dateTime={formatInTimeZone(
                            new Date(item.created_at),
                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                            "MM/dd/yyyy HH:mm:ss zzz"
                          )}
                          className="flex-none py-0.5 text-xs/5"
                          style={{ color: "var(--flash-secondary-text-color)" }}
                        >
                          {item.created_at &&
                            formatInTimeZone(
                              new Date(item.created_at),
                              Intl.DateTimeFormat().resolvedOptions().timeZone,
                              "MM/dd/yyyy HH:mm:ss zzz"
                            )}{" "}
                          (
                          {formatDistance(new Date(item.created_at), new Date(), {
                            addSuffix: true,
                          })}
                          )
                        </time>
                        <div className="flex gap-2">
                          <BadgeComponents
                            sender={channel || platform || ""}
                            platform={platform}
                            profilePic={item?.metadata?.profilePic}
                          />
                          <div className="relative">
                            <BadgeComponents sender={sender} pid={item?.provider?.pid} />
                          </div>
                        </div>
                      </div>
                      <div
                        className="text-sm/6 whitespace-pre-line [&_a]:hover:underline line-clamp-2"
                        style={{
                          color: "var(--flash-text-color)",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: item.description.replace(/\n/g, "<br />"),
                        }}
                      />
                    </div>
                  </a>
                );
              })}
            </InfiniteScroll>
            <Top id="ic-news-flash" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
