#!/bin/bash
set -e

echo "🔍 Pre-Deployment Validation Started..."
echo ""

# Check for required files
echo "📄 Checking required deployment files..."
if [ ! -f "Dockerfile" ]; then
  echo "❌ ERROR: Dockerfile not found!"
  exit 1
fi

if [ ! -f "nginx.conf" ]; then
  echo "❌ ERROR: nginx.conf not found!"
  exit 1
fi

echo "✅ Deployment files present"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
echo "✅ Dependencies installed"
echo ""

# Run linter
echo "🧹 Running linter..."
npm run lint
echo "✅ Linting passed"
echo ""

# Build project
echo "🔨 Building project..."
npm run build
echo "✅ Build completed"
echo ""

# Check bundle size
echo "📊 Checking bundle size..."
du -sh dist/
echo ""

# Verify asset paths
echo "🔍 Verifying asset paths in dist/index.html..."
if grep -q 'src="/assets' dist/index.html; then
  echo "❌ ERROR: Found absolute paths in index.html!"
  echo "   This will cause blank page on deployment."
  echo "   Add 'base: \".\/\"' to vite.config.js"
  exit 1
fi

if grep -q 'src="\./assets' dist/index.html; then
  echo "✅ Asset paths are relative - deployment will work"
else
  echo "⚠️  WARNING: Could not verify asset paths"
fi
echo ""

# List dist contents
echo "📁 Distribution folder contents:"
ls -lh dist/
echo ""

echo "✅ All pre-deployment checks passed!"
echo "🚀 Ready for deployment"
