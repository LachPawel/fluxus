# Fluxus

<p align="center">
  <img src="public/fluxus-logo.svg" alt="Fluxus Logo" width="120" height="120">
</p>

![CI](https://github.com/LachPawel/fluxus/actions/workflows/ci.yml/badge.svg)

Fluxus is a modern, visual flow builder application designed to create and manage complex workflows with ease. Built with **Next.js**, **React**, **TypeScript**, and **React Flow**, it offers a powerful and intuitive node-based interface.

## Features

- **Visual Flow Editor**: Intuitive drag-and-drop interface for building flows.
- **Custom Node System**: Support for various node types including Triggers, Actions, Conditions, and Utilities.
- **Dynamic Properties Panel**: Edit node configurations using a context-aware side panel with support for text, select, boolean, and number inputs.
- **Node Palette**: Categorized list of available nodes for easy access.
- **AI Integration Ready**: Built-in API routes for Vercel AI SDK integration.
- **Extensible Architecture**: Easy to define new node types and fields.
- **Type-Safe**: Built with TypeScript for robustness and maintainability.
- **Vercel Deploy Ready**: Optimized for deployment on Vercel.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Flow Library**: @xyflow/react (React Flow)
- **AI SDK**: Vercel AI SDK
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Linting & Formatting**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- pnpm (v9 recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/LachPawel/fluxus.git
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your OpenAI API key.

4. Start the development server:
   ```bash
   pnpm dev
   ```

### Scripts

- `pnpm dev`: Start the development server with Turbopack.
- `pnpm build`: Build the application for production.
- `pnpm start`: Start the production server.
- `pnpm test`: Run the test suite.
- `pnpm lint`: Run ESLint.
- `pnpm format`: Format code with Prettier.

## Deployment

This project is optimized for deployment on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LachPawel/fluxus)

### Environment Variables

Make sure to set the following environment variables in your Vercel project:

- `OPENAI_API_KEY`: Your OpenAI API key for AI features

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

[MIT](LICENSE)
