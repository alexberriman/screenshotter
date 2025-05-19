# 📸 Screenshotter CLI

A fast, reliable command-line tool for taking screenshots of websites. Built with TypeScript and Playwright, designed for automation and CI/CD environments.

## Features

- 🚀 **Fast & Reliable** - Built on Playwright for consistent results
- 🖼️ **Multiple Formats** - Support for PNG and JPEG with quality settings
- 📐 **Viewport Control** - Preset sizes or custom dimensions
- ⏱️ **Wait Strategies** - Network idle, custom selectors, or fixed delays
- 🎯 **Full Page Capture** - Capture entire pages or just the viewport
- 🔧 **Template Support** - Dynamic filename generation with placeholders
- 🌐 **Headless Operation** - Perfect for servers and automation

## Installation

```bash
npm install -g @screenshotter/cli
```

Or run directly with Bun:

```bash
bun install
bun run build
bun ./dist/index.js https://example.com
```

## Usage

```bash
screenshotter <url> [options]
```

### Basic Examples

Take a full-page screenshot with default settings:
```bash
screenshotter https://example.com
```

Capture with specific output path:
```bash
screenshotter https://example.com -o ./screenshots/homepage.png
```

Use mobile viewport:
```bash
screenshotter https://example.com -v mobile
```

### Advanced Examples

Capture JPEG with custom quality:
```bash
screenshotter https://example.com --format jpeg --quality 90
```

Wait for specific element before capturing:
```bash
screenshotter https://example.com --wait-for ".content-loaded"
```

Use filename template with placeholders:
```bash
screenshotter https://example.com --template "{domain}-{date}-{time}.{format}"
```

Combined options:
```bash
screenshotter https://example.com \
  -v tablet \
  --format jpeg \
  --quality 85 \
  -w 2 \
  --wait-for "#main-content" \
  --template "screenshots/{domain}/{date}-{time}.{format}"
```

### All Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <path>` | Output file path | `screenshot-{timestamp}.png` |
| `-t, --timeout <seconds>` | Page load timeout in seconds | `30` |
| `-w, --wait <seconds>` | Additional wait after page load | - |
| `--wait-for <selector>` | Wait for specific CSS selector | - |
| `--no-full-page` | Capture only viewport | Full page |
| `--format <format>` | Output format (png or jpeg) | `png` |
| `--quality <number>` | JPEG quality (0-100) | `80` |
| `-v, --viewport <size>` | Viewport size | `1920x1080` |
| `--template <template>` | Filename template | - |

### Viewport Presets

- `desktop`: 1920x1080
- `tablet`: 768x1024
- `mobile`: 375x667
- Custom: Any `WIDTHxHEIGHT` format (e.g., `1280x720`)

### Template Placeholders

- `{timestamp}`: ISO timestamp with safe characters
- `{date}`: Current date (YYYY-MM-DD)
- `{time}`: Current time (HH-MM-SS)
- `{domain}`: URL domain with dots replaced by underscores
- `{format}`: File format (png or jpeg)

## Exit Codes

- `0`: Success
- `1`: Error (invalid options, timeout, network failure, etc.)

## Automation Examples

### CI/CD Pipeline

```yaml
# GitHub Actions example
- name: Take screenshot
  run: screenshotter https://myapp.com -o artifacts/screenshot.png
```

### Batch Processing

```bash
#!/bin/bash
urls=("https://example.com" "https://google.com" "https://github.com")

for url in "${urls[@]}"; do
  screenshotter "$url" --template "screenshots/{domain}-{date}.png"
done
```

### Error Handling

```bash
if screenshotter https://example.com -o screenshot.png; then
  echo "Screenshot saved successfully"
else
  echo "Failed to capture screenshot"
  exit 1
fi
```

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/screenshotter.git
cd screenshotter

# Install dependencies
bun install

# Run in development
bun run dev

# Run tests
npm run test

# Type check
bun run typecheck

# Lint code
bun run lint

# Build for production
bun run build
```

## Requirements

- Node.js 18+ or Bun
- Playwright (automatically installed)

## Contributing

Pull requests are welcome! Please ensure:

1. All tests pass
2. Code follows the existing style
3. Commit messages follow conventional commits
4. No linting or type errors

## License

MIT © [Alex Berriman]