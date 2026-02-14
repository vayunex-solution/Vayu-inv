#!/bin/bash

# Configuration
SOURCE_DIR="vayunex-ui/dist"
TARGET_DIR=~/inventory.vayunexsolution.com

echo "🚀 Starting Frontend Deployment..."

# Check if source exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Source directory $SOURCE_DIR not found!"
    echo "   Please run: npm run build (in vayunex-ui folder first if not built)"
    exit 1
fi

# Create target directory if not exists
mkdir -p $TARGET_DIR

# Copy all files INCLUDING hidden files (like .htaccess)
# Using /. at the end of source ensures hidden files are copied
echo "📦 Copying files to $TARGET_DIR ..."
cp -Rf $SOURCE_DIR/. $TARGET_DIR/

echo "✅ Deployment Complete!"
echo "   .htaccess should now be present to handle routing."
