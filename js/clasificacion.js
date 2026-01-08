/**
 * Clasificacion Manager - Gestión de Clasificaciones
 *
 * Maneja el CRUD de la tabla de clasificación almacenada en Firebase
 */

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

class ClasificacionManager {
    /**
     * @param {Firestore} db - Instancia de Firestore
     */
    constructor(db) {
        this.db = db;
        this.clasificaciones = [];
        this.listener = null;
    }

    /**
     * Obtener clasificaciones por fase con listener en tiempo real
     * @param {string} fase - "primera", "segunda" o "todas"
     * @param {Function} callback - Función a ejecutar cuando cambien los datos
     * @returns {Function} Función para detener el listener
     */
    obtenerClasificaciones(fase = 'todas', callback = null) {
        try {
            let q;

            if (fase === 'todas') {
                q = query(
                    collection(this.db, 'clasificacion'),
                    orderBy('fase'),
                    orderBy('posicion')
                );
            } else {
                q = query(
                    collection(this.db, 'clasificacion'),
                    where('fase', '==', fase),
                    orderBy('posicion')
                );
            }

            // Listener en tiempo real
            this.listener = onSnapshot(q, (snapshot) => {
                this.clasificaciones = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                console.log(`✅ ${this.clasificaciones.length} equipos cargados en clasificación (${fase})`);

                if (callback) {
                    callback(this.clasificaciones);
                }
            });

            return this.listener;
        } catch (error) {
            console.error('❌ Error obteniendo clasificaciones:', error);
            return null;
        }
    }

    /**
     * Obtener clasificaciones una sola vez (sin listener)
     * @param {string} fase - "primera", "segunda" o "todas"
     * @returns {Promise<Array>}
     */
    async obtenerClasificacionesUnaVez(fase = 'todas') {
        try {
            let q;

            if (fase === 'todas') {
                q = query(
                    collection(this.db, 'clasificacion'),
                    orderBy('fase'),
                    orderBy('posicion')
                );
            } else {
                q = query(
                    collection(this.db, 'clasificacion'),
                    where('fase', '==', fase),
                    orderBy('posicion')
                );
            }

            const snapshot = await getDocs(q);
            const clasificaciones = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`📊 ${clasificaciones.length} equipos obtenidos (${fase})`);
            return clasificaciones;
        } catch (error) {
            console.error('❌ Error obteniendo clasificaciones:', error);
            return [];
        }
    }

    /**
     * Añadir equipo a la clasificación
     * @param {Object} data - Datos del equipo
     * @returns {Promise<string>} ID del documento creado
     */
    async añadirEquipoClasificacion(data) {
        try {
            console.log('➕ Añadiendo equipo a clasificación:', data);

            const docRef = await addDoc(collection(this.db, 'clasificacion'), {
                equipo: data.equipo.trim(),
                fase: data.fase,
                posicion: parseInt(data.posicion),
                j: parseInt(data.j),
                v: parseInt(data.v),
                p: parseInt(data.p),
                np: parseInt(data.np || 0),
                pf: parseInt(data.pf),
                pc: parseInt(data.pc),
                pts: parseInt(data.pts),
                timestamp: new Date().toISOString()
            });

            console.log('✅ Equipo añadido a clasificación:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error añadiendo equipo a clasificación:', error);
            throw error;
        }
    }

    /**
     * Actualizar equipo en la clasificación
     * @param {string} id - ID del documento
     * @param {Object} data - Datos actualizados
     */
    async actualizarEquipoClasificacion(id, data) {
        try {
            console.log('✏️ Actualizando equipo en clasificación:', id);

            const docRef = doc(this.db, 'clasificacion', id);
            await updateDoc(docRef, {
                equipo: data.equipo.trim(),
                posicion: parseInt(data.posicion),
                j: parseInt(data.j),
                v: parseInt(data.v),
                p: parseInt(data.p),
                np: parseInt(data.np || 0),
                pf: parseInt(data.pf),
                pc: parseInt(data.pc),
                pts: parseInt(data.pts),
                updatedAt: new Date().toISOString()
            });

            console.log('✅ Equipo actualizado en clasificación:', id);
        } catch (error) {
            console.error('❌ Error actualizando equipo en clasificación:', error);
            throw error;
        }
    }

    /**
     * Eliminar equipo de la clasificación
     * @param {string} id - ID del documento
     */
    async eliminarEquipoClasificacion(id) {
        try {
            console.log('🗑️ Eliminando equipo de clasificación:', id);

            await deleteDoc(doc(this.db, 'clasificacion', id));

            console.log('✅ Equipo eliminado de clasificación:', id);
        } catch (error) {
            console.error('❌ Error eliminando equipo de clasificación:', error);
            throw error;
        }
    }

    /**
     * Detener el listener activo
     */
    detenerListener() {
        if (this.listener) {
            this.listener();
            this.listener = null;
            console.log('🔇 Listener de clasificación detenido');
        }
    }
}

export default ClasificacionManager;
