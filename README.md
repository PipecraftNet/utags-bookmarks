# UTags Bookmark Manager

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/utags/utags-bookmarks/ci.yml?branch=main)](https://github.com/utags/utags-bookmarks/actions)
[![UTags Official Site](https://img.shields.io/badge/UTags-Official_Site-brightgreen)](https://utags.link)

## 🚀 Project Overview

**UTags Bookmark Manager** is a modern bookmark manager that organizes web resources using a flexible tagging system. Designed for developers and power users who need to manage large collections of bookmarks with smart filtering and visualization capabilities.

Visit our [official website (https://utags.link)](https://utags.link/) to explore comprehensive features.

## ✨ Core Features

- Multi-dimensional tag management system
- Advanced filtering system supporting:
  - AND/OR/NOT logical combinations
  - Regular expression matching
- Local data persistence via LocalStorage
- Progressive Web App (PWA) support
- Seamless integration with [UTags browser extension/userscript](https://github.com/utags/utags)

### Other Features

- Fully open source and free to use
- Easy self-hosting deployment
- Saved filter presets
- Data import/export capabilities
- Multi-device synchronization (TODO)
- Progressive Web App capabilities:
  - Add to Home Screen (A2HS)
  - Offline mode with Service Worker caching
  - Web App Manifest for native-like experience
- Visual data statistics dashboard
- Light/dark theme support
- Responsive layout with multiple view modes
- Cross-browser compatibility
- Browser bookmark import (Chrome/Edge/Firefox/Safari)

## Usages

### How to add a bookmark

- Add bookmarks on bookmark manager page
- Add bookmarks via [UTags extension/userscript](https://github.com/utags/utags)
- Make your own extension or userscript

### How to use filters

- Filter by keywords, tags, domains, and other metadata
- Multi-level filtering system supporting AND/OR/NOT logic combinations
- Regular expression matching
- Save filter presets for quick access in future sessions

## 🛣 Development Roadmap

- **Bookmark Management Enhancements**

  - Batch modify/delete tags
  - Bulk delete bookmarks
  - Bulk add tags
  - Note viewing interface

- **Bookmark Collection Solutions**

  - Add bookmarks via [UTags extension/userscript](https://github.com/utags/utags)
  - Custom styling options
  - Navigation website style view

- **Data Interoperability**

  - Gist/GitHub import/export support
  - WebDAV import/export support
  - Multi-device sync solution
  - Cloud sync capability
  - Bookmark export/import enhancements
  - Use IndexedDB storage when the bookmark volume is extremely large

## 📦 Installation & Usage

### Development

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

### Data Management

Generate mock data for development:

```bash
node generate-mock-data.js
```

Development data is stored in browser's Local storage. To reset:

1. Visit application website and open Browser Developer Tools
2. Application → Local storage → Clear data

## 🤝 Contributing

Contributions through:

- 🐛 [GitHub Issues](https://github.com/utags/utags-bookmarks/issues) - for bug reports
- 💡 [Pull Requests](https://github.com/utags/utags-bookmarks/pulls) - for feature additions
- 💬 [GitHub Discussions](https://github.com/orgs/utags/discussions) - get help and share tips

Please follow our [contribution guidelines](CONTRIBUTING.md).

## 📄 License

Copyright (c) 2025 [Pipecraft](https://www.pipecraft.net). Licensed under the [MIT License](LICENSE).

---

[![Pipecraft Ecosystem](https://img.shields.io/badge/Pipecraft-Ecosystem-2EAADC)](https://www.pipecraft.net)
[![UTags Offcial Site](https://img.shields.io/badge/UTags-Offcial_Site-brightgreen)](https://utags.link)
