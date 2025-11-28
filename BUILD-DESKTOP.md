# Building Phonon AI for Windows Desktop

This guide explains how to build a standalone Windows .exe installer for Phonon AI.

## Prerequisites

1. Install Node.js (v18 or higher) from https://nodejs.org/
2. Clone/download your project from GitHub
3. Open a terminal in the project directory

## Development Mode

To test the desktop app during development:

```bash
# Install dependencies
npm install

# Run in Electron development mode
npm run dev:electron
```

This will open the app in a native Windows window while keeping hot-reload enabled.

## Building the .exe Installer

To create a distributable Windows installer:

```bash
# Install dependencies (if not already done)
npm install

# Build the production .exe
npm run build:electron
```

The build process will:
1. Build your React app for production
2. Bundle it with Electron
3. Create a Windows installer

## Finding Your Installer

After the build completes, find your installer at:

```
release/Phonon AI-Setup-[version].exe
```

This .exe file is ready to distribute! Users can:
- Download it
- Double-click to install
- Find "Phonon AI" in their Start Menu
- Desktop shortcut is created automatically

## Distribution

Share the .exe file via:
- Your website
- Direct download links
- File sharing services
- GitHub Releases

Users don't need Node.js or any technical setup - just download and run the installer!

## File Size

The installer will be approximately 150-200MB because it includes:
- Your app
- Chromium browser engine (for Web Speech API support)
- Node.js runtime

This ensures the app works identically across all Windows computers.

## Troubleshooting

**"npm command not found"**: Install Node.js from nodejs.org

**Build fails**: Make sure you've run `npm install` first

**App won't start**: Check Windows Defender/antivirus - they sometimes block unsigned apps

## Scripts Reference

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev:electron": "cross-env ELECTRON=true vite",
    "build:electron": "npm run build && cross-env ELECTRON=true electron-builder"
  }
}
```

Note: You'll need to add these scripts manually or ask your developer to add them.
