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
    { nombre: 'Picanya Bàsquet FuturPiso 10', logo: 'picanya.jpg' },
    { nombre: 'Isolia NB Torrent B', logo: 'torrent.jpg' },
    { nombre: 'Mislata BC Verde', logo: 'mislata.jpg' },
    { nombre: 'CB Moncada A', logo: 'moncada.jpg' },
    { nombre: 'Picken MA A', logo: 'picken.jpg' }
];

// Ubicaciones de los pabellones
export const UBICACIONES = [
    { nombre: 'Pabellón Alberto Arnal (Manises)', esLocal: true },
    { nombre: 'Pabellón Municipal Picanya', esLocal: false },
    { nombre: 'Pabellón El Vedat (Torrent)', esLocal: false },
    { nombre: 'Pabellón El Quint (Mislata)', esLocal: false },
    { nombre: 'Pabellón Badia Pedretera (Moncada)', esLocal: false },
    { nombre: 'Pabellón Benimaclet (Valencia)', esLocal: false }
];
