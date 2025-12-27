/**
 * Constantes de la Aplicación
 *
 * Valores constantes utilizados en toda la aplicación
 */

// === TABS DE NAVEGACIÓN ===
export const TABS = {
    CALENDARIO: 'calendario',
    RESULTADOS: 'resultados',
    ESTADISTICAS: 'estadisticas',
    CLASIFICACION: 'clasificacion'
};

// === ESTADOS DE PARTIDOS ===
export const ESTADOS_PARTIDO = {
    PENDIENTE: 'pendiente',
    EN_DIRECTO: 'enDirecto',
    FINALIZADO: 'finalizado'
};

// === CUARTOS DEL PARTIDO ===
export const CUARTOS = {
    Q1: 'Q1',
    Q2: 'Q2',
    Q3: 'Q3',
    Q4: 'Q4',
    OT: 'OT'
};

export const CUARTOS_ARRAY = ['Q1', 'Q2', 'Q3', 'Q4', 'OT'];

// === MENSAJES DE ERROR ===
export const ERRORES = {
    PARTIDO_NO_ENCONTRADO: 'Partido no encontrado',
    ACTA_NO_ENCONTRADA: 'Acta no encontrada',
    ACTA_YA_EXISTE: 'Este partido ya tiene un acta registrada',
    PARTIDO_NO_FINALIZADO: 'El partido debe estar finalizado para crear un acta',
    CAMPOS_OBLIGATORIOS: 'Por favor completa todos los campos obligatorios',
    FORMATO_FECHA_INVALIDO: 'Formato de fecha inválido (debe ser YYYY-MM-DD)',
    FORMATO_HORA_INVALIDO: 'Formato de hora inválido (debe ser HH:MM)',
    EMAIL_INVALIDO: 'Email inválido',
    PERMISOS_INSUFICIENTES: 'No tienes permisos para realizar esta acción',
    ERROR_CONEXION: 'Error de conexión. Intenta de nuevo',
    ERROR_DESCONOCIDO: 'Ha ocurrido un error inesperado'
};

// === MENSAJES DE ÉXITO ===
export const MENSAJES_EXITO = {
    PARTIDO_CREADO: 'Partido añadido correctamente',
    PARTIDO_ACTUALIZADO: 'Partido actualizado correctamente',
    PARTIDO_ELIMINADO: 'Partido eliminado correctamente',
    ACTA_CREADA: 'Acta guardada correctamente',
    ACTA_ACTUALIZADA: 'Acta actualizada correctamente',
    ACTA_ELIMINADA: 'Acta eliminada correctamente',
    LOGIN_EXITOSO: 'Acceso concedido',
    LOGOUT_EXITOSO: 'Sesión cerrada correctamente'
};

// === COLORES DE LAS GRÁFICAS ===
export const COLORES_GRAFICAS = {
    NARANJA_PRIMARY: 'rgba(255, 107, 53, 1)',
    NARANJA_LIGHT: 'rgba(255, 107, 53, 0.8)',
    NARANJA_LIGHTER: 'rgba(255, 107, 53, 0.2)',

    ROJO: 'rgba(220, 38, 38, 1)',
    ROJO_LIGHT: 'rgba(220, 38, 38, 0.2)',

    AZUL: 'rgba(59, 130, 246, 1)',
    AZUL_LIGHT: 'rgba(59, 130, 246, 0.1)',

    VERDE: 'rgba(16, 185, 129, 1)',
    VERDE_LIGHT: 'rgba(16, 185, 129, 0.1)',

    AMARILLO: 'rgba(245, 158, 11, 1)',
    AMARILLO_LIGHT: 'rgba(245, 158, 11, 0.1)',

    PURPURA: 'rgba(168, 85, 247, 1)',
    PURPURA_LIGHT: 'rgba(168, 85, 247, 0.2)'
};

// === IDS DE CANVAS PARA GRÁFICAS ===
export const CANVAS_IDS = {
    // Gráficas del equipo
    PUNTOS_EQUIPO: 'chartPuntosEquipo',
    FALTAS_EQUIPO: 'chartFaltasEquipo',
    TIROS_EQUIPO: 'chartTirosEquipo',
    PORCENTAJE_TL_EQUIPO: 'chartPorcentajeTLEquipo',

    // Gráficas individuales
    TL_JUGADOR: 'chartJugadorTL',
    T2_JUGADOR: 'chartJugadorT2',
    T3_JUGADOR: 'chartJugadorT3',
    FALTAS_JUGADOR: 'chartJugadorFaltas'
};

