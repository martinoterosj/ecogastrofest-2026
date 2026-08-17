/**
 * GASTROFEST 2026 - EVENT DATA SET
 * Rich offline-first dataset for 1-day Gastronomic Fair
 */

const GASTRO_DATA = {
  event: {
    name: "GastroFest 2026",
    edition: "Edición Urbana & Sabores del Mundo",
    date: "Sábado 17 de Octubre, 2026",
    hours: "11:00 a 23:30 hs",
    venue: "Parque Central - Predio Ferial Gourmet",
    address: "Av. Las Palmeras & Del Sol, Sector A",
    mapsUrl: "https://maps.google.com/?q=Parque+Central+Gastronomia",
    wazeUrl: "https://waze.com/ul?q=Parque+Central+Gastronomia",
    phone: "+54 9 11 5555-4321",
    instagram: "@gastrofest.oficial"
  },

  stages: [
    { id: "main", name: "Escenario Fuego & Brasas", icon: "🔥" },
    { id: "domo", name: "Domo Gourmet & Catas", icon: "🍷" },
    { id: "acustico", name: "Patio Cervecero & Música", icon: "🎸" },
    { id: "kids", name: "Espacio Mini Chefs", icon: "🧁" }
  ],

  schedule: [
    {
      id: "ev-1",
      startTime: "11:30",
      endTime: "12:45",
      stageId: "main",
      stageName: "Escenario Fuego & Brasas",
      category: "masterclass",
      title: "Gran Apertura: Secretos del Ahumado y Cortes Criollos",
      speaker: "Chef Marcos Valenzuela",
      speakerAvatar: "👨‍🍳",
      description: "Técnicas ancestrales de cocción a la leña, marinados para costillares y chimichurris de autor.",
      badge: "Masterclass"
    },
    {
      id: "ev-2",
      startTime: "12:30",
      endTime: "13:45",
      stageId: "kids",
      stageName: "Espacio Mini Chefs",
      category: "taller",
      title: "Taller Infantil: Creando Pizzetas & Galletitas Divertidas",
      speaker: "Pastelera Lucía Ramos",
      speakerAvatar: "👩‍🍳",
      description: "Espacio interactivo y seguro para que los más chicos amasen su propia masa madre dulce.",
      badge: "Taller Niños"
    },
    {
      id: "ev-3",
      startTime: "13:00",
      endTime: "14:15",
      stageId: "domo",
      stageName: "Domo Gourmet & Catas",
      category: "cata",
      title: "Cata Guiada: Vinos de Altura & Maridaje con Quesos Madurados",
      speaker: "Sommelier Julieta Rossi (Bodega Los Andes)",
      speakerAvatar: "🍷",
      description: "Degustación de 4 etiquetas exclusivas acompañadas de tablas de quesos artesanales con denominación de origen.",
      badge: "Cata & Degustación"
    },
    {
      id: "ev-4",
      startTime: "14:30",
      endTime: "15:45",
      stageId: "main",
      stageName: "Escenario Fuego & Brasas",
      category: "masterclass",
      title: "Duelo de Burger Masters: El Arte de la Smash Burger Perfecta",
      speaker: "Burger Lab Team vs. Fuego & Pan",
      speakerAvatar: "🍔",
      description: "Proporciones de blends de carne, panes brioche artesanales y salsas umami en vivo con degustación para el público.",
      badge: "Masterclass"
    },
    {
      id: "ev-5",
      startTime: "15:30",
      endTime: "16:45",
      stageId: "acustico",
      stageName: "Patio Cervecero & Música",
      category: "musica",
      title: "Show en Vivo: Groove & Brass Session",
      speaker: "Banda Brass Funkers",
      speakerAvatar: "🎷",
      description: "Música en vivo para acompañar la tarde con los mejores covers de jazz, funk y rock acústico.",
      badge: "Música en Vivo"
    },
    {
      id: "ev-6",
      startTime: "16:30",
      endTime: "17:45",
      stageId: "domo",
      stageName: "Domo Gourmet & Catas",
      category: "cata",
      title: "Masterclass de Coctelería de Autor & Gin Tonic Botánico",
      speaker: "Bartender Matías Gómez (Speakeasy Bar)",
      speakerAvatar: "🍸",
      description: "Aprende a balancear botánicos, maceraciones caseras e hielos cristalinos para elevar tus cócteles.",
      badge: "Coctelería"
    },
    {
      id: "ev-7",
      startTime: "17:30",
      endTime: "18:45",
      stageId: "main",
      stageName: "Escenario Fuego & Brasas",
      category: "masterclass",
      title: "Cocina Nikkei & Street Food Asiático al Wok",
      speaker: "Chef Kenji Tanaka (Tokyo Street)",
      speakerAvatar: "🥢",
      description: "Fusión peruano-japonesa: tiraditos, baos de panceta crocante y técnicas de fuego rápido al wok.",
      badge: "Masterclass"
    },
    {
      id: "ev-8",
      startTime: "18:30",
      endTime: "19:45",
      stageId: "acustico",
      stageName: "Patio Cervecero & Música",
      category: "musica",
      title: "Tributo Acústico Indie & Pop Latino",
      speaker: "Dúo Luna & Sol",
      speakerAvatar: "🎸",
      description: "Sunset acústico ideal para disfrutar con cerveza artesanal y tapeo gourmet.",
      badge: "Música en Vivo"
    },
    {
      id: "ev-9",
      startTime: "19:30",
      endTime: "20:30",
      stageId: "main",
      stageName: "Escenario Fuego & Brasas",
      category: "sorteo",
      title: "🎉 PRIMER GRAN SORTEO EN VIVO: Experiencias Gourmet & Vouchers",
      speaker: "Animación Central GastroFest",
      speakerAvatar: "🎟️",
      description: "Sorteo en la pantalla gigante de canastas gourmet premium, cenas para 2 personas y kits de asador.",
      badge: "Gran Sorteo"
    },
    {
      id: "ev-10",
      startTime: "20:30",
      endTime: "22:00",
      stageId: "acustico",
      stageName: "Patio Cervecero & Música",
      category: "musica",
      title: "Cierre Musical: Fiesta Funk & Hits 90s/2000s",
      speaker: "DJ Set Vintage & Los Cumbieros del Ritmo",
      speakerAvatar: "🎧",
      description: "La mejor música para bailar, comer rico y despedir una jornada gastronómica inolvidable.",
      badge: "Show Estelar"
    },
    {
      id: "ev-11",
      startTime: "22:15",
      endTime: "23:00",
      stageId: "main",
      stageName: "Escenario Fuego & Brasas",
      category: "sorteo",
      title: "🏆 SORTEO FINAL: El Gran Asador GastroFest 2026 + Viaje Enológico",
      speaker: "Jurado & Organizadores",
      speakerAvatar: "🏆",
      description: "Anuncio del Stand Más Votado de la Feria y el sorteo del Premio Mayor entre todos los participantes registrados.",
      badge: "Sorteo Final"
    }
  ],

  stands: [
    {
      id: "st-1",
      number: "Stand #01",
      name: "La Fogonera Asados",
      category: "carnes",
      categoryName: "Carnes & Brasas",
      zone: "Sector Fuego A",
      priceRange: "$$",
      rating: "4.9 ⭐",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🥩",
      featuredDish: "Sándwich de Vacío Ahumado 8hs con Criolla Criolla",
      tags: ["Sin TACC Opcional", "Ahumados", "Especialidad Asado"],
      isGlutenFree: true,
      isVegan: false,
      menu: [
        { item: "Sándwich de Vacío al Quebracho", desc: "Pan artesanal de masa madre y chimichurri casero", price: "$6.500" },
        { item: "Costillar Ahumado con BBQ ahumada", desc: "Acompañado de papas rústicas al romero", price: "$7.200" },
        { item: "Choripán Gourmet con Queso Provolone", desc: "Chorizo puro cerdo con provoleta crocante", price: "$4.800" }
      ]
    },
    {
      id: "st-2",
      number: "Stand #02",
      name: "Smash Burger Mafia",
      category: "burgers",
      categoryName: "Hamburguesas",
      zone: "Sector Fuego B",
      priceRange: "$$",
      rating: "4.8 ⭐",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🍔",
      featuredDish: "Triple Bacon Truffled Smash",
      tags: ["Pan Brioche", "Bacon Crocante", "Salsa Secreta"],
      isGlutenFree: false,
      isVegan: false,
      menu: [
        { item: "Triple Oklahoma Onion Burger", desc: "Cebollas caramelizadas en la plancha con cheddar fundido", price: "$5.900" },
        { item: "Truffled Mushroom Burger", desc: "Mayonesa trufada, hongos salteados y gouda", price: "$6.400" },
        { item: "Papas Fritas con Cheddar Líquido & Bacon", desc: "Papas doble cocción bien crocantes", price: "$3.500" }
      ]
    },
    {
      id: "st-3",
      number: "Stand #03",
      name: "Green Garden Plant Based",
      category: "vegano",
      categoryName: "Vegano & Saludable",
      zone: "Sector Verde",
      priceRange: "$$",
      rating: "4.9 ⭐",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🥗",
      featuredDish: "Tacos de Hongos Portobello al Pastor",
      tags: ["100% Vegano", "Sin TACC", "Orgánico"],
      isGlutenFree: true,
      isVegan: true,
      menu: [
        { item: "Tacos Al Pastor Veganos (3 u.)", desc: "Tortillas de maíz nixtamalizado, piña asada y cilantro", price: "$5.200" },
        { item: "Bowl Proteico Buda", desc: "Quinoa tricolor, palta, tofu marinado y hummus de remolacha", price: "$5.600" },
        { item: "Hamburguesa Not-Beef con Pan de Carbón", desc: "Queso vegetal fundido y cebollas al Malbec", price: "$5.900" }
      ]
    },
    {
      id: "st-4",
      number: "Stand #04",
      name: "Tokyo Ramen & Bao Street",
      category: "asiatica",
      categoryName: "Comida Asiática",
      zone: "Sector Internacional",
      priceRange: "$$$",
      rating: "5.0 ⭐",
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🍜",
      featuredDish: "Bao Buns de Cerdo Glaseado con Teriyaki (2 u.)",
      tags: ["Street Food", "Cocina Nikkei", "Dumplings"],
      isGlutenFree: false,
      isVegan: false,
      menu: [
        { item: "Gua Bao de Panceta Braseada", desc: "Pan al vapor esponjoso, pepino encurtido y salsa hoisin", price: "$5.800" },
        { item: "Gyozas Crocantes de Cerdo y Jengibre (5 u.)", desc: "Con salsa ponzu y sésamo tostado", price: "$4.500" },
        { item: "Yakitori de Pollo y Negi (3 brochetas)", desc: "Glaseadas con salsa tare casera", price: "$4.900" }
      ]
    },
    {
      id: "st-5",
      number: "Stand #05",
      name: "Cervecería Patagonia & Craft",
      category: "bebidas",
      categoryName: "Cervezas & Vinos",
      zone: "Patio Cervecero",
      priceRange: "$$",
      rating: "4.8 ⭐",
      image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🍺",
      featuredDish: "Pinta Neipa Cítrica Doble Lúpulo",
      tags: ["Tirada Fría", "Happy Hour", "Sin TACC Disponible"],
      isGlutenFree: true,
      isVegan: true,
      menu: [
        { item: "Pinta Artesanal (IPA / Golden / Honey)", desc: "Vaso eco-reciclable de 500ml", price: "$3.200" },
        { item: "Degustación de 4 Estilos (Flight 4x150ml)", desc: "Descubre tus variedades favoritas", price: "$4.200" },
        { item: "Cerveza Especial Sin TACC", desc: "Variedad Red Ale artesanal certificada", price: "$3.400" }
      ]
    },
    {
      id: "st-6",
      number: "Stand #06",
      name: "Dulce Tentación & Gelato",
      category: "dulces",
      categoryName: "Postres & Helados",
      zone: "Paseo Dulce",
      priceRange: "$$",
      rating: "4.9 ⭐",
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🍦",
      featuredDish: "Cucurucho Artesanal de Pistacho Siciliano & Dulce de Leche Volcánico",
      tags: ["Helado Artesanal", "Churros", "Café de Especialidad"],
      isGlutenFree: true,
      isVegan: false,
      menu: [
        { item: "Gelato Artesanal 2 Sabores", desc: "Elaborado con leche fresca y frutos seleccionados", price: "$3.800" },
        { item: "Churros Rellenos con Nutella o DDL (4 u.)", desc: "Crujientes, recién fritos y espolvoreados", price: "$3.200" },
        { item: "Espresso Doble & Flat White", desc: "Granos tostados de origen Colombia", price: "$2.400" }
      ]
    },
    {
      id: "st-7",
      number: "Stand #07",
      name: "Tacos & Margaritas El Mariachi",
      category: "asiatica",
      categoryName: "Street Food",
      zone: "Sector Internacional",
      priceRange: "$$",
      rating: "4.7 ⭐",
      image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🌮",
      featuredDish: "Birria Tacos con Consomé para Sumergir",
      tags: ["100% Maíz", "Sin TACC", "Picante Suave / Fuerte"],
      isGlutenFree: true,
      isVegan: false,
      menu: [
        { item: "Tacos de Birria de Res (3 u.)", desc: "Con queso Oaxaca y caldito consomé caliente", price: "$6.200" },
        { item: "Nachos Supremos con Guacamole & Cheddar", desc: "Totopos caseros con pico de gallo", price: "$4.900" },
        { item: "Frozen Margarita Clásica / Frutos Rojos", desc: "Tequila reposado y jugo de lima natural", price: "$4.000" }
      ]
    },
    {
      id: "st-8",
      number: "Stand #08",
      name: "Celíacos Gourmet (100% Sin TACC)",
      category: "carnes",
      categoryName: "Especial Sin TACC",
      zone: "Sector Verde",
      priceRange: "$$",
      rating: "5.0 ⭐",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      fallbackEmoji: "🌾",
      featuredDish: "Milanesa de Lomo Napolitana con Fritas",
      tags: ["Cocina Exclusiva Sin TACC", "Sin Contaminación Cruzada"],
      isGlutenFree: true,
      isVegan: false,
      menu: [
        { item: "Milanesa Napolitana con Papas", desc: "Rebozado crocante libre de gluten con salsa casera", price: "$6.800" },
        { item: "Empanadas Criollas al Horno (2 u.)", desc: "Masa hojaldrada sin TACC rellena de carne cortada a cuchillo", price: "$3.600" },
        { item: "Alfajor de Almendras & DDL Sin TACC", desc: "Bañado en chocolate belga semiamargo", price: "$2.200" }
      ]
    }
  ],

  sponsors: {
    gold: [
      { name: "Cerveza Andes Origen", tier: "Main Sponsor", icon: "🍺" },
      { name: "Bodega Los Andes", tier: "Vino Oficial", icon: "🍷" },
      { name: "Banco Digital Nación", tier: "Medio de Pago Oficial", icon: "💳" }
    ],
    silver: [
      { name: "Quesos Santa Rosa", tier: "Aliado Gastronómico", icon: "🧀" },
      { name: "Aceite de Oliva Olivos del Valle", tier: "Gourmet Partner", icon: "🫒" },
      { name: "Agua Mineral Glaciar", tier: "Hidratación Oficial", icon: "💧" }
    ]
  }
};
