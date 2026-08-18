/**
 * ECOGASTROFEST 2026 - EVENT MASTER DATA
 * Central data store for schedules, stages, stands, and zones
 */

const GASTRO_DATA = {
  "event": {
    "name": "EcoGastroFest 2026",
    "edition": "Feria Gastronómica Sustentable de San José de Mayo",
    "date": "Sábado 17 de Octubre, 2026",
    "hours": "11:00 a 23:45 hs",
    "venue": "Plaza Independencia - San José de Mayo",
    "address": "Plaza de los Treinta y Tres / Independencia, San José de Mayo, Uruguay",
    "mapsUrl": "https://maps.google.com/?q=Plaza+Independencia+San+Jose+de+Mayo+Uruguay",
    "wazeUrl": "https://waze.com/ul?q=Plaza+Independencia+San+Jose+de+Mayo+Uruguay",
    "phone": "+598 99 123 456",
    "instagram": "@ecogastrofest.sanjose",
    "parkingInfo": "Estacionamiento libre y señalizado en el perímetro de la Plaza (Calles 25 de Mayo, 18 de Julio, Asamblea y Artigas). Espacio preferencial para bicicletas.",
    "paymentInfo": "Pagos 100% digitales (QR, tarjetas, transferencias) y efectivo en todos los stands.",
    "firstAidInfo": "Puesto de Primeros Auxilios, Asistencia Médica y Punto Verde junto al monumento central."
  },
  "showCategories": [
    {
      "id": "masterclass",
      "name": "Cocina Cero Desperdicio",
      "icon": "🌱"
    },
    {
      "id": "cata",
      "name": "Vinos Orgánicos & Catas",
      "icon": "🍷"
    },
    {
      "id": "musica",
      "name": "Música & Shows Acústicos",
      "icon": "🎸"
    },
    {
      "id": "sorteo",
      "name": "Eco Sorteos",
      "icon": "🎟️"
    },
    {
      "id": "taller",
      "name": "Huerta & Talleres Niños",
      "icon": "🪴"
    }
  ],
  "standCategories": [
    {
      "id": "carnes",
      "name": "Pastura Regenerativa & Asados",
      "icon": "🥩"
    },
    {
      "id": "burgers",
      "name": "Burgers Artesanales & Brioche",
      "icon": "🍔"
    },
    {
      "id": "vegano",
      "name": "100% Plant Based & Orgánico",
      "icon": "🌱"
    },
    {
      "id": "asiatica",
      "name": "Street Food Km 0",
      "icon": "🥢"
    },
    {
      "id": "bebidas",
      "name": "Cervezas Artesanales & Vinos",
      "icon": "🍺"
    },
    {
      "id": "dulces",
      "name": "Helados Naturales & Frutos",
      "icon": "🍦"
    }
  ],
  "stages": [
    {
      "id": "main",
      "name": "Escenario Principal Solís",
      "icon": "🎸"
    },
    {
      "id": "domo",
      "name": "Domo Gourmet & Catas",
      "icon": "🍷"
    },
    {
      "id": "acustico",
      "name": "Patio Acústico Solar",
      "icon": "🎤"
    },
    {
      "id": "kids",
      "name": "Espacio Candombe & Talleres",
      "icon": "🪴"
    }
  ],
  "zones": [
    {
      "id": "zone-solis",
      "code": "ESCENARIO SOLÍS",
      "name": "🎸 Escenario Principal Solís",
      "category": "Escenario Principal",
      "icon": "🎸",
      "color": "#ef4444",
      "x": 50,
      "y": 15,
      "description": "Escenario principal de recitales, shows estelares y actos centrales (Norte)."
    },
    {
      "id": "zone-brasas",
      "code": "ZONA BRASAS",
      "name": "🥩 Pastura Regenerativa & Asados",
      "category": "Gastronomía",
      "icon": "🥩",
      "color": "#f97316",
      "x": 78,
      "y": 42,
      "description": "Parrillas criollas a la leña de poda y cortes de libre pastoreo (Este)."
    },
    {
      "id": "zone-cerveza",
      "code": "PATIO CERVECERO",
      "name": "🍺 Patio Cervecero & Eco-Vasos",
      "category": "Bebidas",
      "icon": "🍺",
      "color": "#f59e0b",
      "x": 74,
      "y": 78,
      "description": "Cervezas artesanales uruguayas y eco-vasos retornables (Sureste)."
    },
    {
      "id": "zone-acustico",
      "code": "PATIO ACÚSTICO",
      "name": "🎤 Patio Acústico Solar",
      "category": "Escenario Acústico",
      "icon": "🎤",
      "color": "#8b5cf6",
      "x": 26,
      "y": 78,
      "description": "Sesiones íntimas desenchufadas con energía solar (Suroeste)."
    },
    {
      "id": "zone-verde",
      "code": "ZONA VERDE",
      "name": "🌱 100% Plant Based & Orgánico",
      "category": "Gastronomía Saludable",
      "icon": "🌱",
      "color": "#10b981",
      "x": 22,
      "y": 42,
      "description": "Alimentos agroecológicos, opciones veganas y sin TACC (Oeste)."
    },
    {
      "id": "zone-obelisco",
      "code": "PUNTO CENTRAL",
      "name": "🏛️ Monumento Central & Punto Verde",
      "category": "Informes & Ecología",
      "icon": "🏛️",
      "color": "#3b82f6",
      "x": 50,
      "y": 50,
      "description": "Monumento de la Plaza, centro de reciclaje, primeros auxilios e informes."
    },
    {
      "id": "zone-domo",
      "code": "DOMO GOURMET",
      "name": "🍷 Domo Gourmet & Catas",
      "category": "Catas & Masterclass",
      "icon": "🍷",
      "color": "#ec4899",
      "x": 48,
      "y": 32,
      "description": "Catas de vinos Tannat, maridaje de quesos y talleres gastronómicos."
    },
    {
      "id": "zone-dj",
      "code": "ZONA DJ",
      "name": "🎧 Espacio DJ & Ambientación Electrónica",
      "category": "Música & Escenario",
      "icon": "🎧",
      "color": "#a855f7",
      "x": 38,
      "y": 24,
      "description": "Cabina de DJs en vivo, mezclas de música orgánica, cumbia digital y ambientación festiva (Noroeste)."
    }
  ],
  "sponsors": {
    "gold": [
      {
        "name": "Cerveza Andes Origen",
        "tier": "Vaso Eco-Retornable Oficial",
        "icon": "🍺",
        "logoUrl": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=200&auto=format&fit=crop&q=80"
      },
      {
        "name": "Bodega Orgánica Los Andes",
        "tier": "Vino Biodinámico Certificado",
        "icon": "🍷",
        "logoUrl": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&auto=format&fit=crop&q=80"
      },
      {
        "name": "Banco Verde Sustentable",
        "tier": "Medio de Pago Huella Cero",
        "icon": "💳",
        "logoUrl": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&auto=format&fit=crop&q=80"
      }
    ],
    "silver": [
      {
        "name": "Quesos de Granja Regenerativa",
        "tier": "Lácteos de Libre Pastoreo",
        "icon": "🧀",
        "logoUrl": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&auto=format&fit=crop&q=80"
      },
      {
        "name": "Aceites Valles del Sol Orgánicos",
        "tier": "Oliva Virgen Extra Km 0",
        "icon": "🫒",
        "logoUrl": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&auto=format&fit=crop&q=80"
      },
      {
        "name": "EcoVasos & Compostables",
        "tier": "Packaging 100% Biodegradable",
        "icon": "♻️",
        "logoUrl": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=200&auto=format&fit=crop&q=80"
      }
    ]
  },
  "announcements": [
    {
      "id": "ann-1",
      "type": "alert",
      "icon": "🌱",
      "title": "¡Festival 100% Libre de Plásticos de un Solo Uso!",
      "message": "Recuerda retirar tu Eco-Vaso retornable en cualquier stand de bebidas.",
      "createdAt": "12:00",
      "active": true
    }
  ],
  "schedule": [
    {
      "id": "ev-1",
      "startTime": "12:00",
      "endTime": "13:15",
      "stageId": "domo",
      "stageName": "Domo Gourmet & Catas",
      "category": "masterclass",
      "title": "Gran Duelo Culinario: Asado Criollo, Pastas & Tannat Uruguayo",
      "speaker": "Sergio Puglia & Lucía Soria",
      "speakerAvatar": "👨‍🍳",
      "image": "images/artists/sergio-puglia-lucia.webp",
      "description": "Masterclass magistral con dos referentes de la gastronomía uruguaya: cortes a la leña, pastas artesanales y maridaje con vinos Tannat.",
      "badge": "Masterclass",
      "status": "scheduled"
    },
    {
      "id": "ev-2",
      "startTime": "13:30",
      "endTime": "14:45",
      "stageId": "acustico",
      "stageName": "Patio Acústico Solar",
      "category": "musica",
      "title": "Canto Popular, Milongas & Boleros Acústicos",
      "speaker": "Laura Canoura & Trío",
      "speakerAvatar": "🎤",
      "image": "images/artists/laura-canoura.webp",
      "description": "La voz femenina insignia de la música popular uruguaya en un emotivo concierto acústico de tango, candombe y canciones clásicas.",
      "badge": "Show Acústico",
      "status": "scheduled"
    },
    {
      "id": "ev-3",
      "startTime": "15:00",
      "endTime": "16:15",
      "stageId": "acustico",
      "stageName": "Patio Acústico Solar",
      "category": "musica",
      "title": "Fusión Candombe, Jazz & Piano en Vivo",
      "speaker": "Hugo Fattoruso & Rey Tambor",
      "speakerAvatar": "🎹",
      "image": "images/artists/hugo-fattoruso.webp",
      "description": "El virtuoso maestro Hugo Fattoruso en una clase magistral de jazz-fusion y ritmo candombero con cuerda de tambores en vivo.",
      "badge": "Candombe Jazz",
      "status": "scheduled"
    },
    {
      "id": "ev-4",
      "startTime": "16:30",
      "endTime": "17:45",
      "stageId": "main",
      "stageName": "Escenario Principal Solís",
      "category": "musica",
      "title": "Canciones Desenchufadas & Acústicos de Autor",
      "speaker": "Emiliano Brancciari (No Te Va Gustar)",
      "speakerAvatar": "🎸",
      "image": "images/artists/ntvg-emiliano.webp",
      "description": "El líder y vocalista de NTVG en un concierto desenchufado íntimo repasando grandes himnos del rock uruguayo.",
      "badge": "Show Acústico",
      "status": "scheduled"
    },
    {
      "id": "ev-5",
      "startTime": "18:00",
      "endTime": "19:15",
      "stageId": "acustico",
      "stageName": "Patio Acústico Solar",
      "category": "musica",
      "title": "Fogón Criollo & Clásicos del Rock Oriental",
      "speaker": "Sebastián 'Cebolla' Teysera (La Vela Puerca)",
      "speakerAvatar": "🔥",
      "image": "images/artists/vela-puerca.webp",
      "description": "Una sesión íntima y fogonera a guitarra criolla con las composiciones más queridas y anécdotas de La Vela Puerca.",
      "badge": "Fogón Rock",
      "status": "scheduled"
    },
    {
      "id": "ev-6",
      "startTime": "19:30",
      "endTime": "20:45",
      "stageId": "domo",
      "stageName": "Domo Gourmet & Catas",
      "category": "musica",
      "title": "Concierto Acústico: Poesía, Décimas y Sabores",
      "speaker": "Jorge Drexler",
      "speakerAvatar": "✨",
      "image": "images/artists/jorge-drexler.webp",
      "description": "El aclamado cantautor uruguayo en una presentación única: guitarra, poesía, percusión y armonías del Río de la Plata.",
      "badge": "Concierto Estelar",
      "status": "scheduled"
    },
    {
      "id": "ev-7",
      "startTime": "20:00",
      "endTime": "21:15",
      "stageId": "main",
      "stageName": "Escenario Principal Solís",
      "category": "musica",
      "title": "Rimas, Humor y Rock Rioplatense",
      "speaker": "El Cuarteto de Nos (Roberto Musso)",
      "speakerAvatar": "⚡",
      "image": "images/artists/cuarteto-nos.webp",
      "description": "Show con la potencia lírica y sonora inconfundible del Cuarteto: 'Yendo a la casa de Damián', 'Lo Malo de Ser Bueno' y más éxitos.",
      "badge": "Show en Vivo",
      "status": "scheduled"
    },
    {
      "id": "ev-8",
      "startTime": "21:00",
      "endTime": "22:00",
      "stageId": "acustico",
      "stageName": "Patio Acústico Solar",
      "category": "musica",
      "title": "Noche de Rock 'N Roll Puro & Baladas Inmortales",
      "speaker": "Buitres (Gabriel Peluffo & Gustavo Parodi)",
      "speakerAvatar": "🦅",
      "image": "images/artists/buitres-rock.webp",
      "description": "La histórica banda de rock uruguayo desata la energía en vivo con sus guitarras afiladas y canciones emblemáticas.",
      "badge": "Rock Uruguayo",
      "status": "scheduled"
    },
    {
      "id": "ev-9",
      "startTime": "21:30",
      "endTime": "22:45",
      "stageId": "main",
      "stageName": "Escenario Principal Solís",
      "category": "musica",
      "title": "Candombe Beat, Fiesta Popular & Grandes Éxitos",
      "speaker": "Ruben 'Negro' Rada & Orquesta",
      "speakerAvatar": "🥁",
      "image": "images/artists/ruben-rada.webp",
      "description": "El gran prócer del candombe-beat uruguayo en una fiesta de percusión, vientos, canto popular y alegría desbordante.",
      "badge": "Candombe Beat",
      "status": "scheduled"
    },
    {
      "id": "ev-10",
      "startTime": "22:45",
      "endTime": "23:45",
      "stageId": "main",
      "stageName": "Escenario Principal Solís",
      "category": "musica",
      "title": "Gran Cierre de Gala: Murga Canción & Candombe",
      "speaker": "Jaime Roos & Banda Completa",
      "speakerAvatar": "👑",
      "image": "images/artists/jaime-roos.webp",
      "description": "El máximo ícono de la música uruguaya corona la noche con sus himnos eternos: 'Brindis por Pierrot', 'Amor Profundo' y 'Colombina'.",
      "badge": "Gran Cierre",
      "status": "scheduled"
    }
  ],
  "stands": [
    {
      "id": "st-1",
      "number": "Stand #01",
      "name": "La Fogonera Regenerativa",
      "category": "carnes",
      "categoryName": "Pastura Regenerativa & Asados",
      "zone": "Sector Tierra A",
      "priceRange": "$$",
      "rating": "4.9 ⭐",
      "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
      "fallbackEmoji": "🥩",
      "featuredDish": "Sándwich de Vacío de Libre Pastoreo con Chimichurri de Huerta",
      "tags": [
        "🌱 Envases Biodegradables",
        "🥩 Carne Regenerativa",
        "🌾 Sin TACC Opcional"
      ],
      "isGlutenFree": true,
      "isVegan": false,
      "menu": [
        {
          "id": "m-101",
          "item": "Sándwich de Vacío Agroecológico",
          "desc": "Pan de masa madre integral con chimichurri casero fresco",
          "price": "$6.500",
          "isSoldOut": false
        },
        {
          "id": "m-102",
          "item": "Costillar con Leña de Poda Certificada",
          "desc": "Acompañado de batatas asadas al romero de huerta",
          "price": "$7.200",
          "isSoldOut": false
        },
        {
          "id": "m-103",
          "item": "Choripán de Cerdo de Granja con Provolone",
          "desc": "Chorizo artesanal sin conservantes artificiales",
          "price": "$4.800",
          "isSoldOut": false
        }
      ]
    },
    {
      "id": "st-2",
      "number": "Stand #02",
      "name": "Smash Burger Eco Lab",
      "category": "burgers",
      "categoryName": "Burgers Artesanales & Brioche",
      "zone": "Sector Tierra B",
      "priceRange": "$$",
      "rating": "4.8 ⭐",
      "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
      "fallbackEmoji": "🍔",
      "featuredDish": "Triple Smash de Pastura con Bacon Artesanal y Pan Brioche Orgánico",
      "tags": [
        "🌱 Envases Biodegradables",
        "Pan Orgánico",
        "Bacon Curado Natural"
      ],
      "isGlutenFree": false,
      "isVegan": false,
      "menu": [
        {
          "id": "m-201",
          "item": "Triple Onion Eco Burger",
          "desc": "Cebollas caramelizadas sin azúcar refinada y queso gouda de campo",
          "price": "$5.900",
          "isSoldOut": false
        },
        {
          "id": "m-202",
          "item": "Truffled Forest Mushroom Burger",
          "desc": "Hongos de cultivo agroecológico y mayonesa de hierbas",
          "price": "$6.400",
          "isSoldOut": false
        },
        {
          "id": "m-203",
          "item": "Papas Rústicas Doble Cocción",
          "desc": "Papas con piel cultivadas en huerta local sin pesticidas",
          "price": "$3.500",
          "isSoldOut": false
        }
      ]
    },
    {
      "id": "st-3",
      "number": "Stand #03",
      "name": "Green Garden 100% Plant Based",
      "category": "vegano",
      "categoryName": "100% Plant Based & Orgánico",
      "zone": "Sector Verde",
      "priceRange": "$$",
      "rating": "5.0 ⭐",
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
      "fallbackEmoji": "🥗",
      "featuredDish": "Tacos de Hongos Portobello al Pastor con Tortillas Nixtamalizadas",
      "tags": [
        "🌱 100% Vegano",
        "🌾 Sin TACC Certificado",
        "♻️ Residuo Cero"
      ],
      "isGlutenFree": true,
      "isVegan": true,
      "menu": [
        {
          "id": "m-301",
          "item": "Tacos Al Pastor Veganos (3 u.)",
          "desc": "Maíz nativo, piña asada, cilantro orgánico y salsa verde casera",
          "price": "$5.200",
          "isSoldOut": false
        },
        {
          "id": "m-302",
          "item": "Bowl Proteico Pachamama",
          "desc": "Quinoa tricolor andina, palta orgánica, tofu marinado y hummus de remolacha",
          "price": "$5.600",
          "isSoldOut": false
        },
        {
          "id": "m-303",
          "item": "Hamburguesa Not-Beef con Pan de Carbón Vegetal",
          "desc": "Queso de castañas fundido y cebollas al Malbec orgánico",
          "price": "$5.900",
          "isSoldOut": false
        }
      ]
    },
    {
      "id": "st-4",
      "number": "Stand #04",
      "name": "Tokyo Green Street Food",
      "category": "asiatica",
      "categoryName": "Street Food Km 0",
      "zone": "Sector Internacional",
      "priceRange": "$$$",
      "rating": "4.9 ⭐",
      "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
      "fallbackEmoji": "🥢",
      "featuredDish": "Gua Baos al Vapor con Cerdo Braseado y Verduras Km 0",
      "tags": [
        "🌱 Envases Biodegradables",
        "🥟 Dumplings Caseros",
        "Ingredientes Km 0"
      ],
      "isGlutenFree": false,
      "isVegan": false,
      "menu": [
        {
          "id": "m-401",
          "item": "Gua Bao de Cerdo Glaseado",
          "desc": "Pan esponjoso al vapor con pepinos encurtidos en casa",
          "price": "$5.800",
          "isSoldOut": false
        },
        {
          "id": "m-402",
          "item": "Gyozas Crocantes de Verduras y Jengibre (5 u.)",
          "desc": "Con masa casera y salsa ponzu artesanal",
          "price": "$4.500",
          "isSoldOut": false
        },
        {
          "id": "m-403",
          "item": "Brochetas Yakitori Orgánicas (3 u.)",
          "desc": "Pollo de campo con salsa tare reducida",
          "price": "$4.900",
          "isSoldOut": false
        }
      ]
    },
    {
      "id": "st-5",
      "number": "Stand #05",
      "name": "Cervecería Eco Patagonia",
      "category": "bebidas",
      "categoryName": "Cervezas Artesanales & Vinos",
      "zone": "Patio Cervecero",
      "priceRange": "$$",
      "rating": "4.8 ⭐",
      "image": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&auto=format&fit=crop&q=80",
      "fallbackEmoji": "🍺",
      "featuredDish": "Pinta Neipa Cítrica en Eco-Vaso Retornable",
      "tags": [
        "♻️ Eco-Vaso Retornable",
        "Lúpulo Patagónico",
        "🌾 Sin TACC Disponible"
      ],
      "isGlutenFree": true,
      "isVegan": true,
      "menu": [
        {
          "id": "m-501",
          "item": "Pinta Artesanal en Eco-Vaso (500ml)",
          "desc": "IPA, Golden o Honey elaborada con agua de deshielo",
          "price": "$3.200",
          "isSoldOut": false
        },
        {
          "id": "m-502",
          "item": "Degustación de 4 Estilos Sustentables",
          "desc": "4 vasos de cata de variedades patagónicas",
          "price": "$4.200",
          "isSoldOut": false
        },
        {
          "id": "m-503",
          "item": "Cerveza Especial Red Ale Sin TACC",
          "desc": "Certificada libre de gluten con malta de sorgo",
          "price": "$3.400",
          "isSoldOut": false
        }
      ]
    },
    {
      "id": "st-6",
      "number": "Stand #06",
      "name": "Dulce Raíz & Helados Naturales",
      "category": "dulces",
      "categoryName": "Helados Naturales & Frutos",
      "zone": "Paseo Dulce",
      "priceRange": "$$",
      "rating": "4.9 ⭐",
      "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
      "fallbackEmoji": "🍦",
      "featuredDish": "Helado Artesanal de Pistacho & Frutos Rojos Silvestres con Cucharita de Bambú",
      "tags": [
        "🌱 Cucharitas de Bambú",
        "Leche Agroecológica",
        "Café de Comercio Justo"
      ],
      "isGlutenFree": true,
      "isVegan": false,
      "menu": [
        {
          "id": "m-601",
          "item": "Gelato 2 Sabores en Cono Artesanal",
          "desc": "Elaborado con frutas recolectadas de cooperativas locales",
          "price": "$3.800",
          "isSoldOut": false
        },
        {
          "id": "m-602",
          "item": "Churros con Azúcar Mascabo Orgánica (4 u.)",
          "desc": "Fritos en aceite vegetal de primer prensado",
          "price": "$3.200",
          "isSoldOut": false
        },
        {
          "id": "m-603",
          "item": "Café de Especialidad de Comercio Justo",
          "desc": "Granos arábicos de origen ético con leche vegetal de avena o almendras",
          "price": "$2.400",
          "isSoldOut": false
        }
      ]
    }
  ],
  "participants": [
    {
      "code": "GF-8412",
      "name": "Martín Gómez",
      "phone": "11-4521-9988",
      "stand": "La Fogonera Regenerativa",
      "issuedAt": "12:15"
    },
    {
      "code": "GF-3904",
      "name": "Camila Navarro",
      "phone": "11-8844-3211",
      "stand": "Smash Burger Eco Lab",
      "issuedAt": "12:40"
    },
    {
      "code": "GF-7721",
      "name": "Gonzalo Benítez",
      "phone": "11-6632-1100",
      "stand": "Green Garden 100% Plant Based",
      "issuedAt": "13:10"
    }
  ]
};

if (typeof window !== 'undefined') {
  window.GASTRO_DATA = GASTRO_DATA;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GASTRO_DATA;
}
