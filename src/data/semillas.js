// Datos iniciales que se cargan cuando localStorage está vacío.

export const productosIniciales = [
    {
        id: 1,
        codigo: "PS5-001",
        nombre: "PlayStation 5",
        categoria: "consolas",
        precio: 549990,
        stock: 10,
        stockCritico: 3,
        descripcion: "Consola de última generación con SSD de alta velocidad y soporte 4K.",
        imagen: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        codigo: "XBX-001",
        nombre: "Xbox Series X",
        categoria: "consolas",
        precio: 529990,
        stock: 8,
        stockCritico: 3,
        descripcion: "La consola Xbox más rápida y potente de la historia.",
        imagen: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        codigo: "ZEL-001",
        nombre: "The Legend of Zelda: Tears of the Kingdom",
        categoria: "juegos",
        precio: 59990,
        stock: 25,
        stockCritico: 5,
        descripcion: "Aventura épica a través de las tierras y los cielos de Hyrule.",
        imagen: "https://juegosdigitaleschile.com/files/images/productos/1684171975-the-legend-of-zelda-tears-of-the-kingdom-nintendo-switch-0.jpg"
    },
    {
        id: 4,
        codigo: "DS5-001",
        nombre: "Mando Inalámbrico DualSense PS5",
        categoria: "accesorios",
        precio: 69990,
        stock: 15,
        stockCritico: 4,
        descripcion: "Retroalimentación háptica y gatillos adaptativos dinámicos.",
        imagen: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        codigo: "NSW-001",
        nombre: "Nintendo Switch OLED",
        categoria: "consolas",
        precio: 349990,
        stock: 12,
        stockCritico: 3,
        descripcion: "Pantalla OLED de 7 pulgadas, base con puerto LAN y 64 GB de almacenamiento.",
        imagen: "https://media.falabella.com/falabellaCL/123426297_01/w=1500,h=1500,fit=cover"
    },
    {
        id: 6,
        codigo: "NSL-001",
        nombre: "Nintendo Switch Lite",
        categoria: "consolas",
        precio: 219990,
        stock: 14,
        stockCritico: 3,
        descripcion: "Versión compacta y portátil de Nintendo Switch, ideal para jugar en cualquier lugar.",
        imagen: "https://media.falabella.com/falabellaCL/143211068_01/w=1500,h=1500,fit=cover"
    },
    {
        id: 7,
        codigo: "PS5D-001",
        nombre: "PlayStation 5 Digital Edition",
        categoria: "consolas",
        precio: 469990,
        stock: 9,
        stockCritico: 3,
        descripcion: "Sin lector de discos: descarga tus juegos directamente desde la PlayStation Store.",
        imagen: "https://media.vandal.net/m/10-2026/13/202610139522887_1.jpg"
    },
    {
        id: 8,
        codigo: "XSS-001",
        nombre: "Xbox Series S 512GB",
        categoria: "consolas",
        precio: 299990,
        stock: 11,
        stockCritico: 3,
        descripcion: "Consola compacta totalmente digital con rendimiento de nueva generación a 1440p.",
        imagen: "https://rimage.ripley.cl/home.ripley/Attachment/MKP/5710/MPM10002609906/imagen2-1.jpeg"
    },
    {
        id: 9,
        codigo: "SDK-001",
        nombre: "Steam Deck OLED 512GB",
        categoria: "consolas",
        precio: 629990,
        stock: 6,
        stockCritico: 2,
        descripcion: "PC portátil para jugar tu biblioteca de Steam con pantalla HDR OLED.",
        imagen: "https://http2.mlstatic.com/D_NQ_NP_907758-MLU76044601866_052024-O.webp"
    },
    {
        id: 10,
        codigo: "MQ3-001",
        nombre: "Meta Quest 3 128GB",
        categoria: "consolas",
        precio: 579990,
        stock: 7,
        stockCritico: 2,
        descripcion: "Visor de realidad mixta con lentes pancake y procesador Snapdragon XR2 Gen 2.",
        imagen: "https://newark.cl/storage/2026/03/Meta-Quest-3S-128GB.png"
    },
    {
        id: 11,
        codigo: "GOW-001",
        nombre: "God of War Ragnarök",
        categoria: "juegos",
        precio: 49990,
        stock: 20,
        stockCritico: 5,
        descripcion: "Kratos y Atreus enfrentan el Fimbulwinter en la conclusión de la saga nórdica.",
        imagen: "https://juegosdigitaleschile.com/files/images/productos/1764614630-god-of-war-ragnarok-deluxe-edition-ps5-0.webp"
    },
    {
        id: 12,
        codigo: "SPM-001",
        nombre: "Marvel's Spider-Man 2",
        categoria: "juegos",
        precio: 59990,
        stock: 18,
        stockCritico: 5,
        descripcion: "Peter Parker y Miles Morales unen fuerzas contra Venom en Nueva York.",
        imagen: "https://clsonyb2c.vtexassets.com/arquivos/ids/463181/PS5-Spiderman2-packshot-1.jpg?v=638366939331430000"
    },
    {
        id: 13,
        codigo: "ELR-001",
        nombre: "Elden Ring",
        categoria: "juegos",
        precio: 44990,
        stock: 22,
        stockCritico: 5,
        descripcion: "RPG de acción en un vasto mundo abierto creado por FromSoftware y G.R.R. Martin.",
        imagen: "https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/aGhopp3MHppi7kooGE2Dtt8C.png"
    },
    {
        id: 14,
        codigo: "MKW-001",
        nombre: "Mario Kart 8 Deluxe",
        categoria: "juegos",
        precio: 54990,
        stock: 30,
        stockCritico: 6,
        descripcion: "Carreras para toda la familia con 48 pistas y modo multijugador local y en línea.",
        imagen: "https://cl-dam-resizer.ecomm.cencosud.com/unsafe/adaptive-fit-in/3840x0/filters:quality(75)/cl/paris/175867999/variant/682202a2e43c208c59a188e8/images/2087dca8-7c2e-4469-983f-392b4d901369/175867999-0000-001.jpg"
    },
    {
        id: 15,
        codigo: "SMW-001",
        nombre: "Super Mario Bros. Wonder",
        categoria: "juegos",
        precio: 54990,
        stock: 16,
        stockCritico: 4,
        descripcion: "La nueva aventura 2D de Mario con flores maravilla que transforman cada nivel.",
        imagen: "https://www.todojuegos.cl/Productos/_mediaProd/31515/super_mario_wonder.jpg"
    },
    {
        id: 16,
        codigo: "FC25-001",
        nombre: "EA Sports FC 25",
        categoria: "juegos",
        precio: 49990,
        stock: 35,
        stockCritico: 8,
        descripcion: "El fútbol más realista con HyperMotion V y los mejores clubes y ligas del mundo.",
        imagen: "https://megagames.cl/wp-content/uploads/2024/09/fifa-25-ps5.jpg"
    },
    {
        id: 17,
        codigo: "CP77-001",
        nombre: "Cyberpunk 2077 Ultimate Edition",
        categoria: "juegos",
        precio: 39990,
        stock: 14,
        stockCritico: 4,
        descripcion: "Incluye la expansión Phantom Liberty. Explora Night City como el mercenario V.",
        imagen: "https://m.media-amazon.com/images/I/810iVtG1iuL._SX466_.jpg"
    },
    {
        id: 18,
        codigo: "RDR-001",
        nombre: "Red Dead Redemption 2",
        categoria: "juegos",
        precio: 29990,
        stock: 17,
        stockCritico: 4,
        descripcion: "Western épico de Rockstar Games protagonizado por Arthur Morgan.",
        imagen: "https://media.falabella.com/falabellaCL/80782306_1/w=1200,h=1400,fit=cover"
    },
    {
        id: 19,
        codigo: "HGW-001",
        nombre: "Hogwarts Legacy",
        categoria: "juegos",
        precio: 39990,
        stock: 19,
        stockCritico: 5,
        descripcion: "Vive como estudiante de Hogwarts en el siglo XIX y domina la magia.",
        imagen: "https://media.falabella.com/falabellaCL/118000217_01/w=1004,h=1500,fit=pad"
    },
    {
        id: 20,
        codigo: "MCF-001",
        nombre: "Minecraft",
        categoria: "juegos",
        precio: 24990,
        stock: 40,
        stockCritico: 8,
        descripcion: "Construye, explora y sobrevive en un mundo de bloques sin límites.",
        imagen: "https://www.weplay.cl/pub/media/catalog/product/cache/3f1b140c3c9f36fbf6b01dffb521c246/8/1/810136672695.jpg"
    },
    {
        id: 21,
        codigo: "ACS-001",
        nombre: "Animal Crossing: New Horizons",
        categoria: "juegos",
        precio: 49990,
        stock: 15,
        stockCritico: 4,
        descripcion: "Crea tu propia isla paradisíaca y convive con adorables vecinos.",
        imagen: "https://media.falabella.com/falabellaCL/80682991_01/w=1200,h=1400,fit=cover"
    },
    {
        id: 22,
        codigo: "RE4-001",
        nombre: "Resident Evil 4 Remake",
        categoria: "juegos",
        precio: 34990,
        stock: 13,
        stockCritico: 4,
        descripcion: "Leon S. Kennedy rescata a la hija del presidente en este clásico del survival horror.",
        imagen: "https://m.media-amazon.com/images/I/815o7ZcxpFL._AC_UF1000,1000_QL80_.jpg"
    },
    {
        id: 23,
        codigo: "DSE-001",
        nombre: "DualSense Edge PS5",
        categoria: "accesorios",
        precio: 199990,
        stock: 8,
        stockCritico: 2,
        descripcion: "Mando profesional con palancas reemplazables, botones traseros y perfiles personalizables.",
        imagen: "https://clsonyb2c.vtexassets.com/arquivos/ids/462080/711719559337_001.jpg?v=638219053379300000"
    },
    {
        id: 24,
        codigo: "PRO-001",
        nombre: "Nintendo Switch Pro Controller",
        categoria: "accesorios",
        precio: 64990,
        stock: 12,
        stockCritico: 3,
        descripcion: "Mando inalámbrico con vibración HD, sensor de movimiento y amiibo NFC.",
        imagen: "https://sniper.cl/cdn/shop/files/proyecto-nuevo-2025-12-30t175026774-ba76088b-8c39-4504-89e3-38eae2686d05_1000x.jpg?v=1772849155"
    },
    {
        id: 25,
        codigo: "PSP-001",
        nombre: "PlayStation Portal",
        categoria: "accesorios",
        precio: 219990,
        stock: 9,
        stockCritico: 2,
        descripcion: "Juega tus títulos de PS5 en remoto con una pantalla LCD de 8 pulgadas.",
        imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmyz2gDPhpUdo3TP-1m83X1QDhgZod01Y2cONfjH4Luw&s=10"
    },
    {
        id: 26,
        codigo: "HXC-001",
        nombre: "Audífonos HyperX Cloud II",
        categoria: "accesorios",
        precio: 79990,
        stock: 18,
        stockCritico: 4,
        descripcion: "Sonido envolvente 7.1 virtual, almohadillas de espuma viscoelástica y micrófono desmontable.",
        imagen: "https://i5.walmartimages.com/asr/15c3e6e7-ef23-4a4d-9ba9-efaad35ec4fa_1.1aafcdba7389c7e8ac8acfe14da5ceb9.jpeg"
    },
    {
        id: 27,
        codigo: "PLS-001",
        nombre: "Audífonos PlayStation Pulse 3D",
        categoria: "accesorios",
        precio: 99990,
        stock: 10,
        stockCritico: 3,
        descripcion: "Audífonos inalámbricos optimizados para el audio 3D de PS5.",
        imagen: "https://i5.walmartimages.cl/asr/3ffc4421-3c9f-4d12-91ca-b62adbc9d71b.1542c085cfe93acaa5c2257cd7e240bc.jpeg?odnHeight=2000&odnWidth=2000&odnBg=ffffff"
    },
    {
        id: 28,
        codigo: "LGM-001",
        nombre: "Mouse Logitech G502 HERO",
        categoria: "accesorios",
        precio: 49990,
        stock: 25,
        stockCritico: 5,
        descripcion: "Sensor HERO de 25.600 DPI, 11 botones programables y pesas ajustables.",
        imagen: "https://cdnx.jumpseller.com/smart-tech/image/21706862/g502-hero-inthebox-mobile-nw.webp?1642774271"
    },
    {
        id: 29,
        codigo: "RZK-001",
        nombre: "Teclado Mecánico Razer BlackWidow V4",
        categoria: "accesorios",
        precio: 149990,
        stock: 10,
        stockCritico: 3,
        descripcion: "Switches mecánicos Razer Green, iluminación Chroma RGB y rueda multifunción.",
        imagen: "https://media.spdigital.cl/thumbnails/products/qvi2wbnv_cb436cd5_thumbnail_4096.jpg"
    },
    {
        id: 30,
        codigo: "SDM-001",
        nombre: "Volante Logitech G29",
        categoria: "accesorios",
        precio: 299990,
        stock: 5,
        stockCritico: 1,
        descripcion: "Volante con force feedback de doble motor y pedales de acero para PS5 y PC.",
        imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwBcQ4LMeg57F8Git1Y3rxkskqmVFhbYARI_N6-2ao0ShX2r9xBxUqnkI&s=10"
    },
    {
        id: 31,
        codigo: "CHG-001",
        nombre: "Silla Gamer Ergonómica",
        categoria: "accesorios",
        precio: 189990,
        stock: 6,
        stockCritico: 2,
        descripcion: "Respaldo reclinable 180°, cojín lumbar y apoyabrazos 4D.",
        imagen: "https://cl-cenco-pim-resizer.ecomm.cencosud.com/unsafe/adaptive-fit-in/3840x0/filters:quality(75)/prd-cl/product-medias/fb97438e-e383-442c-a030-e9a67855ff22/MKM38GNAE2/MKM38GNAE2-1/1740768773719-MKM38GNAE2-1-0.jpg"
    },
    {
        id: 32,
        codigo: "MON-001",
        nombre: "Monitor Gamer 27\" 165Hz",
        categoria: "accesorios",
        precio: 249990,
        stock: 8,
        stockCritico: 2,
        descripcion: "Panel IPS QHD de 27 pulgadas, 1 ms de respuesta y compatibilidad FreeSync.",
        imagen: "https://cl-cenco-pim-resizer.ecomm.cencosud.com/unsafe/adaptive-fit-in/3840x0/filters:quality(75)/prd-cl/product-medias/1748ea88-25db-470a-8c0e-e78f882f7e9b/MK20OSD25Z/MK20OSD25Z-1/1699050837180-MK20OSD25Z-1-0.jpg"
    },
    {
        id: 33,
        codigo: "CRG-001",
        nombre: "Base de Carga DualSense",
        categoria: "accesorios",
        precio: 34990,
        stock: 20,
        stockCritico: 5,
        descripcion: "Carga dos mandos DualSense a la vez sin conectarlos a la consola.",
        imagen: "https://media.falabella.com/falabellaCL/143077108_01/w=1500,h=1500,fit=cover"
    },
    {
        id: 34,
        codigo: "SDC-001",
        nombre: "Tarjeta microSD 512GB para Switch",
        categoria: "accesorios",
        precio: 59990,
        stock: 22,
        stockCritico: 5,
        descripcion: "Amplía el almacenamiento de tu Nintendo Switch con licencia oficial.",
        imagen: "https://media.falabella.com/falabellaCL/17307069_1/w=800,h=800,fit=pad"
    }
];

