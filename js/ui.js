/**
 * UI Manager - Gestión de la Interfaz de Usuario
 *
 * Este módulo maneja toda la lógica de renderizado y manipulación del DOM.
 * Separa completamente la presentación de la lógica de negocio.
 */

import { formatearFecha, formatearFechaCorta, mostrarNotificacion, compartirResultado } from './utils.js';
import { INFO_EQUIPO, URLS, JUGADORES_EQUIPO, CLASIFICACION_PRIMERA_FASE, CLASIFICACION_SEGUNDA_FASE } from './constants.js';
import { UBICACIONES, EQUIPOS_RIVALES } from './config.js';

/**
 * Clase principal para gestionar la interfaz de usuario
 */
export class UIManager {
    constructor() {
        this.app = null; // Referencia a la app principal
        this.jugadoresActaTemporal = []; // Array temporal para jugadores del acta
        this.partidoSeleccionadoActa = null; // ID del partido seleccionado para acta
    }

    /**
     * Inicializa el UI Manager con referencia a la app principal
     * @param {Object} app - Instancia de CBCManisesApp
     */
    inicializar(app) {
        this.app = app;
    }

    /**
     * Renderiza toda la aplicación
     */
    renderizar() {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        const estado = this.app.getEstado();

        // Si estamos viendo un acta, mostrar solo eso
        if (estado.viendoActa) {
            appContainer.innerHTML = this.generarVistaActa(estado.viendoActa);
            return;
        }

        // Renderizado principal
        appContainer.innerHTML = this.generarLayoutPrincipal(estado);

        // Si se está mostrando el panel de admin, configurar event listeners
        if (estado.showAdminPanel) {
            this.configurarEventListenersAdmin();
        }

        // Si es admin, configurar el modal de edición (siempre que esté disponible)
        if (estado.isAdmin) {
            this.configurarModalEditarPartido();
        }
    }

