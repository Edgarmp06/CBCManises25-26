// Configuración de Firebase
// Este archivo contiene la configuración de conexión a Firebase

export const firebaseConfig = {
    apiKey: "AIzaSyAOG8EroOz3pn9o1fLYxbtTTV2laFBqd2s",
    authDomain: "cbc-manises.firebaseapp.com",
    projectId: "cbc-manises",
    storageBucket: "cbc-manises.firebasestorage.app",
    messagingSenderId: "756895829915",
    appId: "1:756895829915:web:b70f5930703f183bf65b3e"
};

// Equipos rivales del calendario
export const EQUIPOS_RIVALES = [
    // EQUIPOS DE PRIMERA FASE
    { nombre: 'Picanya Bàsquet FuturPiso 10', logo: 'picanya.jpg' },
    { nombre: 'Isolia NB Torrent B', logo: 'torrent.jpg' },
    { nombre: 'Mislata BC Verde', logo: 'mislata.jpg' },
    { nombre: 'CB Moncada A', logo: 'moncada.jpg' },
    { nombre: 'Picken MA A', logo: 'picken.jpg' },

    // EQUIPOS DE SEGUNDA FASE
    { nombre: 'C.B. Tabernes Blanques A', logo: 'tabernes.jpg' },
    { nombre: 'CB TLLA Abastos C', logo: 'abastos.jpg' },
    { nombre: 'CB Escolapias CMV', logo: 'escolapias.jpg' },
    { nombre: 'Flex Básquet Riba-Roja', logo: 'riba-roja.jpg' },
    { nombre: 'Academia Petraher B', logo: 'petraher.jpg' },
    { nombre: 'S.D. El Pilar Valencia A', logo: 'el-pilar.jpg' },

    // AMISTOSOS
    { nombre: 'Godella Infantil', logo: 'godella.jpg' },
    { nombre: 'Valencia Basket Infantil', logo: 'valencia-basket.jpg' },
    { nombre: 'Valencia Basket Azul', logo: 'valencia-basket.jpg' }
];

// Equipos de Copa Valenciana (si es necesario separarlos)
export const EQUIPOS_COPA_VALENCIANA = [
    // Añade aquí los equipos de copa cuando los tengas
    // Ejemplo: { nombre: 'Equipo Copa 1', logo: 'logo1.jpg' },
];

// Equipos de Masters Only (si es necesario)
export const EQUIPOS_MASTERS_ONLY = [
    // Añade aquí los equipos de masters cuando los tengas
    // Ejemplo: { nombre: 'Equipo Masters 1', logo: 'logo1.jpg' },
];

// Ubicaciones de los pabellones
export const UBICACIONES = [
    // UBICACIÓN LOCAL
    { nombre: 'Pabellón Alberto Arnal (Manises)', esLocal: true },

    // UBICACIONES DE PRIMERA FASE
    { nombre: 'Pabellón Municipal Picanya', esLocal: false },
    { nombre: 'Pabellón El Vedat (Torrent)', esLocal: false },
    { nombre: 'Pabellón El Quint (Mislata)', esLocal: false },
    { nombre: 'Pabellón Badia Pedretera (Moncada)', esLocal: false },
    { nombre: 'Pabellón Benimaclet (Valencia)', esLocal: false },

    // UBICACIONES DE SEGUNDA FASE
    { nombre: 'PAB MUNI TABERNES BLANQUES', esLocal: false },
    { nombre: 'IES Cid Campeador (Valencia)', esLocal: false },
    { nombre: 'COL ESCOLAPIAS (Valencia)', esLocal: false },
    { nombre: 'PAB MUNI RIBA-ROJA', esLocal: false },
    { nombre: 'Pistas de Baloncesto Sant Marcellí (Valencia)', esLocal: false },
    { nombre: 'PAB MUNI EL QUINT (Mislata)', esLocal: false },
    { nombre: 'COL EL PILAR (Valencia)', esLocal: false }
];
