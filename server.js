const express = require('express');
const { createCanvas } = require('canvas');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Canvas dimensions (iPhone 14 Pro lock screen)
const CANVAS_WIDTH = 1170;
const CANVAS_HEIGHT = 2532;

// Theme configurations
const THEMES = {
  dark: {
    background: '#000000',
    lived: '#FFFFFF',
    future: '#333333',
    current: '#FF0000',
    text: '#FFFFFF',
    textSecondary: '#888888',
  },
  light: {
    background: '#FFFFFF',
    lived: '#000000',
    future: '#CCCCCC',
    current: '#00A8FF',
    text: '#000000',
    textSecondary: '#666666',
  },
};

/**
 * Validate input parameters
 */
function validateInput(body) {
  const errors = [];

  if (body.theme && !THEMES[body.theme]) {
    errors.push('theme must be either "dark" or "light"');
  }

  return errors;
}

/**
 * Calculate current week of the year (0-51)
 */
function getCurrentWeekOfYear() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weekNumber = Math.floor((now - startOfYear) / msPerWeek);
  return Math.min(weekNumber, 51); // Cap at 51 (0-indexed, 52 weeks total)
}

/**
 * Generate the year calendar image
 */
function generateCalendarImage(themeName) {
  const theme = THEMES[themeName] || THEMES.dark;
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');

  console.log(`Canvas created: ${CANVAS_WIDTH}x${CANVAS_HEIGHT}`);
  console.log(`Theme: ${themeName}`, theme);

  // Fill background
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Grid configuration - 52 weeks in a 13×4 grid
  const totalWeeks = 52;
  const weeksPerRow = 13;
  const rows = 4;
  const currentWeek = getCurrentWeekOfYear();
  const currentYear = new Date().getFullYear();

  console.log(`Current week: ${currentWeek + 1}/52, Year: ${currentYear}`);

  // Calculate dot size and spacing to fit the grid
  const headerHeight = 200;
  const safeAreaTop = 250;
  const marginBottom = 150;
  const marginLeft = 50;
  const marginRight = 50;

  const availableWidth = CANVAS_WIDTH - marginLeft - marginRight;
  const availableHeight = CANVAS_HEIGHT - headerHeight - safeAreaTop - marginBottom;

  // Calculate optimal dot size and spacing (large dots for year view)
  const dotDiameter = 50;
  const spacing = 15;
  const cellSize = dotDiameter + spacing;

  // Calculate grid dimensions
  const gridWidth = weeksPerRow * cellSize;
  const gridHeight = rows * cellSize;

  // Center the grid
  const startX = marginLeft + (availableWidth - gridWidth) / 2;
  const startY = safeAreaTop + headerHeight + (availableHeight - gridHeight) / 2;

  // Draw year label at top
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(currentYear.toString(), CANVAS_WIDTH / 2, safeAreaTop + 80);

  // Draw week count
  ctx.font = '24px sans-serif';
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText(`Week ${currentWeek + 1} of 52`, CANVAS_WIDTH / 2, safeAreaTop + 140);

  // Draw the grid of weeks (13×4 grid)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < weeksPerRow; col++) {
      const weekIndex = row * weeksPerRow + col;
      if (weekIndex >= totalWeeks) continue; // Skip if beyond 52 weeks

      const x = startX + col * cellSize + dotDiameter / 2;
      const y = startY + row * cellSize + dotDiameter / 2;

      // Determine dot color
      let color;
      if (weekIndex === currentWeek) {
        color = theme.current; // Current week
      } else if (weekIndex < currentWeek) {
        color = theme.lived; // Completed weeks
      } else {
        color = theme.future; // Future weeks
      }

      // Draw circle
      ctx.beginPath();
      ctx.arc(x, y, dotDiameter / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  // Draw legend at bottom
  const legendY = CANVAS_HEIGHT - 80;
  const legendStartX = CANVAS_WIDTH / 2 - 180;

  // Completed dot
  ctx.beginPath();
  ctx.arc(legendStartX, legendY, 8, 0, Math.PI * 2);
  ctx.fillStyle = theme.lived;
  ctx.fill();
  ctx.fillStyle = theme.textSecondary;
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Completed', legendStartX + 20, legendY + 6);

  // Current dot
  ctx.beginPath();
  ctx.arc(legendStartX + 140, legendY, 8, 0, Math.PI * 2);
  ctx.fillStyle = theme.current;
  ctx.fill();
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText('This Week', legendStartX + 160, legendY + 6);

  // Remaining dot
  ctx.beginPath();
  ctx.arc(legendStartX + 290, legendY, 8, 0, Math.PI * 2);
  ctx.fillStyle = theme.future;
  ctx.fill();
  ctx.fillStyle = theme.textSecondary;
  ctx.fillText('Remaining', legendStartX + 310, legendY + 6);

  return canvas.toBuffer('image/png');
}

// Test endpoint for debugging canvas
app.get('/test-canvas', (req, res) => {
  try {
    const canvas = createCanvas(500, 500);
    const ctx = canvas.getContext('2d');

    // Fill background with white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 500, 500);

    // Draw a red rectangle
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(50, 50, 100, 100);

    // Draw a blue circle
    ctx.beginPath();
    ctx.arc(250, 250, 50, 0, Math.PI * 2);
    ctx.fillStyle = '#0000FF';
    ctx.fill();

    // Draw some green text
    ctx.fillStyle = '#00FF00';
    ctx.font = '20px sans-serif';
    ctx.fillText('Test Canvas', 150, 400);

    const buffer = canvas.toBuffer('image/png');
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Canvas test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check / landing page
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Year Calendar API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { color: #fff; margin-bottom: 10px; font-size: 2.5rem; }
    .subtitle { color: #888; margin-bottom: 40px; font-size: 1.1rem; }
    .status {
      display: inline-block;
      background: #1a3d1a;
      color: #4ade80;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      margin-bottom: 40px;
    }
    .section { margin-bottom: 40px; }
    h2 { color: #fff; margin-bottom: 15px; font-size: 1.3rem; }
    .endpoint {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .method {
      display: inline-block;
      background: #2563eb;
      color: #fff;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-right: 10px;
    }
    .method.post { background: #16a34a; }
    .path { color: #fff; font-family: monospace; font-size: 1rem; }
    .description { color: #888; margin-top: 10px; }
    pre {
      background: #111;
      border: 1px solid #333;
      border-radius: 6px;
      padding: 15px;
      overflow-x: auto;
      font-size: 0.85rem;
      color: #a5f3fc;
      margin-top: 15px;
    }
    code { font-family: 'SF Mono', Monaco, monospace; }
    .params { margin-top: 15px; }
    .param {
      display: flex;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #222;
    }
    .param:last-child { border-bottom: none; }
    .param-name { color: #fbbf24; font-family: monospace; min-width: 140px; }
    .param-type { color: #888; min-width: 80px; }
    .param-desc { color: #aaa; }
    .required { color: #ef4444; font-size: 0.8rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Year Calendar API</h1>
    <p class="subtitle">Generate year calendar images showing weeks completed in the current year (out of 52)</p>
    <span class="status">Service Online</span>

    <div class="section">
      <h2>Endpoints</h2>

      <div class="endpoint">
        <span class="method post">POST</span>
        <span class="path">/api/generate-calendar</span>
        <p class="description">Generate a year calendar PNG image for the current year</p>

        <div class="params">
          <div class="param">
            <span class="param-name">theme</span>
            <span class="param-type">string</span>
            <span class="param-desc">"dark" or "light" (default: dark)</span>
          </div>
        </div>

        <pre><code>curl -X POST ${req.protocol}://${req.get('host')}/api/generate-calendar \\
  -H "Content-Type: application/json" \\
  -d '{"theme":"dark"}' \\
  --output calendar.png</code></pre>
      </div>

      <div class="endpoint">
        <span class="method">GET</span>
        <span class="path">/</span>
        <p class="description">Health check and API documentation (this page)</p>
      </div>
    </div>

    <div class="section">
      <h2>Response</h2>
      <p style="color: #888;">Success: PNG image (1170x2532px, optimized for iPhone lock screen)</p>
      <p style="color: #888; margin-top: 5px;">Shows current year with 52 weeks in a 13×4 grid</p>
      <p style="color: #888; margin-top: 5px;">Error: JSON with error message</p>
    </div>
  </div>
</body>
</html>
  `;
  res.type('html').send(html);
});

// Generate calendar endpoint
app.post('/api/generate-calendar', (req, res) => {
  try {
    // Validate input
    const errors = validateInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') });
    }

    const { theme = 'dark' } = req.body;

    console.log(`Generating year calendar: theme=${theme}`);

    // Generate the image
    const imageBuffer = generateCalendarImage(theme);

    console.log(`Generated image buffer: ${imageBuffer.length} bytes`);

    // Set response headers
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=3600',
    });

    res.send(imageBuffer);
  } catch (error) {
    console.error('Error generating calendar:', error);
    res.status(500).json({ error: 'Failed to generate calendar image' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Year Calendar API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log(`Generate calendar: POST http://localhost:${PORT}/api/generate-calendar`);
});
