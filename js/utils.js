/**
 * Módulo de Utilidades Comunes
 *
 * Funciones auxiliares reutilizables en toda la aplicación
 */

/**
 * Formatea una fecha en formato español
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada
 */
export function formatearFecha(fecha) {
    if (!fecha) return '';

    try {
        const date = new Date(fecha + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return fecha;
    }
}

/**
 * Formatea una fecha en formato corto (DD/MM/YYYY)
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada
 */
export function formatearFechaCorta(fecha) {
    if (!fecha) return '';

    try {
        const date = new Date(fecha + 'T00:00:00');
        return date.toLocaleDateString('es-ES');
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return fecha;
    }
}

/**
 * Formatea una hora en formato HH:MM
 * @param {string} hora - Hora
 * @returns {string} Hora formateada
 */
export function formatearHora(hora) {
    if (!hora) return '';
    return hora;
}

/**
 * Calcula el porcentaje
 * @param {number} parte - Parte del total
 * @param {number} total - Total
 * @returns {number|null} Porcentaje o null si total es 0
 */
export function calcularPorcentaje(parte, total) {
    if (total === 0) return null;
    return Math.round((parte / total) * 100);
}

/**
 * Verifica si una fecha ya pasó
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {boolean}
 */
export function fechaPasada(fecha) {
    if (!fecha) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaPartido = new Date(fecha + 'T00:00:00');

    return fechaPartido < hoy;
}

/**
 * Verifica si una fecha es hoy
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {boolean}
 */
export function esHoy(fecha) {
    if (!fecha) return false;

    const hoy = new Date().toISOString().split('T')[0];
    return fecha === hoy;
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string}
 */
export function obtenerFechaActual() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Sanitiza HTML para prevenir XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto
 * @returns {string} Texto capitalizado
 */
export function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Debounce para optimizar eventos
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Muestra una notificación toast
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - 'success', 'error', 'warning', 'info'
 */
export function mostrarNotificacion(mensaje, tipo = 'info') {
    // Por ahora usa alert, pero se puede mejorar con una librería de toasts
    const iconos = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    alert(`${iconos[tipo] || 'ℹ️'} ${mensaje}`);
}

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>}
 */
export async function copiarAlPortapapeles(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Error al copiar:', error);
        return false;
    }
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida un formato de fecha YYYY-MM-DD
 * @param {string} fecha - Fecha a validar
 * @returns {boolean}
 */
export function validarFormatoFecha(fecha) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(fecha);
}

/**
 * Valida un formato de hora HH:MM
 * @param {string} hora - Hora a validar
 * @returns {boolean}
 */
export function validarFormatoHora(hora) {
    const regex = /^\d{2}:\d{2}$/;
    return regex.test(hora);
}

/**
 * Genera un ID único
 * @returns {string}
 */
export function generarID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Ordena array por propiedad
 * @param {Array} array - Array a ordenar
 * @param {string} propiedad - Propiedad por la que ordenar
 * @param {string} direccion - 'asc' o 'desc'
 * @returns {Array}
 */
export function ordenarPor(array, propiedad, direccion = 'asc') {
    return [...array].sort((a, b) => {
        const valorA = a[propiedad];
        const valorB = b[propiedad];

        if (valorA < valorB) return direccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return direccion === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Agrupa array por propiedad
 * @param {Array} array - Array a agrupar
 * @param {string} propiedad - Propiedad por la que agrupar
 * @returns {Object}
 */
export function agruparPor(array, propiedad) {
    return array.reduce((grupos, item) => {
        const valor = item[propiedad];
        if (!grupos[valor]) {
            grupos[valor] = [];
        }
        grupos[valor].push(item);
        return grupos;
    }, {});
}

/**
 * Obtiene un elemento del DOM de forma segura
 * @param {string} selector - Selector CSS
 * @returns {Element|null}
 */
export function getElement(selector) {
    try {
        return document.querySelector(selector);
    } catch (error) {
        console.error('Error al obtener elemento:', selector, error);
        return null;
    }
}

/**
 * Obtiene múltiples elementos del DOM
 * @param {string} selector - Selector CSS
 * @returns {NodeList}
 */
export function getElements(selector) {
    try {
        return document.querySelectorAll(selector);
    } catch (error) {
        console.error('Error al obtener elementos:', selector, error);
        return [];
    }
}

/**
 * Añade clase a un elemento de forma segura
 * @param {Element} element - Elemento
 * @param {string} className - Clase a añadir
 */
export function addClass(element, className) {
    if (element && element.classList) {
        element.classList.add(className);
    }
}

/**
 * Elimina clase de un elemento de forma segura
 * @param {Element} element - Elemento
 * @param {string} className - Clase a eliminar
 */
export function removeClass(element, className) {
    if (element && element.classList) {
        element.classList.remove(className);
    }
}

/**
 * Toggle clase en un elemento
 * @param {Element} element - Elemento
 * @param {string} className - Clase a hacer toggle
 */
export function toggleClass(element, className) {
    if (element && element.classList) {
        element.classList.toggle(className);
    }
}

/**
 * Scroll suave a un elemento
 * @param {string|Element} target - Selector o elemento
 */
export function scrollTo(target) {
    const element = typeof target === 'string' ? getElement(target) : target;

    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Formatea un número con separadores de miles
 * @param {number} numero - Número a formatear
 * @returns {string}
 */
export function formatearNumero(numero) {
    return numero.toLocaleString('es-ES');
}

/**
 * Trunca un texto si es muy largo
 * @param {string} texto - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string}
 */
export function truncar(texto, maxLength = 100) {
    if (!texto || texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
}
