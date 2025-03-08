// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
// start
import { formatInTimeZone } from "date-fns-tz";
import { QRCodeCanvas } from "qrcode.react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "./components/Breadcrumb";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Copy } from "./components/ui/copy";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./components/ui/hover-card";
import { alias, platformImages, verifyChannel } from "./Home";
import { News, useNewsCanister } from "./hooks/useNewsCanister";
import { abbreviateAddress } from "./utils";

const NewsDetail: React.FC = () => {
  const { id } = useParams();
  const { getNewsByHash } = useNewsCanister();
  // const [selectedMenu, setSelectedMenu] = useState("Latest News");
  // const [selectedCategory, setSelectedCategory] = useState("All");
  // const [showDropdown, setShowDropdown] = useState(false);
  // const [newsData, setNewsData] = useState<NewsItem[]>([]);
  // const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  // const [showNewsDetail, setShowNewsDetail] = useState(false);

  const [item, setNewsItem] = useState<News | undefined>(undefined);
  useEffect(() => {
    if (!id) return;
    getNewsByHash(id)
      .then(setNewsItem)
      .catch((error) => {
        console.log("error:", error);
      });
  }, [id]);
  const provider = item?.provider;
  const channel = item?.metadata?.channel;
  const sender = item?.provider?.alias || "IC.News";
  const platform = item?.metadata?.platform;
  console.log(channel, platform, sender, "-channel");
  return (
    <div className={`max-w-7xl mx-auto min-h-screen`}>
      <Breadcrumb
        items={[
          {
            label: item?.title,
            path: `/news/${id}`,
          },
        ]}
      />
      <div className={`bg-[var(--bg-color-secondary)] shadow-sm p-4 md:p-6 mb-4 md:mb-6`}>
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" translate="no" className="flex gap-1">
              {item?.category}
            </Badge>
            <span className="text-[var(--text-color-primary)] text-sm">
              {item?.created_at &&
                formatInTimeZone(
                  new Date(item.created_at),
                  "Asia/Shanghai",
                  "MM/dd/yyyy HH:mm:ss zzz"
                )}
            </span>
          </div>
          <h2 className={`text-3xl font-bold text-[var(--text-color-primary)]`}>{item?.title}</h2>
          <div className="flex gap-1 md:gap-2 flex-wrap">
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
                          value={provider?.pid ?? ""}
                          size={180}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <Copy
                        className="flex justify-center items-center pb-2 text-xs text-gray-500 hover:text-[var(--color-primary)]"
                        text={provider?.pid ?? ""}
                      >
                        {abbreviateAddress(provider?.pid ?? "")}
                      </Copy>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </div>
          <div
            className={`prose max-w-none text-[var(--text-color-primary)] mb-8 leading-relaxed whitespace-pre-line [&_a]:text-blue-500 [&_a]:hover:underline`}
            dangerouslySetInnerHTML={{ __html: (item?.description ?? "").replace(/\n/g, "<br />") }}
          />
          <div className="border-t border-[--border-color] pt-8">
            <h3 className={`text-xl font-bold text-[var(--text-color-primary)] mb-6`}>
              Related Tags
            </h3>
            <div className="flex flex-wrap gap-3">
              {item?.tags.map((tag) => (
                <Badge key={tag} variant="secondary" translate="no" className="flex gap-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NewsDetail;
// end
