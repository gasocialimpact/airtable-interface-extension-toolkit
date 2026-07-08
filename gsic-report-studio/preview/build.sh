#!/bin/bash
# Builds a standalone preview of the extension (no Airtable needed).
# Output: preview/dist/index.html — open in any browser.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p preview/dist

npx esbuild frontend/index.js \
    --bundle \
    --loader:.js=jsx \
    --loader:.css=empty \
    --alias:@airtable/blocks/interface/ui=./preview/sdk-mock.js \
    --alias:@airtable/blocks/interface/models=./preview/models-mock.js \
    --outfile=preview/dist/bundle.js \
    --define:process.env.NODE_ENV='"production"'

npx tailwindcss -i frontend/style.css -o preview/dist/tw.css --minify

cat > preview/dist/index.html <<'HTML'
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GSIC Report Studio — Preview</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="tw.css">
<style>html,body,#root{height:100%;margin:0}</style>
</head>
<body>
<div id="root"></div>
<script src="bundle.js"></script>
</body>
</html>
HTML

echo "Preview built: preview/dist/index.html"
