/**
 * ECOGASTROFEST 2026 - EVENT DATA SET (100% DYNAMIC & ECO-SUSTAINABLE)
 * Offline-first rich dataset for GastroFest Sustentable
 */

const GASTRO_DATA = {
  event: {
    name: "EcoGastroFest 2026",
    edition: "Feria Gastronómica Sustentable & Sabores del Mundo",
    date: "Sábado 17 de Octubre, 2026",
    hours: "11:00 a 23:30 hs",
    venue: "Parque Central - Predio Ferial Gourmet",
    address: "Av. Las Palmeras & Del Sol, Sector Eco A",
    mapsUrl: "https://maps.google.com/?q=Parque+Central+Gastronomia",
    wazeUrl: "https://waze.com/ul?q=Parque+Central+Gastronomia",
    phone: "+54 9 11 5555-4321",
    instagram: "@ecogastrofest.oficial",
    parkingInfo: "Estacionamiento para autos híbridos/eléctricos y bicicletas gratis. Vehículos convencionales $2.000 (100% donado a reforestación).",
    paymentInfo: "Pagos 100% Digitales sin papel (QR, contactless y billeteras virtuales).",
    firstAidInfo: "Punto Verde Central y Puesto de Asistencia Ecológica y Médica."
  },

  showCategories: [
    { id: "masterclass", name: "Cocina Cero Desperdicio", icon: "🌱" },
    { id: "cata", name: "Vinos Orgánicos & Catas", icon: "🍷" },
    { id: "musica", name: "Música & Shows Acústicos", icon: "🎸" },
    { id: "sorteo", name: "Eco Sorteos", icon: "🎟️" },
    { id: "taller", name: "Huerta & Talleres Niños", icon: "🪴" }
  ],

  standCategories: [
    { id: "carnes", name: "Pastura Regenerativa & Asados", icon: "🥩" },
    { id: "burgers", name: "Burgers Artesanales & Brioche", icon: "🍔" },
    { id: "vegano", name: "100% Plant Based & Orgánico", icon: "🌱" },
    { id: "asiatica", name: "Street Food Km 0", icon: "🥢" },
    { id: "bebidas", name: "Cervezas Artesanales & Vinos", icon: "🍺" },
    { id: "dulces", name: "Helados Naturales & Frutos", icon: "🍦" }
  ],

  stages: [
    { id: "main", name: "Escenario Tierra & Brasas", icon: "🔥" },
    { id: "domo", name: "Domo Biodinámico & Catas", icon: "🍷" },
    { id: "acustico", name: "Patio Acústico Solar", icon: "🎸" },
    { id: "kids", name: "Espacio Semillitas & Mini Chefs", icon: "🪴" }
  ],

  zones: [
    { code: "ZONA A", name: "🥩 Pastura Regenerativa" },
    { code: "ZONA B", name: "🍔 Burgers Artesanales" },
    { code: "ZONA VERDE", name: "🌱 100% Plant Based & Sin TACC" },
    { code: "ZONA C", name: "🍺 Patio Cervecero Eco-Vasos" },
    { code: "ZONA D", name: "🥢 Street Food Km 0" },
    { code: "PUNTO VERDE", name: "♻️ Centro de Compostaje & Reciclaje" }
  ],

  schedule: [
    {
      id: "ev-1",
      startTime: "11:30",
      endTime: "12:45",
      stageId: "main",
      stageName: "Escenario Tierra & Brasas",
      category: "masterclass",
      title: "Gran Apertura: Asado Regenerativo y Técnicas a la Leña",
      speaker: "Chef Marcos Valenzuela",
      speakerAvatar: "👨‍🍳",
      description: "Cortes de libre pastoreo, técnicas de ahumado con leña de poda sustentable y chimichurris silvestres.",
      badge: "Masterclass",
      status: "scheduled"
    },
    {
      id: "ev-2",
      startTime: "12:30",
      endTime: "13:45",
      stageId: "kids",
      stageName: "Espacio Semillitas & Mini Chefs",
      category: "taller",
      title: "Taller Infantil: Siembra de Huerta Urbana & Snacks Saludables",
      speaker: "Pastelera Lucía Ramos",
      speakerAvatar: "👩‍🍳",
      description: "Los niños aprenden sobre compostaje, plantan sus plantines de aromáticas y crean galletas de avena y miel.",
      badge: "Taller Niños",
      status: "scheduled"
    },
    {
      id: "ev-3",
      startTime: "13:00",
      endTime: "14:15",
      stageId: "domo",
      stageName: "Domo Biodinámico & Catas",
      category: "cata",
      title: "Cata Guiada: Vinos Biodinámicos & Quesos de Libre Pastoreo",
      speaker: "Sommelier Julieta Rossi (Bodega Los Andes)",
      speakerAvatar: "🍷",
      description: "Maridaje sensorial con etiquetas orgánicas de altura y quesos artesanales con certificación agroecológica.",
      badge: "Cata & Degustación",
      status: "scheduled"
    },
    {
      id: "ev-4",
      startTime: "14:30",
      endTime: "15:45",
      stageId: "main",
      stageName: "Escenario Tierra & Brasas",
      category: "masterclass",
      title: "Duelo Smash Burgers: Blend de Pastura vs. Plant Based Gourmet",
      speaker: "Burger Lab Team vs. Green Mafia",
      speakerAvatar: "🍔",
      description: "Demostración en vivo de panes brioche orgánicos, medallones sustentables y quesos sin conservantes.",
      badge: "Masterclass",
      status: "scheduled"
    },
    {
      id: "ev-5",
      startTime: "15:30",
      endTime: "16:45",
      stageId: "acustico",
      stageName: "Patio Acústico Solar",
      category: "musica",
      title: "Show en Vivo: Groove & Brass Session",
      speaker: "Banda Brass Funkers",
      speakerAvatar: "🎷",
      description: "Música acústica y funk impulsada por paneles solares para acompañar el patio cervecero.",
      badge: "Música en Vivo",
      status: "scheduled"
    },
    {
      id: "ev-6",
      startTime: "16:30",
      endTime: "17:45",
      stageId: "domo",
      stageName: "Domo Biodinámico & Catas",
      category: "cata",
      title: "Coctelería Botánica Zero Waste & Macerados Nativos",
      speaker: "Bartender Matías Gómez",
      speakerAvatar: "🍸",
      description: "Aprovechamiento total de frutas, botánicos locales y destilados artesanales de baja huella de carbono.",
      badge: "Coctelería",
      status: "scheduled"
    },
    {
      id: "ev-7",
      startTime: "17:30",
      endTime: "18:45",
      stageId: "main",
      stageName: "Escenario Tierra & Brasas",
      category: "masterclass",
      title: "Cocina Nikkei Sustentable & Pesca Artesanal al Wok",
      speaker: "Chef Kenji Tanaka (Tokyo Street)",
      speakerAvatar: "🥢",
      description: "Pesca con devolución responsable, baos al vapor de bambú y técnicas de fuego rápido.",
      badge: "Masterclass",
      status: "scheduled"
    },
    {
      id: "ev-8",
      startTime: "18:30",
      endTime: "19:45",
      stageId: "acustico",
      stageName: "Patio Acústico Solar",
      category: "musica",
      title: "Sunset Acústico Indie & Rimas de Autor",
      speaker: "Dúo Luna & Sol",
      speakerAvatar: "🎸",
      description: "Atardecer musical en el predio con cerveza artesanal en vasos retornables.",
      badge: "Música en Vivo",
      status: "scheduled"
    },
    {
      id: "ev-9",
      startTime: "19:30",
      endTime: "20:30",
      stageId: "main",
      stageName: "Escenario Tierra & Brasas",
      category: "sorteo",
      title: "🎉 PRIMER GRAN ECO-SORTEO: Canastas Orgánicas & Vouchers",
      speaker: "Animación Central EcoGastroFest",
      speakerAvatar: "🎟️",
      description: "Sorteo en vivo en pantalla gigante de canastas de productos agroecológicos y cenas para 2 personas.",
      badge: "Gran Sorteo",
      status: "scheduled"
    },
    {
      id: "ev-10",
      startTime: "20:30",
      endTime: "22:00",
      stageId: "acustico",
      stageName: "Patio Acústico Solar",
      category: "musica",
      title: "Cierre Musical: Fiesta Funk & Ritmos Latinos",
      speaker: "DJ Set Vintage & Los Cumbieros del Ritmo",
      speakerAvatar: "🎧",
      description: "La mejor música bailable para disfrutar de los stands gastronómicos hasta la noche.",
      badge: "Show Estelar",
      status: "scheduled"
    },
    {
      id: "ev-11",
      startTime: "22:15",
      endTime: "23:00",
      stageId: "main",
      stageName: "Escenario Tierra & Brasas",
      category: "sorteo",
      title: "🏆 ECO-PREMIO FINAL: Gran Asador Sustentable + Viaje Enológico",
      speaker: "Jurado & Organizadores",
      speakerAvatar: "🏆",
      description: "Anuncio del Stand Más Votado y sorteo del Premio Mayor entre los asistentes con ticket digital.",
      badge: "Sorteo Final",
      status: "scheduled"
    }
  ],

  stands: [
    {
      id: "st-1",
      number: "Stand #01",
      name: "La Fogonera Asados",
      category: "carnes",
      categoryName: "Pastura Regenerativa & Asados",
      zone: "Sector Fuego A",
      priceRange: "$$",
      rating: "4.9 ⭐",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🥩",
      featuredDish: "Sándwich de Vacío de Pastura Ahumado 8hs",
      tags: ["Pastura Regenerativa", "Envases Biodegradables", "Sin TACC Opcional"],
      isGlutenFree: true,
      isVegan: false,
      ecoPackaging: true,
      menu: [
        { item: "Sándwich de Vacío al Quebracho de Poda", desc: "Pan artesanal de masa madre y chimichurri agroecológico", price: "$6.500", isSoldOut: false },
        { item: "Costillar Ahumado con BBQ de Ciruelas Silvestres", desc: "Acompañado de papas orgánicas al romero", price: "$7.200", isSoldOut: false },
        { item: "Choripán Artesanal de Campo con Provolone", desc: "Chorizo puro cerdo de granja con provoleta crocante", price: "$4.800", isSoldOut: false }
      ]
    },
    {
      id: "st-2",
      number: "Stand #02",
      name: "Smash Burger Mafia",
      category: "burgers",
      categoryName: "Burgers Artesanales & Brioche",
      zone: "Sector Fuego B",
      priceRange: "$$",
      rating: "4.8 ⭐",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🍔",
      featuredDish: "Triple Bacon Orgánico Truffled Smash",
      tags: ["Pan Brioche Orgánico", "Bacon de Granja", "Packaging Compostable"],
      isGlutenFree: false,
      isVegan: false,
      ecoPackaging: true,
      menu: [
        { item: "Triple Oklahoma Onion Burger", desc: "Cebollas orgánicas a la plancha con cheddar natural", price: "$5.900", isSoldOut: false },
        { item: "Truffled Mushroom Burger", desc: "Mayonesa trufada casera, hongos de pino y queso gouda", price: "$6.400", isSoldOut: false },
        { item: "Papas Rústicas Nativas con Dip de Palta", desc: "Papas andinas doble cocción con sal marina", price: "$3.500", isSoldOut: false }
      ]
    },
    {
      id: "st-3",
      number: "Stand #03",
      name: "Green Garden Plant Based",
      category: "vegano",
      categoryName: "100% Plant Based & Orgánico",
      zone: "Sector Verde",
      priceRange: "$$",
      rating: "4.9 ⭐",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🥗",
      featuredDish: "Tacos de Hongos Portobello al Pastor",
      tags: ["100% Vegano", "Sin TACC", "Residuo Cero", "Orgánico Huella Cero"],
      isGlutenFree: true,
      isVegan: true,
      ecoPackaging: true,
      menu: [
        { item: "Tacos Al Pastor Veganos (3 u.)", desc: "Tortillas de maíz nixtamalizado, piña asada y cilantro fresco", price: "$5.200", isSoldOut: false },
        { item: "Bowl Proteico Buda Km 0", desc: "Quinoa tricolor, palta de campo, tofu marinado y hummus de remolacha", price: "$5.600", isSoldOut: false },
        { item: "Hamburguesa Not-Beef con Pan de Carbón Activado", desc: "Queso vegetal fundido y cebollas al Malbec orgánico", price: "$5.900", isSoldOut: false }
      ]
    },
    {
      id: "st-4",
      number: "Stand #04",
      name: "Tokyo Ramen & Bao Street",
      category: "asiatica",
      categoryName: "Street Food Km 0",
      zone: "Sector Internacional",
      priceRange: "$$$",
      rating: "5.0 ⭐",
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🍜",
      featuredDish: "Bao Buns de Cerdo Glaseado con Teriyaki (2 u.)",
      tags: ["Street Food Km 0", "Cocina Nikkei", "Palillos de Bambú"],
      isGlutenFree: false,
      isVegan: false,
      ecoPackaging: true,
      menu: [
        { item: "Gua Bao de Panceta Braseada", desc: "Pan al vapor esponjoso, pepino encurtido y salsa hoisin casera", price: "$5.800", isSoldOut: false },
        { item: "Gyozas Crocantes de Hongos y Jengibre (5 u.)", desc: "Con salsa ponzu cítrica y sésamo tostado", price: "$4.500", isSoldOut: false },
        { item: "Yakitori de Pollo de Campo (3 brochetas)", desc: "Glaseadas con salsa tare y cebollines de huerta", price: "$4.900", isSoldOut: false }
      ]
    },
    {
      id: "st-5",
      number: "Stand #05",
      name: "Cervecería Patagonia & Craft",
      category: "bebidas",
      categoryName: "Cervezas Artesanales & Vinos",
      zone: "Patio Cervecero",
      priceRange: "$$",
      rating: "4.8 ⭐",
      image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🍺",
      featuredDish: "Pinta Neipa Cítrica Doble Lúpulo en Eco-Vaso",
      tags: ["Vaso Eco-Retornable", "Lúpulo Patagónico", "Sin TACC Disponible"],
      isGlutenFree: true,
      isVegan: true,
      ecoPackaging: true,
      menu: [
        { item: "Pinta Artesanal (IPA / Golden / Honey)", desc: "Vaso eco-reciclable de 500ml (retornable)", price: "$3.200", isSoldOut: false },
        { item: "Degustación de 4 Estilos (Flight 4x150ml)", desc: "Descubre tus variedades favoritas de estación", price: "$4.200", isSoldOut: false },
        { item: "Cerveza Especial Sin TACC", desc: "Variedad Red Ale artesanal certificada libre de gluten", price: "$3.400", isSoldOut: false }
      ]
    },
    {
      id: "st-6",
      number: "Stand #06",
      name: "Dulce Tentación & Gelato Natural",
      category: "dulces",
      categoryName: "Helados Naturales & Frutos",
      zone: "Paseo Dulce",
      priceRange: "$$",
      rating: "4.9 ⭐",
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🍦",
      featuredDish: "Cucurucho Artesanal de Pistacho & Dulce de Leche Agroecológico",
      tags: ["Leche Orgánica", "Cucharas de Madera", "Café de Sombra"],
      isGlutenFree: true,
      isVegan: false,
      ecoPackaging: true,
      menu: [
        { item: "Gelato Artesanal 2 Sabores", desc: "Elaborado con leche fresca de tambo regenerativo y frutos reales", price: "$3.800", isSoldOut: false },
        { item: "Churros de Harina Integral con DDL Orgánico (4 u.)", desc: "Crujientes, recién fritos y espolvoreados con azúcar rubia mascabo", price: "$3.200", isSoldOut: false },
        { item: "Espresso Doble de Comercio Justo", desc: "Granos de especialidad tostados artesanalmente", price: "$2.400", isSoldOut: false }
      ]
    },
    {
      id: "st-7",
      number: "Stand #07",
      name: "Tacos & Margaritas El Mariachi",
      category: "asiatica",
      categoryName: "Street Food Km 0",
      zone: "Sector Internacional",
      priceRange: "$$",
      rating: "4.7 ⭐",
      image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🌮",
      featuredDish: "Birria Tacos con Consomé Agroecológico",
      tags: ["100% Maíz Nativo", "Sin TACC", "Envases de Caña de Azúcar"],
      isGlutenFree: true,
      isVegan: false,
      ecoPackaging: true,
      menu: [
        { item: "Tacos de Birria de Res Regenerativa (3 u.)", desc: "Con queso Oaxaca de libre pastoreo y consomé caliente", price: "$6.200", isSoldOut: false },
        { item: "Nachos de Maíz Criollo con Guacamole", desc: "Totopos horneados con pico de gallo de huerta", price: "$4.900", isSoldOut: false },
        { item: "Frozen Margarita Orgánica con Lima Natural", desc: "Tequila reposado con néctar de agave", price: "$4.000", isSoldOut: false }
      ]
    },
    {
      id: "st-8",
      number: "Stand #08",
      name: "Celíacos Gourmet (100% Sin TACC)",
      category: "carnes",
      categoryName: "Pastura Regenerativa & Asados",
      zone: "Sector Verde",
      priceRange: "$$",
      rating: "5.0 ⭐",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🌾",
      featuredDish: "Milanesa de Lomo de Pastura Napolitana con Fritas",
      tags: ["100% Sin TACC", "Sin Contaminación Cruzada", "Packaging Biodegradable"],
      isGlutenFree: true,
      isVegan: false,
      ecoPackaging: true,
      menu: [
        { item: "Milanesa Napolitana Sin TACC con Papas", desc: "Rebozado crocante libre de gluten con salsa de tomates de huerta", price: "$6.800", isSoldOut: false },
        { item: "Empanadas Criollas al Horno (2 u.)", desc: "Masa artesanal libre de gluten rellena de carne cortada a cuchillo", price: "$3.600", isSoldOut: false },
        { item: "Alfajor de Almendras & DDL Sin TACC", desc: "Bañado en chocolate semiamargo de comercio justo", price: "$2.200", isSoldOut: false }
      ]
    }
  ],

  sponsors: {
    gold: [
      {
        name: "Cerveza Andes Origen",
        tier: "Vaso Eco-Retornable Oficial",
        icon: "🍺",
        logoUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=200&auto=format&fit=crop&q=80"
      },
      {
        name: "Bodega Orgánica Los Andes",
        tier: "Vino Biodinámico Certificado",
        icon: "🍷",
        logoUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&auto=format&fit=crop&q=80"
      },
      {
        name: "Banco Verde Sustentable",
        tier: "Medio de Pago Huella Cero",
        icon: "💳",
        logoUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&auto=format&fit=crop&q=80"
      }
    ],
    silver: [
      {
        name: "Quesos de Granja Regenerativa",
        tier: "Lácteos de Libre Pastoreo",
        icon: "🧀",
        logoUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&auto=format&fit=crop&q=80"
      },
      {
        name: "Aceite de Oliva Extra Virgen Orgánico",
        tier: "Aliado Gastronómico Sustentable",
        icon: "🫒",
        logoUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&auto=format&fit=crop&q=80"
      },
      {
        name: "Eco-Agua de Vertiente",
        tier: "Estaciones de Hidratación Gratis",
        icon: "💧",
        logoUrl: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=200&auto=format&fit=crop&q=80"
      }
    ]
  },

  announcements: [
    {
      id: "ann-1",
      title: "🌿 ¡Bienvenidos a EcoGastroFest 2026!",
      message: "Recuerda retirar tu vaso eco-retornable en cualquier stand de bebidas.",
      icon: "🌱",
      createdAt: "11:00 hs"
    }
  ]
};
