# UTags Bookmark Manager

[![npm version](https://img.shields.io/npm/v/utags.svg?style=flat-square)](https://www.npmjs.com/package/utags)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/pipecraft/utags/ci.yml?branch=main)](https://github.com/pipecraft/utags/actions)

## 🚀 Project Overview

UTags is a modern bookmark manager that organizes web resources using a multi-dimensional tagging system. Designed for developers and power users who need to manage large collections of bookmarks with smart filtering and visualization capabilities.

## ✨ Core Features

- Multi-dimensional tag management system
- Advanced search with composite filters
- Visual bookmark statistics dashboard
- Dual theme support (light/dark modes)
- Local storage persistence
- Cross-browser compatibility

## 📦 Installation & Usage

### Prerequisites

- Node.js 18+
- npm 9+

### Quick Start

```bash
npm install
npm run dev
```

Access the application at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 🛠 Development

### Project Structure

```
/utags-app
├── src/
│   ├── components/    # Svelte components
│   ├── stores.ts      # State management
│   └── utils/         # Helper functions
├── public/            # Static assets
└── package.json       # Dependency management
```

### Data Generation

Use `generate-mock-data.js` to create development datasets:

```bash
node generate-mock-data.js
```

## 🤝 Contributing

We welcome contributions through:

- 🐛 GitHub Issues for bug reports
- 💡 Pull Requests for feature additions
- 📖 Documentation improvements

Please follow our [contribution guidelines](CONTRIBUTING.md).

## 📄 License

Copyright (c) 2025 [Pipecraft](https://www.pipecraft.net). Licensed under the [MIT License](LICENSE).

---

[![Pipecraft Ecosystem](https://img.shields.io/badge/Pipecraft-Ecosystem-2EAADC)](https://www.pipecraft.net)
[![UTags Documentation](https://img.shields.io/badge/Docs-UTags_Bookmarks-4D4D4D)](https://utags.pipecraft.net)
