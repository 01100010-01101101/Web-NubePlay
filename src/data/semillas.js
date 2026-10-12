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
        imagen: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"
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

export const categorias = [
    { valor: "juegos", nombre: "Videojuegos" },
    { valor: "consolas", nombre: "Consolas" },
    { valor: "accesorios", nombre: "Accesorios" }
];
