import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";
import IcNews from "../../assets/logo.svg";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  text?: string;
}

// Use forwardRef to allow ref to be passed to the component
export const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  ({ size = 48, text, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center min-h-[200px] gap-4", className)}
        {...props}
      >
        <div className="relative">
          <img
            src={IcNews}
            alt="Loading"
            style={{ width: size, height: size }}
            className="animate-pulse"
          />
        </div>
        {text && <p className="text-sm text-[var(--text-color-secondary)]">{text}</p>}
      </div>
    );
  }
);

// Add display name for better debugging
Loading.displayName = "Loading";
