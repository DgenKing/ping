const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icon - lightning bolt for "Ping"
function generateSVG(size, isMaskable = false) {
  const padding = isMaskable ? size * 0.1 : 0;
  const innerSize = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const scale = innerSize / 100;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#4f46e5" rx="${isMaskable ? 0 : size * 0.15}"/>
  <g transform="translate(${padding}, ${padding})">
    <path d="M${55*scale} ${10*scale} L${30*scale} ${45*scale} L${45*scale} ${45*scale} L${40*scale} ${90*scale} L${70*scale} ${50*scale} L${55*scale} ${50*scale} Z" fill="#fbbf24"/>
  </g>
</svg>`;
}

// Write SVG files
sizes.forEach(size => {
  const svg = generateSVG(size, false);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), svg);
  console.log(`Generated icon-${size}.svg`);
});

// Maskable icon
const maskableSvg = generateSVG(512, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), maskableSvg);
console.log('Generated icon-maskable.svg');

// Also create a simple inline data URI placeholder for PNGs
// Real PNGs would need canvas or sharp, but SVGs work in modern browsers
console.log('Done! SVG icons generated.');