// === TIPOS DE GRÁFICAS ===
export const TIPOS_GRAFICA = {
    BAR: 'bar',
    LINE: 'line',
    PIE: 'pie',
    DOUGHNUT: 'doughnut'
};

// === CONFIGURACIÓN DE GRÁFICAS ===
export const CONFIG_GRAFICA_BASE = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top'
        }
    },
    scales: {
        y: {
            beginAtZero: true
        }
    }
};

// === CAMPOS DE JUGADOR ===
export const CAMPOS_JUGADOR = {
    DORSAL: 'dorsal',
    NOMBRE: 'nombre',
    PUNTOS: 'pts',
    MINUTOS: 'min',
    TL_ANOTADOS: 'tl_anotados',
    TL_INTENTOS: 'tl_intentos',
    T2_ANOTADOS: 't2_anotados',
    T2_INTENTOS: 't2_intentos',
    T3_ANOTADOS: 't3_anotados',
    T3_INTENTOS: 't3_intentos',
    FALTAS: 'fc'
};

// === MODOS DEL PANEL ADMIN ===
export const MODOS_ADMIN = {
    PARTIDOS: 'partidos',
    ACTAS: 'actas'
};

// === LÍMITES Y VALIDACIONES ===
export const LIMITES = {
    MAX_JUGADORES_POR_ACTA: 15,
    MIN_JUGADORES_POR_ACTA: 5,
    MAX_PUNTOS_PARTIDO: 300,
    MAX_FALTAS_JUGADOR: 5,
    MAX_LONGITUD_NOMBRE: 50,
    MAX_LONGITUD_UBICACION: 100
};

// === PLANTILLA DEL EQUIPO ===
// TODO: Añadir los nombres de los jugadores del equipo con sus dorsales
export const JUGADORES_EQUIPO = [
    { dorsal: '0', nombre: 'CARLOS LAGO VALLDECABRES' },
    { dorsal: '7', nombre: 'JORGE FERREIRA SÁNCHEZ' },
    { dorsal: '9', nombre: 'HÉCTOR POQUET LIRON' },
    { dorsal: '31', nombre: 'DARIO MEROÑO PALOMO' },
    { dorsal: '33', nombre: 'DANIEL DÍAZ FOLGADO' },
    { dorsal: '37', nombre: 'VICTOR ARDID HERRERO' },
    { dorsal: '43', nombre: 'MARC LUCENA ALIAGA' },
    { dorsal: '45', nombre: 'GUILLEM RUIZ SOLER' },
    { dorsal: '55', nombre: 'RUBEN GIL MUÑOZ' },
    { dorsal: '91', nombre: 'RAUL RUIZ ROCHINA' },
    { dorsal: '96', nombre: 'RAUL GIL MUÑOZ' },
    // Añade más jugadores según sea necesario
];

// === INTERVALOS DE TIEMPO ===
export const INTERVALOS = {
    ROTACION_FOTOS: 6000, // 6 segundos
    DEBOUNCE_BUSQUEDA: 300, // 300ms
    TIMEOUT_NOTIFICACION: 3000 // 3 segundos
};

// === CLASES CSS COMUNES ===
export const CLASES_CSS = {
    ACTIVA: 'activa',
    OCULTO: 'hidden',
    VISIBLE: 'block',
    DESHABILITADO: 'disabled',
    ERROR: 'error',
    EXITO: 'success',
    WARNING: 'warning'
};

// === SELECTORES DOM COMUNES ===
export const SELECTORES = {
    APP_CONTAINER: '#app',
    FONDO_FOTO: '.fondo-foto',
    TAB_BUTTON: '.tab-button',
    JUGADOR_CARD: '.jugador-card'
};

// === REGEX PATTERNS ===
export const PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    FECHA: /^\d{4}-\d{2}-\d{2}$/,
    HORA: /^\d{2}:\d{2}$/,
    TELEFONO: /^\d{9}$/,
    SOLO_NUMEROS: /^\d+$/,
    SOLO_LETRAS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
};

