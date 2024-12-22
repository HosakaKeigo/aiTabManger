import { crx, defineManifest } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";

const manifest = defineManifest({
  manifest_version: 3,
  name: "AI Tab Manager",
  version: "1.0.0",
  description: "AI powered tab manager using Gemini",
  permissions: [
    "tabs",
    "storage",
    "bookmarks"
  ],
  host_permissions: [
    "https://generativelanguage.googleapis.com/*"
  ],
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  action: {
    default_popup: "src/popup/index.html",
    default_icon: {
      "48": "src/icons/icon48.png",
      "128": "src/icons/icon128.png"
    }
  },
  icons: {
    "48": "src/icons/icon48.png",
    "128": "src/icons/icon128.png"
  },
  options_ui: {
    page: "src/options/index.html",
    open_in_tab: true
  },
  commands: {
    "_execute_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+X"
      },
      "description": "Open the Tab Switcher popup"
    }
  }
});

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: 'src/background/index.ts',
        popup: 'src/popup/index.html',
        options: 'src/options/index.html',
      },
    },
  },
  plugins: [crx({ manifest })],
});