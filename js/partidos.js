/**
 * Módulo de Gestión de Partidos
 *
 * Responsabilidades:
 * - CRUD de partidos (crear, leer, actualizar, eliminar)
 * - Listeners de Firestore en tiempo real
 * - Gestión de marcadores en directo
 * - Actualización de cuartos
 */

import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { UBICACIONES, EQUIPOS_RIVALES } from './config.js';

export class PartidosManager {
    /**
     * @param {Firestore} db - Instancia de Firestore
     * @param {Function} onUpdate - Callback cuando hay cambios
     */
    constructor(db, onUpdate) {
        this.db = db;
        this.onUpdate = onUpdate; // Callback para notificar cambios
        this.partidos = [];
        this.unsubscribe = null;
    }

    /**
     * Inicia el listener en tiempo real de partidos
     */
    iniciarListener() {
        if (this.unsubscribe) {
            return;
        }

        const q = query(collection(this.db, 'partidos'), orderBy('fecha', 'asc'));

        this.unsubscribe = onSnapshot(q, (querySnapshot) => {
            this.partidos = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Notificar cambios
            if (this.onUpdate) {
                this.onUpdate(this.partidos);
            }
        });
    }

    /**
     * Detiene el listener en tiempo real
     */
    detenerListener() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    /**
     * Obtiene todos los partidos
     * @returns {Array} Lista de partidos
     */
    getPartidos() {
        return this.partidos;
    }

    /**
     * Obtiene un partido por ID
     * @param {string} id - ID del partido
     * @returns {Object|null} Partido encontrado o null
     */
    getPartidoById(id) {
        return this.partidos.find(p => p.id === id) || null;
    }

    /**
     * Obtiene partidos filtrados por estado
     * @param {string} estado - 'pendientes', 'finalizados', 'enDirecto'
     * @returns {Array} Partidos filtrados
     */
    getPartidosPorEstado(estado) {
        const hoy = new Date().toISOString().split('T')[0];

        switch (estado) {
            case 'pendientes':
                return this.partidos.filter(p => !p.finalizado && p.fecha >= hoy);
            case 'finalizados':
                return this.partidos.filter(p => p.finalizado);
            case 'enDirecto':
                return this.partidos.filter(p => p.enDirecto && !p.finalizado);
            default:
                return this.partidos;
        }
    }

    /**
     * Valida los datos de un partido
     * @param {Object} data - Datos del partido
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validarPartido(data) {
        const errors = [];

        if (!data.fecha) errors.push('La fecha es obligatoria');
        if (!data.hora) errors.push('La hora es obligatoria');
        if (!data.rival) errors.push('El rival es obligatorio');
        if (!data.ubicacion) errors.push('La ubicación es obligatoria');
        if (!data.jornada) errors.push('La jornada es obligatoria');

        // Validar formato de fecha
        if (data.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(data.fecha)) {
            errors.push('Formato de fecha inválido (debe ser YYYY-MM-DD)');
        }

        // Validar formato de hora
        if (data.hora && !/^\d{2}:\d{2}$/.test(data.hora)) {
            errors.push('Formato de hora inválido (debe ser HH:MM)');
        }

        // Validar jornada
        if (data.jornada && isNaN(parseInt(data.jornada))) {
            errors.push('La jornada debe ser un número');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Obtiene el logo del equipo rival desde la configuración
     * @param {string} nombreRival - Nombre del equipo rival
     * @returns {string} Nombre del archivo del logo
     */
    obtenerLogoRival(nombreRival) {
        const equipo = EQUIPOS_RIVALES.find(e => e.nombre === nombreRival);
        return equipo ? equipo.logo : '';
    }

