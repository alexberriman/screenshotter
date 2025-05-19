# 📸 Screenshotter CLI - TODO

A focused CLI tool for taking screenshots in automated environments, particularly for capturing work-in-progress from development tools.

---

## 🏗️ Setup & Infrastructure

- [ ] Create proper TypeScript project structure:
  - [ ] `src/index.ts` - CLI entry point with shebang
  - [ ] `src/screenshot.ts` - Core screenshot logic
  - [ ] `src/types/` - TypeScript interfaces and types
  - [ ] `src/utils/` - Helper functions
  - [ ] `src/config/` - Default configuration
- [ ] Set up build pipeline with tsup
- [ ] Configure npm scripts for development and build
- [ ] Add `.gitignore` with proper exclusions

---

## 🎯 Core Functionality

- [ ] Implement basic screenshot capture:
  - [ ] Use Playwright (not Puppeteer) for better performance
  - [ ] Accept URL as command argument
  - [ ] Take full-page screenshot by default (to confirm - if the page is beyond 100vh i.e. is scrollable, we need to screenshot the ENTIRE page)
  - [ ] Save with timestamp-based filename
- [ ] Add essential CLI options:
  - [ ] `-o, --output` - Output file path
  - [ ] `-t, --timeout` - Page load timeout (default: 30s)
  - [ ] `-w, --wait` - Additional wait after page load
  - [ ] `--no-full-page` - Capture only viewport
- [ ] Implement error handling:
  - [ ] Use ts-results for functional error handling
  - [ ] Proper exit codes (0 success, 1 error)
  - [ ] Clear error messages to stderr

---

## 🔧 Automation-Friendly Features

- [ ] Add viewport support:
  - [ ] `-v, --viewport` - Specify viewport size (e.g., "1920x1080")
  - [ ] Common presets: desktop (1920x1080), tablet (768x1024), mobile (375x667)
- [ ] Add wait strategies:
  - [ ] Wait for network idle
  - [ ] Wait for specific selector (optional)
  - [ ] Custom wait time after load
- [ ] Output control:
  - [ ] Support PNG and JPEG formats (default to png)
  - [ ] JPEG quality option
  - [ ] Filename template support (with placeholders)
- [ ] Reliability features:
  - [ ] Retry on failure (configurable)
  - [ ] Timeout handling
  - [ ] Network error handling

---

## ✅ Quality & Testing

- [ ] Write unit tests for:
  - [ ] Viewport parsing utility
  - [ ] Error formatting
  - [ ] Filename generation
  - [ ] Command argument validation
- [ ] Integration tests for:
  - [ ] Basic screenshot capture
  - [ ] Error scenarios
  - [ ] Different viewport sizes
- [ ] Add github actions workflow for pushes to main to lint, typecheck, test and build

---

## 📦 Publishing & Documentation

- [ ] Create comprehensive README:
  - [ ] Installation instructions
  - [ ] Usage examples for common scenarios
  - [ ] Automation examples (CI/CD, scripts)
  - [ ] Error troubleshooting guide

---

## 🚀 Docker

- [ ] Docker image for containerized usage

**Note**: Focus on core functionality first. This tool should be simple, reliable, and perfect for automation scenarios like capturing Claude Code output or development progress.
