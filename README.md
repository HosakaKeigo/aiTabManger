# AI Tab Manager

AI Tab Manager is a Chrome extension that helps you find and switch tabs using natural language queries powered by Google's Gemini AI.

## Features

- Search tabs using natural language
- Multiple results with relevance ranking
- Fallback to bookmarks when tab isn't found
- Keyboard shortcuts and navigation
- Simple and clean interface

## Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/aiTabManager.git
cd aiTabManager
```

2. Install dependencies
```bash
npm install
```

3. Build the extension
```bash
npm run build
```

4. Load the extension in Chrome
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `dist` directory from the project

## Configuration

1. Get a Gemini API key from the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click the extension settings icon (right-click on the extension icon > Options)
3. Enter your Gemini API key
4. Save the settings

## Usage

1. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac)
2. Type your search query
3. Select from search results using arrow keys or mouse
4. Press Enter to switch to the selected tab or open bookmark

## Development

### Project Structure
```
src/
├── background/     # Background service worker
├── popup/         # Popup UI and main logic
├── options/       # Settings page
├── services/      # API and tab management services
├── types/         # TypeScript type definitions
└── utils/         # Helper utilities
```

### Commands
- `npm run dev`: Start development mode
- `npm run build`: Build for production

## Requirements

- Node.js 16 or higher
- npm 7 or higher
- Chrome browser

## License

MIT License - see LICENSE file for details