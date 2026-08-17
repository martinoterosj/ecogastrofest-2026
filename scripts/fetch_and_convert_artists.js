const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGET_DIR = path.join(__dirname, '..', 'images', 'artists');
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Artist candidates with fallback image URLs
const artists = [
  {
    id: 'jaime-roos',
    name: 'Jaime Roos',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Jaime_Roos_2011.jpg/800px-Jaime_Roos_2011.jpg',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80'
    ]
  },
  {
    id: 'ruben-rada',
    name: 'Ruben Rada',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Ruben_Rada_en_2011.jpg/800px-Ruben_Rada_en_2011.jpg',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80'
    ]
  },
  {
    id: 'ntvg-emiliano',
    name: 'No Te Va Gustar (Emiliano Brancciari)',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Emiliano_Brancciari_2014.jpg/800px-Emiliano_Brancciari_2014.jpg',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80'
    ]
  },
  {
    id: 'vela-puerca',
    name: 'La Vela Puerca (Sebastián Teysera)',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Sebastian_Teysera_2015.jpg/800px-Sebastian_Teysera_2015.jpg',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80'
    ]
  },
  {
    id: 'jorge-drexler',
    name: 'Jorge Drexler',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Jorge_Drexler_2017.jpg/800px-Jorge_Drexler_2017.jpg',
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80'
    ]
  },
  {
    id: 'cuarteto-nos',
    name: 'El Cuarteto de Nos (Roberto Musso)',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Roberto_Musso_2017.jpg/800px-Roberto_Musso_2017.jpg',
      'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80'
    ]
  },
  {
    id: 'hugo-fattoruso',
    name: 'Hugo Fattoruso',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Hugo_Fattoruso_2017.jpg/800px-Hugo_Fattoruso_2017.jpg',
      'https://images.unsplash.com/photo-1520523839898-507127053c37?w=800&q=80'
    ]
  },
  {
    id: 'buitres-rock',
    name: 'Buitres (Gabriel Peluffo)',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Gabriel_Peluffo_2014.jpg/800px-Gabriel_Peluffo_2014.jpg',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80'
    ]
  },
  {
    id: 'sergio-puglia-lucia',
    name: 'Sergio Puglia & Lucía Soria',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Sergio_Puglia_2019.jpg/800px-Sergio_Puglia_2019.jpg',
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'
    ]
  },
  {
    id: 'laura-canoura',
    name: 'Laura Canoura',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Laura_Canoura_2013.jpg/800px-Laura_Canoura_2013.jpg',
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80'
    ]
  }
];

async function downloadAndProcess() {
  console.log('🎨 Iniciando descarga y optimización a WebP (< 100KB)...');

  for (const artist of artists) {
    const outputPath = path.join(TARGET_DIR, `${artist.id}.webp`);
    let downloaded = false;

    for (const url of artist.urls) {
      try {
        console.log(`⏳ Descargando foto para ${artist.name} desde ${url}...`);
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GastroFest/1.0'
          }
        });

        if (!res.ok) continue;

        const buffer = Buffer.from(await res.arrayBuffer());

        // Process with sharp to WebP under 100kb
        await sharp(buffer)
          .resize(700, 420, { fit: 'cover', position: 'center' })
          .webp({ quality: 80, effort: 6 })
          .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`✅ [OK] ${artist.id}.webp generado (${sizeKB} KB - Menor a 100KB)`);
        downloaded = true;
        break;
      } catch (err) {
        console.warn(`  ⚠️ Falló URL ${url}: ${err.message}`);
      }
    }

    if (!downloaded) {
      console.error(`❌ No se pudo descargar imagen para ${artist.name}`);
    }
  }

  console.log('\n📊 Resumen de imágenes WebP generadas:');
  const files = fs.readdirSync(TARGET_DIR);
  files.forEach(f => {
    const s = fs.statSync(path.join(TARGET_DIR, f));
    console.log(`  🖼️ ${f} -> ${(s.size / 1024).toFixed(1)} KB (Formato: WebP)`);
  });
}

downloadAndProcess();
