# Screenshotter CLI

A powerful command-line tool for taking full-page screenshots of websites with multiple viewports. Designed to run on servers and in automated environments.

## Installation

```bash
npm install -g @screenshotter/cli
```

Or run directly with npx:

```bash
npx @screenshotter/cli https://example.com
```

## Usage

```bash
screenshotter <url> [options]
```

### Options

- `-o, --output <path>` - Output file path (default: screenshot-{timestamp}.png)
- `-v, --viewport <viewport>` - Viewport size (default: 1920x1080)
- `-f, --full-page` - Capture full page (default: true)
- `-t, --timeout <ms>` - Page load timeout in milliseconds (default: 30000)
- `-w, --wait <ms>` - Additional wait time after page load in milliseconds
- `-d, --device <device>` - Emulate device (e.g., "iPhone 12", "iPad Pro")
- `-s, --selector <selector>` - CSS selector to screenshot specific element
- `--no-headless` - Run browser in headful mode
- `--format <format>` - Image format: png or jpeg (default: png)
- `--quality <quality>` - JPEG quality 0-100 (default: 80)

### Examples

Take a full-page screenshot:
```bash
screenshotter https://example.com
```

Capture with specific viewport:
```bash
screenshotter https://example.com -v 1280x720
```

Save to specific location:
```bash
screenshotter https://example.com -o ./screenshots/homepage.png
```

Capture specific element:
```bash
screenshotter https://example.com -s ".main-content"
```

Emulate mobile device:
```bash
screenshotter https://example.com -d "iPhone 12"
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint and format
npm run lint
npm run format
```

## License

MIT