const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { width: 192, height: 192, name: 'icon-192x192.png' },
  { width: 512, height: 512, name: 'icon-512x512.png' },
  { width: 180, height: 180, name: 'apple-icon.png' },
];

// Créer un logo simple avec un H pour Hades
async function generateLogo(size) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#141414"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial"
        font-size="${size * 0.6}"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central"
      >H</text>
    </svg>
  `;

  return Buffer.from(svg);
}

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Créer le dossier public s'il n'existe pas
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  for (const size of sizes) {
    const svg = await generateLogo(size.width);
    
    await sharp(svg)
      .resize(size.width, size.height)
      .png()
      .toFile(path.join(publicDir, size.name));
    
    console.log(`Generated ${size.name}`);
  }
}

generateIcons().catch(console.error);
