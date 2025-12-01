#!/usr/bin/env node

/**
 * Simple Web Server for KiddoTubes
 * Serves web/ folder with proper routing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8005;
const WEB_DIR = path.join(__dirname, 'web');
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Parse the request URL
  const parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;
  
  // Default to index.html for root
  if (pathname === './') {
    pathname = './index.html';
  }

  // Build the file path
  let filePath = path.join(WEB_DIR, pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(WEB_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  // Handle file not found - serve index.html for SPA routing
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // If file doesn't exist, try index.html
      filePath = path.join(WEB_DIR, 'index.html');
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end('File not found');
          return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
      });
      return;
    }

    // Read and serve the file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Error reading file');
        return;
      }

      const ext = path.extname(filePath);
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

      res.statusCode = 200;
      res.setHeader('Content-Type', mimeType);
      
      // Add cache headers
      if (ext === '.html') {
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
      
      res.end(data);
    });
  });
});

server.listen(PORT, 'localhost', () => {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║ 🎬 KiddoTubes Web Server Running        ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);
  console.log(`✅ Web server: http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${WEB_DIR}\n`);
  console.log(`🚀 Open in browser: http://localhost:${PORT}`);
  console.log(`📡 Backend API: http://localhost:5000\n`);
  
  // Auto-open browser on Windows
  if (process.platform === 'win32') {
    const { exec } = require('child_process');
    exec(`start http://localhost:${PORT}`);
  }
});
