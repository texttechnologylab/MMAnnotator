# Installation

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- npm 10+

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/texttechnologylab/MMAnnotator.git
cd MMAnnotator
npm install
```

## Development Server

```bash
npm run dev
```

The app starts at `http://localhost:5173` by default.

## Production Build

```bash
npm run build
```

Output is written to `dist/`. See [Docker deployment](../deployment/docker.md) for serving the build.

## Linting & Formatting

```bash
npm run lint       # ESLint
npm run format     # Prettier
```
