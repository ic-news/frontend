# IC News Flash Plugin

A React component for displaying IC News flashs that can be easily integrated into any React application.

## Installation

```bash
pnpm add ic-news-flash
```

or

```bash
yarn add ic-news-flash
```

or

```bash
npm install ic-news-flash
```

## Usage

```jsx
import React from "react";
import { FlashNews } from "ic-news-flash";

// Optional: Import your own styling
import "./your-styles.css";

const YourApp = () => {
  // Example custom hook to fetch news data
  const useCustomFlashs = () => {
    // Your implementation to fetch and manage news data
    return {
      news: [
        /* your news items */
      ],
      loadNextPage: () => {
        /* load more news */
      },
      hasNextPage: true,
    };
  };

  // Custom theme configuration (optional)
  const customTheme = {
    light: {
      background: "#ffffff",
      textColor: "#333333",
      // ... other theme properties
    },
    dark: {
      background: "#1f2937",
      textColor: "#f3f4f6",
      // ... other theme properties
    },
  };

  return (
    <div className="your-app">
      <FlashNews
        className="your-flash-class"
        logo="/path/to/your/logo.svg"
        useFlashs={useCustomFlashs}
        linkBaseUrl="https://your-site.com/news"
        theme="light" // or 'dark'
        themeConfig={customTheme}
        draggable={true}
        width="600px"
        height="400px"
        components={{
          // Optional: Provide your own UI components
          Badge: YourBadgeComponent,
          Button: YourButtonComponent,
          // ... other components
        }}
      />
    </div>
  );
};

export default YourApp;
```

## Props

| Prop          | Type     | Default                                                          | Description                                  |
| ------------- | -------- | ---------------------------------------------------------------- | -------------------------------------------- |
| `className`   | string   | `''`                                                             | Additional CSS class for the flash container |
| `draggable`   | boolean  | `true`                                                           | Whether the component can be dragged         |
| `width`       | string   | `'600px'`                                                        | Width of the component                       |
| `height`      | string   | `'400px'`                                                        | Height of the expanded news list             |
| `theme`       | string   | `'light'`                                                        | Theme to use ('light' or 'dark')             |
| `themeConfig` | object   | _see below_                                                      | Custom theme configuration                   |
| `logo`        | string   | _default logo_                                                   | URL or data URI for the logo                 |
| `useFlashs`   | function | `() => { news: [], loadNextPage: () => {}, hasNextPage: false }` | Hook function that returns news data         |
| `linkBaseUrl` | string   | `'https://ic.news/flash'`                                        | Base URL for news item links                 |
| `components`  | object   | `{}`                                                             | Custom UI components to override defaults    |

### Theme Configuration

You can customize the appearance of the flash by providing a theme configuration:

```jsx
const customThemeConfig = {
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

// Then use it in your component
<FlashNews themeConfig={customThemeConfig} theme="dark" />;
```

### Custom Components

You can provide your own UI components to match your application's design system:

```jsx
const components = {
  Badge: ({ children, variant, ...props }) => (
    <YourBadgeComponent variant={variant} {...props}>
      {children}
    </YourBadgeComponent>
  ),
  Button: ({ children, ...props }) => (
    <YourButtonComponent {...props}>{children}</YourButtonComponent>
  ),
  Skeleton: (props) => <YourSkeletonComponent {...props} />,
  Loading: ({ text, className }) => <YourLoadingComponent text={text} className={className} />,
  Link: ({ to, children, ...props }) => (
    <YourLinkComponent to={to} {...props}>
      {children}
    </YourLinkComponent>
  ),
};
```

## Flash Item Structure

The flash items should follow this structure:

```typescript
interface FlashItem {
  hash: string; // Unique identifier for the news item
  title: string; // Title of the news item
  created_at: string; // Creation timestamp
  description?: string; // Optional description/content
  provider?: {
    alias?: string; // Provider name
    pid?: string; // Provider ID
  };
  metadata?: {
    channel?: string; // News channel
    platform?: string; // Platform source
    profilePic?: string; // URL to profile picture
  };
}
```

## Building and Publishing

To build the package:

```bash
pnpm run build:flash
```

This will generate the distribution files in the `dist` directory.

## License

MIT
