import { ElementType, useState } from "react";
import { Trans } from "react-i18next";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

const FloatingMenu = ({
  children,
  className,
  options,
}: {
  children: React.ReactNode;
  className?: string;
  options: {
    label: React.ReactNode;
    href?: string;
    component?: ElementType;
    onClick?: () => void;
  }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HoverCard openDelay={100} closeDelay={200} open={isOpen} onOpenChange={setIsOpen}>
      <HoverCardTrigger
        className={`w-15 h-15 text-2xl border-none cursor-pointer hover:scale-110 transition-transform duration-300 ${className}`}
      >
        {children}
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-43 p-2 flex flex-col gap-1">
        <h4 className="text-sm font-medium mb-2">
          <Trans i18nKey={"share.share"} />
        </h4>
        <div className="flex flex-col space-y-1">
          {options.map((option, index) => {
            const Element = option.component || "div";
            const props: any = {
              key: index,
              className:
                "w-full text-black border-none cursor-pointer flex items-center justify-start hover:text-[var(--color-primary)] flex gap-2 whitespace-nowrap",
              onClick: (e: any) => {
                e.stopPropagation();
                option.onClick?.();
                setIsOpen(false);
                if (option.component !== "a") {
                  e.preventDefault();
                }
                return false;
              },
            };

            if (option.component === "a" && option.href) {
              props.href = option.href;
              props.target = "_blank";
              props.rel = "noopener noreferrer";
            }

            return <Element {...props}>{option.label}</Element>;
          })}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default FloatingMenu;
