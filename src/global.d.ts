interface Window {
  ApexCharts: any;
  googleTranslateElementInit: (language: string) => void;
  google: any;
}

declare class ApexCharts {
  constructor(
    element: HTMLElement | string,
    options: {
      chart?: {
        type?: string;
        height?: number;
        sparkline?: {
          enabled?: boolean;
        };
        animations?: {
          enabled?: boolean;
        };
        toolbar?: {
          show?: boolean;
        };
      };
      series?: Array<{
        name?: string;
        data: number[];
      }>;
      xaxis?: {
        type?: string;
        labels?: {
          show?: boolean;
        };
      };
      stroke?: {
        curve?: string;
        width?: number;
      };
      fill?: {
        type?: string;
        gradient?: {
          shadeIntensity?: number;
          opacityFrom?: number;
          opacityTo?: number;
          stops?: number[];
        };
      };
      tooltip?: {
        fixed?: {
          enabled?: boolean;
        };
        x?: {
          show?: boolean;
        };
        y?: {
          formatter?: (value: number) => string;
        };
        marker?: {
          show?: boolean;
        };
      };
      colors?: string[];
    }
  );
  render(): Promise<void>;
  destroy(): void;
}
