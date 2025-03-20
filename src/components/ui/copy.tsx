import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Copy as CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface CopyProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  children?: React.ReactNode;
}

export function Copy({ text, children, className, ...props }: CopyProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
    return false;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 cursor-pointer hover:text-gray-700 transition-colors",
        className
      )}
      onClick={handleCopy}
      {...props}
    >
      <span>{children}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <CopyIcon className="h-3.5 w-3.5" />
      )}
    </div>
  );
}
