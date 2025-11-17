/**
 * UI Manager - Gestión de la Interfaz de Usuario
 *
 * Este módulo maneja toda la lógica de renderizado y manipulación del DOM.
 * Separa completamente la presentación de la lógica de negocio.
 */

import { formatearFecha, formatearFechaCorta } from './utils.js';
import { INFO_EQUIPO, URLS, JUGADORES_EQUIPO } from './constants.js';
import { UBICACIONES } from './config.js';

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
        console.log('🎨 UIManager inicializado');
    }

    /**
     * Renderiza toda la aplicación
     */
    renderizar() {
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            console.error('❌ No se encontró el contenedor #app');
            return;
        }

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
    }

    /**
     * Configura los event listeners del panel de administración
     */
    configurarEventListenersAdmin() {
        // Reiniciar datos temporales
        this.jugadoresActaTemporal = [];
        this.partidoSeleccionadoActa = null;

        // === FORMULARIO AÑADIR PARTIDO ===
        const formPartido = document.getElementById('form-añadir-partido');
        if (formPartido) {
            formPartido.addEventListener('submit', async (e) => {
                e.preventDefault();

                const ubicacionSeleccionada = document.getElementById('ubicacion').value;
                const ubicacionConfig = UBICACIONES.find(u => u.nombre === ubicacionSeleccionada);
                const esLocal = ubicacionConfig ? ubicacionConfig.esLocal : true;

                const data = {
                    fecha: document.getElementById('fecha').value,
                    hora: document.getElementById('hora').value,
                    rival: document.getElementById('rival').value,
                    esLocal: esLocal,
                    ubicacion: ubicacionSeleccionada,
                    jornada: document.getElementById('jornada').value,
                    finalizado: false,
                    enDirecto: false,
                    resultadoLocal: '',
                    resultadoVisitante: '',
                    cuartoActual: ''
                };

                console.log('📝 Datos del formulario:', data);

                try {
                    await window.añadirPartidoGlobal(data);
                    e.target.reset();
                } catch (error) {
                    console.error('❌ Error al añadir partido:', error);
                    alert('❌ Error: ' + error.message);
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
                        console.log(`✅ ${this.jugadoresActaTemporal.length} jugadores cargados automáticamente`);
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
                    alert('⚠️ Dorsal y nombre son obligatorios');
                    return;
                }

                // Añadir a la lista
                this.jugadoresActaTemporal.push(jugador);
                console.log('➕ Jugador añadido:', jugador);

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
                    alert('⚠️ Selecciona un partido');
                    return;
                }

                if (this.jugadoresActaTemporal.length === 0) {
                    alert('⚠️ Añade al menos un jugador al acta');
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

                    alert('✅ Acta guardada correctamente');
                } catch (error) {
                    console.error('❌ Error al guardar acta:', error);
                    alert('❌ Error: ' + error.message);
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

        console.log('✅ Event listeners del panel admin configurados');
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

        return `
            <div class="min-h-screen flex flex-col">
                ${this.generarHeader(isAdmin, showAdminPanel)}

                <div class="flex-1 max-w-4xl mx-auto p-4 w-full">
                    ${showAdminPanel
                        ? this.generarPanelAdmin(estado)
                        : this.generarContenidoPrincipal(estado)
                    }
                </div>

                ${this.generarFooter()}
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
                            <a href="mailto:cbcmanisesweb@gmail.com" class="text-orange-400 hover:text-orange-300 font-semibold">
                                cbcmanisesweb@gmail.com
                            </a>
                        </p>
                    </div>

                    <!-- Separador -->
                    <div class="border-t border-gray-700 my-6"></div>

                    <!-- Información de temporada -->
                    <div class="text-center">
                        <p class="text-sm text-gray-400">
                            🏀 <strong class="text-white">Temporada 2025/26</strong> • Preferente Cadete Masculino Grupo D
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
                if (a.jornada && b.jornada) {
                    const jornadaA = parseInt(a.jornada);
                    const jornadaB = parseInt(b.jornada);
                    if (jornadaA !== jornadaB) return jornadaA - jornadaB;
                }
                return new Date(a.fecha) - new Date(b.fecha);
            });

        const partidosFinalizados = partidos
            .filter(p => p.finalizado)
            .sort((a, b) => {
                if (a.jornada && b.jornada) {
                    const jornadaA = parseInt(a.jornada);
                    const jornadaB = parseInt(b.jornada);
                    if (jornadaA !== jornadaB) return jornadaB - jornadaA;
                }
                return new Date(b.fecha) - new Date(a.fecha);
            });

        return `
            <!-- Tabs de navegación -->
            <div class="bg-white rounded-lg shadow-md mb-6 p-2 flex gap-2">
                <button
                    onclick="window.cambiarTab('calendario')"
                    class="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-colors ${
                        activeTab === 'calendario'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }"
                >
                    📅<span class="hidden xs:inline sm:hidden"> </span><span class="hidden sm:inline"> Calendario</span><span class="sm:hidden xs:inline">Cal</span>
                </button>
                <button
                    onclick="window.cambiarTab('resultados')"
                    class="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-colors ${
                        activeTab === 'resultados'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }"
                >
                    🏆<span class="hidden xs:inline sm:hidden"> </span><span class="hidden sm:inline"> Resultados</span><span class="sm:hidden xs:inline">Res</span>
                </button>
                <button
                    onclick="window.cambiarTab('estadisticas')"
                    class="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-colors ${
                        activeTab === 'estadisticas'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }"
                >
                    📊<span class="hidden xs:inline sm:hidden"> </span><span class="hidden sm:inline"> Estadísticas</span><span class="sm:hidden xs:inline">Est</span>
                </button>
            </div>

            <!-- Contenido de la tab activa -->
            ${activeTab === 'calendario' ? this.generarTabCalendario(partidosCalendario, actas, estado.isAdmin) : ''}
            ${activeTab === 'resultados' ? this.generarTabResultados(partidosFinalizados, actas, estado.isAdmin) : ''}
            ${activeTab === 'estadisticas' ? this.generarTabEstadisticas(actas, datosJugadores, jugadorSeleccionado) : ''}
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
        if (partidos.length === 0) {
            return `
                <div class="bg-white rounded-lg shadow-md p-8 text-center">
                    <div class="text-6xl mb-4">🏆</div>
                    <h3 class="text-xl font-bold text-gray-700 mb-2">No hay resultados aún</h3>
                    <p class="text-gray-500">Los resultados aparecerán aquí una vez finalizados los partidos</p>
                </div>
            `;
        }

        return `
            <div>
                <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">🏆 Resultados</h3>
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
        if (!actas || actas.length === 0) {
            return `
                <div class="bg-white rounded-lg shadow-md p-8 text-center">
                    <div class="text-6xl mb-4">📊</div>
                    <h3 class="text-xl font-bold text-gray-700 mb-2">No hay estadísticas disponibles</h3>
                    <p class="text-gray-500">Las estadísticas aparecerán cuando se registren las actas de los partidos</p>
                </div>
            `;
        }

        const jugadores = Object.values(datosJugadores).sort((a, b) => b.totalPts - a.totalPts);

        return `
            <div class="space-y-6">
                <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">📊 Estadísticas de la Temporada</h3>

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
                ${jugadorSeleccionado ? `
                    <div class="bg-white rounded-lg shadow-md p-4 md:p-6">
                        <h4 class="text-lg md:text-xl font-bold text-gray-800 mb-4">
                            👤 Estadísticas de ${jugadorSeleccionado}
                        </h4>

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
                ` : ''}
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
            <div class="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4">
                ${partido.jornada ? `
                    <div class="text-center mb-4">
                        <span class="bg-orange-500 text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-bold">
                            Jornada ${partido.jornada}
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

                ${partido.finalizado && tieneActa ? `
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <button onclick="window.verActaGlobal('${partido.id}')" class="w-full bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700">
                            📊 Ver Acta Oficial
                        </button>
                    </div>
                ` : partido.finalizado && partido.sinActa ? `
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <div class="bg-orange-100 border-l-4 border-orange-500 p-4 rounded-lg">
                            <div class="flex items-start gap-3">
                                <span class="text-xl">⚠️</span>
                                <div>
                                    <p class="font-bold text-orange-800 text-sm">Acta no disponible (incidencia técnica)</p>
                                    <p class="text-xs text-orange-700 mt-1">
                                        El acta del encuentro no pudo emitirse por una incidencia técnica. Como consecuencia, no se publicarán las estadísticas de este partido en la jornada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}

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

                ${isAdmin ? `
                    <div class="mt-4 flex gap-2 justify-center">
                        <button onclick="window.editarPartidoGlobal('${partido.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm">✏️ Editar</button>
                        <button onclick="window.eliminarPartidoGlobal('${partido.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm">🗑️ Eliminar</button>
                    </div>
                ` : ''}
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
                            <select id="ubicacion" required class="w-full border rounded px-3 py-2">
                                <option value="">Seleccionar pabellón...</option>
                                <option value="Pabellón Alberto Arnal (Manises)">🏠 Pabellón Alberto Arnal (Manises) - LOCAL</option>
                                <option value="Pabellón Municipal Picanya">🚗 Pabellón Municipal Picanya</option>
                                <option value="Pabellón El Vedat (Torrent)">🚗 Pabellón El Vedat (Torrent)</option>
                                <option value="Pabellón El Quint (Mislata)">🚗 Pabellón El Quint (Mislata)</option>
                                <option value="Pabellón Badia Pedretera (Moncada)">🚗 Pabellón Badia Pedretera (Moncada)</option>
                                <option value="Pabellón Benimaclet (Valencia)">🚗 Pabellón Benimaclet (Valencia)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Rival</label>
                            <select id="rival" required class="w-full border rounded px-3 py-2">
                                <option value="">Seleccionar equipo...</option>
                                <option value="Picanya Bàsquet FuturPiso 10">Picanya Bàsquet FuturPiso 10</option>
                                <option value="Isolia NB Torrent B">Isolia NB Torrent B</option>
                                <option value="Mislata BC Verde">Mislata BC Verde</option>
                                <option value="CB Moncada A">CB Moncada A</option>
                                <option value="Picken MA A">Picken MA A</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
                            <input type="number" id="jornada" required min="1" class="w-full border rounded px-3 py-2">
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
            </div>
        `;
    }
}

// Exportar instancia singleton
const uiManager = new UIManager();
export default uiManager;
