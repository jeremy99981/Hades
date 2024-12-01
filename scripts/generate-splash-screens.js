const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const splashScreens = [
  {
    name: 'apple-splash-2778-1284.png',
    width: 2778,
    height: 1284,
    label: 'iPhone 13 Pro Max, 12 Pro Max'
  },
  {
    name: 'apple-splash-2532-1170.png',
    width: 2532,
    height: 1170,
    label: 'iPhone 13, 13 Pro, 12, 12 Pro'
  },
  {
    name: 'apple-splash-2340-1080.png',
    width: 2340,
    height: 1080,
    label: 'iPhone 12 mini, 13 mini'
  }
];

async function generateSplashScreen(width, height) {
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#141414"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial"
        font-size="${Math.min(width, height) * 0.2}"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central"
      >HADES</text>
    </svg>
  `;

  return Buffer.from(svg);
}

async function generateSplashScreens() {
  const publicDir = path.join(__dirname, '..', 'public', 'splash');
  
  // Créer le dossier splash s'il n'existe pas
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  for (const screen of splashScreens) {
    const svg = await generateSplashScreen(screen.width, screen.height);
    
    await sharp(svg)
      .resize(screen.width, screen.height)
      .png()
      .toFile(path.join(publicDir, screen.name));
    
    console.log(`Generated ${screen.name} for ${screen.label}`);
  }
}

generateSplashScreens().catch(console.error);