export const usuariosIniciales = [
    {
        id: 101,
        run: "111111111",
        nombre: "Administrador",
        apellidos: "NUBEPLAY",
        correo: "admin@duoc.cl",
        password: "admin",
        fechaNacimiento: "1990-01-01",
        region: "Metropolitana de Santiago",
        comuna: "Santiago",
        direccion: "Av. Siempre Viva 742, Santiago",
        rol: "Administrador",
        estado: "Activo",
        compras: []
    }
];

// `valor` es el identificador que guardan los productos; no cambia al editar el nombre.
export const categoriasIniciales = [
    { valor: "juegos", nombre: "Videojuegos", icono: "bi-joystick", descripcion: "Los mejores títulos para todas las plataformas." },
    { valor: "consolas", nombre: "Consolas", icono: "bi-controller", descripcion: "Consolas de última generación." },
    { valor: "accesorios", nombre: "Accesorios", icono: "bi-headset", descripcion: "Mandos, audífonos y más para tu setup." }
];

// Íconos de Bootstrap Icons que el admin puede elegir para una categoría.
export const ICONOS_CATEGORIA = [
    "bi-joystick", "bi-controller", "bi-headset", "bi-pc-display", "bi-laptop", "bi-keyboard",
    "bi-mouse", "bi-phone", "bi-tv", "bi-speaker", "bi-camera", "bi-gift", "bi-tag", "bi-box-seam"
];

