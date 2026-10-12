export const regiones = [
    { region: "Arica y Parinacota", comunas: ["Arica", "Camarones", "Putre", "General Lagos"] },
    { region: "Tarapacá", comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica"] },
    { region: "Antofagasta", comunas: ["Antofagasta", "Calama", "Tocopilla", "Mejillones"] },
    { region: "Atacama", comunas: ["Copiapó", "Caldera", "Vallenar", "Huasco"] },
    { region: "Coquimbo", comunas: ["La Serena", "Coquimbo", "Ovalle", "Illapel"] },
    { region: "Valparaíso", comunas: ["Valparaíso", "Viña del Mar", "Quilpué", "San Antonio"] },
    { region: "Metropolitana de Santiago", comunas: ["Santiago", "Maipú", "Puente Alto", "Las Condes", "La Florida"] },
    { region: "O'Higgins", comunas: ["Rancagua", "Machalí", "San Fernando", "Rengo"] },
    { region: "Maule", comunas: ["Talca", "Curicó", "Linares", "Constitución"] },
    { region: "Ñuble", comunas: ["Chillán", "San Carlos", "Bulnes", "Yungay"] },
    { region: "Biobío", comunas: ["Concepción", "Talcahuano", "Los Ángeles", "Coronel"] },
    { region: "La Araucanía", comunas: ["Temuco", "Villarrica", "Angol", "Pucón"] },
    { region: "Los Ríos", comunas: ["Valdivia", "La Unión", "Río Bueno", "Panguipulli"] },
    { region: "Los Lagos", comunas: ["Puerto Montt", "Osorno", "Castro", "Ancud"] },
    { region: "Aysén", comunas: ["Coyhaique", "Aysén", "Chile Chico", "Cochrane"] },
    { region: "Magallanes", comunas: ["Punta Arenas", "Puerto Natales", "Porvenir", "Cabo de Hornos"] }
];

export function obtenerComunas(nombreRegion) {
    return regiones.find(item => item.region === nombreRegion)?.comunas || [];
}
