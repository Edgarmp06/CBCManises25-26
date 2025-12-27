/**
 * Módulo de Gestión de Actas
 *
 * Responsabilidades:
 * - CRUD de actas oficiales
 * - Validación de datos de jugadores
 * - Listeners de Firestore en tiempo real
 * - Cálculos de estadísticas individuales
 */

import { collection, addDoc, deleteDoc, doc, updateDoc, query, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

export class ActasManager {
    /**
     * @param {Firestore} db - Instancia de Firestore
     * @param {Function} onUpdate - Callback cuando hay cambios
     */
    constructor(db, onUpdate) {
        this.db = db;
        this.onUpdate = onUpdate;
        this.actas = [];
        this.unsubscribe = null;
    }

    /**
     * Inicia el listener en tiempo real de actas
     */
    iniciarListener() {
        if (this.unsubscribe) {
            console.warn('⚠️ Listener de actas ya iniciado');
            return;
        }

        const q = query(collection(this.db, 'actas'));

        this.unsubscribe = onSnapshot(q, (querySnapshot) => {
            this.actas = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`📋 ${this.actas.length} actas cargadas`);

            // Notificar cambios
            if (this.onUpdate) {
                this.onUpdate(this.actas);
            }
        }, (error) => {
            console.error('❌ Error en listener de actas:', error);
        });
    }

    /**
     * Detiene el listener en tiempo real
     */
    detenerListener() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
            console.log('🛑 Listener de actas detenido');
        }
    }

    /**
     * Obtiene todas las actas
     * @returns {Array} Lista de actas
     */
    getActas() {
        return this.actas;
    }

    /**
     * Obtiene un acta por ID de partido
     * @param {string} partidoId - ID del partido
     * @returns {Object|null} Acta encontrada o null
     */
    getActaPorPartido(partidoId) {
        return this.actas.find(a => a.partidoId === partidoId) || null;
    }

    /**
     * Verifica si un partido ya tiene acta
     * @param {string} partidoId - ID del partido
     * @returns {boolean}
     */
    tieneActa(partidoId) {
        return this.actas.some(a => a.partidoId === partidoId);
    }

    /**
     * Calcula el porcentaje de tiros libres
     * @param {number} anotados - Tiros anotados
     * @param {number} intentos - Tiros intentados
     * @returns {number|null} Porcentaje o null si no hay intentos
     */
    calcularPorcentajeTL(anotados, intentos) {
        if (intentos === 0) return null;
        return Math.round((anotados / intentos) * 100);
    }

    /**
     * Valida los datos de un jugador
     * @param {Object} jugador - Datos del jugador
     * @param {number} index - Índice del jugador (para mensajes de error)
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validarJugador(jugador, index) {
        const errors = [];
        const num = index + 1;

        // Validar campos obligatorios
        if (!jugador.dorsal || jugador.dorsal.trim() === '') {
            errors.push(`Jugador ${num}: El dorsal es obligatorio`);
        }

        if (!jugador.nombre || jugador.nombre.trim() === '') {
            errors.push(`Jugador ${num}: El nombre es obligatorio`);
        }

        // Validar que los valores sean números
        const campos = ['pts', 'min', 'fc', 'tl_anotados', 'tl_intentos', 't2_anotados', 't2_intentos', 't3_anotados', 't3_intentos'];
        campos.forEach(campo => {
            if (jugador[campo] && isNaN(parseInt(jugador[campo]))) {
                errors.push(`Jugador ${num}: ${campo} debe ser un número`);
            }
        });

        // Validar que anotados <= intentos
        const t2_an = parseInt(jugador.t2_anotados) || 0;
        const t2_int = parseInt(jugador.t2_intentos) || 0;
        const t3_an = parseInt(jugador.t3_anotados) || 0;
        const t3_int = parseInt(jugador.t3_intentos) || 0;
        const tl_an = parseInt(jugador.tl_anotados) || 0;
        const tl_int = parseInt(jugador.tl_intentos) || 0;

        if (t2_an > t2_int) {
            errors.push(`Jugador ${num}: T2 anotados (${t2_an}) no puede ser mayor que intentos (${t2_int})`);
        }

        if (t3_an > t3_int) {
            errors.push(`Jugador ${num}: T3 anotados (${t3_an}) no puede ser mayor que intentos (${t3_int})`);
        }

        if (tl_an > tl_int) {
            errors.push(`Jugador ${num}: TL anotados (${tl_an}) no puede ser mayor que intentos (${tl_int})`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Procesa los datos de un jugador para guardarlos
     * @param {Object} jugador - Datos crudos del jugador
     * @returns {Object} Jugador procesado
     */
    procesarJugador(jugador) {
        const tl_an = parseInt(jugador.tl_anotados) || 0;
        const tl_int = parseInt(jugador.tl_intentos) || 0;

        return {
            dorsal: jugador.dorsal.trim(),
            nombre: jugador.nombre.trim().toUpperCase(),
            pts: parseInt(jugador.pts) || 0,
            min: parseInt(jugador.min) || 0,
            tl: {
                anotados: tl_an,
                intentos: tl_int,
                porcentaje: this.calcularPorcentajeTL(tl_an, tl_int)
            },
            t2: {
                anotados: parseInt(jugador.t2_anotados) || 0,
                intentos: parseInt(jugador.t2_intentos) || 0
            },
            t3: {
                anotados: parseInt(jugador.t3_anotados) || 0,
                intentos: parseInt(jugador.t3_intentos) || 0
            },
            fc: parseInt(jugador.fc) || 0
        };
    }

    /**
     * Valida un acta completa
     * @param {Object} data - Datos del acta
     * @param {Object} partido - Datos del partido asociado
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validarActa(data, partido) {
        const errors = [];

        // Validar partido
        if (!data.partidoId) {
            errors.push('Selecciona un partido');
        }

        if (!partido) {
            errors.push('Partido no encontrado');
        } else if (!partido.finalizado) {
            errors.push('El partido debe estar finalizado para crear un acta');
        }

        // Validar jugadores
        if (!data.jugadores || data.jugadores.length === 0) {
            errors.push('Añade al menos un jugador');
        }

        // Verificar si ya existe un acta para este partido
        if (this.tieneActa(data.partidoId)) {
            errors.push('Este partido ya tiene un acta registrada');
        }

        // Validar cada jugador
        if (data.jugadores) {
            data.jugadores.forEach((jugador, index) => {
                const validation = this.validarJugador(jugador, index);
                errors.push(...validation.errors);
            });
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Crea un acta oficial
     * @param {Object} data - Datos del acta
     * @param {Object} partido - Datos del partido
     * @returns {Promise<string>} ID del acta creada
     */
    async crearActa(data, partido) {
        console.log('=== INICIANDO CREACIÓN DE ACTA ===');
        console.log('Partido ID:', data.partidoId);
        console.log('Número de jugadores:', data.jugadores?.length || 0);

        // Validar acta
        const validation = this.validarActa(data, partido);

        if (!validation.valid) {
            const errorMsg = validation.errors.join('\n');
            console.error('❌ Errores de validación:', errorMsg);
            throw new Error(errorMsg);
        }

        // Procesar jugadores
        const jugadoresProcesados = data.jugadores.map(j => this.procesarJugador(j));

        console.log('✅ Validación completada');
        console.log('Jugadores procesados:', jugadoresProcesados);

        // Preparar datos del acta
        const actaData = {
            partidoId: data.partidoId,
            fecha: partido.fecha,
            rival: partido.rival,
            logoRival: partido.logoRival,
            esLocal: partido.esLocal,
            ubicacion: partido.ubicacion,
            resultadoLocal: partido.resultadoLocal,
            resultadoVisitante: partido.resultadoVisitante,
            jornada: partido.jornada,
            fase: partido.fase || 'primera',
            jugadores: jugadoresProcesados
        };

        console.log('Datos del acta a guardar:', actaData);

        try {
            console.log('Guardando en Firebase...');
            const docRef = await addDoc(collection(this.db, 'actas'), actaData);
            console.log('✅ Acta guardada exitosamente:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error al guardar acta:', error);
            throw error;
        }
    }

    /**
     * Actualiza un acta existente
     * @param {string} id - ID del acta
     * @param {Object} data - Datos a actualizar
     * @param {Object} partido - Datos del partido
     */
    async actualizarActa(id, data, partido) {
        // Procesar jugadores
        const jugadoresProcesados = data.jugadores.map(j => this.procesarJugador(j));

        const actaData = {
            jugadores: jugadoresProcesados,
            // Actualizar también datos del partido por si cambiaron
            resultadoLocal: partido.resultadoLocal,
            resultadoVisitante: partido.resultadoVisitante,
            fase: partido.fase || 'primera'
        };

        try {
            await updateDoc(doc(this.db, 'actas', id), actaData);
            console.log('✅ Acta actualizada:', id);
        } catch (error) {
            console.error('❌ Error al actualizar acta:', error);
            throw error;
        }
    }

    /**
     * Elimina un acta
     * @param {string} id - ID del acta a eliminar
     */
    async eliminarActa(id) {
        try {
            await deleteDoc(doc(this.db, 'actas', id));
            console.log('✅ Acta eliminada:', id);
        } catch (error) {
            console.error('❌ Error al eliminar acta:', error);
            throw error;
        }
    }

    /**
     * Obtiene las actas ordenadas por jornada
     * @returns {Array} Actas ordenadas
     */
    getActasOrdenadas() {
        return [...this.actas].sort((a, b) => parseInt(a.jornada) - parseInt(b.jornada));
    }

    /**
     * Obtiene estadísticas resumidas de un acta
     * @param {Object} acta - Acta a analizar
     * @returns {Object} Estadísticas
     */
    getEstadisticasActa(acta) {
        if (!acta || !acta.jugadores) {
            return null;
        }

        const totalPuntos = acta.jugadores.reduce((sum, j) => sum + (j.pts || 0), 0);
        const totalMinutos = acta.jugadores.reduce((sum, j) => sum + (j.min || 0), 0);
        const totalFaltas = acta.jugadores.reduce((sum, j) => sum + (j.fc || 0), 0);
        const totalTL_an = acta.jugadores.reduce((sum, j) => sum + (j.tl?.anotados || 0), 0);
        const totalTL_int = acta.jugadores.reduce((sum, j) => sum + (j.tl?.intentos || 0), 0);

        return {
            puntos: totalPuntos,
            minutos: totalMinutos,
            faltas: totalFaltas,
            porcentajeTL: this.calcularPorcentajeTL(totalTL_an, totalTL_int),
            jugadores: acta.jugadores.length
        };
    }
}
