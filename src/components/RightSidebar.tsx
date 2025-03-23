import { useTheme } from "@/context/ThemeContext";
import BigNumber from "bignumber.js";
import { Mail, PanelLeftClose, PanelRightClose } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import CountUp from "react-countup";
import InlineSvg from "react-inlinesvg";
import Telegram from "../assets/images/telegram.svg";
import X from "../assets/images/x.svg";
import { Listing, useTopCryptoListings } from "../hooks/useCryptoMarket";
import { TOKEN, useICPTokens } from "../hooks/useICPTokens";
import { classNames, getFirstNonZeroDecimalPosition } from "../utils";

export function ICEcosystemTokens() {
  const { tokens } = useICPTokens();
  return (
    <div className="space-y-4">
      <h2 className="font-bold mb-4 text-[var(--text-color-primary)]">ICP Ecosystem Tokens</h2>
      {tokens.slice(0, 5).map((token: TOKEN, index: number) => {
        const usd = new BigNumber(token.metrics.price.usd).toNumber();
        const decimals = getFirstNonZeroDecimalPosition(usd);
        const change24_usd = new BigNumber(token.metrics.change["24h"].usd).toNumber();
        return (
          <div key={token.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={`https://web2.icptokens.net/storage/${token.logo}`}
                alt={token.name}
                className="w-6 h-6 xl:w-8 xl:h-8 bg-gray-200 rounded-full mr-2"
              />
              <div>
                <div
                  className="font-medium text-[var(--text-color-primary)] flex items-center gap-1 whitespace-nowrap"
                  translate="no"
                >
                  {token.symbol}
                  <CountUp
                    className={classNames(
                      "text-xs",
                      change24_usd > 0 ? "text-[var(--green)]" : "text-[var(--red)]"
                    )}
                    end={new BigNumber(usd).toNumber()}
                    decimals={decimals}
                    prefix="$"
                    preserveValue={true}
                    enableScrollSpy={false}
                  />
                  <CountUp
                    className={classNames(
                      "text-xs flex",
                      change24_usd > 0 ? "text-[var(--green)]" : "text-[var(--red)]"
                    )}
                    end={Math.abs(new BigNumber(change24_usd).toNumber())}
                    decimals={2}
                    prefix={change24_usd > 0 ? "↑" : "↓"}
                    suffix="%"
                    preserveValue={true}
                    enableScrollSpy={false}
                  />
                </div>
                {token.name && (
                  <div className="text-xs text-[var(--text-color-secondary)]">{token.name}</div>
                )}
              </div>
            </div>
            <div
              className={classNames(
                "text-right",
                token.metrics.change["24h"].usd > 0 ? "text-[var(--green)]" : "text-[var(--red)]"
              )}
            >
              {token?.metrics?.chartLast7Days?.["USD"] && (
                <div className="w-[22.2222222222%] min-w-[80px]">
                  <ChartComponent
                    data={
                      token?.metrics?.chartLast7Days?.["USD"]?.map((item: any) => item.price) || []
                    }
                    color={change24_usd > 0 ? "var(--green)" : "var(--red)"}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MarketOverview() {
  const { listings } = useTopCryptoListings(5);
  return (
    <div className="space-y-4 md:mb-8">
      <h2 className="font-bold mb-4 text-[var(--text-color-primary)]">Market Overview</h2>
      {listings.map((listing: Listing) => {
        const getFirstNonZeroDecimalPosition = (num: number): number => {
          const decimalPart = String(num).split(".")[1];
          if (!decimalPart) return 2;
          for (let i = 0; i < decimalPart.length; i++) {
            if (decimalPart[i] !== "0") {
              return i + 2;
            }
          }
          return 2;
        };
        const price = new BigNumber(listing.quote.price).toNumber();
        const decimals = getFirstNonZeroDecimalPosition(price);
        const percent_change_24h = new BigNumber(listing.quote.percent_change_24h).toNumber();
        return (
          <div key={listing.symbol} className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${listing.id}.png`}
                alt={listing.name}
                className="w-6 h-6 xl:w-8 xl:h-8 bg-gray-200 rounded-full mr-2"
              />
              <div>
                <div className="font-medium text-[var(--text-color-primary)]" translate="no">
                  {listing.symbol}
                </div>
                <div className="text-xs text-[var(--text-color-secondary)]">{listing.name}</div>
              </div>
            </div>
            <div
              className={classNames(
                "text-right",
                listing.quote.percent_change_24h > 0 ? "text-[var(--green)]" : "text-[var(--red)]"
              )}
            >
              <CountUp
                className={"text-sm"}
                end={new BigNumber(listing.quote.price).toNumber()}
                decimals={decimals}
                preserveValue={true}
                enableScrollSpy={false}
              />
              <CountUp
                className={classNames(
                  "flex justify-end text-sm",
                  percent_change_24h > 0 ? "text-[var(--green)]" : "text-[var(--red)]"
                )}
                end={Math.abs(new BigNumber(percent_change_24h).toNumber())}
                decimals={decimals}
                prefix={percent_change_24h > 0 ? "↑" : "↓"}
                suffix={"%"}
                preserveValue={true}
                enableScrollSpy={false}
              />
            </div>
          </div>
        );
      })}
      {/* <button className="w-full text-center text-gray-500 mt-4">More</button> */}
    </div>
  );
}

export function SocialLinks() {
  return (
    <div className="mt-8 border border-[var(--border-color)] dark:border-gray-800 rounded-lg overflow-hidden lg:mt-auto flex-shrink-0 md:mt-8">
      <h2 className="px-4 pt-3 font-bold text-[var(--text-color-primary)]">Follow Us</h2>
      <div className="py-4 flex items-center">
        <a
          href="https://t.me/ic_news_hub"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center flex-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {/* @ts-ignore */}
          <InlineSvg src={Telegram} className="w-5 h-5 flex-shrink-0" />
        </a>
        <a
          href="https://x.com/ic_news_"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center flex-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {/* @ts-ignore */}
          <InlineSvg src={X} className="w-5 h-5 flex-shrink-0" />
        </a>
        <a
          href="mailto:dev@ic.news"
          target="_blank"
          className="flex items-center justify-center flex-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          rel="noreferrer"
        >
          <Mail className="w-5 h-5 flex-shrink-0" />
        </a>
      </div>
    </div>
  );
}

interface ChartComponentProps {
  data: number[];
  color: string;
}

function ChartComponent({ data, color }: ChartComponentProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    const initChart = () => {
      if (chartRef.current && window.ApexCharts) {
        // Destroy existing chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Create new chart
        chartInstance.current = new window.ApexCharts(chartRef.current, {
          chart: {
            type: "area",
            height: 40,
            sparkline: {
              enabled: true,
            },
            animations: {
              enabled: false,
            },
            toolbar: {
              show: false,
            },
            background: "transparent",
            parentHeightOffset: 0,
          },
          grid: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            },
          },
          series: [
            {
              name: "Price",
              data: data,
            },
          ],
          xaxis: {
            type: "numeric",
            labels: {
              show: false,
            },
          },
          stroke: {
            curve: "smooth",
            width: 1.5,
          },
          fill: {
            type: "gradient",
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.2,
              opacityTo: 0,
              stops: [0, 100],
            },
          },
          tooltip: {
            fixed: {
              enabled: false,
            },
            x: {
              show: false,
            },
            y: {
              formatter: (value: number) => `$${value.toFixed(4)}`,
            },
            marker: {
              show: false,
            },
          },
          colors: [color],
        });

        chartInstance.current.render();
      }
    };

    // Initialize chart when ApexCharts is available
    if (window.ApexCharts) {
      initChart();
    } else {
      // Wait for ApexCharts to load
      const interval = setInterval(() => {
        if (window.ApexCharts) {
          clearInterval(interval);
          initChart();
        }
      }, 100);

      return () => clearInterval(interval);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, color, darkMode]);

  return <div ref={chartRef} className="bg-transparent" />;
}

export default function RightSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode } = useTheme();
  return (
    <>
      {/* Right Sidebar */}
      <aside
        className={classNames(
          "min-w-[320px] xl:min-w-[360px] w-80 border-l border-[var(--border-color)]",
          "lg:relative lg:right-auto lg:translate-x-0",
          "fixed right-0 top-0 h-screen bg-[var(--bg-color-secondary)] dark:bg-gray-900",
          "transform transition-transform duration-300 ease-in-out",
          !isOpen ? "translate-x-full" : "translate-x-0"
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden absolute -left-9 top-4 p-2 bg-[var(--bg-color-secondary)] dark:bg-gray-900 rounded-l-lg border border-r-0 border-[var(--border-color)]"
        >
          {isOpen ? (
            <PanelRightClose className={classNames(darkMode ? "stroke-white" : "", "w-5 h-5")} />
          ) : (
            <PanelLeftClose className={classNames(darkMode ? "stroke-white" : "", "w-5 h-5")} />
          )}
        </button>
        <div className="overflow-y-auto h-full p-3 xl:p-4 flex flex-col max-md:space-y-4">
          <MarketOverview />
          <ICEcosystemTokens />
          <SocialLinks />
        </div>
      </aside>
    </>
  );
}
