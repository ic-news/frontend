declare module "motion/react" {
  import * as React from "react";

  export interface MotionProps {
    [key: string]: any;
  }

  export type Motion = {
    [K in keyof JSX.IntrinsicElements]: React.ForwardRefExoticComponent<
      MotionProps & JSX.IntrinsicElements[K] & React.RefAttributes<Element>
    >;
  };

  export const motion: Motion;
  export const AnimatePresence: React.FC<{
    children?: React.ReactNode;
    onExitComplete?: () => void;
    exitBeforeEnter?: boolean;
    initial?: boolean;
  }>;
  export const LayoutGroup: React.FC<{
    children?: React.ReactNode;
    id?: string;
  }>;
}
