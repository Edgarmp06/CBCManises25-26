/**
 * Archivo Principal de la Aplicación
 *
 * Este archivo coordina todos los módulos y gestiona el estado global
 * de la aplicación del CBC Manises.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { firebaseConfig } from './config.js';
import { PartidosManager } from './partidos.js';
import { ActasManager } from './actas.js';
import { EstadisticasManager } from './estadisticas.js';
import { AdminManager } from './admin.js';
import { AnotacionesManager } from './anotaciones.js';
import uiManager from './ui.js';

/**
 * Clase principal de la aplicación
 */
class CBCManisesApp {
    constructor() {
        // Inicializar Firebase
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);

        // Estado de la aplicación
        this.activeTab = 'calendario';
        this.viendoActa = null;

        // Inicializar managers
        this.partidosManager = new PartidosManager(
            this.db,
            (partidos) => this.onPartidosUpdate(partidos)
        );

        this.actasManager = new ActasManager(
            this.db,
            (actas) => this.onActasUpdate(actas)
        );

        this.estadisticasManager = new EstadisticasManager();

        this.anotacionesManager = new AnotacionesManager(this.db);

        this.adminManager = new AdminManager(
            this.app,
            (isAdmin) => this.onAuthChange(isAdmin)
        );

        // Inicializar UI Manager
        uiManager.inicializar(this);

        console.log('🏀 CBC Manises - Aplicación inicializada');
    }

    /**
     * Inicia la aplicación
     */
    async iniciar() {
        console.log('🚀 Iniciando aplicación...');

        // Iniciar listeners
        this.partidosManager.iniciarListener();
        this.actasManager.iniciarListener();
        this.adminManager.iniciarListenerAuth();

        // Iniciar rotación de fotos de fondo
        this.iniciarRotacionFotos();

        console.log('✅ Aplicación iniciada correctamente');
    }

    /**
     * Callback cuando se actualizan los partidos
     * @param {Array} partidos - Lista actualizada de partidos
     */
    onPartidosUpdate(partidos) {
        console.log(`🔄 Partidos actualizados: ${partidos.length}`);
        this.renderizar();
    }

    /**
     * Callback cuando se actualizan las actas
     * @param {Array} actas - Lista actualizada de actas
     */
    onActasUpdate(actas) {
        console.log(`🔄 Actas actualizadas: ${actas.length}`);
        // Procesar datos de jugadores para estadísticas
        this.estadisticasManager.procesarDatosJugadores(actas);
        this.renderizar();
    }

    /**
     * Callback cuando cambia el estado de autenticación
     * @param {boolean} isAdmin - Si el usuario es admin
     */
    onAuthChange(isAdmin) {
        console.log(`🔄 Estado de autenticación: ${isAdmin ? 'Admin' : 'Usuario'}`);
        this.renderizar();
    }

    /**
     * Cambia la pestaña activa
     * @param {string} tab - Nombre de la pestaña ('calendario', 'resultados', 'estadisticas')
     */
    cambiarTab(tab) {
        this.activeTab = tab;
        console.log(`📑 Pestaña activa: ${tab}`);

        // Si es la pestaña de estadísticas, crear gráficas
        if (tab === 'estadisticas') {
            const actas = this.actasManager.getActas();
            if (actas.length > 0) {
                setTimeout(() => {
                    this.estadisticasManager.crearGraficasEquipo(actas);
                    const jugadorSeleccionado = this.estadisticasManager.getJugadorSeleccionado();
                    if (jugadorSeleccionado) {
                        this.estadisticasManager.crearGraficasJugador(jugadorSeleccionado);
                    }
                }, 200);
            }
        }

        this.renderizar();
    }

    /**
     * Cambia el jugador seleccionado en estadísticas
     * @param {string} nombre - Nombre del jugador
     */
    cambiarJugador(nombre) {
        this.estadisticasManager.seleccionarJugador(nombre);

        if (nombre) {
            setTimeout(() => {
                const actas = this.actasManager.getActas();
                this.estadisticasManager.crearGraficasEquipo(actas);
                this.estadisticasManager.crearGraficasJugador(nombre);
            }, 200);
        }

        this.renderizar();
    }

    /**
     * Renderiza la interfaz de usuario
     */
    renderizar() {
        uiManager.renderizar();
    }

    /**
     * Muestra el acta de un partido
     * @param {string} partidoId - ID del partido
     */
    verActa(partidoId) {
        const acta = this.actasManager.getActas().find(a => a.partidoId === partidoId);
        if (!acta) {
            alert('No hay acta para este partido');
            return;
        }
        this.viendoActa = acta;
        this.renderizar();
    }

    /**
     * Cierra la vista del acta
     */
    cerrarActa() {
        this.viendoActa = null;
        this.renderizar();
    }

    /**
     * Inicia la rotación automática de fotos de fondo
     */
    iniciarRotacionFotos() {
        let fotoActual = 0;
        const totalFotos = 4;

        setInterval(() => {
            document.querySelectorAll('.fondo-foto').forEach(foto => {
                foto.classList.remove('activa');
            });

            fotoActual = (fotoActual + 1) % totalFotos;

            const fotos = document.querySelectorAll('.fondo-foto');
            if (fotos[fotoActual]) {
                fotos[fotoActual].classList.add('activa');
            }
        }, 6000);

        console.log('🖼️ Rotación de fotos iniciada');
    }

    /**
     * Obtiene el estado actual de la aplicación
     * @returns {Object} Estado de la aplicación
     */
    getEstado() {
        return {
            activeTab: this.activeTab,
            partidos: this.partidosManager.getPartidos(),
            actas: this.actasManager.getActas(),
            datosJugadores: this.estadisticasManager.getDatosJugadores(),
            jugadorSeleccionado: this.estadisticasManager.getJugadorSeleccionado(),
            isAdmin: this.adminManager.esAdmin(),
            showAdminPanel: this.adminManager.panelVisible(),
            viendoActa: this.viendoActa
        };
    }
}