    /**
     * Configura los event listeners del panel de administración
     */
    configurarEventListenersAdmin() {
        // Reiniciar datos temporales
        this.jugadoresActaTemporal = [];
        this.partidoSeleccionadoActa = null;

        // === MODAL EDITAR PARTIDO ===
        this.configurarModalEditarPartido();

        // === FORMULARIO AÑADIR PARTIDO ===
        const formPartido = document.getElementById('form-añadir-partido');
        if (formPartido) {
            formPartido.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Verificar si usa ubicación personalizada
                const ubicacionCustomCheckbox = document.getElementById('ubicacion-custom-checkbox');
                let ubicacionSeleccionada;
                let esLocal;

                if (ubicacionCustomCheckbox && ubicacionCustomCheckbox.checked) {
                    // Usar ubicación personalizada
                    ubicacionSeleccionada = document.getElementById('ubicacion-custom').value.trim();

                    // Validación
                    if (!ubicacionSeleccionada) {
                        mostrarNotificacion('Por favor, escribe una ubicación personalizada', 'warning');
                        return;
                    }

                    // Obtener el valor del radio button seleccionado
                    const radioTipo = document.querySelector('input[name="ubicacion-custom-tipo"]:checked');
                    esLocal = radioTipo ? radioTipo.value === 'true' : false;
                } else {
                    // Usar ubicación del select
                    ubicacionSeleccionada = document.getElementById('ubicacion').value;

                    // Validación
                    if (!ubicacionSeleccionada) {
                        mostrarNotificacion('Por favor, selecciona una ubicación', 'warning');
                        return;
                    }

                    const ubicacionConfig = UBICACIONES.find(u => u.nombre === ubicacionSeleccionada);
                    esLocal = ubicacionConfig ? ubicacionConfig.esLocal : false;
                }

                const data = {
                    fecha: document.getElementById('fecha').value,
                    hora: document.getElementById('hora').value,
                    rival: document.getElementById('rival').value,
                    esLocal: esLocal,
                    ubicacion: ubicacionSeleccionada,
                    jornada: document.getElementById('jornada').value,
                    fase: document.getElementById('fase').value || 'primera',
                    finalizado: false,
                    enDirecto: false,
                    resultadoLocal: '',
                    resultadoVisitante: '',
                    cuartoActual: ''
                };

                try {
                    await window.añadirPartidoGlobal(data);
                    e.target.reset();
                    // Reset del checkbox y container custom
                    if (ubicacionCustomCheckbox) ubicacionCustomCheckbox.checked = false;
                    window.toggleUbicacionCustom();
                } catch (error) {
                    mostrarNotificacion(`Error: ${error.message}`, 'error');
                }
            });
        }

        // === SELECTOR DE PARTIDO PARA ACTA ===
        const selectorPartido = document.getElementById('partido-acta-selector');
        const formularioActaContainer = document.getElementById('formulario-acta-container');
        const infoPartidoSeleccionado = document.getElementById('info-partido-seleccionado');

        if (selectorPartido) {
            selectorPartido.addEventListener('change', (e) => {
                this.partidoSeleccionadoActa = e.target.value;

                if (this.partidoSeleccionadoActa) {
                    const partido = window.cbcApp.partidosManager.getPartidoById(this.partidoSeleccionadoActa);
                    if (partido) {
                        // Mostrar formulario
                        formularioActaContainer.style.display = 'block';

                        // Mostrar info del partido
                        infoPartidoSeleccionado.innerHTML = `
                            <p class="font-semibold text-blue-800">
                                Jornada ${partido.jornada} - ${partido.fecha} ${partido.hora}
                            </p>
                            <p class="text-sm text-blue-700">
                                ${partido.esLocal ? 'CBC Manises-Quart' : partido.rival}
                                ${partido.resultadoLocal} - ${partido.resultadoVisitante}
                                ${partido.esLocal ? partido.rival : 'CBC Manises-Quart'}
                            </p>
                            <p class="text-xs text-blue-600 mt-1">📍 ${partido.ubicacion}</p>
                        `;

                        // Mostrar resumen de anotaciones si existen
                        this.mostrarResumenAnotacionesEnActa(partido);

                        // Cargar automáticamente los jugadores del equipo
                        this.jugadoresActaTemporal = JUGADORES_EQUIPO.map(j => ({
                            dorsal: j.dorsal,
                            nombre: j.nombre,
                            pts: '0',
                            min: '0',
                            fc: '0',
                            tl_anotados: '0',
                            tl_intentos: '0',
                            t2_anotados: '0',
                            t2_intentos: '0',
                            t3_anotados: '0',
                            t3_intentos: '0'
                        }));

                        this.actualizarListaJugadores();
                    }
                } else {
                    formularioActaContainer.style.display = 'none';
                    this.jugadoresActaTemporal = [];
                }
            });
        }

        // === BOTÓN AÑADIR JUGADOR ===
        const btnAñadirJugador = document.getElementById('btn-añadir-jugador');
        if (btnAñadirJugador) {
            btnAñadirJugador.addEventListener('click', () => {
                const jugador = {
                    dorsal: document.getElementById('jugador-dorsal').value,
                    nombre: document.getElementById('jugador-nombre').value,
                    pts: document.getElementById('jugador-pts').value,
                    min: document.getElementById('jugador-min').value,
                    fc: document.getElementById('jugador-fc').value,
                    tl_anotados: document.getElementById('jugador-tl-an').value,
                    tl_intentos: document.getElementById('jugador-tl-int').value,
                    t2_anotados: document.getElementById('jugador-t2-an').value,
                    t2_intentos: document.getElementById('jugador-t2-int').value,
                    t3_anotados: document.getElementById('jugador-t3-an').value,
                    t3_intentos: document.getElementById('jugador-t3-int').value
                };

                // Validar campos básicos
                if (!jugador.dorsal || !jugador.nombre) {
                    mostrarNotificacion('Dorsal y nombre son obligatorios', 'warning');
                    return;
                }

                // Añadir a la lista
                this.jugadoresActaTemporal.push(jugador);

                // Actualizar vista
                this.actualizarListaJugadores();

                // Limpiar formulario
                document.getElementById('jugador-dorsal').value = '';
                document.getElementById('jugador-nombre').value = '';
                document.getElementById('jugador-pts').value = '0';
                document.getElementById('jugador-min').value = '0';
                document.getElementById('jugador-fc').value = '0';
                document.getElementById('jugador-tl-an').value = '0';
                document.getElementById('jugador-tl-int').value = '0';
                document.getElementById('jugador-t2-an').value = '0';
                document.getElementById('jugador-t2-int').value = '0';
                document.getElementById('jugador-t3-an').value = '0';
                document.getElementById('jugador-t3-int').value = '0';

                // Focus en dorsal para el siguiente jugador
                document.getElementById('jugador-dorsal').focus();
            });
        }

        // === BOTÓN GUARDAR ACTA ===
        const btnGuardarActa = document.getElementById('btn-guardar-acta');
        if (btnGuardarActa) {
            btnGuardarActa.addEventListener('click', async () => {
                if (!this.partidoSeleccionadoActa) {
                    mostrarNotificacion('Selecciona un partido', 'warning');
                    return;
                }

                if (this.jugadoresActaTemporal.length === 0) {
                    mostrarNotificacion('Añade al menos un jugador al acta', 'warning');
                    return;
                }

                if (!confirm(`¿Guardar acta con ${this.jugadoresActaTemporal.length} jugadores?`)) {
                    return;
                }

                const data = {
                    partidoId: this.partidoSeleccionadoActa,
                    jugadores: this.jugadoresActaTemporal
                };

                try {
                    await window.guardarActaGlobal(data);

                    // Limpiar formulario
                    this.jugadoresActaTemporal = [];
                    this.partidoSeleccionadoActa = null;
                    selectorPartido.value = '';
                    formularioActaContainer.style.display = 'none';

                } catch (error) {
                    mostrarNotificacion(`Error: ${error.message}`, 'error');
                }
            });
        }

        // === BOTÓN CANCELAR ACTA ===
        const btnCancelarActa = document.getElementById('btn-cancelar-acta');
        if (btnCancelarActa) {
            btnCancelarActa.addEventListener('click', () => {
                if (this.jugadoresActaTemporal.length > 0) {
                    if (!confirm('¿Cancelar? Se perderán los jugadores añadidos.')) {
                        return;
                    }
                }

                this.jugadoresActaTemporal = [];
                this.partidoSeleccionadoActa = null;
                selectorPartido.value = '';
                formularioActaContainer.style.display = 'none';
            });
        }
    }

    /**
     * Actualiza la lista visual de jugadores añadidos al acta
     */
    actualizarListaJugadores() {
        const listaContainer = document.getElementById('lista-jugadores-acta');
        if (!listaContainer) return;

        if (this.jugadoresActaTemporal.length === 0) {
            listaContainer.innerHTML = '<p class="text-sm text-gray-500 italic">No hay jugadores añadidos aún</p>';
            return;
        }

        listaContainer.innerHTML = this.jugadoresActaTemporal.map((j, index) => `
            <div class="bg-white border border-gray-300 rounded p-3">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex gap-2 items-center flex-1">
                        <label class="text-xs text-gray-600 font-medium">Dorsal:</label>
                        <input
                            type="text"
                            value="${j.dorsal}"
                            onchange="window.actualizarDorsalJugadorGlobal(${index}, this.value)"
                            class="w-16 border rounded px-2 py-1 text-sm font-bold"
                            placeholder="0"
                        />
                        <span class="font-semibold text-gray-800">${j.nombre}</span>
                    </div>
                    <button
                        onclick="window.eliminarJugadorActaGlobal(${index})"
                        class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                        🗑️
                    </button>
                </div>
                <div class="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                    <div>
                        <label class="text-gray-500">PTS</label>
                        <input
                            type="number"
                            value="${j.pts}"
                            onchange="window.actualizarEstadisticaJugadorGlobal(${index}, 'pts', this.value)"
                            class="w-full border rounded px-1 py-0.5 text-sm"
                            min="0"
                        />
                    </div>
                    <div>
                        <label class="text-gray-500">MIN</label>
                        <input
                            type="number"
                            value="${j.min}"
                            onchange="window.actualizarEstadisticaJugadorGlobal(${index}, 'min', this.value)"
                            class="w-full border rounded px-1 py-0.5 text-sm"
                            min="0"
                        />
                    </div>
                    <div>
                        <label class="text-gray-500">FC</label>
                        <input
                            type="number"
                            value="${j.fc}"
                            onchange="window.actualizarEstadisticaJugadorGlobal(${index}, 'fc', this.value)"
                            class="w-full border rounded px-1 py-0.5 text-sm"
                            min="0"
                        />
                    </div>
                    <div>
                        <label class="text-gray-500">TL</label>
                        <div class="flex gap-1">
                            <input
                                type="number"
                                value="${j.tl_anotados}"
                                onchange="window.actualizarEstadisticaJugadorGlobal(${index}, 'tl_anotados', this.value)"
                                class="w-1/2 border rounded px-1 py-0.5 text-xs"
                                min="0"
                                placeholder="An"
                            />
                            <input
                                type="number"
                                value="${j.tl_intentos}"
                                onchange="window.actualizarEstadisticaJugadorGlobal(${index}, 'tl_intentos', this.value)"
                                class="w-1/2 border rounded px-1 py-0.5 text-xs"
                                min="0"
                                placeholder="Int"
                            />
                        </div>
                    </div>
                    <div>
                        <label class="text-gray-500">T2</label>
                        <div class="flex gap-1">
                            <input
                                type="number"
                                value="${j.t2_anotados}"
                                onchange="window.actualizarEstadisticaJugadorGlobal(${index}, 't2_anotados', this.value)"
                                class="w-1/2 border rounded px-1 py-0.5 text-xs"
                                min="0"
                                placeholder="An"
                            />
                            <input
                                type="number"
                                value="${j.t2_intentos}"
                                onchange="window.actualizarEstadisticaJugadorGlobal(${index}, 't2_intentos', this.value)"
                                class="w-1/2 border rounded px-1 py-0.5 text-xs"
                                min="0"
                                placeholder="Int"
                            />
                        </div>
                    </div>
                    <div>
                        <label class="text-gray-500">T3</label>
                        <div class="flex gap-1">
                            <input
                                type="number"
                                value="${j.t3_anotados}"
                                onchange="window.actualizarEstadisticaJugadorGlobal(${index}, 't3_anotados', this.value)"
                                class="w-1/2 border rounded px-1 py-0.5 text-xs"
                                min="0"
                                placeholder="An"
                            />
                            <input
                                type="number"
                                value="${j.t3_intentos}"
                                onchange="window.actualizarEstadisticaJugadorGlobal(${index}, 't3_intentos', this.value)"
                                class="w-1/2 border rounded px-1 py-0.5 text-xs"
                                min="0"
                                placeholder="Int"
                            />
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Configura el modal de edición de partidos
     */
    configurarModalEditarPartido() {
        const modal = document.getElementById('modal-editar-partido');
        const btnCerrar = document.getElementById('btn-cerrar-modal-editar');
        const btnCancelar = document.getElementById('btn-cancelar-editar');
        const formEditar = document.getElementById('form-editar-partido');

        // Cerrar modal al hacer clic en X o Cancelar
        if (btnCerrar) {
            btnCerrar.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // Cerrar modal al hacer clic fuera de él
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Manejar envío del formulario
        if (formEditar) {
            formEditar.addEventListener('submit', async (e) => {
                e.preventDefault();

                const partidoId = document.getElementById('editar-partido-id').value;

                // Verificar si usa ubicación personalizada
                const ubicacionCustomCheckbox = document.getElementById('editar-ubicacion-custom-checkbox');
                let ubicacionSeleccionada;
                let esLocal;

                if (ubicacionCustomCheckbox && ubicacionCustomCheckbox.checked) {
                    // Usar ubicación personalizada
                    ubicacionSeleccionada = document.getElementById('editar-ubicacion-custom').value.trim();

                    // Validación
                    if (!ubicacionSeleccionada) {
                        mostrarNotificacion('Por favor, escribe una ubicación personalizada', 'warning');
                        return;
                    }

                    // Obtener el valor del radio button seleccionado
                    const radioTipo = document.querySelector('input[name="ubicacion-custom-tipo-editar"]:checked');
                    esLocal = radioTipo ? radioTipo.value === 'true' : false;
                } else {
                    // Usar ubicación del select
                    ubicacionSeleccionada = document.getElementById('editar-ubicacion').value;

                    // Validación
                    if (!ubicacionSeleccionada) {
                        mostrarNotificacion('Por favor, selecciona una ubicación', 'warning');
                        return;
                    }

                    const ubicacionConfig = UBICACIONES.find(u => u.nombre === ubicacionSeleccionada);
                    esLocal = ubicacionConfig ? ubicacionConfig.esLocal : false;
                }

                // Obtener y limpiar valores de resultado (pueden estar vacíos)
                const resultadoLocalValue = document.getElementById('editar-resultado-local').value.trim();
                const resultadoVisitanteValue = document.getElementById('editar-resultado-visitante').value.trim();

                const data = {
                    fecha: document.getElementById('editar-fecha').value,
                    hora: document.getElementById('editar-hora').value,
                    rival: document.getElementById('editar-rival').value,
                    esLocal: esLocal,
                    ubicacion: ubicacionSeleccionada,
                    jornada: document.getElementById('editar-jornada').value,
                    fase: document.getElementById('editar-fase').value || 'primera',
                    finalizado: document.getElementById('editar-finalizado').checked,
                    enDirecto: document.getElementById('editar-en-directo').checked,
                    resultadoLocal: resultadoLocalValue,
                    resultadoVisitante: resultadoVisitanteValue,
                    cuartoActual: document.getElementById('editar-cuarto').value,
                    sinActa: document.getElementById('editar-sin-acta')?.checked || false,
                    actaCerrada: document.getElementById('editar-acta-cerrada')?.checked || false
                };

                try {
                    await window.actualizarPartidoGlobal(partidoId, data);
                    modal.style.display = 'none';
                } catch (error) {
                    mostrarNotificacion(`Error: ${error.message}`, 'error');
                }
            });
        }
    }

    /**
     * Muestra el modal de edición con los datos del partido
     * @param {Object} partido - Datos del partido a editar
     */
    mostrarModalEditarPartido(partido) {
        const modal = document.getElementById('modal-editar-partido');
        if (!modal) {
            console.error('❌ Modal de edición no encontrado');
            return;
        }

        // Rellenar formulario con datos del partido
        document.getElementById('editar-partido-id').value = partido.id;
        document.getElementById('editar-fecha').value = partido.fecha;
        document.getElementById('editar-hora').value = partido.hora;
        document.getElementById('editar-rival').value = partido.rival;
        document.getElementById('editar-jornada').value = partido.jornada;
        document.getElementById('editar-fase').value = partido.fase || 'primera';
        document.getElementById('editar-finalizado').checked = partido.finalizado || false;
        document.getElementById('editar-en-directo').checked = partido.enDirecto || false;
        document.getElementById('editar-resultado-local').value = partido.resultadoLocal || '';
        document.getElementById('editar-resultado-visitante').value = partido.resultadoVisitante || '';
        document.getElementById('editar-cuarto').value = partido.cuartoActual || '';
        if (document.getElementById('editar-sin-acta')) {
            document.getElementById('editar-sin-acta').checked = partido.sinActa || false;
        }
        if (document.getElementById('editar-acta-cerrada')) {
            document.getElementById('editar-acta-cerrada').checked = partido.actaCerrada || false;
        }

        // Verificar si la ubicación es personalizada (no está en UBICACIONES)
        const ubicacionEnLista = UBICACIONES.find(u => u.nombre === partido.ubicacion);
        const checkboxCustom = document.getElementById('editar-ubicacion-custom-checkbox');
        const inputCustom = document.getElementById('editar-ubicacion-custom');

        if (!ubicacionEnLista && partido.ubicacion) {
            // Ubicación personalizada
            if (checkboxCustom) checkboxCustom.checked = true;
            if (inputCustom) inputCustom.value = partido.ubicacion;
            window.toggleUbicacionCustomEditar();

            // Seleccionar el radio button correcto según esLocal
            const radioLocal = document.querySelector('input[name="ubicacion-custom-tipo-editar"][value="true"]');
            const radioVisitante = document.querySelector('input[name="ubicacion-custom-tipo-editar"][value="false"]');

            if (partido.esLocal) {
                if (radioLocal) radioLocal.checked = true;
            } else {
                if (radioVisitante) radioVisitante.checked = true;
            }
        } else {
            // Ubicación normal
            if (checkboxCustom) checkboxCustom.checked = false;
            document.getElementById('editar-ubicacion').value = partido.ubicacion;
            if (inputCustom) inputCustom.value = '';
            // Asegurar que el container custom esté oculto
            const container = document.getElementById('editar-ubicacion-custom-container');
            if (container) container.style.display = 'none';
        }

        // Mostrar modal
        modal.style.display = 'flex';
        console.log('✅ Modal de edición abierto para partido:', partido.id);
    }

    /**
     * Actualiza el dorsal de un jugador
     * @param {number} index - Índice del jugador
     * @param {string} dorsal - Nuevo dorsal
     */
    actualizarDorsalJugador(index, dorsal) {
        if (index >= 0 && index < this.jugadoresActaTemporal.length) {
            this.jugadoresActaTemporal[index].dorsal = dorsal;
            console.log(`✏️ Dorsal actualizado: jugador ${index} → ${dorsal}`);
        }
    }

    /**
     * Actualiza una estadística de un jugador
     * @param {number} index - Índice del jugador
     * @param {string} campo - Campo a actualizar
     * @param {string} valor - Nuevo valor
     */
    actualizarEstadisticaJugador(index, campo, valor) {
        if (index >= 0 && index < this.jugadoresActaTemporal.length) {
            this.jugadoresActaTemporal[index][campo] = valor;
            console.log(`✏️ ${campo} actualizado: jugador ${index} → ${valor}`);
        }
    }

    /**
     * Elimina un jugador de la lista temporal del acta
     * @param {number} index - Índice del jugador a eliminar
     */
    eliminarJugadorActa(index) {
        if (index >= 0 && index < this.jugadoresActaTemporal.length) {
            this.jugadoresActaTemporal.splice(index, 1);
            this.actualizarListaJugadores();
            console.log('🗑️ Jugador eliminado. Quedan:', this.jugadoresActaTemporal.length);
        }
    }

    /**
     * Genera el layout principal de la aplicación
     * @param {Object} estado - Estado actual de la aplicación
     * @returns {string} HTML del layout principal
     */
    generarLayoutPrincipal(estado) {
        const { activeTab, isAdmin, showAdminPanel } = estado;

        // Chequear si mostramos o no el banner de notificaciones
        const notificacionesActivadas = localStorage.getItem('notificacionesActivadas') === 'true' || Notification.permission === 'granted';
        const bannerNotificacionesHTML = notificacionesActivadas ? '' : `
                <div id="banner-notificaciones" class="w-full bg-orange-100 border-b border-orange-200 p-2 text-center text-sm flex flex-col md:flex-row justify-center items-center gap-2 animate-fade-in shadow-sm z-10 relative">
                    <span class="text-orange-800 font-semibold text-xs md:text-sm">🔔 Recibe alertas de los partidos en directo</span>
                    <button onclick="window.solicitarNotificacionesGlobal()" class="bg-orange-600 text-white px-3 py-1.5 md:py-1 rounded hover:bg-orange-700 font-bold ml-0 md:ml-2 shadow text-xs transition active:scale-95">
                        Activar Notificaciones
                    </button>
                    <button onclick="localStorage.setItem('notificacionesActivadas', 'true'); document.getElementById('banner-notificaciones').style.display = 'none';" class="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-700 p-1 font-bold text-lg leading-none" title="Cerrar aviso temporalmente">
                        &times;
                    </button>
                </div>`;

        return `
            <div class="min-h-screen flex flex-col">
                ${this.generarHeader(isAdmin, showAdminPanel)}
                
                ${bannerNotificacionesHTML}

                <div class="flex-1 max-w-4xl mx-auto p-4 w-full">
                    ${showAdminPanel
                ? this.generarPanelAdmin(estado)
                : this.generarContenidoPrincipal(estado)
            }
                </div>

                ${this.generarFooter()}
            </div>
            ${isAdmin ? this.generarModalEditarPartido() : ''}
        `;
    }

    /**
     * Genera el modal de edición de partido
     * @returns {string} HTML del modal
     */
    generarModalEditarPartido() {
        return `
            <!-- Modal Editar Partido -->
            <div id="modal-editar-partido" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 1rem;">
                <div style="background: white; border-radius: 0.5rem; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(to right, #ea580c, #f97316); color: white; padding: 1.5rem; border-radius: 0.5rem 0.5rem 0 0; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="font-size: 1.5rem; font-weight: bold; margin: 0;">✏️ Editar Partido</h3>
                        <button id="btn-cerrar-modal-editar" style="background: white; color: #ea580c; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold;">✕</button>
                    </div>

                    <form id="form-editar-partido" style="padding: 1.5rem;">
                        <input type="hidden" id="editar-partido-id">

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Fecha</label>
                                <input type="date" id="editar-fecha" required style="width: 100%; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Hora</label>
                                <input type="time" id="editar-hora" required style="width: 100%; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem;">
                            </div>
                        </div>

                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Ubicación</label>
                            <select id="editar-ubicacion" style="width: 100%; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem;">
                                <option value="">Seleccionar pabellón...</option>
                                ${UBICACIONES.map(ubicacion =>
            `<option value="${ubicacion.nombre}">${ubicacion.esLocal ? '🏠' : '🚗'} ${ubicacion.nombre}${ubicacion.esLocal ? ' - LOCAL' : ''}</option>`
        ).join('')}
                            </select>
                            <div style="margin-top: 0.5rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #4b5563; cursor: pointer;">
                                    <input
                                        type="checkbox"
                                        id="editar-ubicacion-custom-checkbox"
                                        style="border-radius: 0.25rem; border: 1px solid #d1d5db;"
                                        onchange="window.toggleUbicacionCustomEditar()"
                                    />
                                    <span>📍 Usar ubicación personalizada</span>
                                </label>
                            </div>
                            <div id="editar-ubicacion-custom-container" style="margin-top: 0.5rem; display: none;">
                                <input
                                    type="text"
                                    id="editar-ubicacion-custom"
                                    placeholder="Ej: Pabellón Municipal de Paterna"
                                    style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-bottom: 0.75rem;"
                                />
                                <div style="display: flex; gap: 1rem;">
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input
                                            type="radio"
                                            name="ubicacion-custom-tipo-editar"
                                            value="true"
                                            style="cursor: pointer;"
                                        />
                                        <span style="font-size: 0.875rem;">🏠 Local (en casa)</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                        <input
                                            type="radio"
                                            name="ubicacion-custom-tipo-editar"
                                            value="false"
                                            checked
                                            style="cursor: pointer;"
                                        />
                                        <span style="font-size: 0.875rem;">✈️ Visitante (fuera)</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Rival</label>
                                <select id="editar-rival" required style="width: 100%; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem;">
                                    <option value="">Seleccionar equipo...</option>
                                    ${EQUIPOS_RIVALES.map(equipo =>
            `<option value="${equipo.nombre}">${equipo.nombre}</option>`
        ).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Jornada</label>
                                <input type="number" id="editar-jornada" required min="1" style="width: 100%; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem;">
                            </div>
                        </div>

                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Fase</label>
                            <select id="editar-fase" required style="width: 100%; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem;">
                                <option value="primera">🟡 Primera Fase</option>
                                <option value="segunda">🔵 Segunda Fase</option>
                            </select>
                        </div>

                        <div style="margin-bottom: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 0.375rem;">
                            <h4 style="font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem;">Estado del Partido</h4>
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="editar-finalizado" style="cursor: pointer;">
                                    <span style="font-size: 0.875rem;">✅ Finalizado</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="editar-en-directo" style="cursor: pointer;">
                                    <span style="font-size: 0.875rem;">🔴 En directo</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="editar-sin-acta" style="cursor: pointer;">
                                    <span style="font-size: 0.875rem;">⚠️ Sin acta (incidencia)</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="checkbox" id="editar-acta-cerrada" style="cursor: pointer;">
                                    <span style="font-size: 0.875rem;">🚫 Acta cerrada (>40 pts)</span>
                                </label>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Resultado Local (opcional)</label>
                                <input type="text" id="editar-resultado-local" style="width: 100%; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem;" placeholder="Ej: 75">
                            </div>
                            <div>
                                <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Resultado Visitante (opcional)</label>
                                <input type="text" id="editar-resultado-visitante" style="width: 100%; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem;" placeholder="Ej: 68">
                            </div>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Cuarto Actual (opcional)</label>
                            <select id="editar-cuarto" style="width: 100%; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem;">
                                <option value="">Ninguno</option>
                                <option value="1º">1º Cuarto</option>
                                <option value="2º">2º Cuarto</option>
                                <option value="3º">3º Cuarto</option>
                                <option value="4º">4º Cuarto</option>
                            </select>
                        </div>

                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                            <button type="button" id="btn-cancelar-editar" style="background: #6b7280; color: white; padding: 0.5rem 1.5rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: 600;">
                                Cancelar
                            </button>
                            <button type="submit" style="background: #ea580c; color: white; padding: 0.5rem 1.5rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: 600;">
                                💾 Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * Genera el footer de la aplicación
     * @returns {string} HTML del footer
     */
    generarFooter() {
        return `
            <footer class="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 mt-12">
                <div class="max-w-4xl mx-auto px-4 py-8">
                    <!-- Información principal -->
                    <div class="text-center mb-6">
                        <p class="text-lg font-bold text-white mb-2">
                            © 2025 CBC Manises-Quart
                        </p>
                        <p class="text-sm text-gray-400">
                            Desarrollado por <span class="text-orange-400 font-semibold">Edgar MP</span> para el club CBC Manises
                        </p>
                    </div>

                    <!-- Separador -->
                    <div class="border-t border-gray-700 my-6"></div>

                    <!-- Información legal y privacidad -->
                    <div class="text-xs text-gray-400 space-y-3 max-w-3xl mx-auto">
                        <p class="text-center">
                            Esta web es informativa y muestra datos públicos del equipo <strong class="text-gray-300">Cadete Masculino</strong>.
                        </p>

                        <p class="text-center">
                            Los nombres y estadísticas publicados corresponden a jugadores federados en competición oficial.
                            Al participar en el equipo, los jugadores/tutores consienten la publicación de estas estadísticas deportivas.
                        </p>

                        <p class="text-center">
                            Esta web <strong class="text-gray-300">no recopila datos personales</strong> ni usa cookies de seguimiento.
                            Utiliza Firebase (Google) para almacenar información deportiva del equipo.
                        </p>

                        <p class="text-center mt-4">
                            Para cualquier consulta sobre privacidad:
                            <a href="mailto:cbcmanisesweb@gmail.com" class="text-orange-400 hover:underline">cbcmanisesweb@gmail.com</a>
                        </p>
                        
                        <!-- Botón de emergencia para problemas de caché -->
                        <div class="text-center mt-8 pt-4 border-t border-gray-700">
                            <p class="text-[10px] text-gray-500 mb-2 italic">¿La web no carga bien o muestra datos antiguos?</p>
                            <button 
                                onclick="window.forzarRefrescoPersonalizado()" 
                                class="text-[10px] bg-gray-700 hover:bg-gray-600 text-gray-400 px-3 py-1 rounded transition-colors uppercase tracking-widest font-bold"
                            >
                                🔄 Forzar Reinicio de Aplicación
                            </button>
                        </div>
                    </div>

                    <!-- Separador -->
                    <div class="border-t border-gray-700 my-6"></div>

                    <!-- Información de temporada -->
                    <div class="text-center">
                        <p class="text-sm text-gray-400">
                            🏀 <strong class="text-white">Temporada 2025/26</strong> • Preferente Cadete Masculino Grupo D • Cadete Masculino IR Campeonato 1ª Zonal Fase Regular Grupo D
                        </p>
                    </div>
                </div>
            </footer>
        `;
    }

    /**
     * Genera el header de la aplicación
     * @param {boolean} isAdmin - Si el usuario es admin
     * @param {boolean} showAdminPanel - Si se muestra el panel admin
     * @returns {string} HTML del header
     */
    generarHeader(isAdmin, showAdminPanel) {
        return `
            <div class="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-4 md:p-6 shadow-lg">
                <div class="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div class="flex-1">
                        <h2 class="text-2xl md:text-3xl font-bold">🏀 ${INFO_EQUIPO.NOMBRE}</h2>
                        <p class="text-sm md:text-base text-orange-100">${INFO_EQUIPO.CATEGORIA} - ${INFO_EQUIPO.COMPETICION}</p>
                        <p class="text-xs md:text-sm text-orange-200">Temporada ${INFO_EQUIPO.TEMPORADA} • 🔴 EN VIVO</p>
                    </div>
                    <div class="flex gap-2 items-center flex-shrink-0">
                        <a
                            href="${URLS.WHATSAPP_CANAL}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="whatsapp-header-btn text-sm md:text-base"
                        >
                            <span style="font-size: 1.2rem;">💬</span>
                            <span class="hidden sm:inline">Canal</span>
                        </a>
                        ${!isAdmin ? `
                            <button
                                onclick="window.handleAdminLoginGlobal()"
                                class="bg-white text-orange-600 px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-semibold hover:bg-orange-50"
                            >
                                ⚙️
                            </button>
                        ` : `
                            <div class="flex gap-2 flex-wrap">
                                <button
                                    onclick="window.toggleAdminPanel()"
                                    class="bg-white text-orange-600 px-3 md:px-4 py-2 rounded-lg text-xs md:text-base font-semibold hover:bg-orange-50 whitespace-nowrap"
                                >
                                    ${showAdminPanel ? '👁️ Ver Web' : '⚙️ Gestionar'}
                                </button>
                                <button
                                    onclick="window.logout()"
                                    class="bg-orange-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-base font-semibold hover:bg-orange-800 whitespace-nowrap"
                                >
                                    🚪 Salir
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Genera el contenido principal (tabs)
     * @param {Object} estado - Estado de la aplicación
     * @returns {string} HTML del contenido principal
     */
    generarContenidoPrincipal(estado) {
        const { activeTab, partidos, actas, datosJugadores, jugadorSeleccionado } = estado;

        // Filtrar partidos
        const partidosCalendario = partidos
            .filter(p => !p.finalizado)
            .sort((a, b) => {
                // Ordenar por fecha (más próximo primero)
                return new Date(a.fecha) - new Date(b.fecha);
            });

        // Obtener el filtro actual de fase
        const filtroFaseActual = this.app.estadisticasManager.getFiltroFase();

        const partidosFinalizados = partidos
            .filter(p => p.finalizado)
            .filter(p => {
                // Si el filtro es 'todas', mostrar todo
                if (filtroFaseActual === 'todas') return true;
                // Si no, filtrar por la fase del partido (default 'primera' si no existe)
                return (p.fase || 'primera') === filtroFaseActual;
            })
            .sort((a, b) => {
                // Ordenar por fecha (más reciente primero)
                return new Date(b.fecha) - new Date(a.fecha);
            });

        return `
            <!-- Tabs de navegación -->
            <div class="bg-white rounded-lg shadow-md mb-6 p-2 flex gap-2">
                <button
                    onclick="window.cambiarTab('calendario')"
                    class="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-colors ${activeTab === 'calendario'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }"
                >
                    📅<span class="hidden xs:inline sm:hidden"> </span><span class="hidden sm:inline"> Calendario</span><span class="sm:hidden xs:inline">Cal</span>
                </button>
                <button
                    onclick="window.cambiarTab('resultados')"
                    class="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-colors ${activeTab === 'resultados'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }"
                >
                    🏆<span class="hidden xs:inline sm:hidden"> </span><span class="hidden sm:inline"> Resultados</span><span class="sm:hidden xs:inline">Res</span>
                </button>
                <button
                    onclick="window.cambiarTab('estadisticas')"
                    class="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-colors ${activeTab === 'estadisticas'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }"
                >
                    📊<span class="hidden xs:inline sm:hidden"> </span><span class="hidden sm:inline"> Estadísticas</span><span class="sm:hidden xs:inline">Est</span>
                </button>
                <button
                    onclick="window.cambiarTab('clasificacion')"
                    class="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-colors ${activeTab === 'clasificacion'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }"
                >
                    🏅<span class="hidden xs:inline sm:hidden"> </span><span class="hidden sm:inline"> Clasificación</span><span class="sm:hidden xs:inline">Clas</span>
                </button>
            </div>

            <!-- Contenido de la tab activa -->
            <div id="tab-content" class="animate-fade-in">
                ${activeTab === 'calendario' ? this.generarTabCalendario(partidosCalendario, actas, estado.isAdmin) : ''}
                ${activeTab === 'resultados' ? this.generarTabResultados(partidosFinalizados, actas, estado.isAdmin) : ''}
                ${activeTab === 'estadisticas' ? this.generarTabEstadisticas(actas, datosJugadores, jugadorSeleccionado) : ''}
                ${activeTab === 'clasificacion' ? this.generarTabClasificacion() : ''}
            </div>
        `;
    }

    /**
     * Genera la tab de calendario
     * @param {Array} partidos - Lista de partidos pendientes
     * @param {Array} actas - Lista de actas
     * @param {boolean} isAdmin - Si es admin
     * @returns {string} HTML de la tab calendario
     */
    generarTabCalendario(partidos, actas, isAdmin) {
        if (partidos.length === 0) {
            return `
                <div class="bg-white rounded-lg shadow-md p-8 text-center">
                    <div class="text-6xl mb-4">📅</div>
                    <h3 class="text-xl font-bold text-gray-700 mb-2">No hay próximos partidos</h3>
                    <p class="text-gray-500">El calendario está vacío por el momento</p>
                </div>
            `;
        }

        return `
            <div>
                <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">📅 Próximos Partidos</h3>
                ${partidos.map(p => this.generarPartidoCard(p, actas, isAdmin)).join('')}
            </div>
        `;
    }

    /**
     * Genera la tab de resultados
     * @param {Array} partidos - Lista de partidos finalizados
     * @param {Array} actas - Lista de actas
     * @param {boolean} isAdmin - Si es admin
     * @returns {string} HTML de la tab resultados
     */
    generarTabResultados(partidos, actas, isAdmin) {
        const filtroActual = this.app.estadisticasManager.getFiltroFase();

        // Los botones de filtro SIEMPRE se muestran
        const botonesHeader = `
            <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">🏆 Resultados</h3>

            <!-- Filtros por fase -->
            <div class="bg-white rounded-lg shadow-md p-4 mb-4">
                <p class="text-sm font-bold text-gray-700 mb-3">Filtrar por fase:</p>
                <div class="flex flex-wrap gap-2">
                    <button
                        onclick="window.cambiarFiltroFaseGlobal('todas')"
                        class="px-4 py-2 rounded-lg font-semibold transition-all ${filtroActual === 'todas' ? 'bg-orange-600 text-white ring-2 ring-orange-400' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}">
                        📊 Temporada Completa
                    </button>
                    <button
                        onclick="window.cambiarFiltroFaseGlobal('primera')"
                        class="px-4 py-2 rounded-lg font-semibold transition-all ${filtroActual === 'primera' ? 'bg-orange-600 text-white ring-2 ring-orange-400' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}">
                        🟡 1ª Fase
                    </button>
                    <button
                        onclick="window.cambiarFiltroFaseGlobal('segunda')"
                        class="px-4 py-2 rounded-lg font-semibold transition-all ${filtroActual === 'segunda' ? 'bg-orange-600 text-white ring-2 ring-orange-400' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}">
                        🔵 2ª Fase
                    </button>
                </div>
            </div>
        `;

        if (partidos.length === 0) {
            return `
                <div>
                    ${botonesHeader}
                    <div class="bg-white rounded-lg shadow-md p-8 text-center">
                        <div class="text-6xl mb-4">🏆</div>
                        <h3 class="text-xl font-bold text-gray-700 mb-2">
                            ${filtroActual === 'todas' ? 'No hay resultados aún' : `No hay resultados de ${filtroActual === 'primera' ? '1ª Fase' : '2ª Fase'}`}
                        </h3>
                        <p class="text-gray-500 mb-4">
                            ${filtroActual === 'todas'
                    ? 'Los resultados aparecerán aquí una vez finalizados los partidos'
                    : `No hay partidos de ${filtroActual === 'primera' ? '1ª Fase' : '2ª Fase'} todavía.`}
                        </p>
                        ${filtroActual !== 'todas' ? `
                            <button
                                onclick="window.cambiarFiltroFaseGlobal('todas')"
                                class="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-all">
                                Ver Temporada Completa
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        return `
            <div>
                ${botonesHeader}
                ${partidos.map(p => this.generarPartidoCard(p, actas, isAdmin)).join('')}
            </div>
        `;
    }

    /**
     * Genera la tab de estadísticas
     * @param {Array} actas - Lista de actas
     * @param {Object} datosJugadores - Datos de jugadores
     * @param {string} jugadorSeleccionado - Jugador seleccionado
     * @returns {string} HTML de la tab estadísticas
     */
    generarTabEstadisticas(actas, datosJugadores, jugadorSeleccionado) {
        const filtroActual = this.app.estadisticasManager.getFiltroFase();

        // Botones de filtro - SIEMPRE se muestran
        const botonesFilter = `
            <!-- Filtros por fase -->
            <div class="bg-white rounded-lg shadow-md p-4">
                <p class="text-sm font-bold text-gray-700 mb-3">Filtrar por fase:</p>
                <div class="flex flex-wrap gap-2">
                    <button
                        onclick="window.cambiarFiltroFaseGlobal('todas')"
                        class="px-4 py-2 rounded-lg font-semibold transition-all ${filtroActual === 'todas' ? 'bg-orange-600 text-white ring-2 ring-orange-400' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}">
                        📊 Temporada Completa
                    </button>
                    <button
                        onclick="window.cambiarFiltroFaseGlobal('primera')"
                        class="px-4 py-2 rounded-lg font-semibold transition-all ${filtroActual === 'primera' ? 'bg-orange-600 text-white ring-2 ring-orange-400' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}">
                        🟡 1ª Fase
                    </button>
                    <button
                        onclick="window.cambiarFiltroFaseGlobal('segunda')"
                        class="px-4 py-2 rounded-lg font-semibold transition-all ${filtroActual === 'segunda' ? 'bg-orange-600 text-white ring-2 ring-orange-400' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}">
                        🔵 2ª Fase
                    </button>
                </div>
            </div>
        `;

        if (!actas || actas.length === 0) {
            return `
                <div class="space-y-6">
                    <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">📊 Estadísticas de la Temporada</h3>
                    ${botonesFilter}
                    <div class="bg-white rounded-lg shadow-md p-8 text-center">
                        <div class="text-6xl mb-4">📊</div>
                        <h3 class="text-xl font-bold text-gray-700 mb-2">No hay estadísticas disponibles</h3>
                        <p class="text-gray-500">Las estadísticas aparecerán cuando se registren las actas de los partidos</p>
                    </div>
                </div>
            `;
        }

        const jugadores = Object.values(datosJugadores).sort((a, b) => b.totalPts - a.totalPts);

        return `
            <div class="space-y-6">
                <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">📊 Estadísticas de la Temporada</h3>

                ${botonesFilter}

                <!-- Gráficas del equipo -->
                <div class="bg-white rounded-lg shadow-md p-4 md:p-6">
                    <h4 class="text-lg md:text-xl font-bold text-gray-800 mb-4">📈 Estadísticas del Equipo</h4>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div class="h-64 md:h-72">
                            <canvas id="chartPuntosEquipo"></canvas>
                        </div>
                        <div class="h-64 md:h-72">
                            <canvas id="chartFaltasEquipo"></canvas>
                        </div>
                        <div class="h-64 md:h-72">
                            <canvas id="chartTirosEquipo"></canvas>
                        </div>
                        <div class="h-64 md:h-72">
                            <canvas id="chartPorcentajeTLEquipo"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Selector de jugador para estadísticas individuales -->
                <div class="bg-white rounded-lg shadow-md p-4">
                    <label class="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                        Selecciona un jugador para ver sus estadísticas individuales:
                    </label>
                    <select
                        onchange="window.cambiarJugadorGlobal(this.value)"
                        class="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 truncate"
                    >
                        <option value="">-- Selecciona un jugador --</option>
                        ${jugadores.map(j => `
                            <option value="${j.nombre}" ${jugadorSeleccionado === j.nombre ? 'selected' : ''} class="truncate">
                                #${j.dorsal} ${j.nombre} (${j.totalPts}pts ${j.partidos.length}PJ)
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Gráficas del jugador (si hay uno seleccionado) -->
                ${jugadorSeleccionado ? (() => {
                const datos = datosJugadores[jugadorSeleccionado];
                if (!datos) return '';

                const maxPts = Math.max(...datos.partidos.map(p => p.pts), 0);
                const avgPts = (datos.totalPts / datos.partidos.length).toFixed(1);
                const porcTL = datos.totalTL_int > 0 ? Math.round((datos.totalTL_an / datos.totalTL_int) * 100) : 0;
                const maxT3 = Math.max(...datos.partidos.map(p => p.t3_an), 0);

                return `
                        <div class="bg-white rounded-lg shadow-md p-4 md:p-6 space-y-6">
                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                                <h4 class="text-xl md:text-2xl font-bold text-gray-800">
                                    👤 ${jugadorSeleccionado} <span class="text-orange-600">#${datos.dorsal}</span>
                                </h4>
                                <div class="flex gap-4">
                                    <div class="text-center">
                                        <p class="text-xs text-gray-500 uppercase font-bold">PJ</p>
                                        <p class="text-lg font-bold text-gray-800">${datos.partidos.length}</p>
                                    </div>
                                    <div class="text-center">
                                        <p class="text-xs text-gray-500 uppercase font-bold">PTS/P</p>
                                        <p class="text-lg font-bold text-gray-800">${avgPts}</p>
                                    </div>
                                    <div class="text-center">
                                        <p class="text-xs text-gray-500 uppercase font-bold">%TL</p>
                                        <p class="text-lg font-bold text-orange-600">${porcTL}%</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Récords Personales -->
                            <div>
                                <h5 class="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">🏆 Récords Personales</h5>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div class="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                        <p class="text-xs text-orange-600 font-bold">Máx. Puntos</p>
                                        <p class="text-2xl font-black text-orange-700">${maxPts}</p>
                                    </div>
                                    <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <p class="text-xs text-blue-600 font-bold">Más Triples</p>
                                        <p class="text-2xl font-black text-blue-700">${maxT3}</p>
                                    </div>
                                    <div class="bg-green-50 p-3 rounded-lg border border-green-100">
                                        <p class="text-xs text-green-600 font-bold">Total Puntos</p>
                                        <p class="text-2xl font-black text-green-700">${datos.totalPts}</p>
                                    </div>
                                    <div class="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                        <p class="text-xs text-purple-600 font-bold">Faltas Totales</p>
                                        <p class="text-2xl font-black text-purple-700">${datos.totalFC}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Gráficas Individuales -->
                            <div class="pt-4">
                                <h5 class="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">📈 Evolución por Jornada</h5>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div class="h-64 md:h-72">
                                        <canvas id="chartJugadorTL"></canvas>
                                    </div>
                                    <div class="h-64 md:h-72">
                                        <canvas id="chartJugadorT2"></canvas>
                                    </div>
                                    <div class="h-64 md:h-72">
                                        <canvas id="chartJugadorT3"></canvas>
                                    </div>
                                    <div class="h-64 md:h-72">
                                        <canvas id="chartJugadorFaltas"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
            })() : ''}
            </div>
        `;
    }

    /**
     * Genera una tarjeta de partido
     * @param {Object} partido - Datos del partido
     * @param {Array} actas - Lista de actas
     * @param {boolean} isAdmin - Si es admin
     * @returns {string} HTML de la tarjeta
     */
    generarPartidoCard(partido, actas, isAdmin) {
        const equipoLocal = partido.esLocal ? INFO_EQUIPO.NOMBRE : partido.rival;
        const equipoVisitante = partido.esLocal ? partido.rival : INFO_EQUIPO.NOMBRE;
        const logoLocal = partido.esLocal ? INFO_EQUIPO.LOGO : `logos/${partido.logoRival}`;
        const logoVisitante = partido.esLocal ? `logos/${partido.logoRival}` : INFO_EQUIPO.LOGO;
        const tieneActa = actas.some(a => a.partidoId === partido.id);

        return `
            <div class="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 animate-fade-in hover-premium">
                ${partido.jornada ? `
                    <div class="text-center mb-4">
                        <span class="bg-orange-500 text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-bold">
                            Jornada ${partido.jornada}
                        </span>
                    </div>
                ` : ''}

                ${partido.fase ? `
                    <div class="text-center mb-2">
                        <span class="text-xs font-semibold px-2 py-1 rounded ${partido.fase === 'primera' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}">
                            ${partido.fase === 'primera' ? '🟡 1ª Fase' : '🔵 2ª Fase'}
                        </span>
                    </div>
                ` : ''}

                ${partido.cuartoActual && !partido.finalizado ? `
                    <div class="text-center mb-3">
                        <span class="cuarto-badge text-xs md:text-sm">
                            ${partido.cuartoActual} Cuarto
                        </span>
                    </div>
                ` : ''}

                ${partido.enDirecto && !partido.finalizado ? `
                    <div class="text-center mb-2">
                        <span class="text-red-600 text-xs md:text-sm font-bold animate-pulse">● EN DIRECTO</span>
                    </div>
                ` : ''}

                <div class="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
                    <!-- Equipo Local -->
                    <div class="flex items-center gap-2 md:gap-3 flex-1 justify-end">
                        <div class="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">
                            <img
                                src="${logoLocal}"
                                alt="Logo ${equipoLocal}"
                                class="max-w-full max-h-full object-contain"
                                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                            />
                            <div style="display:none" class="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full items-center justify-center">
                                <span class="text-lg md:text-xl">🏀</span>
                            </div>
                        </div>
                        <div class="text-left hidden sm:block">
                            <p class="font-bold text-gray-800 text-xs md:text-sm">${equipoLocal}</p>
                        </div>
                    </div>

                    <!-- Marcador -->
                    <div class="text-center flex-shrink-0">
                        ${partido.finalizado || partido.enDirecto ? `
                            <div class="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2 md:gap-3">
                                <span>${partido.resultadoLocal || '0'}</span>
                                <span class="text-lg md:text-2xl text-gray-500">-</span>
                                <span>${partido.resultadoVisitante || '0'}</span>
                            </div>
                        ` : `
                            <div class="text-lg md:text-2xl font-bold text-gray-600">
                                <div>${partido.hora}</div>
                            </div>
                        `}
                    </div>

                    <!-- Equipo Visitante -->
                    <div class="flex items-center gap-2 md:gap-3 flex-1 justify-start">
                        <div class="text-right hidden sm:block">
                            <p class="font-bold text-gray-800 text-xs md:text-sm">${equipoVisitante}</p>
                        </div>
                        <div class="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">
                            <img
                                src="${logoVisitante}"
                                alt="Logo ${equipoVisitante}"
                                class="max-w-full max-h-full object-contain"
                                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                            />
                            <div style="display:none" class="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full items-center justify-center">
                                <span class="text-lg md:text-xl">🏀</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Nombres de equipos en móvil -->
                <div class="sm:hidden mt-3 flex justify-between text-xs text-gray-700 font-semibold px-2">
                    <div class="text-left flex-1">${equipoLocal}</div>
                    <div class="text-right flex-1">${equipoVisitante}</div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                    <p class="text-center">📅 ${formatearFecha(partido.fecha)}</p>
                    <div class="mt-3">
                        <p class="text-center font-semibold text-gray-700 mb-2">📍 ${partido.ubicacion}</p>
                        <div class="flex flex-wrap gap-2 justify-center">
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partido.ubicacion)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-600 flex items-center gap-1"
                            >
                                <span>🗺️</span>
                                <span>Google Maps</span>
                            </a>
                            <a
                                href="https://waze.com/ul?q=${encodeURIComponent(partido.ubicacion)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="bg-cyan-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-cyan-600 flex items-center gap-1"
                            >
                                <span>🚗</span>
                                <span>Waze</span>
                            </a>
                            <a
                                href="https://maps.apple.com/?q=${encodeURIComponent(partido.ubicacion)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="bg-gray-700 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-800 flex items-center gap-1"
                            >
                                <span>🍎</span>
                                <span>Apple Maps</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    ${partido.finalizado && partido.actaCerrada ? `
                        <div class="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg">
                            <div class="flex items-start gap-3">
                                <span class="text-xl">🚫</span>
                                <div>
                                    <p class="font-bold text-blue-800 text-sm">Acta cerrada (>40 pts diferencia)</p>
                                    <p class="text-xs text-blue-700 mt-1">
                                        El acta se cerró por diferencia de puntos. Las estadísticas están disponibles pero pueden no estar completas, ya que no se pudo controlar el directo de los puntos tras el cierre del marcador.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    ${partido.finalizado && tieneActa ? `
                        <button onclick="window.verActaGlobal('${partido.id}')" class="w-full bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700">
                            📊 Ver Acta Oficial
                        </button>
                    ` : partido.finalizado && partido.sinActa ? `
                        <div class="bg-orange-100 border-l-4 border-orange-500 p-4 rounded-lg text-left">
                            <div class="flex items-start gap-3">
                                <span class="text-xl">⚠️</span>
                                <div>
                                    <p class="font-bold text-orange-800 text-sm">Acta no disponible (incidencia técnica)</p>
                                    <p class="text-xs text-orange-700 mt-1">
                                        El acta del encuentro no pudo emitirse por una incidencia técnica. Como consecuencia, no se publicarán las estadísticas de este partido.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                ${isAdmin && !partido.finalizado ? `
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <p class="text-center text-sm font-bold text-gray-700 mb-2">Control de Cuarto</p>
                        <div class="flex gap-2 justify-center mb-4 flex-wrap">
                            <button onclick="window.actualizarCuartoGlobal('${partido.id}', '1º')" class="bg-blue-500 text-white px-3 py-1 rounded text-xs ${partido.cuartoActual === '1º' ? 'ring-2 ring-blue-700' : ''}">1º</button>
                            <button onclick="window.actualizarCuartoGlobal('${partido.id}', '2º')" class="bg-blue-500 text-white px-3 py-1 rounded text-xs ${partido.cuartoActual === '2º' ? 'ring-2 ring-blue-700' : ''}">2º</button>
                            <button onclick="window.actualizarCuartoGlobal('${partido.id}', '3º')" class="bg-blue-500 text-white px-3 py-1 rounded text-xs ${partido.cuartoActual === '3º' ? 'ring-2 ring-blue-700' : ''}">3º</button>
                            <button onclick="window.actualizarCuartoGlobal('${partido.id}', '4º')" class="bg-blue-500 text-white px-3 py-1 rounded text-xs ${partido.cuartoActual === '4º' ? 'ring-2 ring-blue-700' : ''}">4º</button>
                            <button onclick="window.actualizarCuartoGlobal('${partido.id}', '')" class="bg-gray-500 text-white px-3 py-1 rounded text-xs">Limpiar</button>
                        </div>
                        <p class="text-center text-sm font-bold text-gray-700 mb-2">Control de Marcador</p>
                        <div class="flex gap-4 justify-center flex-wrap">
                            <div class="text-center">
                                <p class="text-xs mb-1">${equipoLocal}</p>
                                <div class="flex gap-1">
                                    <button onclick="window.actualizarMarcadorGlobal('${partido.id}', 'resultadoLocal', 1)" class="bg-green-500 text-white px-2 py-1 rounded text-xs">+1</button>
                                    <button onclick="window.actualizarMarcadorGlobal('${partido.id}', 'resultadoLocal', 2)" class="bg-green-600 text-white px-2 py-1 rounded text-xs">+2</button>
                                    <button onclick="window.actualizarMarcadorGlobal('${partido.id}', 'resultadoLocal', 3)" class="bg-green-700 text-white px-2 py-1 rounded text-xs">+3</button>
                                    <button onclick="window.actualizarMarcadorGlobal('${partido.id}', 'resultadoLocal', -1)" class="bg-red-500 text-white px-2 py-1 rounded text-xs">-1</button>
                                </div>
                            </div>
                            <div class="text-center">
                                <p class="text-xs mb-1">${equipoVisitante}</p>
                                <div class="flex gap-1">
                                    <button onclick="window.actualizarMarcadorGlobal('${partido.id}', 'resultadoVisitante', 1)" class="bg-green-500 text-white px-2 py-1 rounded text-xs">+1</button>
                                    <button onclick="window.actualizarMarcadorGlobal('${partido.id}', 'resultadoVisitante', 2)" class="bg-green-600 text-white px-2 py-1 rounded text-xs">+2</button>
                                    <button onclick="window.actualizarMarcadorGlobal('${partido.id}', 'resultadoVisitante', 3)" class="bg-green-700 text-white px-2 py-1 rounded text-xs">+3</button>
                                    <button onclick="window.actualizarMarcadorGlobal('${partido.id}', 'resultadoVisitante', -1)" class="bg-red-500 text-white px-2 py-1 rounded text-xs">-1</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${(partido.anotaciones && partido.anotaciones.length > 0) ? `
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <div class="flex flex-col gap-2">
                            <button onclick="window.verAnotacionesGlobal('${partido.id}')" class="w-full bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 flex items-center justify-center gap-2">
                                <span>📋</span>
                                <span>Ver Anotaciones (Datos NO Oficiales)${partido.anotaciones && partido.anotaciones.length > 0 ? ` (${partido.anotaciones.length})` : ''}
                                </span>
                            </button>
                        </div>
                    </div>
                ` : ''}

                <div class="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2 justify-center">
                    <button 
                        onclick="window.compartirPartidoGlobal('${partido.id}')" 
                        class="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <span>🔗</span>
                        <span>Compartir</span>
                    </button>

                    ${isAdmin ? `
                        <button onclick="window.editarPartidoGlobal('${partido.id}')" class="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-600">✏️ Editar</button>
                        <button onclick="window.eliminarPartidoGlobal('${partido.id}')" class="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-600">🗑️ Eliminar</button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Genera la vista de un acta completa
     * @param {Object} acta - Datos del acta
     * @returns {string} HTML de la vista del acta
     */
    generarVistaActa(acta) {
        const equipoLocal = acta.esLocal ? INFO_EQUIPO.NOMBRE : acta.rival;
        const equipoVisitante = acta.esLocal ? acta.rival : INFO_EQUIPO.NOMBRE;
        const logoLocal = acta.esLocal ? INFO_EQUIPO.LOGO : `logos/${acta.logoRival}`;
        const logoVisitante = acta.esLocal ? `logos/${acta.logoRival}` : INFO_EQUIPO.LOGO;

        return `
            <div class="min-h-screen bg-gradient-to-br from-orange-50 to-white">
                <div class="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-6 shadow-lg">
                    <div class="max-w-4xl mx-auto">
                        <button
                            onclick="window.cerrarActaGlobal()"
                            class="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 mb-4"
                        >
                            ← Volver
                        </button>
                        <h1 class="text-3xl font-bold">📊 ACTA OFICIAL</h1>
                        <p class="text-orange-100">Jornada ${acta.jornada} • Temporada ${INFO_EQUIPO.TEMPORADA}</p>
                    </div>
                </div>

                <div class="max-w-4xl mx-auto p-4">
                    <!-- Resultado del partido -->
                    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <div class="flex items-center justify-between gap-4">
                            <div class="flex-1 text-center">
                                <div class="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
                                    <img
                                        src="${logoLocal}"
                                        alt="${equipoLocal}"
                                        class="max-w-full max-h-full object-contain"
                                    />
                                </div>
                                <p class="font-bold text-gray-800">${equipoLocal}</p>
                            </div>

                            <div class="text-center">
                                <div class="text-4xl md:text-5xl font-bold text-gray-800 flex items-center gap-3 md:gap-4">
                                    <span>${acta.resultadoLocal}</span>
                                    <span class="text-2xl md:text-3xl text-gray-500">-</span>
                                    <span>${acta.resultadoVisitante}</span>
                                </div>
                            </div>

                            <div class="flex-1 text-center">
                                <div class="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
                                    <img
                                        src="${logoVisitante}"
                                        alt="${equipoVisitante}"
                                        class="max-w-full max-h-full object-contain"
                                    />
                                </div>
                                <p class="font-bold text-gray-800">${equipoVisitante}</p>
                            </div>
                        </div>

                        <div class="mt-4 pt-4 border-t text-center text-sm text-gray-600">
                            <p>📅 ${formatearFecha(acta.fecha)}</p>
                            <p class="mt-1">📍 ${acta.ubicacion}</p>
                        </div>
                    </div>

                    <!-- Estadísticas de jugadores -->
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">👥 Estadísticas Individuales</h2>

                        ${acta.jugadores.map(jugador => `
                            <div class="jugador-card">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="flex items-center gap-3">
                                        <span class="dorsal-badge">#${jugador.dorsal}</span>
                                        <span class="font-bold text-gray-800">${jugador.nombre}</span>
                                    </div>
                                </div>

                                <div class="stats-grid">
                                    <div class="stat-item">
                                        <div class="stat-label">PTS</div>
                                        <div class="stat-value">${jugador.pts}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">MIN</div>
                                        <div class="stat-value">${jugador.min}'</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">TL</div>
                                        <div class="stat-value">${jugador.tl.anotados}/${jugador.tl.intentos}</div>
                                        ${jugador.tl.porcentaje !== null ? `
                                            <div class="stat-percentage">${jugador.tl.porcentaje}%</div>
                                        ` : ''}
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">T2</div>
                                        <div class="stat-value">${jugador.t2.anotados}/${jugador.t2.intentos}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">T3</div>
                                        <div class="stat-value">${jugador.t3.anotados}/${jugador.t3.intentos}</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">FC</div>
                                        <div class="stat-value">${jugador.fc}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}

                        <!-- Totales del Equipo -->
                        ${this.generarTotalesEquipo(acta)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Genera los totales del equipo para el acta
     * @param {Object} acta - Acta del partido
     * @returns {string} HTML con los totales
     */
    generarTotalesEquipo(acta) {
        // Calcular totales
        let totalPuntos = 0;
        let totalFaltas = 0;
        let totalTL_anotados = 0;
        let totalTL_intentos = 0;
        let totalT2_anotados = 0;
        let totalT2_intentos = 0;
        let totalT3_anotados = 0;
        let totalT3_intentos = 0;

        acta.jugadores.forEach(jugador => {
            totalPuntos += jugador.pts || 0;
            totalFaltas += jugador.fc || 0;
            totalTL_anotados += jugador.tl?.anotados || 0;
            totalTL_intentos += jugador.tl?.intentos || 0;
            totalT2_anotados += jugador.t2?.anotados || 0;
            totalT2_intentos += jugador.t2?.intentos || 0;
            totalT3_anotados += jugador.t3?.anotados || 0;
            totalT3_intentos += jugador.t3?.intentos || 0;
        });

        // Calcular porcentajes
        const porcentajeTL = totalTL_intentos > 0
            ? Math.round((totalTL_anotados / totalTL_intentos) * 100)
            : 0;
        const porcentajeT2 = totalT2_intentos > 0
            ? Math.round((totalT2_anotados / totalT2_intentos) * 100)
            : 0;
        const porcentajeT3 = totalT3_intentos > 0
            ? Math.round((totalT3_anotados / totalT3_intentos) * 100)
            : 0;

        return `
            <div class="mt-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-lg p-6 border-2 border-orange-300">
                <h3 class="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                    <span>📊</span>
                    <span>TOTALES DEL EQUIPO</span>
                </h3>

                <div class="grid gap-4">
                    <!-- Primera fila: Puntos y Faltas -->
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Puntos Totales -->
                        <div class="bg-white rounded-lg p-6 text-center shadow">
                            <div class="text-gray-600 text-sm font-semibold mb-2">PUNTOS</div>
                            <div class="text-4xl font-bold text-orange-600">${totalPuntos}</div>
                        </div>

                        <!-- Faltas Totales -->
                        <div class="bg-white rounded-lg p-6 text-center shadow">
                            <div class="text-gray-600 text-sm font-semibold mb-2">FALTAS</div>
                            <div class="text-4xl font-bold text-red-600">${totalFaltas}</div>
                        </div>
                    </div>

                    <!-- Segunda fila: Tiros -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Tiros Libres -->
                        <div class="bg-white rounded-lg p-4 text-center shadow">
                            <div class="text-gray-600 text-xs font-semibold mb-1">TIROS LIBRES</div>
                            <div class="text-2xl font-bold text-gray-800">${totalTL_anotados}/${totalTL_intentos}</div>
                            <div class="text-sm font-semibold text-blue-600 mt-1">${porcentajeTL}%</div>
                        </div>

                        <!-- Tiros de 2 -->
                        <div class="bg-white rounded-lg p-4 text-center shadow">
                            <div class="text-gray-600 text-xs font-semibold mb-1">TIROS DE 2</div>
                            <div class="text-2xl font-bold text-gray-800">${totalT2_anotados}/${totalT2_intentos}</div>
                            <div class="text-sm font-semibold text-green-600 mt-1">${porcentajeT2}%</div>
                        </div>

                        <!-- Tiros de 3 -->
                        <div class="bg-white rounded-lg p-4 text-center shadow">
                            <div class="text-gray-600 text-xs font-semibold mb-1">TIROS DE 3</div>
                            <div class="text-2xl font-bold text-gray-800">${totalT3_anotados}/${totalT3_intentos}</div>
                            <div class="text-sm font-semibold text-purple-600 mt-1">${porcentajeT3}%</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Genera las opciones de partidos finalizados sin acta
     * @param {Array} partidos - Lista de partidos
     * @param {Array} actas - Lista de actas
     * @returns {string} HTML de las opciones
     */
    generarOpcionesPartidosSinActa(partidos, actas) {
        const partidosFinalizados = partidos.filter(p => p.finalizado);
        const partidosSinActa = partidosFinalizados.filter(p => {
            return !actas.some(a => a.partidoId === p.id);
        });

        if (partidosSinActa.length === 0) {
            return '<option value="" disabled>No hay partidos finalizados sin acta</option>';
        }

        return partidosSinActa.map(p => `
            <option value="${p.id}">
                J${p.jornada || '?'} - ${p.fecha} - ${p.rival} (${p.resultadoLocal}-${p.resultadoVisitante})
            </option>
        `).join('');
    }

    /**
     * Genera el panel de administración
     * @param {Object} estado - Estado de la aplicación
     * @returns {string} HTML del panel admin
     */
    generarPanelAdmin(estado) {
        const { partidos } = estado;

        return `
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 class="text-2xl font-bold text-gray-800 mb-6">⚙️ Panel de Administración</h3>

                <!-- Formulario Añadir Partido -->
                <div class="mb-8">
                    <h4 class="text-xl font-semibold text-orange-600 mb-4">🏀 Añadir Nuevo Partido</h4>
                    <form id="form-añadir-partido" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                            <input type="date" id="fecha" required class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                            <input type="time" id="hora" required class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                            <select id="ubicacion" class="w-full border rounded px-3 py-2">
                                <option value="">Seleccionar pabellón...</option>
                                ${UBICACIONES.map(ubicacion =>
            `<option value="${ubicacion.nombre}">${ubicacion.esLocal ? '🏠' : '🚗'} ${ubicacion.nombre}${ubicacion.esLocal ? ' - LOCAL' : ''}</option>`
        ).join('')}
                            </select>
                            <div class="mt-2">
                                <label class="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="ubicacion-custom-checkbox"
                                        class="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        onchange="window.toggleUbicacionCustom()"
                                    />
                                    <span>📍 Usar ubicación personalizada</span>
                                </label>
                            </div>
                            <div id="ubicacion-custom-container" class="mt-2 hidden">
                                <input
                                    type="text"
                                    id="ubicacion-custom"
                                    placeholder="Ej: Pabellón Municipal de Paterna"
                                    class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-3"
                                />
                                <div class="flex gap-4">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="ubicacion-custom-tipo"
                                            value="true"
                                            class="text-orange-600 focus:ring-orange-500"
                                        />
                                        <span class="text-sm">🏠 Local (en casa)</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="ubicacion-custom-tipo"
                                            value="false"
                                            checked
                                            class="text-orange-600 focus:ring-orange-500"
                                        />
                                        <span class="text-sm">✈️ Visitante (fuera)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Rival</label>
                            <select id="rival" required class="w-full border rounded px-3 py-2">
                                <option value="">Seleccionar equipo...</option>
                                ${EQUIPOS_RIVALES.map(equipo =>
            `<option value="${equipo.nombre}">${equipo.nombre}</option>`
        ).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
                            <input type="number" id="jornada" required min="1" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Fase</label>
                            <select id="fase" required class="w-full border rounded px-3 py-2">
                                <option value="primera">🟡 Primera Fase</option>
                                <option value="segunda">🔵 Segunda Fase</option>
                            </select>
                        </div>
                        <div class="md:col-span-2">
                            <button type="submit" class="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700">
                                ➕ Añadir Partido
                            </button>
                        </div>
                    </form>
                </div>

                <hr class="my-8">

                <!-- Formulario Añadir Acta -->
                <div class="mb-8">
                    <h4 class="text-xl font-semibold text-orange-600 mb-4">📋 Añadir Acta de Partido</h4>

                    <!-- Selector de partido -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Seleccionar Partido Finalizado</label>
                        <select id="partido-acta-selector" class="w-full border rounded px-3 py-2">
                            <option value="">-- Seleccionar partido --</option>
                            ${this.generarOpcionesPartidosSinActa(partidos, estado.actas)}
                        </select>
                    </div>

                    <!-- Contenedor del formulario de acta (se muestra al seleccionar partido) -->
                    <div id="formulario-acta-container" style="display: none;">
                        <div class="bg-blue-50 border border-blue-200 rounded p-4 mb-4" id="info-partido-seleccionado">
                            <!-- Se llenará con JavaScript -->
                        </div>

                        <!-- Resumen de anotaciones (si existen) -->
                        <div id="resumen-anotaciones-acta"></div>

                        <!-- Lista de jugadores añadidos -->
                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <h5 class="font-semibold text-gray-700">Jugadores del Equipo:</h5>
                                <p class="text-xs text-gray-500 italic">Los jugadores se cargan automáticamente. Edita las estadísticas directamente.</p>
                            </div>
                            <div id="lista-jugadores-acta" class="space-y-2">
                                <p class="text-sm text-gray-500 italic">Selecciona un partido para cargar los jugadores</p>
                            </div>
                        </div>

                        <!-- Formulario para añadir jugador -->
                        <div class="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
                            <h5 class="font-semibold text-gray-700 mb-1">➕ Añadir Jugador Extra (Opcional)</h5>
                            <p class="text-xs text-gray-500 mb-3">Solo si necesitas añadir un jugador que no está en la plantilla</p>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Dorsal*</label>
                                    <input type="text" id="jugador-dorsal" class="w-full border rounded px-2 py-1 text-sm" placeholder="0">
                                </div>
                                <div class="md:col-span-3">
                                    <label class="block text-xs font-medium text-gray-600 mb-1">Nombre*</label>
                                    <input type="text" id="jugador-nombre" class="w-full border rounded px-2 py-1 text-sm" placeholder="NOMBRE APELLIDO">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">PTS*</label>
                                    <input type="number" id="jugador-pts" class="w-full border rounded px-2 py-1 text-sm" min="0" value="0">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">MIN*</label>
                                    <input type="number" id="jugador-min" class="w-full border rounded px-2 py-1 text-sm" min="0" value="0">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">FC</label>
                                    <input type="number" id="jugador-fc" class="w-full border rounded px-2 py-1 text-sm" min="0" value="0">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">TL (An/Int)</label>
                                    <div class="flex gap-1">
                                        <input type="number" id="jugador-tl-an" class="w-1/2 border rounded px-2 py-1 text-sm" min="0" value="0" placeholder="An">
                                        <input type="number" id="jugador-tl-int" class="w-1/2 border rounded px-2 py-1 text-sm" min="0" value="0" placeholder="Int">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">T2 (An/Int)</label>
                                    <div class="flex gap-1">
                                        <input type="number" id="jugador-t2-an" class="w-1/2 border rounded px-2 py-1 text-sm" min="0" value="0" placeholder="An">
                                        <input type="number" id="jugador-t2-int" class="w-1/2 border rounded px-2 py-1 text-sm" min="0" value="0" placeholder="Int">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600 mb-1">T3 (An/Int)</label>
                                    <div class="flex gap-1">
                                        <input type="number" id="jugador-t3-an" class="w-1/2 border rounded px-2 py-1 text-sm" min="0" value="0" placeholder="An">
                                        <input type="number" id="jugador-t3-int" class="w-1/2 border rounded px-2 py-1 text-sm" min="0" value="0" placeholder="Int">
                                    </div>
                                </div>
                            </div>
                            <div class="mt-3">
                                <button type="button" id="btn-añadir-jugador" class="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 text-sm">
                                    ➕ Añadir Jugador a la Lista
                                </button>
                            </div>
                        </div>

                        <!-- Botón para guardar acta -->
                        <div class="flex gap-2">
                            <button type="button" id="btn-guardar-acta" class="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700">
                                💾 Guardar Acta Completa
                            </button>
                            <button type="button" id="btn-cancelar-acta" class="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600">
                                ❌ Cancelar
                            </button>
                        </div>
                    </div>
                </div>

                <hr class="my-8">

                <!-- Lista de Partidos -->
                <div>
                    <h4 class="text-xl font-semibold text-orange-600 mb-4">📋 Gestión de Partidos</h4>
                    <div class="overflow-x-auto">
                        <table class="min-w-full bg-white border">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-4 py-2 border text-left">J.</th>
                                    <th class="px-4 py-2 border text-left">Fecha</th>
                                    <th class="px-4 py-2 border text-left">Rival</th>
                                    <th class="px-4 py-2 border text-center">Resultado</th>
                                    <th class="px-4 py-2 border text-center">Estado</th>
                                    <th class="px-4 py-2 border text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${partidos.map(p => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-4 py-2 border">${p.jornada || '-'}</td>
                                        <td class="px-4 py-2 border">${p.fecha} ${p.hora}</td>
                                        <td class="px-4 py-2 border">${p.rival}</td>
                                        <td class="px-4 py-2 border text-center">
                                            ${p.finalizado ? `${p.resultadoLocal}-${p.resultadoVisitante}` : '-'}
                                        </td>
                                        <td class="px-4 py-2 border text-center">
                                            ${p.enDirecto ? '🔴 En directo' : p.finalizado ? '✅ Finalizado' : '⏳ Próximo'}
                                        </td>
                                        <td class="px-4 py-2 border text-center">
                                            <button onclick="window.editarPartidoGlobal('${p.id}')" class="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-1">✏️</button>
                                            <button onclick="window.eliminarPartidoGlobal('${p.id}')" class="bg-red-500 text-white px-2 py-1 rounded text-sm">🗑️</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <hr class="my-8">

                <!-- Gestión de Actas -->
                <div>
                    <h4 class="text-xl font-semibold text-orange-600 mb-4">📋 Gestión de Actas</h4>
                    ${estado.actas && estado.actas.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="min-w-full bg-white border">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="px-4 py-2 border text-left">Jornada</th>
                                        <th class="px-4 py-2 border text-left">Rival</th>
                                        <th class="px-4 py-2 border text-left">Resultado</th>
                                        <th class="px-4 py-2 border text-left">Fase</th>
                                        <th class="px-4 py-2 border text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${estado.actas.map(a => {
            const partido = partidos.find(p => p.id === a.partidoId);
            return `
                                            <tr class="hover:bg-gray-50">
                                                <td class="px-4 py-2 border">${a.jornada || '-'}</td>
                                                <td class="px-4 py-2 border">${partido?.rival || 'Desconocido'}</td>
                                                <td class="px-4 py-2 border text-center">${a.resultadoLocal}-${a.resultadoVisitante}</td>
                                                <td class="px-4 py-2 border text-center">${a.fase === 'segunda' ? '🔵 2ª Fase' : '🟡 1ª Fase'}</td>
                                                <td class="px-4 py-2 border text-center">
                                                    <button onclick="if(confirm('¿Estás seguro de que quieres eliminar esta acta?')) window.eliminarActaGlobal('${a.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                                                        🗑️ Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
        }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <p class="text-gray-500 italic">No hay actas registradas aún.</p>
                    `}
                </div>

                <hr class="my-8">

                <!-- Gestión de Sistema -->
                <div>
                    <h4 class="text-xl font-semibold text-orange-600 mb-4">⚙️ Gestión de Sistema</h4>
                    <div class="bg-orange-50 border border-orange-200 rounded p-4 mb-6">
                        <h5 class="font-semibold text-orange-800 mb-2">🧹 Limpieza de Caché (Contra-F5)</h5>
                        <p class="text-sm text-orange-700 mb-4">
                            Si notas que la web no se actualiza o muestra datos antiguos, pulsa este botón. Borrará toda la memoria temporal del navegador y forzará una recarga limpia.
                        </p>
                        <button
                            onclick="window.forzarRefrescoPersonalizado()"
                            class="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                        >
                            🚀 Forzar Recarga Limpia
                        </button>
                    </div>
                </div>

                <hr class="my-8">

                <!-- Gestión de Clasificación -->
                <div>
                    <h4 class="text-xl font-semibold text-orange-600 mb-4">🏆 Gestión de Clasificación</h4>

                    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                        <p class="text-sm text-blue-800 mb-2">
                            <strong>ℹ️ Edición inline activada:</strong> Ahora puedes editar la clasificación directamente desde la pestaña "🏅 Clasificación" cuando estés logueado como admin.
                        </p>
                        <p class="text-xs text-blue-700">
                            Ve a la pestaña Clasificación para añadir, editar, eliminar equipos y cambiar posiciones con un solo clic.
                        </p>
                    </div>

                    <!-- Selector de fase -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Fase</label>
                        <select id="fase-clasificacion-eliminar" class="w-full border rounded px-3 py-2">
                            <option value="primera">🟡 Primera Fase</option>
                            <option value="segunda">🔵 Segunda Fase</option>
                        </select>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div class="bg-green-50 border border-green-200 rounded p-4">
                            <h5 class="font-semibold text-green-800 mb-2">🔄 Recalcular Clasificación</h5>
                            <p class="text-sm text-green-700 mb-4">
                                Reordena automáticamente a los equipos basándose en victorias, derrotas y diferencia de puntos.
                            </p>
                            <button
                                onclick="window.corregirPosicionesClasificacion(document.getElementById('fase-clasificacion-eliminar').value)"
                                class="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                            >
                                📊 Recalcular Posiciones
                            </button>
                        </div>

                        <div class="bg-blue-50 border border-blue-200 rounded p-4">
                            <h5 class="font-semibold text-blue-800 mb-2">📥 Migración Rápida</h5>
                            <p class="text-sm text-blue-700 mb-4">
                                Solo para 1ª Fase: Carga los datos finales del sistema anterior a Firebase.
                            </p>
                            <button
                                onclick="window.migrarClasificacionAFirebase()"
                                class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                            >
                                📤 Migrar Datos 1ª Fase
                            </button>
                        </div>
                    </div>

                    <!-- Botón para eliminar toda la clasificación -->
                    <div class="bg-red-50 border border-red-300 rounded p-4">
                        <h5 class="font-semibold text-red-800 mb-2">⚠️ Zona de Peligro</h5>
                        <p class="text-sm text-red-700 mb-4">
                            Esta acción eliminará <strong>TODOS</strong> los equipos de la clasificación de la fase seleccionada. Esta operación no se puede deshacer.
                        </p>
                        <button
                            onclick="window.eliminarClasificacionCompletaGlobal()"
                            class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                        >
                            🗑️ Eliminar Toda la Clasificación
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Muestra el resumen de anotaciones en el formulario de crear acta
     * @param {Object} partido - Datos del partido
     */
    mostrarResumenAnotacionesEnActa(partido) {
        const resumenContainer = document.getElementById('resumen-anotaciones-acta');
        if (!resumenContainer) return;

        const anotaciones = partido.anotaciones || [];

        if (anotaciones.length === 0) {
            resumenContainer.innerHTML = '';
            return;
        }

        const resumen = this.app.anotacionesManager.generarResumenPorJugador(anotaciones);
        const jugadoresOrdenados = Object.values(resumen).sort((a, b) => b.totalPuntos - a.totalPuntos);

        resumenContainer.innerHTML = `
            <div class="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-4 mb-4">
                <h5 class="font-bold text-purple-800 mb-3 text-lg flex items-center gap-2">
                    <span>📊</span>
                    <span>Anotaciones Registradas en Vivo</span>
                </h5>
                <p class="text-xs text-purple-700 mb-3 italic">
                    Usa esta información como referencia para completar el acta oficial. Recuerda verificar los datos con el acta física.
                </p>
                <div class="space-y-2">
                    ${jugadoresOrdenados.map(j => `
                        <div class="bg-white border border-purple-200 rounded p-3">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-bold text-gray-800">${j.nombre}</span>
                                <span class="bg-purple-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                                    ${j.totalPuntos} pts
                                </span>
                            </div>
                            <div class="text-sm text-gray-600 mb-2">
                                ${j.anotaciones.map(a => `+${a.puntos}${a.cuarto ? ` (${a.cuarto})` : ''}`).join(', ')}
                            </div>
                            <div class="text-sm font-semibold text-purple-700">
                                → Sugerencia: ${this.app.anotacionesManager.generarSugerencia(j)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Muestra el modal selector de jugador para registrar anotación
     * @param {string} partidoId - ID del partido
     * @param {number} puntos - Puntos anotados (1, 2 o 3)
     * @param {Object} partido - Datos del partido
     */
    mostrarSelectorJugador(partidoId, puntos, partido, campo) {
        // Obtener jugadores de la plantilla oficial (dorsales siempre correctos)
        const jugadores = [...this.app.estadisticasManager.jugadores].sort((a, b) => {
            const dorsalA = parseInt(a.dorsal) || 0;
            const dorsalB = parseInt(b.dorsal) || 0;
            return dorsalA - dorsalB;
        });

        // Crear modal con diseño grid amplio y sin scroll
        const modalHTML = `
            <div id="modal-selector-jugador" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; align-items: center; justify-content: center; padding: 1rem; overflow-y: auto;">
                <div style="background: white; border-radius: 0.75rem; max-width: 800px; width: 100%; margin: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                    <div style="background: linear-gradient(to right, #ea580c, #f97316); color: white; padding: 1.5rem; border-radius: 0.75rem 0.75rem 0 0;">
                        <h3 style="font-size: 1.5rem; font-weight: bold; margin: 0; text-align: center;">🏀 ¿Quién anotó +${puntos}?</h3>
                    </div>

                    <div style="padding: 2rem;">
                        ${jugadores.length > 0 ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
                                ${jugadores.map(j => `
                                    <button
                                        onclick="window.registrarAnotacionGlobal('${partidoId}', '${j.nombre}', ${puntos}, ${JSON.stringify(partido).replace(/"/g, '&quot;')}, '${campo}'); document.getElementById('modal-selector-jugador').remove();"
                                        style="padding: 1rem; background: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer; text-align: center; font-weight: 600; color: #374151; transition: all 0.2s; font-size: 1rem;"
                                        onmouseover="this.style.background='#ea580c'; this.style.color='white'; this.style.borderColor='#ea580c'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(234,88,12,0.3)';"
                                        onmouseout="this.style.background='#f3f4f6'; this.style.color='#374151'; this.style.borderColor='#e5e7eb'; this.style.transform='translateY(0)'; this.style.boxShadow='none';"
                                    >
                                        <div style="font-size: 1.25rem; margin-bottom: 0.25rem;">#${j.dorsal}</div>
                                        <div style="font-size: 0.875rem;">${j.nombre}</div>
                                    </button>
                                `).join('')}
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 3rem; color: #6b7280;">
                                <p style="margin-bottom: 1rem; font-size: 1.125rem;">📋 No hay jugadores registrados aún.</p>
                                <p style="font-size: 0.875rem;">Los jugadores aparecerán aquí después de crear la primera acta.</p>
                            </div>
                        `}

                        <div style="display: flex; gap: 1rem; border-top: 1px solid #e5e7eb; padding-top: 1.5rem;">
                            <button
                                onclick="window.saltarAnotacionGlobal('${partidoId}', ${puntos}, '${campo}'); document.getElementById('modal-selector-jugador').remove();"
                                style="flex: 1; background: #6b7280; color: white; padding: 1rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: 600; font-size: 1rem; transition: background 0.2s;"
                                onmouseover="this.style.background='#4b5563';"
                                onmouseout="this.style.background='#6b7280';"
                            >
                                ⏭️ Saltar
                            </button>
                            <button
                                onclick="document.getElementById('modal-selector-jugador').remove();"
                                style="flex: 1; background: #ef4444; color: white; padding: 1rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: 600; font-size: 1rem; transition: background 0.2s;"
                                onmouseover="this.style.background='#dc2626';"
                                onmouseout="this.style.background='#ef4444';"
                            >
                                ✕ Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Agregar modal al body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Muestra el modal con todas las anotaciones del partido
     * @param {Object} partido - Datos del partido
     */
    mostrarModalAnotaciones(partido) {
        const anotaciones = partido.anotaciones || [];
        const resumen = this.app.anotacionesManager.generarResumenPorJugador(anotaciones);
        const jugadoresOrdenados = Object.values(resumen).sort((a, b) => b.totalPuntos - a.totalPuntos);

        const modalHTML = `
            <div id="modal-anotaciones" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2000; align-items: center; justify-content: center; padding: 1rem;">
                <div style="background: white; border-radius: 0.5rem; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(to right, #ea580c, #f97316); color: white; padding: 1.5rem; border-radius: 0.5rem 0.5rem 0 0; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="font-size: 1.5rem; font-weight: bold; margin: 0;">📋 Anotaciones del Partido</h3>
                        <button
                            onclick="document.getElementById('modal-anotaciones').remove();"
                            style="background: white; color: #ea580c; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold;"
                        >
                            ✕
                        </button>
                    </div>

                    <div style="padding: 1.5rem;">
                        ${anotaciones.length === 0 ? `
                            <div style="text-align: center; padding: 3rem; color: #6b7280;">
                                <div style="font-size: 3rem; margin-bottom: 1rem;">🏀</div>
                                <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">No hay anotaciones registradas</p>
                                <p style="font-size: 0.875rem;">Las anotaciones aparecerán aquí cuando se registren durante el partido.</p>
                            </div>
                        ` : `
                            <!-- Resumen por Jugador -->
                            <div style="margin-bottom: 2rem;">
                                <h4 style="font-size: 1.125rem; font-weight: bold; color: #374151; margin-bottom: 1rem; border-bottom: 2px solid #ea580c; padding-bottom: 0.5rem;">
                                    📊 Resumen por Jugador
                                </h4>
                                ${jugadoresOrdenados.map(j => `
                                    <div style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 0.75rem; border-left: 4px solid #ea580c;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                            <span style="font-weight: 700; color: #1f2937; font-size: 1.125rem;">${j.nombre}</span>
                                            <span style="background: #ea580c; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: bold; font-size: 0.875rem;">
                                                ${j.totalPuntos} pts
                                            </span>
                                        </div>
                                        <div style="font-size: 0.875rem; color: #6b7280;">
                                            ${j.anotaciones.map(a => `+${a.puntos}${a.cuarto ? ` (${a.cuarto})` : ''}`).join(', ')}
                                        </div>
                                        <div style="font-size: 0.875rem; color: #ea580c; font-weight: 600; margin-top: 0.5rem;">
                                            → Sugerencia: ${this.app.anotacionesManager.generarSugerencia(j)}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Lista Cronológica -->
                            <div>
                                <h4 style="font-size: 1.125rem; font-weight: bold; color: #374151; margin-bottom: 1rem; border-bottom: 2px solid #fb923c; padding-bottom: 0.5rem;">
                                    🕐 Cronología
                                </h4>
                                <div style="max-height: 300px; overflow-y: auto;">
                                    ${anotaciones.map(a => `
                                        <div style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <span style="font-weight: 600; color: #1f2937;">${a.jugador}</span>
                                                <span style="color: #ea580c; font-weight: bold; margin-left: 0.5rem;">+${a.puntos}</span>
                                            </div>
                                            ${a.cuarto ? `<span style="font-size: 0.75rem; color: #6b7280; background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${a.cuarto}</span>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `}

                        <button
                            onclick="document.getElementById('modal-anotaciones').remove();"
                            style="width: 100%; margin-top: 1.5rem; background: #ea580c; color: white; padding: 0.75rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: 600;"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Agregar modal al body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Genera la tab de clasificación
     * @returns {string} HTML de la tab clasificación
     */
    generarTabClasificacion() {
        let filtroFase = this.app.estadisticasManager.getFiltroFase();

        // La clasificación no debe mostrarse "todas" juntas (mezclaría fases)
        // Si el filtro global es 'todas', para clasificación usamos 'primera' por defecto
        if (filtroFase === 'todas') {
            filtroFase = 'primera';
        }

        return `
            <!-- Sub-pestañas de fases -->
            <div class="bg-white rounded-lg shadow-md mb-6 p-2 flex gap-2">
                <button
                    onclick="window.cambiarFaseClasificacion('primera')"
                    class="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-lg text-sm md:text-base font-semibold transition-colors ${filtroFase === 'primera' || filtroFase === 'todas'
                ? 'bg-yellow-400 text-gray-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }"
                >
                    🟡 1ª Fase
                </button>
                <button
                    onclick="window.cambiarFaseClasificacion('segunda')"
                    class="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-lg text-sm md:text-base font-semibold transition-colors ${filtroFase === 'segunda'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }"
                >
                    🔵 2ª Fase
                </button>
            </div>

            <!-- Contenido de clasificación -->
            ${this.mostrarClasificacion(filtroFase)}
        `;
    }

    /**
     * Muestra la tabla de clasificación según la fase
     * @param {string} fase - Fase a mostrar
     * @returns {string} HTML de la clasificación
     */
    mostrarClasificacion(faseOriginal) {
        // Asegurar que no usamos 'todas' para la tabla de clasificación
        const fase = faseOriginal === 'todas' ? 'primera' : faseOriginal;

        // Verificar si es admin
        const esAdmin = this.app && this.app.adminManager && this.app.adminManager.usuario;

        // Debug: verificar estado de admin
        console.log('🔍 mostrarClasificacion - esAdmin:', esAdmin);
        console.log('🔍 this.app:', this.app);
        console.log('🔍 this.app.adminManager:', this.app?.adminManager);
        console.log('🔍 this.app.adminManager.usuario:', this.app?.adminManager?.usuario);

        // Guardar fase actual para las funciones globales
        window.faseClasificacionActual = fase;

        // Cargar clasificación desde Firebase
        this.cargarClasificacionFirebase(fase);

        // Usar datos de constants.js como fallback mientras carga Firebase
        const clasificacion = fase === 'segunda' ? CLASIFICACION_SEGUNDA_FASE : CLASIFICACION_PRIMERA_FASE;

        return `
            <div class="bg-white rounded-lg shadow-md overflow-x-auto">
                ${esAdmin ? `
                    <div class="p-4 bg-orange-50 border-b border-orange-200 flex justify-between items-center">
                        <p class="text-sm text-gray-600">
                            <span class="font-semibold text-orange-600">Modo Admin:</span> Puedes editar la clasificación directamente desde esta tabla
                        </p>
                        <button
                            onclick="window.mostrarFormAñadirEquipoInline('${fase}')"
                            class="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
                        >
                            ➕ Añadir Equipo
                        </button>
                    </div>
                ` : ''}

                <table class="w-full text-sm md:text-base" id="tabla-clasificacion-${fase}">
                    <thead>
                        <tr class="bg-orange-500 text-white">
                            <th class="px-2 md:px-4 py-3 text-left font-bold">#</th>
                            <th class="px-2 md:px-4 py-3 text-left font-bold">Equipo</th>
                            <th class="px-2 md:px-4 py-3 text-center font-bold">J</th>
                            <th class="px-2 md:px-4 py-3 text-center font-bold">V</th>
                            <th class="px-2 md:px-4 py-3 text-center font-bold">P</th>
                            <th class="px-2 md:px-4 py-3 text-center font-bold">NP</th>
                            <th class="px-2 md:px-4 py-3 text-center font-bold">PF</th>
                            <th class="px-2 md:px-4 py-3 text-center font-bold">PC</th>
                            <th class="px-2 md:px-4 py-3 text-center font-bold hidden sm:table-cell">Dif.</th>
                            <th class="px-2 md:px-4 py-3 text-center font-bold">PTS</th>
                            ${esAdmin ? '<th class="px-2 md:px-4 py-3 text-center font-bold">Acciones</th>' : ''}
                        </tr>
                    </thead>
                    <tbody id="tbody-clasificacion-${fase}">
                        ${clasificacion.map((equipo, index) => {
            const diferencia = equipo.pf - equipo.pc;
            const esNuestroEquipo = equipo.equipo.toUpperCase().includes('MANISES') ||
                equipo.equipo.toUpperCase().includes('CBC');
            const fondoFila = esNuestroEquipo ? 'bg-orange-100' : 'bg-white';
            const colorDiferencia = diferencia > 0 ? 'text-green-600 font-bold' :
                diferencia < 0 ? 'text-red-600 font-bold' :
                    'text-gray-600';

            // Usar ID temporal para datos de constants.js (sin id real)
            const equipoId = equipo.id || `temp-${index}`;

            return `
                                <tr id="fila-${equipoId}" class="${fondoFila} border-b hover:bg-gray-50 transition-colors" data-posicion="${equipo.pos || equipo.posicion}">
                                    <td class="px-2 md:px-4 py-3 font-bold text-orange-600">${equipo.pos || equipo.posicion}</td>
                                    <td id="equipo-${equipoId}" class="px-2 md:px-4 py-3 font-semibold ${esNuestroEquipo ? 'text-orange-700' : 'text-gray-800'}">
                                        ${esNuestroEquipo ? '🏀 ' : ''}${equipo.equipo}
                                    </td>
                                    <td id="j-${equipoId}" class="px-2 md:px-4 py-3 text-center">${equipo.j}</td>
                                    <td id="v-${equipoId}" class="px-2 md:px-4 py-3 text-center text-green-600 font-semibold">${equipo.v}</td>
                                    <td id="p-${equipoId}" class="px-2 md:px-4 py-3 text-center text-red-600 font-semibold">${equipo.p}</td>
                                    <td id="np-${equipoId}" class="px-2 md:px-4 py-3 text-center">${equipo.np || 0}</td>
                                    <td id="pf-${equipoId}" class="px-2 md:px-4 py-3 text-center font-semibold">${equipo.pf}</td>
                                    <td id="pc-${equipoId}" class="px-2 md:px-4 py-3 text-center font-semibold">${equipo.pc}</td>
                                    <td class="px-2 md:px-4 py-3 text-center font-bold hidden sm:table-cell ${colorDiferencia}">
                                        ${diferencia > 0 ? '+' : ''}${diferencia}
                                    </td>
                                    <td id="pts-${equipoId}" class="px-2 md:px-4 py-3 text-center font-bold bg-orange-200 text-orange-800">${equipo.pts}</td>
                                    ${esAdmin ? `
                                        <td id="acciones-${equipoId}" class="px-2 md:px-4 py-3 text-center space-x-1">
                                            <button onclick="window.editarEquipoInline('${equipoId}')" class="text-blue-600 hover:text-blue-800 text-lg" title="Editar">✏️</button>
                                            ${index > 0 ? `<button onclick="window.subirPosicionEquipo('${equipoId}')" class="text-green-600 hover:text-green-800 text-lg" title="Subir posición">⬆️</button>` : ''}
                                            ${index < clasificacion.length - 1 ? `<button onclick="window.bajarPosicionEquipo('${equipoId}')" class="text-yellow-600 hover:text-yellow-800 text-lg" title="Bajar posición">⬇️</button>` : ''}
                                            <button onclick="if(confirm('¿Eliminar ${equipo.equipo.replace(/'/g, "\\'")} de la clasificación?')) window.eliminarEquipoClasificacionInline('${equipoId}')" class="text-red-600 hover:text-red-800 text-lg" title="Eliminar">🗑️</button>
                                        </td>
                                    ` : ''}
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Leyenda -->
            <div class="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 class="font-bold text-gray-800 mb-3">📋 Leyenda</h4>
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                    <div><strong>J:</strong> Partidos Jugados</div>
                    <div><strong>V:</strong> Victorias</div>
                    <div><strong>P:</strong> Derrotas</div>
                    <div><strong>NP:</strong> No Presentado</div>
                    <div><strong>PF:</strong> Puntos a Favor</div>
                    <div><strong>PC:</strong> Puntos en Contra</div>
                    <div><strong>Dif.:</strong> Diferencia (PF-PC)</div>
                    <div><strong>PTS:</strong> Puntos de Clasificación</div>
                </div>
            </div>
        `;
    }

    /**
     * Carga la clasificación desde Firebase y actualiza la tabla dinámicamente
     * @param {string} fase - Fase a cargar
     */
    async cargarClasificacionFirebase(fase) {
        if (!this.app || !this.app.clasificacionManager) return;

        try {
            const clasificaciones = await this.app.clasificacionManager.obtenerClasificacionesUnaVez(fase);

            // Verificar si es admin
            const esAdmin = this.app.adminManager && this.app.adminManager.usuario;

            // Debug
            console.log('🔍 cargarClasificacionFirebase - esAdmin:', esAdmin);
            console.log('🔍 clasificaciones desde Firebase:', clasificaciones.length, 'equipos');

            if (clasificaciones && clasificaciones.length > 0) {
                // Actualizar tbody
                const tbody = document.getElementById(`tbody-clasificacion-${fase}`);
                if (!tbody) return;

                // Si es admin, asegurarse de que la cabecera tenga la columna "Acciones" y el banner
                if (esAdmin) {
                    // Añadir banner de admin si no existe
                    const tabla = document.getElementById(`tabla-clasificacion-${fase}`);
                    if (tabla) {
                        const contenedor = tabla.parentElement;
                        const tieneBannerAdmin = contenedor.querySelector('.bg-orange-50');
                        if (!tieneBannerAdmin) {
                            const banner = document.createElement('div');
                            banner.className = 'p-4 bg-orange-50 border-b border-orange-200 flex justify-between items-center';
                            banner.innerHTML = `
                                <p class="text-sm text-gray-600">
                                    <span class="font-semibold text-orange-600">Modo Admin:</span> Puedes editar la clasificación directamente desde esta tabla
                                </p>
                                <button
                                    onclick="window.mostrarFormAñadirEquipoInline('${fase}')"
                                    class="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors"
                                >
                                    ➕ Añadir Equipo
                                </button>
                            `;
                            contenedor.insertBefore(banner, tabla);
                            console.log('✅ Banner de admin añadido');
                        }

                        // Añadir columna "Acciones" en thead si no existe
                        const thead = tabla.querySelector('thead tr');
                        const tieneColumnaAcciones = thead.querySelector('th:last-child')?.textContent.includes('Acciones');
                        if (!tieneColumnaAcciones) {
                            const thAcciones = document.createElement('th');
                            thAcciones.className = 'px-2 md:px-4 py-3 text-center font-bold';
                            thAcciones.textContent = 'Acciones';
                            thead.appendChild(thAcciones);
                            console.log('✅ Columna "Acciones" añadida al thead (Firebase path)');
                        }
                    }
                }

                tbody.innerHTML = clasificaciones.map((equipo, index) => {
                    const diferencia = equipo.pf - equipo.pc;
                    const esNuestroEquipo = equipo.equipo.toUpperCase().includes('MANISES') ||
                        equipo.equipo.toUpperCase().includes('CBC');
                    const fondoFila = esNuestroEquipo ? 'bg-orange-100' : 'bg-white';
                    const colorDiferencia = diferencia > 0 ? 'text-green-600 font-bold' :
                        diferencia < 0 ? 'text-red-600 font-bold' :
                            'text-gray-600';

                    return `
                        <tr id="fila-${equipo.id}" class="${fondoFila} border-b hover:bg-gray-50 transition-colors" data-posicion="${equipo.posicion}">
                            <td class="px-2 md:px-4 py-3 font-bold text-orange-600">${equipo.posicion}</td>
                            <td id="equipo-${equipo.id}" class="px-2 md:px-4 py-3 font-semibold ${esNuestroEquipo ? 'text-orange-700' : 'text-gray-800'}">
                                ${esNuestroEquipo ? '🏀 ' : ''}${equipo.equipo}
                            </td>
                            <td id="j-${equipo.id}" class="px-2 md:px-4 py-3 text-center">${equipo.j}</td>
                            <td id="v-${equipo.id}" class="px-2 md:px-4 py-3 text-center text-green-600 font-semibold">${equipo.v}</td>
                            <td id="p-${equipo.id}" class="px-2 md:px-4 py-3 text-center text-red-600 font-semibold">${equipo.p}</td>
                            <td id="np-${equipo.id}" class="px-2 md:px-4 py-3 text-center">${equipo.np || 0}</td>
                            <td id="pf-${equipo.id}" class="px-2 md:px-4 py-3 text-center font-semibold">${equipo.pf}</td>
                            <td id="pc-${equipo.id}" class="px-2 md:px-4 py-3 text-center font-semibold">${equipo.pc}</td>
                            <td class="px-2 md:px-4 py-3 text-center font-bold hidden sm:table-cell ${colorDiferencia}">
                                ${diferencia > 0 ? '+' : ''}${diferencia}
                            </td>
                            <td id="pts-${equipo.id}" class="px-2 md:px-4 py-3 text-center font-bold bg-orange-200 text-orange-800">${equipo.pts}</td>
                            ${esAdmin ? `
                                <td id="acciones-${equipo.id}" class="px-2 md:px-4 py-3 text-center space-x-1">
                                    <button onclick="window.editarEquipoInline('${equipo.id}')" class="text-blue-600 hover:text-blue-800 text-lg" title="Editar">✏️</button>
                                    ${index > 0 ? `<button onclick="window.subirPosicionEquipo('${equipo.id}')" class="text-green-600 hover:text-green-800 text-lg" title="Subir posición">⬆️</button>` : ''}
                                    ${index < clasificaciones.length - 1 ? `<button onclick="window.bajarPosicionEquipo('${equipo.id}')" class="text-yellow-600 hover:text-yellow-800 text-lg" title="Bajar posición">⬇️</button>` : ''}
                                    <button onclick="if(confirm('¿Eliminar ${equipo.equipo.replace(/'/g, "\\'")} de la clasificación?')) window.eliminarEquipoClasificacionInline('${equipo.id}')" class="text-red-600 hover:text-red-800 text-lg" title="Eliminar">🗑️</button>
                                </td>
                            ` : ''}
                        </tr>
                    `;
                }).join('');

                console.log(`✅ Clasificación de ${fase} fase actualizada desde Firebase (${clasificaciones.length} equipos)`);
            } else {
                // No hay datos en Firebase
                console.log('⚠️ No hay datos en Firebase para la clasificación de', fase, 'fase');

                if (esAdmin) {
                    // Si es admin y no hay datos, mostrar pantalla de migración/añadir
                    const contenedor = document.querySelector(`#tabla-clasificacion-${fase}`)?.parentElement;
                    if (!contenedor) return;

                    // Reemplazar todo el contenedor con la pantalla de estado vacío
                    contenedor.innerHTML = `
                        <div class="bg-white rounded-lg shadow-md p-8 text-center">
                            <div class="mb-6">
                                <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                            </div>

                            <h3 class="text-2xl font-bold text-gray-800 mb-4">📊 Clasificación Vacía</h3>

                            <p class="text-gray-600 mb-8">
                                No hay equipos en la base de datos para ${fase === 'primera' ? 'la primera fase' : 'la segunda fase'}.
                            </p>

                            ${fase === 'primera' ? `
                                <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                                    <h4 class="font-bold text-blue-800 mb-3">💡 ¿Primera vez configurando?</h4>
                                    <p class="text-sm text-blue-700 mb-4">
                                        Los datos finales de la 1ª fase están listos para migrar desde el código.
                                        <br>
                                        Incluye los 6 equipos del Grupo D con sus estadísticas finales.
                                    </p>
                                    <button
                                        onclick="window.migrarClasificacionAFirebase()"
                                        class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                                    >
                                        📤 Migrar Datos de 1ª Fase a Firebase
                                    </button>
                                    <p class="text-xs text-gray-600 mt-3">
                                        Esto copiará los 6 equipos finales de la 1ª fase a la base de datos
                                    </p>
                                </div>

                                <div class="text-gray-500 text-sm">
                                    <p>O también puedes:</p>
                                </div>
                            ` : ''}

                            <div class="mt-6">
                                <button
                                    onclick="window.mostrarFormAñadirEquipoInline('${fase}')"
                                    class="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
                                >
                                    ➕ Añadir Equipos Manualmente
                                </button>
                            </div>

                            ${fase === 'segunda' ? `
                                <p class="text-sm text-gray-500 mt-4">
                                    Añade los equipos de la segunda fase uno por uno
                                </p>
                            ` : `
                                <p class="text-sm text-gray-500 mt-4">
                                    Añade equipos personalizados si la migración no es apropiada
                                </p>
                            `}
                        </div>
                    `;

                    console.log(`✅ Pantalla de estado vacío mostrada para ${fase} fase`);
                } else {
                    // Si no es admin, mostrar mensaje de "sin datos" para usuarios públicos
                    const contenedor = document.querySelector(`#tabla-clasificacion-${fase}`)?.parentElement;
                    if (!contenedor) return;

                    contenedor.innerHTML = `
                        <div class="bg-white rounded-lg shadow-md p-8 text-center">
                            <h3 class="text-xl font-bold text-gray-800 mb-4">📊 Clasificación No Disponible</h3>
                            <p class="text-gray-600">
                                La clasificación de ${fase === 'primera' ? 'la primera fase' : 'la segunda fase'} aún no ha sido publicada.
                            </p>
                            <p class="text-sm text-gray-500 mt-4">
                                Vuelve pronto para ver los resultados
                            </p>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('❌ Error cargando clasificación desde Firebase:', error);
        }
    }
}

// Exportar instancia singleton
const uiManager = new UIManager();
export default uiManager;