    /**
     * Añade un nuevo partido
     * @param {Object} data - Datos del partido
     * @returns {Promise<string>} ID del partido creado
     */
    async añadirPartido(data) {
        const validation = this.validarPartido(data);

        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        // Obtener el logo automáticamente desde la configuración
        const logoRival = this.obtenerLogoRival(data.rival);

        const partidoData = {
            fecha: data.fecha,
            hora: data.hora,
            rival: data.rival,
            logoRival: logoRival,
            esLocal: data.esLocal !== undefined ? data.esLocal : true,
            ubicacion: data.ubicacion,
            jornada: data.jornada,
            finalizado: data.finalizado || false,
            resultadoLocal: data.resultadoLocal || '',
            resultadoVisitante: data.resultadoVisitante || '',
            enDirecto: data.enDirecto || false,
            cuartoActual: data.cuartoActual || '',
            fase: data.fase || 'primera',
            sinActa: data.sinActa || false,
            actaCerrada: data.actaCerrada || false
        };

        try {
            const docRef = await addDoc(collection(this.db, 'partidos'), partidoData);
            return docRef.id;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualiza un partido existente
     * @param {string} id - ID del partido
     * @param {Object} data - Datos a actualizar
     */
    async actualizarPartido(id, data) {
        const validation = this.validarPartido(data);

        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        // Obtener el logo automáticamente desde la configuración
        const logoRival = this.obtenerLogoRival(data.rival);

        const partidoData = {
            fecha: data.fecha,
            hora: data.hora,
            rival: data.rival,
            logoRival: logoRival,
            esLocal: data.esLocal !== undefined ? data.esLocal : true,
            ubicacion: data.ubicacion,
            jornada: data.jornada,
            finalizado: data.finalizado || false,
            resultadoLocal: data.resultadoLocal || '',
            resultadoVisitante: data.resultadoVisitante || '',
            enDirecto: data.enDirecto || false,
            cuartoActual: data.cuartoActual || '',
            fase: data.fase || 'primera',
            sinActa: data.sinActa || false,
            actaCerrada: data.actaCerrada || false
        };

        try {
            await updateDoc(doc(this.db, 'partidos', id), partidoData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Elimina un partido
     * @param {string} id - ID del partido a eliminar
     */
    async eliminarPartido(id) {
        try {
            await deleteDoc(doc(this.db, 'partidos', id));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualiza el marcador de un partido en directo
     * @param {string} id - ID del partido
     * @param {string} campo - 'resultadoLocal' o 'resultadoVisitante'
     * @param {number} incremento - Cantidad a incrementar/decrementar
     */
    async actualizarMarcador(id, campo, incremento) {
        const partido = this.getPartidoById(id);

        if (!partido) {
            throw new Error('Partido no encontrado');
        }

        const nuevoValor = parseInt(partido[campo] || 0) + incremento;

        if (nuevoValor < 0) {
            return;
        }

        try {
            await updateDoc(doc(this.db, 'partidos', id), {
                [campo]: nuevoValor.toString(),
                enDirecto: true
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualiza el cuarto actual del partido
     * @param {string} id - ID del partido
     * @param {string} cuarto - 'Q1', 'Q2', 'Q3', 'Q4', 'OT'
     */
    async actualizarCuarto(id, cuarto) {
        try {
            await updateDoc(doc(this.db, 'partidos', id), {
                cuartoActual: cuarto
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Finaliza un partido
     * @param {string} id - ID del partido
     */
    async finalizarPartido(id) {
        try {
            await updateDoc(doc(this.db, 'partidos', id), {
                finalizado: true,
                enDirecto: false,
                cuartoActual: ''
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Inicia el modo directo de un partido
     * @param {string} id - ID del partido
     */
    async iniciarDirecto(id) {
        try {
            await updateDoc(doc(this.db, 'partidos', id), {
                enDirecto: true,
                cuartoActual: 'Q1'
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtiene estadísticas generales de partidos
     * @returns {Object} Estadísticas
     */
    getEstadisticas() {
        const finalizados = this.getPartidosPorEstado('finalizados');
        const pendientes = this.getPartidosPorEstado('pendientes');
        const enDirecto = this.getPartidosPorEstado('enDirecto');

        let victorias = 0;
        let derrotas = 0;
        let empates = 0;

        finalizados.forEach(p => {
            const local = parseInt(p.resultadoLocal || 0);
            const visitante = parseInt(p.resultadoVisitante || 0);

            if (p.esLocal) {
                if (local > visitante) victorias++;
                else if (local < visitante) derrotas++;
                else empates++;
            } else {
                if (visitante > local) victorias++;
                else if (visitante < local) derrotas++;
                else empates++;
            }
        });

        return {
            total: this.partidos.length,
            finalizados: finalizados.length,
            pendientes: pendientes.length,
            enDirecto: enDirecto.length,
            victorias,
            derrotas,
            empates
        };
    }
}