// Crear instancia global de la aplicación
const app = new CBCManisesApp();

// Exponer la app globalmente para acceso desde HTML/eventos
window.cbcApp = app;

// Funciones globales para compatibilidad con el HTML actual
// Estas serán llamadas desde los event handlers del HTML

// === FUNCIONES DE NAVEGACIÓN ===
window.cambiarTab = (tab) => app.cambiarTab(tab);
window.cambiarJugadorGlobal = (nombre) => app.cambiarJugador(nombre);

// === FUNCIONES DE ADMIN ===
window.handleAdminLoginGlobal = () => app.adminManager.loginConPrompt();
window.logout = () => app.adminManager.logout();
window.toggleAdminPanel = () => {
    app.adminManager.toggleAdminPanel();
    app.renderizar();
};

// === FUNCIONES DE PARTIDOS ===
window.añadirPartidoGlobal = async (data) => {
    try {
        await app.partidosManager.añadirPartido(data);
        alert('✅ Partido añadido correctamente');
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
};

window.actualizarPartidoGlobal = async (id, data) => {
    try {
        await app.partidosManager.actualizarPartido(id, data);
        alert('✅ Partido actualizado correctamente');
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
};

window.eliminarPartidoGlobal = async (id) => {
    if (confirm('¿Estás seguro de eliminar este partido?')) {
        try {
            await app.partidosManager.eliminarPartido(id);
            alert('✅ Partido eliminado');
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    }
};

window.actualizarMarcadorGlobal = async (id, campo, incremento) => {
    try {
        const partido = app.partidosManager.getPartidoById(id);

        // Si es positivo y es el equipo local (CBC Manises), preguntar quién anotó
        if (incremento > 0 && campo === 'resultadoLocal' && partido.esLocal) {
            // Mostrar modal de selector de jugador
            window.mostrarSelectorJugadorGlobal(id, incremento, partido);
        } else {
            // Solo actualizar el marcador
            await app.partidosManager.actualizarMarcador(id, campo, incremento);
        }
    } catch (error) {
        console.error('Error al actualizar marcador:', error);
    }
};

window.actualizarCuartoGlobal = async (id, cuarto) => {
    try {
        await app.partidosManager.actualizarCuarto(id, cuarto);
    } catch (error) {
        console.error('Error al actualizar cuarto:', error);
    }
};

// === FUNCIONES DE ACTAS ===
window.guardarActaGlobal = async (data) => {
    const partido = app.partidosManager.getPartidoById(data.partidoId);

    try {
        await app.actasManager.crearActa(data, partido);
        alert('✅ Acta guardada correctamente');
        // Volver al modo normal
        // app.modoAdmin = 'partidos';
        // app.creandoActa = false;
        // app.renderizar();
    } catch (error) {
        alert(`❌ ${error.message}`);
    }
};

// === FUNCIONES DE ACTAS (VISTAS) ===
window.verActaGlobal = (partidoId) => app.verActa(partidoId);
window.cerrarActaGlobal = () => app.cerrarActa();

// === FUNCIONES DE GESTIÓN DE ACTAS (PANEL ADMIN) ===
window.eliminarJugadorActaGlobal = (index) => {
    uiManager.eliminarJugadorActa(index);
};

window.actualizarDorsalJugadorGlobal = (index, dorsal) => {
    uiManager.actualizarDorsalJugador(index, dorsal);
};

window.actualizarEstadisticaJugadorGlobal = (index, campo, valor) => {
    uiManager.actualizarEstadisticaJugador(index, campo, valor);
};

// === FUNCIONES DE EDICIÓN DE PARTIDOS ===
window.editarPartidoGlobal = (id) => {
    const partido = app.partidosManager.getPartidoById(id);
    if (!partido) {
        alert('❌ Partido no encontrado');
        return;
    }

    // Mostrar modal de edición
    uiManager.mostrarModalEditarPartido(partido);
};

window.eliminarPartidoGlobal = async (id) => {
    if (confirm('¿Estás seguro de eliminar este partido?')) {
        try {
            await app.partidosManager.eliminarPartido(id);
            alert('✅ Partido eliminado correctamente');
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        }
    }
};

// === FUNCIONES DE ANOTACIONES ===
window.mostrarSelectorJugadorGlobal = (partidoId, puntos, partido) => {
    uiManager.mostrarSelectorJugador(partidoId, puntos, partido);
};

window.registrarAnotacionGlobal = async (partidoId, jugador, puntos, partido) => {
    try {
        // Registrar anotación
        const anotacionesActuales = app.anotacionesManager.getAnotaciones(partido);
        await app.anotacionesManager.añadirAnotacion(partidoId, {
            jugador,
            puntos,
            cuarto: partido.cuartoActual || ''
        }, anotacionesActuales);

        // Actualizar marcador
        await app.partidosManager.actualizarMarcador(partidoId, 'resultadoLocal', puntos);

        console.log(`✅ Anotación registrada: +${puntos} de ${jugador}`);
    } catch (error) {
        console.error('❌ Error al registrar anotación:', error);
        alert('Error al registrar la anotación');
    }
};

window.saltarAnotacionGlobal = async (partidoId, puntos) => {
    try {
        // Solo actualizar marcador sin registrar jugador
        await app.partidosManager.actualizarMarcador(partidoId, 'resultadoLocal', puntos);
    } catch (error) {
        console.error('❌ Error al actualizar marcador:', error);
    }
};

window.verAnotacionesGlobal = (partidoId) => {
    const partido = app.partidosManager.getPartidoById(partidoId);
    if (partido) {
        uiManager.mostrarModalAnotaciones(partido);
    }
};

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    app.iniciar();
});

// Exportar la app para uso en otros módulos si es necesario
export default app;
