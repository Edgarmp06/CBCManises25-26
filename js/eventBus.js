/**
 * Event Bus - Sistema de Eventos Personalizado
 *
 * Permite comunicación desacoplada entre módulos mediante eventos
 * Implementa el patrón Observer/Pub-Sub
 */

class EventBus {
    constructor() {
        this.events = new Map();
        console.log('📡 EventBus inicializado');
    }

    /**
     * Suscribe un listener a un evento
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función a ejecutar
     * @returns {Function} Función para desuscribirse
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }

        this.events.get(event).push(callback);

        // Retornar función para desuscribirse
        return () => this.off(event, callback);
    }

    /**
     * Suscribe un listener que se ejecuta solo una vez
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función a ejecutar
     */
    once(event, callback) {
        const onceWrapper = (...args) => {
            callback(...args);
            this.off(event, onceWrapper);
        };

        this.on(event, onceWrapper);
    }

    /**
     * Desuscribe un listener de un evento
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función a desuscribir
     */
    off(event, callback) {
        if (!this.events.has(event)) return;

        const callbacks = this.events.get(event);
        const index = callbacks.indexOf(callback);

        if (index > -1) {
            callbacks.splice(index, 1);
        }

        // Si no quedan callbacks, eliminar el evento
        if (callbacks.length === 0) {
            this.events.delete(event);
        }
    }

    /**
     * Emite un evento
     * @param {string} event - Nombre del evento
     * @param {*} data - Datos del evento
     */
    emit(event, data) {
        if (!this.events.has(event)) return;

        const callbacks = this.events.get(event);

        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error en listener de evento "${event}":`, error);
            }
        });

        console.log(`📡 Evento emitido: ${event}`, data);
    }

    /**
     * Elimina todos los listeners de un evento
     * @param {string} event - Nombre del evento
     */
    clear(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }

    /**
     * Obtiene el número de listeners de un evento
     * @param {string} event - Nombre del evento
     * @returns {number}
     */
    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).length : 0;
    }

    /**
     * Lista todos los eventos registrados
     * @returns {string[]}
     */
    eventNames() {
        return Array.from(this.events.keys());
    }
}

// Crear instancia singleton del EventBus
const eventBus = new EventBus();

// Exportar instancia singleton
export default eventBus;

// También exportar la clase para testing
export { EventBus };
