/**
 * Módulo de Gestión de Anotaciones en Vivo
 *
 * Responsabilidades:
 * - Registrar anotaciones durante el partido
 * - Guardar y recuperar anotaciones de Firebase
 * - Generar resúmenes por jugador
 */

import { doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

export class AnotacionesManager {
    /**
     * @param {Firestore} db - Instancia de Firestore
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Añade una anotación a un partido
     * @param {string} partidoId - ID del partido
     * @param {Object} anotacion - Datos de la anotación
     * @param {Array} anotacionesActuales - Anotaciones actuales del partido
     * @returns {Promise<void>}
     */
    async añadirAnotacion(partidoId, anotacion, anotacionesActuales = []) {
        const nuevaAnotacion = {
            jugador: anotacion.jugador,
            puntos: anotacion.puntos, // 1, 2 o 3
            cuarto: anotacion.cuarto || '',
            timestamp: new Date().toISOString()
        };

        const anotacionesActualizadas = [...anotacionesActuales, nuevaAnotacion];

        try {
            await updateDoc(doc(this.db, 'partidos', partidoId), {
                anotaciones: anotacionesActualizadas
            });
            console.log('✅ Anotación guardada:', nuevaAnotacion);
        } catch (error) {
            console.error('❌ Error al guardar anotación:', error);
            throw error;
        }
    }

    /**
     * Obtiene las anotaciones de un partido
     * @param {Object} partido - Datos del partido
     * @returns {Array} Lista de anotaciones
     */
    getAnotaciones(partido) {
        return partido.anotaciones || [];
    }

    /**
     * Genera un resumen de anotaciones por jugador
     * @param {Array} anotaciones - Lista de anotaciones
     * @returns {Object} Resumen organizado por jugador
     */
    generarResumenPorJugador(anotaciones) {
        const resumen = {};

        anotaciones.forEach(anotacion => {
            const jugador = anotacion.jugador;

            if (!resumen[jugador]) {
                resumen[jugador] = {
                    nombre: jugador,
                    anotaciones: [],
                    totalPuntos: 0,
                    tl: 0, // +1
                    t2: 0, // +2
                    t3: 0  // +3
                };
            }

            resumen[jugador].anotaciones.push({
                puntos: anotacion.puntos,
                cuarto: anotacion.cuarto
            });
            resumen[jugador].totalPuntos += anotacion.puntos;

            // Contar tipo de tiro
            if (anotacion.puntos === 1) resumen[jugador].tl++;
            if (anotacion.puntos === 2) resumen[jugador].t2++;
            if (anotacion.puntos === 3) resumen[jugador].t3++;
        });

        return resumen;
    }

    /**
     * Genera sugerencias de estadísticas basadas en anotaciones
     * @param {Object} resumenJugador - Resumen de un jugador
     * @returns {string} Sugerencia de estadísticas
     */
    generarSugerencia(resumenJugador) {
        const sugerencias = [];

        if (resumenJugador.t3 > 0) {
            sugerencias.push(`${resumenJugador.t3} T3`);
        }
        if (resumenJugador.t2 > 0) {
            sugerencias.push(`${resumenJugador.t2} T2`);
        }
        if (resumenJugador.tl > 0) {
            sugerencias.push(`${resumenJugador.tl} TL`);
        }

        return sugerencias.length > 0 ? sugerencias.join(' + ') : 'Sin sugerencias';
    }

    /**
     * Borra las anotaciones de un partido
     * @param {string} partidoId - ID del partido
     * @returns {Promise<void>}
     */
    async borrarAnotaciones(partidoId) {
        try {
            await updateDoc(doc(this.db, 'partidos', partidoId), {
                anotaciones: []
            });
            console.log('✅ Anotaciones borradas del partido:', partidoId);
        } catch (error) {
            console.error('❌ Error al borrar anotaciones:', error);
            throw error;
        }
    }
}
