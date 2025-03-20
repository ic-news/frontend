import * as React from "react";
import Logo from "@/assets/logo.svg";
import { Toaster as Sonner, toast as baseToast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

interface CustomToastOptions extends ToasterProps {
  description?: string;
  duration?: number;
  href?: string;
}

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg cursor-pointer",
          title:
            "group-[.toast]:text-lg group-[.toast]:font-semibold group-[.toast]:flex group-[.toast]:items-center group-[.toast]:gap-2",
          description: "group-[.toast]:text-muted-foreground line-clamp-4",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

// Custom toast with icon
const toast = (title: string, options?: CustomToastOptions) => {
  baseToast(
    <div
      className="flex items-start gap-2"
      onClick={() => {
        options?.href && window.location.assign(options.href);
      }}
    >
      <img src={Logo} alt="Logo" className="w-8 h-8 mt-2" />
      <span className="line-clamp-2">{title}</span>
    </div>,
    options
  );
};

// Custom error toast with icon
const error = (title: string, options?: CustomToastOptions) => {
  baseToast.error(
    <div
      className="flex items-start gap-2"
      onClick={() => options?.href && window.location.assign(options.href)}
    >
      <img src={Logo} alt="Logo" className="w-8 h-8 mt-2" />
      <span className="line-clamp-2">{title}</span>
    </div>,
    options
  );
};

export { Toaster, error, toast };
