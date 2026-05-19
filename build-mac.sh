#!/bin/bash

set -e

echo ""
echo "🔧 MetaStrip — Mac Build Script"
echo "================================"

# Navigate to script directory
cd "$(dirname "$0")"

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🏗️  Building frontend..."
npm run build

echo ""
echo "🍎 Packaging macOS app..."
npm run dist:mac

echo ""
echo "✅ Done! Your app is in the dist-electron/ folder."
echo "   Open dist-electron/ and double-click the .dmg to install."
open dist-electron/