// === URLS Y ENLACES ===
export const URLS = {
    WEB: 'https://cbc-manises.vercel.app',
    WHATSAPP_CANAL: 'https://whatsapp.com/channel/0029VbBc5Eh4SpkD0kfaV93T',
    INSTAGRAM: 'https://instagram.com/edgarmp06',
    EMAIL_CONTACTO: 'cbcmanisesweb@gmail.com'
};

// === INFORMACIÓN DEL EQUIPO ===
export const INFO_EQUIPO = {
    NOMBRE: 'CBC Manises-Quart',
    CATEGORIA: 'Cadete Masculino',
    TEMPORADA: '2025/26',
    COMPETICION: 'Preferente Grupo D',
    LOGO: 'logos/cbc-manises.jpg',
    PABELLON_LOCAL: 'Pabellón Alberto Arnal (Manises)'
};

// === LOCAL STORAGE KEYS ===
export const STORAGE_KEYS = {
    PREFERENCIAS: 'cbc_preferencias',
    ULTIMA_VISITA: 'cbc_ultima_visita',
    TAB_ACTIVA: 'cbc_tab_activa'
};

// === EVENTOS PERSONALIZADOS ===
export const EVENTOS = {
    PARTIDO_ACTUALIZADO: 'partidoActualizado',
    ACTA_CREADA: 'actaCreada',
    ESTADISTICAS_ACTUALIZADAS: 'estadisticasActualizadas',
    AUTH_CHANGE: 'authChange',
    TAB_CHANGE: 'tabChange'
};

// === BREAKPOINTS RESPONSIVE ===
export const BREAKPOINTS = {
    MOBILE: 640,
    TABLET: 768,
    DESKTOP: 1024,
    WIDE: 1280
};

// === CONFIGURACIÓN DE ANIMACIONES ===
export const ANIMACIONES = {
    DURACION_CORTA: 200,
    DURACION_MEDIA: 300,
    DURACION_LARGA: 500,
    EASE_IN_OUT: 'ease-in-out',
    EASE_OUT: 'ease-out'
};

// === CLASIFICACIÓN DEL GRUPO D ===
export const CLASIFICACION_PRIMERA_FASE = [
    { pos: 1, equipo: 'PICKEN MA A', j: 10, v: 10, p: 0, np: 0, pf: 715, pc: 352, pts: 20 },
    { pos: 2, equipo: 'PICANYA BASQUET FUTURPISO 10', j: 10, v: 6, p: 4, np: 0, pf: 627, pc: 606, pts: 16 },
    { pos: 3, equipo: 'CB MONCADA "A"', j: 10, v: 5, p: 5, np: 0, pf: 587, pc: 640, pts: 15 },
    { pos: 4, equipo: 'ISOLIA NB TORRENT B', j: 10, v: 4, p: 6, np: 0, pf: 567, pc: 630, pts: 14 },
    { pos: 5, equipo: 'CRISCOLOR C.B.C MANISES-QUART', j: 10, v: 4, p: 6, np: 0, pf: 625, pc: 687, pts: 14 },
    { pos: 6, equipo: 'MISLATA BC VERDE', j: 10, v: 1, p: 9, np: 0, pf: 390, pc: 596, pts: 11 }
];

export const CLASIFICACION_SEGUNDA_FASE = [];

// Exportar objeto con todas las constantes
export default {
    TABS,
    ESTADOS_PARTIDO,
    CUARTOS,
    CUARTOS_ARRAY,
    ERRORES,
    MENSAJES_EXITO,
    COLORES_GRAFICAS,
    CANVAS_IDS,
    TIPOS_GRAFICA,
    CONFIG_GRAFICA_BASE,
    CAMPOS_JUGADOR,
    MODOS_ADMIN,
    LIMITES,
    JUGADORES_EQUIPO,
    INTERVALOS,
    CLASES_CSS,
    SELECTORES,
    PATTERNS,
    URLS,
    INFO_EQUIPO,
    STORAGE_KEYS,
    EVENTOS,
    BREAKPOINTS,
    ANIMACIONES,
    CLASIFICACION_PRIMERA_FASE,
    CLASIFICACION_SEGUNDA_FASE
};
