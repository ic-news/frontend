# IC News Frontend

IC News is a decentralized news aggregation platform built on the Internet Computer (ICP) blockchain. This repository contains the frontend application for IC News.

## Features

- Real-time news updates via WebSocket connection
- Support for multiple news sources (Telegram, Twitter/X, etc.)
- Infinite scroll for news flash
- User notifications
- Author verification and support system
- Responsive design for all devices

## Technology Stack

- **Framework**: React with TypeScript
- **Package Manager**: pnpm
- **State Management**: React Query
- **UI Components**: Custom components with Tailwind CSS
- **WebSocket**: IC WebSocket for real-time updates
- **Blockchain**: Internet Computer (ICP)

## Prerequisites

- Node.js >= 16
- pnpm >= 8
- DFX >= 0.24.1

## Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ic-news-frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the environment variables in `.env` with your canister IDs and other configurations.

## Available Scripts

### Development

```bash
# Start the development server
pnpm dev
```

### Production

```bash
# Build for production
pnpm build

# Deploy to IC network
dfx deploy --network ic
```

## Project Structure

```
src/
├── canister/       # Canister type definitions and interfaces
├── components/     # Reusable UI components
├── context/        # React context providers
├── hooks/         # Custom React hooks
└── utils/         # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
