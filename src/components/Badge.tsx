import coingape from "@/assets/images/coingape.png";
import cointelegraph from "@/assets/images/cointelegraph.png";
import decrypt from "@/assets/images/decrypt.png";
import Gift from "@/assets/images/gift.svg";
import ICExplorer from "@/assets/images/ic-explorer.svg";
import IcNews from "@/assets/images/ic.news.svg";
import libsyn from "@/assets/images/libsyn.png";
import panewslab from "@/assets/images/panewslab.png";
import Support from "@/assets/images/support.png";
import Telegram from "@/assets/images/telegram.svg";
import X from "@/assets/images/x.svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "@/components/ui/copy";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { abbreviateAddress } from "@/utils";
import { QRCodeCanvas } from "qrcode.react";

export const alias: { [key: string]: string } = {
  "ic.news": "IC.News",
  "IC.News": "IC.News",
};
export const verifyChannel: { [key: string]: string } = {
  "ic.news": IcNews,
  "IC.News": IcNews,
};
export const platformImages: { [key: string]: string } = {
  telegram: Telegram,
  x: X,
  ICExplorer: ICExplorer,
  CoinGape: coingape,
  Cointelegraph: cointelegraph,
  decrypt,
  libsyn,
  PANews: panewslab,
};
export default function BadgeComponents({
  sender,
  pid,
  profilePic,
  platform,
}: {
  sender: string;
  pid?: string;
  profilePic?: string;
  platform?: string;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button className="p-0 bg-transparent min-h-0 h-auto hover:bg-transparent">
          <Badge variant="secondary" translate="no" className="flex gap-1 cursor-pointer">
            {(profilePic ||
              (sender && (verifyChannel[sender] || platformImages[sender])) ||
              (platform && (verifyChannel[platform] || platformImages[platform]))) && (
              <img
                className="w-[16px] rounded-full"
                src={
                  profilePic ||
                  (sender && verifyChannel[sender]) ||
                  (sender && platformImages[sender]) ||
                  (platform && verifyChannel[platform]) ||
                  (platform && platformImages[platform])
                }
                alt={`${sender} icon`}
              />
            )}
            {alias[sender] || sender}
            {pid && <img src={Gift} alt="gift" />}
          </Badge>
        </Button>
      </HoverCardTrigger>
      {pid && (
        <HoverCardContent
          className="w-50 flex items-center justify-center p-0 rounded-lg cursor-default"
          onClick={(e: any) => {
            e.stopPropagation();
            e.preventDefault();
            return false;
          }}
        >
          <div className="bg-white rounded-lg overflow-hidden">
            <span className="w-full flex justify-center pt-2 font-medium text-sm text-gray-600">
              Scan to Support
            </span>
            <div className="p-3">
              <QRCodeCanvas value={pid} size={180} level="H" includeMargin={false} />
            </div>
            <Copy
              className="flex justify-center items-center pb-2 text-xs text-gray-500 hover:text-[var(--color-primary)]"
              text={pid}
            >
              {abbreviateAddress(pid)}
            </Copy>
            <div className="w-45 m-auto mb-3 relative">
              <img src={Support} alt="support" />
              <span className="absolute top-0 left-0 w-full h-full flex items-center pl-2 text-xs text-[#727C7F]">
                Support multiple
                <br /> token rewards
              </span>
            </div>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
}
