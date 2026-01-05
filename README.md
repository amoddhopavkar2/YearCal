# Life Calendar API

A Node.js web service that generates "life calendar" images showing your entire life as a grid of weeks. Each dot represents one week of your life - perfect for iPhone lock screen wallpapers.

## Features

- Generate life calendar PNG images (1170x2532px - iPhone 14 Pro lock screen size)
- Dark and light themes
- Visualize weeks lived vs remaining
- Current week highlighting
- Optimized for iOS Shortcuts integration

## Deploy to Railway

### One-Click Deploy

1. Fork or clone this repository to your GitHub account
2. Go to [Railway](https://railway.app/new)
3. Click "Deploy from GitHub repo"
4. Select this repository
5. Railway will automatically detect Node.js and deploy
6. Click "Generate Domain" to get your public URL
7. Your API will be live at: `https://your-app.up.railway.app`

### Manual Deploy with Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project (in this directory)
railway init

# Deploy
railway up

# Get your public URL
railway domain
```

### Environment Variables

No environment variables are required. Railway automatically assigns the `PORT`.

## API Usage

### Endpoints

#### `GET /`

Health check and API documentation page.

#### `POST /api/generate-calendar`

Generate a life calendar PNG image.

**Request Body (JSON):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Your birth date (YYYY-MM-DD) |
| `lifeExpectancy` | number | No | Expected lifespan in years (default: 80) |
| `theme` | string | No | "dark" or "light" (default: "dark") |

**Note:** The current date is automatically set to today's date by the API.

**Response:**

- Success: PNG image with `Content-Type: image/png`
- Error: JSON with `{ "error": "message" }`

### Examples

#### cURL

```bash
# Generate dark theme calendar
curl -X POST https://your-app.up.railway.app/api/generate-calendar \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "lifeExpectancy": 80,
    "theme": "dark"
  }' \
  --output calendar.png

# Generate light theme calendar
curl -X POST https://your-app.up.railway.app/api/generate-calendar \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1985-12-01",
    "lifeExpectancy": 90,
    "theme": "light"
  }' \
  --output calendar-light.png
```

#### JavaScript (fetch)

```javascript
const response = await fetch('https://your-app.up.railway.app/api/generate-calendar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    birthDate: '1990-05-15',
    lifeExpectancy: 80,
    theme: 'dark',
  }),
});

const imageBlob = await response.blob();
```

## iOS Shortcut Integration

Create an iOS Shortcut to automatically generate and set your life calendar as your lock screen wallpaper.

### Setup Steps

1. **Get Your Railway URL**
   - After deploying, copy your Railway URL (e.g., `https://lifecalendar.up.railway.app`)

2. **Create New Shortcut**
   - Open the Shortcuts app on your iPhone
   - Tap "+" to create a new shortcut

3. **Add Actions**

   **Action 1: Create JSON Dictionary**
   - Add "Dictionary" action
   - Add keys:
     - `birthDate`: Your birth date (e.g., "1990-05-15")
     - `lifeExpectancy`: 80 (or your preference)
     - `theme`: "dark" or "light"

   **Action 2: Get Contents of URL**
   - Add "Get Contents of URL" action
   - URL: `https://your-app.up.railway.app/api/generate-calendar`
   - Method: POST
   - Headers: `Content-Type` = `application/json`
   - Request Body: JSON → Dictionary from previous step

   **Action 3: Save to Photos**
   - Add "Save to Photo Album" action
   - Input: Contents of URL result

   **Action 4 (Optional): Set Wallpaper**
   - Add "Set Wallpaper" action
   - Photo: Saved photo
   - Screen: Lock Screen

4. **Automate (Optional)**
   - Go to Automation tab
   - Create "Time of Day" automation
   - Run daily at midnight
   - Run your Life Calendar shortcut

### Example Shortcut Flow

```
1. Dictionary:
   - birthDate: "1990-05-15"
   - lifeExpectancy: 80
   - theme: "dark"
2. Get Contents of URL
   - URL: https://your-app.up.railway.app/api/generate-calendar
   - Method: POST
   - Headers: Content-Type: application/json
   - Body: Dictionary
3. Save to Photo Album
4. Set Wallpaper (Lock Screen)
```

The API automatically uses today's date, so you don't need to format or pass the current date.

## Local Development

### Prerequisites

- Node.js 18.x or higher
- npm

### System Dependencies (for canvas)

**macOS:**
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/life-calendar-api.git
cd life-calendar-api

# Install dependencies
npm install

# Start the server
npm start
```

The server will start at `http://localhost:3000`

### Test Locally

```bash
curl -X POST http://localhost:3000/api/generate-calendar \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","lifeExpectancy":80,"theme":"dark"}' \
  --output test-calendar.png
```

## Rate Limiting

The API is rate limited to 100 requests per 15 minutes per IP address to prevent abuse.

## Image Specifications

- **Dimensions:** 1170 x 2532 pixels (iPhone 14 Pro lock screen)
- **Format:** PNG
- **Grid:** 52 columns (weeks) × lifeExpectancy rows (years)
- **Dot size:** 8px diameter
- **Safe area:** 250px top margin for iPhone clock

### Theme Colors

**Dark Theme:**
- Background: #000000
- Lived weeks: #FFFFFF
- Future weeks: #333333
- Current week: #FF0000

**Light Theme:**
- Background: #FFFFFF
- Lived weeks: #000000
- Future weeks: #CCCCCC
- Current week: #00A8FF

## License

MIT
