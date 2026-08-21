const sharp = require('sharp');
const path = require('path');

async function createIcon() {
  const svg = `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#061a12" />
        <stop offset="50%" stop-color="#0b291d" />
        <stop offset="100%" stop-color="#04120d" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="50%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
      <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#34d399" />
        <stop offset="100%" stop-color="#10b981" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="30" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background with rounded corners -->
    <rect width="1024" height="1024" rx="220" fill="url(#bgGrad)" />
    
    <!-- Outer Golden Border -->
    <rect x="24" y="24" width="976" height="976" rx="200" fill="none" stroke="url(#goldGrad)" stroke-width="16" opacity="0.8" />
    <rect x="44" y="44" width="936" height="936" rx="180" fill="none" stroke="#34d399" stroke-width="4" opacity="0.3" />

    <!-- Center Glow Circle -->
    <circle cx="512" cy="460" r="260" fill="url(#leafGrad)" opacity="0.15" filter="url(#glow)" />

    <!-- Central Leaf & Fork Icon -->
    <g transform="translate(512, 430) scale(1.4)">
      <!-- Left Leaf -->
      <path d="M-100,-80 C-40,-160 60,-140 100,-80 C120,-20 80,80 0,100 C-80,80 -120,-20 -100,-80 Z" fill="url(#leafGrad)" />
      <!-- Leaf Vein -->
      <path d="M0,90 Q0,-40 0,-140" stroke="#061a12" stroke-width="8" stroke-linecap="round" />
      <path d="M0,-10 Q30,-40 50,-60" stroke="#061a12" stroke-width="6" stroke-linecap="round" />
      <path d="M0,-50 Q-30,-80 -50,-100" stroke="#061a12" stroke-width="6" stroke-linecap="round" />
      <path d="M0,30 Q-30,0 -50,-20" stroke="#061a12" stroke-width="6" stroke-linecap="round" />
      <path d="M0,50 Q30,20 50,0" stroke="#061a12" stroke-width="6" stroke-linecap="round" />
    </g>

    <!-- Festival Name Title -->
    <text x="512" y="760" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">
      ECOGASTROFEST
    </text>

    <!-- Year Subtitle -->
    <text x="512" y="840" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="800" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="8">
      2026
    </text>
  </svg>
  `;

  const outputPath = path.join(__dirname, '../images/app_icon_1024.png');
  await sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .png()
    .toFile(outputPath);

  console.log('✅ Icon created at:', outputPath);
}

createIcon().catch(console.error);
