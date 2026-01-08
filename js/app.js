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
import ClasificacionManager from './clasificacion.js';
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

        this.clasificacionManager = new ClasificacionManager(this.db);

        this.adminManager = new AdminManager(
            this.app,
            (isAdmin) => this.onAuthChange(isAdmin)
        );

        // Vincular adminManager con la instancia de la app (para re-render post-auth)
        this.adminManager.setAppInstance(this);

        // Inicializar UI Manager
        uiManager.inicializar(this);

        // Cargar filtro de fase desde localStorage
        const filtroGuardado = localStorage.getItem('filtroFase');
        if (filtroGuardado) {
            this.estadisticasManager.setFiltroFase(filtroGuardado);
        } else {
            // Por defecto, mostrar temporada completa
            this.estadisticasManager.setFiltroFase('todas');
            localStorage.setItem('filtroFase', 'todas');
        }

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
     * @param {string} tab - Nombre de la pestaña ('calendario', 'resultados', 'estadisticas', 'clasificacion')
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
     * Cambia la fase en la tab de clasificación
     * @param {string} fase - Fase ('primera', 'segunda')
     */
    cambiarFaseClasificacion(fase) {
        console.log(`🏅 Fase clasificación: ${fase}`);
        this.estadisticasManager.setFiltroFase(fase);
        localStorage.setItem('filtroFase', fase);
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
window.app = app;
window.uiManager = uiManager;

// Funciones globales para compatibilidad con el HTML actual
// Estas serán llamadas desde los event handlers del HTML

// === FUNCIONES DE NAVEGACIÓN ===
window.cambiarTab = (tab) => app.cambiarTab(tab);
window.cambiarFaseClasificacion = (fase) => app.cambiarFaseClasificacion(fase);
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
        await window.app.partidosManager.añadirPartido(data);
        alert('✅ Partido añadido correctamente');
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
};

window.actualizarPartidoGlobal = async (id, data) => {
    try {
        await window.app.partidosManager.actualizarPartido(id, data);
        alert('✅ Partido actualizado correctamente');
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }
};

// === FUNCIÓN PARA UBICACIÓN PERSONALIZADA ===
window.toggleUbicacionCustom = function() {
    const checkbox = document.getElementById('ubicacion-custom-checkbox');
    const container = document.getElementById('ubicacion-custom-container');
    const select = document.getElementById('ubicacion');

    console.log('🔧 toggleUbicacionCustom called');
    console.log('  - Checkbox:', checkbox);
    console.log('  - Checked:', checkbox?.checked);
    console.log('  - Container:', container);

    if (checkbox && checkbox.checked) {
        if (container) {
            container.classList.remove('hidden');
            console.log('  ✅ Container mostrado (hidden removed)');
            console.log('  - Container classes:', container.className);
        }
        if (select) {
            select.disabled = true;
            select.classList.add('opacity-50');
            console.log('  ✅ Select deshabilitado');
        }
    } else {
        if (container) {
            container.classList.add('hidden');
            console.log('  ❌ Container oculto (hidden added)');
        }
        if (select) {
            select.disabled = false;
            select.classList.remove('opacity-50');
            console.log('  ✅ Select habilitado');
        }
        const customInput = document.getElementById('ubicacion-custom');
        if (customInput) customInput.value = '';
    }
};

// Función similar para el modal de editar
window.toggleUbicacionCustomEditar = function() {
    const checkbox = document.getElementById('editar-ubicacion-custom-checkbox');
    const container = document.getElementById('editar-ubicacion-custom-container');
    const select = document.getElementById('editar-ubicacion');

    console.log('🔧 toggleUbicacionCustomEditar called');
    console.log('  - Checkbox:', checkbox);
    console.log('  - Checked:', checkbox?.checked);
    console.log('  - Container:', container);

    if (checkbox && checkbox.checked) {
        // El modal usa inline styles, no clases
        if (container) {
            container.style.display = 'block';
            console.log('  ✅ Container mostrado (display: block)');
        }
        if (select) {
            select.disabled = true;
            select.classList.add('opacity-50');
            console.log('  ✅ Select deshabilitado');
        }
    } else {
        if (container) {
            container.style.display = 'none';
            console.log('  ❌ Container oculto (display: none)');
        }
        if (select) {
            select.disabled = false;
            select.classList.remove('opacity-50');
            console.log('  ✅ Select habilitado');
        }
        const customInput = document.getElementById('editar-ubicacion-custom');
        if (customInput) customInput.value = '';
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

// ============================================
// FUNCIONES INLINE DE CLASIFICACIÓN (TAB)
// ============================================

/**
 * Editar equipo inline (convierte fila en inputs)
 */
window.editarEquipoInline = async (id) => {
    try {
        const fase = window.faseClasificacionActual || 'primera';
        const clasificaciones = await window.app.clasificacionManager.obtenerClasificacionesUnaVez(fase);
        const equipo = clasificaciones.find(e => e.id === id);

        if (!equipo) {
            alert('❌ Equipo no encontrado');
            return;
        }

        // Guardar valores originales para cancelar
        window.equipoEditandoOriginal = { ...equipo };

        // Convertir celdas en inputs
        document.getElementById(`equipo-${id}`).innerHTML = `
            <input type="text" value="${equipo.equipo}" id="input-equipo-${id}" class="border rounded px-2 py-1 w-full text-sm">
        `;
        document.getElementById(`j-${id}`).innerHTML = `
            <input type="number" value="${equipo.j}" id="input-j-${id}" class="border rounded px-2 py-1 w-16 text-center text-sm" min="0">
        `;
        document.getElementById(`v-${id}`).innerHTML = `
            <input type="number" value="${equipo.v}" id="input-v-${id}" class="border rounded px-2 py-1 w-16 text-center text-sm" min="0">
        `;
        document.getElementById(`p-${id}`).innerHTML = `
            <input type="number" value="${equipo.p}" id="input-p-${id}" class="border rounded px-2 py-1 w-16 text-center text-sm" min="0">
        `;
        document.getElementById(`np-${id}`).innerHTML = `
            <input type="number" value="${equipo.np || 0}" id="input-np-${id}" class="border rounded px-2 py-1 w-16 text-center text-sm" min="0">
        `;
        document.getElementById(`pf-${id}`).innerHTML = `
            <input type="number" value="${equipo.pf}" id="input-pf-${id}" class="border rounded px-2 py-1 w-16 text-center text-sm" min="0">
        `;
        document.getElementById(`pc-${id}`).innerHTML = `
            <input type="number" value="${equipo.pc}" id="input-pc-${id}" class="border rounded px-2 py-1 w-16 text-center text-sm" min="0">
        `;
        document.getElementById(`pts-${id}`).innerHTML = `
            <input type="number" value="${equipo.pts}" id="input-pts-${id}" class="border rounded px-2 py-1 w-16 text-center text-sm font-bold" min="0">
        `;

        // Cambiar botones de acciones
        document.getElementById(`acciones-${id}`).innerHTML = `
            <button onclick="window.guardarEdicionInline('${id}')" class="text-green-600 hover:text-green-800 text-xl" title="Guardar">✅</button>
            <button onclick="window.cancelarEdicionInline('${id}')" class="text-red-600 hover:text-red-800 text-xl" title="Cancelar">❌</button>
        `;

        console.log('✏️ Modo edición activado para:', equipo.equipo);
    } catch (error) {
        console.error('❌ Error al editar equipo:', error);
        alert('❌ Error: ' + error.message);
    }
};

/**
 * Guardar edición inline
 */
window.guardarEdicionInline = async (id) => {
    try {
        const data = {
            equipo: document.getElementById(`input-equipo-${id}`).value,
            posicion: parseInt(document.querySelector(`#fila-${id}`).dataset.posicion),
            j: parseInt(document.getElementById(`input-j-${id}`).value),
            v: parseInt(document.getElementById(`input-v-${id}`).value),
            p: parseInt(document.getElementById(`input-p-${id}`).value),
            np: parseInt(document.getElementById(`input-np-${id}`).value) || 0,
            pf: parseInt(document.getElementById(`input-pf-${id}`).value),
            pc: parseInt(document.getElementById(`input-pc-${id}`).value),
            pts: parseInt(document.getElementById(`input-pts-${id}`).value)
        };

        console.log('💾 Guardando edición:', data);
        await window.app.clasificacionManager.actualizarEquipoClasificacion(id, data);

        // Recargar tabla
        const fase = window.faseClasificacionActual || 'primera';
        await window.uiManager.cargarClasificacionFirebase(fase);

        console.log('✅ Equipo actualizado correctamente');
    } catch (error) {
        console.error('❌ Error guardando edición:', error);
        alert('❌ Error: ' + error.message);
    }
};

/**
 * Cancelar edición inline
 */
window.cancelarEdicionInline = async (id) => {
    const fase = window.faseClasificacionActual || 'primera';
    await window.uiManager.cargarClasificacionFirebase(fase);
    console.log('❌ Edición cancelada');
};

/**
 * Subir posición de un equipo
 */
window.subirPosicionEquipo = async (id) => {
    try {
        const fase = window.faseClasificacionActual || 'primera';
        const clasificaciones = await window.app.clasificacionManager.obtenerClasificacionesUnaVez(fase);
        const equipo = clasificaciones.find(e => e.id === id);

        if (!equipo || equipo.posicion === 1) return;

        const equipoArriba = clasificaciones.find(e => e.posicion === equipo.posicion - 1);

        if (equipoArriba) {
            console.log(`⬆️ Subiendo ${equipo.equipo} de posición ${equipo.posicion} a ${equipo.posicion - 1}`);

            await window.app.clasificacionManager.actualizarEquipoClasificacion(id, { ...equipo, posicion: equipo.posicion - 1 });
            await window.app.clasificacionManager.actualizarEquipoClasificacion(equipoArriba.id, { ...equipoArriba, posicion: equipoArriba.posicion + 1 });

            await window.uiManager.cargarClasificacionFirebase(fase);
        }
    } catch (error) {
        console.error('❌ Error al subir posición:', error);
        alert('❌ Error: ' + error.message);
    }
};

/**
 * Bajar posición de un equipo
 */
window.bajarPosicionEquipo = async (id) => {
    try {
        const fase = window.faseClasificacionActual || 'primera';
        const clasificaciones = await window.app.clasificacionManager.obtenerClasificacionesUnaVez(fase);
        const equipo = clasificaciones.find(e => e.id === id);

        if (!equipo) return;

        const equipoAbajo = clasificaciones.find(e => e.posicion === equipo.posicion + 1);

        if (equipoAbajo) {
            console.log(`⬇️ Bajando ${equipo.equipo} de posición ${equipo.posicion} a ${equipo.posicion + 1}`);

            await window.app.clasificacionManager.actualizarEquipoClasificacion(id, { ...equipo, posicion: equipo.posicion + 1 });
            await window.app.clasificacionManager.actualizarEquipoClasificacion(equipoAbajo.id, { ...equipoAbajo, posicion: equipoAbajo.posicion - 1 });

            await window.uiManager.cargarClasificacionFirebase(fase);
        }
    } catch (error) {
        console.error('❌ Error al bajar posición:', error);
        alert('❌ Error: ' + error.message);
    }
};

/**
 * Eliminar equipo inline
 */
window.eliminarEquipoClasificacionInline = async (id) => {
    try {
        console.log('🗑️ Eliminando equipo:', id);
        await window.app.clasificacionManager.eliminarEquipoClasificacion(id);

        const fase = window.faseClasificacionActual || 'primera';
        await window.uiManager.cargarClasificacionFirebase(fase);

        console.log('✅ Equipo eliminado');
    } catch (error) {
        console.error('❌ Error eliminando equipo:', error);
        alert('❌ Error: ' + error.message);
    }
};

/**
 * Mostrar formulario para añadir equipo inline
 */
window.mostrarFormAñadirEquipoInline = async (fase) => {
    try {
        const clasificaciones = await window.app.clasificacionManager.obtenerClasificacionesUnaVez(fase);
        const nuevaPosicion = clasificaciones.length + 1;
        let tbody = document.getElementById(`tbody-clasificacion-${fase}`);

        // Si no existe tbody (porque se mostró la pantalla vacía), crear la tabla completa
        if (!tbody) {
            console.log('🔄 Creando tabla de clasificación desde cero...');
            const contenedor = document.querySelector('.bg-white.rounded-lg.shadow-md');
            if (!contenedor) return;

            contenedor.innerHTML = `
                <div class="p-4 bg-orange-50 border-b border-orange-200 flex justify-between items-center">
                    <p class="text-sm text-gray-600">
                        <span class="font-semibold text-orange-600">Modo Admin:</span> Puedes editar la clasificación directamente desde esta tabla
                    </p>
                </div>

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
                            <th class="px-2 md:px-4 py-3 text-center font-bold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-clasificacion-${fase}">
                    </tbody>
                </table>
            `;

            tbody = document.getElementById(`tbody-clasificacion-${fase}`);
        }

        // Añadir fila con inputs al final
        const nuevaFila = document.createElement('tr');
        nuevaFila.id = 'fila-nuevo-equipo';
        nuevaFila.className = 'bg-green-50 border-2 border-green-400';
        nuevaFila.innerHTML = `
            <td class="px-2 md:px-4 py-3 font-bold text-orange-600">${nuevaPosicion}</td>
            <td class="px-2 md:px-4 py-3">
                <input type="text" id="nuevo-equipo" placeholder="Nombre del equipo" class="border rounded px-2 py-1 w-full text-sm" required>
            </td>
            <td class="px-2 md:px-4 py-3">
                <input type="number" id="nuevo-j" value="0" class="border rounded px-2 py-1 w-16 text-center text-sm" min="0">
            </td>
            <td class="px-2 md:px-4 py-3">
                <input type="number" id="nuevo-v" value="0" class="border rounded px-2 py-1 w-16 text-center text-sm" min="0">
            </td>
            <td class="px-2 md:px-4 py-3">
                <input type="number" id="nuevo-p" value="0" class="border rounded px-2 py-1 w-16 text-center text-sm" min="0">
            </td>
            <td class="px-2 md:px-4 py-3">
                <input type="number" id="nuevo-np" value="0" class="border rounded px-2 py-1 w-16 text-center text-sm" min="0">
            </td>
            <td class="px-2 md:px-4 py-3">
                <input type="number" id="nuevo-pf" value="0" class="border rounded px-2 py-1 w-16 text-center text-sm" min="0">
            </td>
            <td class="px-2 md:px-4 py-3">
                <input type="number" id="nuevo-pc" value="0" class="border rounded px-2 py-1 w-16 text-center text-sm" min="0">
            </td>
            <td class="px-2 md:px-4 py-3 text-center hidden sm:table-cell">-</td>
            <td class="px-2 md:px-4 py-3">
                <input type="number" id="nuevo-pts" value="0" class="border rounded px-2 py-1 w-16 text-center text-sm font-bold" min="0">
            </td>
            <td class="px-2 md:px-4 py-3 text-center space-x-1">
                <button onclick="window.guardarNuevoEquipoInline('${fase}', ${nuevaPosicion})" class="text-green-600 hover:text-green-800 text-xl" title="Guardar">✅</button>
                <button onclick="window.cancelarNuevoEquipoInline()" class="text-red-600 hover:text-red-800 text-xl" title="Cancelar">❌</button>
            </td>
        `;

        tbody.appendChild(nuevaFila);
        document.getElementById('nuevo-equipo').focus();
    } catch (error) {
        console.error('❌ Error mostrando formulario:', error);
    }
};

/**
 * Guardar nuevo equipo inline
 */
window.guardarNuevoEquipoInline = async (fase, posicion) => {
    try {
        const equipo = document.getElementById('nuevo-equipo').value.trim();

        if (!equipo) {
            alert('⚠️ El nombre del equipo es obligatorio');
            return;
        }

        const data = {
            equipo,
            fase,
            posicion,
            j: parseInt(document.getElementById('nuevo-j').value) || 0,
            v: parseInt(document.getElementById('nuevo-v').value) || 0,
            p: parseInt(document.getElementById('nuevo-p').value) || 0,
            np: parseInt(document.getElementById('nuevo-np').value) || 0,
            pf: parseInt(document.getElementById('nuevo-pf').value) || 0,
            pc: parseInt(document.getElementById('nuevo-pc').value) || 0,
            pts: parseInt(document.getElementById('nuevo-pts').value) || 0
        };

        console.log('➕ Añadiendo nuevo equipo:', data);
        await window.app.clasificacionManager.añadirEquipoClasificacion(data);

        // Eliminar fila del formulario
        const fila = document.getElementById('fila-nuevo-equipo');
        if (fila) fila.remove();

        await window.uiManager.cargarClasificacionFirebase(fase);

        console.log('✅ Nuevo equipo añadido');
    } catch (error) {
        console.error('❌ Error añadiendo equipo:', error);
        alert('❌ Error: ' + error.message);
    }
};

/**
 * Cancelar nuevo equipo inline
 */
window.cancelarNuevoEquipoInline = () => {
    const fila = document.getElementById('fila-nuevo-equipo');
    if (fila) fila.remove();
    console.log('❌ Añadir equipo cancelado');
};

/**
 * Migrar clasificación de constants.js a Firebase (ejecutar UNA VEZ)
 * Solo para 1ª fase - datos finales de la fase regular
 */
window.migrarClasificacionAFirebase = async () => {
    if (!confirm('⚠️ ¿Migrar clasificación de 1ª fase a Firebase?\n\nEsto añadirá los 6 equipos a la base de datos.\n\n¿Continuar?')) {
        return;
    }

    try {
        console.log('📤 Iniciando migración de clasificación de 1ª fase...');

        // Datos finales de 1ª fase (Grupo D - Preferente Cadete Masculino)
        const primeraFase = [
            { equipo: 'PICKEN MA A', posicion: 1, j: 10, v: 10, p: 0, np: 0, pf: 715, pc: 352, pts: 20 },
            { equipo: 'PICANYA BASQUET FUTURPISO 10', posicion: 2, j: 10, v: 6, p: 4, np: 0, pf: 627, pc: 606, pts: 16 },
            { equipo: 'CB MONCADA "A"', posicion: 3, j: 10, v: 5, p: 5, np: 0, pf: 587, pc: 640, pts: 15 },
            { equipo: 'ISOLIA NB TORRENT B', posicion: 4, j: 10, v: 4, p: 6, np: 0, pf: 567, pc: 630, pts: 14 },
            { equipo: 'CRISCOLOR C.B.C MANISES-QUART', posicion: 5, j: 10, v: 4, p: 6, np: 0, pf: 625, pc: 687, pts: 14 },
            { equipo: 'MISLATA BC VERDE', posicion: 6, j: 10, v: 1, p: 9, np: 0, pf: 390, pc: 596, pts: 11 }
        ];

        let migrados = 0;
        for (const eq of primeraFase) {
            await window.app.clasificacionManager.añadirEquipoClasificacion({
                ...eq,
                fase: 'primera'
            });
            migrados++;
            console.log(`✅ Migrado ${migrados}/6: ${eq.equipo}`);
        }

        console.log('🎉 Migración completada exitosamente');
        alert(`✅ Migración completada!\n\n${migrados} equipos añadidos a Firebase.\n\nAhora puedes editarlos desde la tabla de clasificación.`);

        // Re-renderizar para mostrar los nuevos datos
        window.app.renderizar();

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        alert(`❌ Error durante la migración:\n\n${error.message}\n\nRevisa la consola para más detalles.`);
    }
};

/**
 * Eliminar toda la clasificación de una fase (PANEL ADMIN)
 */
window.eliminarClasificacionCompletaGlobal = async () => {
    const fase = document.getElementById('fase-clasificacion-eliminar')?.value || 'primera';

    const confirmacion1 = confirm(`⚠️ ¿Estás COMPLETAMENTE SEGURO de que quieres eliminar TODA la clasificación de ${fase === 'primera' ? '1ª' : '2ª'} fase?\n\nEsta acción NO se puede deshacer.`);

    if (!confirmacion1) return;

    const confirmacion2 = confirm(`⚠️⚠️ ÚLTIMA ADVERTENCIA ⚠️⚠️\n\nSe eliminarán TODOS los equipos de la clasificación de ${fase === 'primera' ? '1ª' : '2ª'} fase.\n\n¿Continuar?`);

    if (!confirmacion2) return;

    try {
        console.log(`🗑️ Eliminando toda la clasificación de ${fase} fase...`);

        const clasificaciones = await window.app.clasificacionManager.obtenerClasificacionesUnaVez(fase);

        if (clasificaciones.length === 0) {
            alert(`ℹ️ No hay equipos en la clasificación de ${fase === 'primera' ? '1ª' : '2ª'} fase.`);
            return;
        }

        // Eliminar cada equipo
        for (const equipo of clasificaciones) {
            await window.app.clasificacionManager.eliminarEquipoClasificacion(equipo.id);
        }

        alert(`✅ Se han eliminado ${clasificaciones.length} equipos de la clasificación de ${fase === 'primera' ? '1ª' : '2ª'} fase.`);

        console.log(`✅ Clasificación de ${fase} fase eliminada completamente`);
    } catch (error) {
        console.error('❌ Error eliminando clasificación completa:', error);
        alert('❌ Error: ' + error.message);
    }
};

// ===================================
// FUNCIÓN DE CORRECCIÓN DE POSICIONES
// ===================================

/**
 * Corregir posiciones de clasificación ordenando por puntos (PTS)
 * @param {string} fase - "primera" o "segunda"
 */
window.corregirPosicionesClasificacion = async (fase = 'primera') => {
    try {
        console.log(`🔧 Corrigiendo posiciones de ${fase} fase...`);

        // 1. Obtener todos los equipos de la fase
        const equipos = await window.app.clasificacionManager.obtenerClasificacionesUnaVez(fase);

        console.log(`📊 ${equipos.length} equipos encontrados`);

        if (equipos.length === 0) {
            alert(`⚠️ No hay equipos en ${fase} fase`);
            return;
        }

        // 2. Ordenar por puntos (PTS) descendente, luego por diferencia de puntos
        equipos.sort((a, b) => {
            if (b.pts !== a.pts) {
                return b.pts - a.pts; // Por puntos descendente
            }
            // Si tienen los mismos puntos, ordenar por diferencia (PF - PC)
            const difA = a.pf - a.pc;
            const difB = b.pf - b.pc;
            return difB - difA;
        });

        // 3. Mostrar orden correcto
        console.log('📋 Orden correcto por puntos:');
        equipos.forEach((eq, i) => {
            console.log(`${i + 1}. ${eq.equipo} - ${eq.pts} pts (posición actual: ${eq.posicion})`);
        });

        // 4. Actualizar posiciones en Firebase
        for (let i = 0; i < equipos.length; i++) {
            const posicionCorrecta = i + 1;
            const equipo = equipos[i];

            if (equipo.posicion !== posicionCorrecta) {
                await window.app.clasificacionManager.actualizarEquipoClasificacion(equipo.id, {
                    ...equipo,
                    posicion: posicionCorrecta
                });
                console.log(`✅ ${equipo.equipo}: ${equipo.posicion} → ${posicionCorrecta}`);
            } else {
                console.log(`⏭️ ${equipo.equipo}: ya está en posición ${posicionCorrecta}`);
            }
        }

        // 5. Recargar tabla
        await window.uiManager.cargarClasificacionFirebase(fase);

        alert(`✅ Posiciones de ${fase} fase corregidas!\n\n${equipos.length} equipos reordenados por puntos.`);
        console.log('✅ ¡Corrección completada!');

    } catch (error) {
        console.error('❌ Error corrigiendo posiciones:', error);
        alert('❌ Error: ' + error.message);
    }
};

window.actualizarMarcadorGlobal = async (id, campo, incremento) => {
    try {
        const partido = app.partidosManager.getPartidoById(id);

        // DEBUG INFO
        console.log('=== ACTUALIZAR MARCADOR ===');
        console.log('partido.id:', id);
        console.log('partido.esLocal:', partido.esLocal);
        console.log('campo (resultadoLocal/resultadoVisitante):', campo);
        console.log('incremento:', incremento);
        console.log('resultadoLocal actual:', partido.resultadoLocal);
        console.log('resultadoVisitante actual:', partido.resultadoVisitante);

        // Determinar si es CBC quien está anotando
        // Si CBC es LOCAL: campo debe ser 'resultadoLocal'
        // Si CBC es VISITANTE: campo debe ser 'resultadoVisitante'
        const esCBCLocal = campo === 'resultadoLocal' && partido.esLocal;
        const esCBCVisitante = campo === 'resultadoVisitante' && !partido.esLocal;
        const esCBCEnDirecto = (esCBCLocal || esCBCVisitante) && incremento > 0;

        console.log('esCBCLocal:', esCBCLocal, 'esCBCVisitante:', esCBCVisitante, 'esCBCEnDirecto:', esCBCEnDirecto);

        // Si es CBC anotando positivamente, mostrar selector de jugador
        if (esCBCEnDirecto) {
            window.mostrarSelectorJugadorGlobal(id, incremento, partido, campo);
        } else {
            // Si es rival o decremento, actualizar marcador directamente sin selector
            await app.partidosManager.actualizarMarcador(id, campo, incremento);
        }

        console.log('Actualizando campo:', campo, 'con incremento:', incremento);
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
window.verActaGlobal = (partidoId) => window.app.verActa(partidoId);
window.cerrarActaGlobal = () => window.app.cerrarActa();

// === FUNCIONES DE GESTIÓN DE ACTAS (PANEL ADMIN) ===
window.eliminarActaGlobal = async (id) => {
    try {
        await app.actasManager.eliminarActa(id);
        alert('✅ Acta eliminada correctamente');
    } catch (error) {
        alert(`❌ Error al eliminar acta: ${error.message}`);
    }
};

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
window.mostrarSelectorJugadorGlobal = (partidoId, puntos, partido, campo) => {
    uiManager.mostrarSelectorJugador(partidoId, puntos, partido, campo);
};

window.registrarAnotacionGlobal = async (partidoId, jugador, puntos, partido, campo) => {
    try {
        // Registrar anotación
        const anotacionesActuales = app.anotacionesManager.getAnotaciones(partido);
        await app.anotacionesManager.añadirAnotacion(partidoId, {
            jugador,
            puntos,
            cuarto: partido.cuartoActual || ''
        }, anotacionesActuales);

        // Usar el campo que viene como parámetro (desde Control de Marcador)
        // Si no viene campo, usar el de CBC
        const campoFinal = campo || (partido.esLocal ? 'resultadoLocal' : 'resultadoVisitante');
        
        // DEBUG ANTES DE ACTUALIZAR
        console.log('ANTES de actualizar:', {
            campo: campo,
            campoFinal: campoFinal,
            esLocal: partido.esLocal,
            resultadoLocalActual: partido.resultadoLocal,
            resultadoVisitanteActual: partido.resultadoVisitante,
            puntosAñadir: puntos
        });
        
        // Actualizar marcador en el campo correcto
        await app.partidosManager.actualizarMarcador(partidoId, campoFinal, puntos);

        // DEBUG DESPUÉS DE ACTUALIZAR
        console.log('DESPUÉS de actualizar:', {
            resultadoLocalNuevo: partido.resultadoLocal,
            resultadoVisitanteNuevo: partido.resultadoVisitante
        });

        console.log(`✅ Anotación registrada: +${puntos} de ${jugador} en campo: ${campoFinal} (partido.esLocal: ${partido.esLocal})`);
    } catch (error) {
        console.error('❌ Error al registrar anotación:', error);
        alert('Error al registrar la anotación');
    }
};

window.saltarAnotacionGlobal = async (partidoId, puntos, campo) => {
    try {
        // Obtener el partido para saber si es local o visitante
        const partido = app.partidosManager.getPartidoById(partidoId);
        
        // Usar el campo que viene como parámetro
        // Si no viene, usar el de CBC
        const campoFinal = campo || (partido.esLocal ? 'resultadoLocal' : 'resultadoVisitante');
        
        // Solo actualizar marcador sin registrar jugador
        await app.partidosManager.actualizarMarcador(partidoId, campoFinal, puntos);
        
        console.log(`⏭️ Puntos saltados: +${puntos} en campo: ${campoFinal} (partido.esLocal: ${partido.esLocal})`);
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

/**
 * Cambia el filtro de fase para estadísticas
 * @param {string} fase - 'todas', 'primera', 'segunda'
 */
window.cambiarFiltroFaseGlobal = (fase) => {
    // Establecer filtro en el manager
    window.app.estadisticasManager.setFiltroFase(fase);

    // Guardar en localStorage
    localStorage.setItem('filtroFase', fase);

    // Reprocesar datos con el nuevo filtro
    const actas = window.app.actasManager.getActas();
    window.app.estadisticasManager.procesarDatosJugadores(actas);

    console.log(`✅ Filtro de fase aplicado: ${fase}`);

    // Regenerar gráficas con los datos filtrados
    if (window.app.activeTab === 'estadisticas') {
        setTimeout(() => {
            window.app.estadisticasManager.crearGraficasEquipo(actas);
            const jugadorSeleccionado = window.app.estadisticasManager.getJugadorSeleccionado();
            if (jugadorSeleccionado) {
                window.app.estadisticasManager.crearGraficasJugador(jugadorSeleccionado);
            }
        }, 100);
    }

    // Renderizar la interfaz
    window.app.renderizar();
};

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    app.iniciar();
});

// Exportar la app para uso en otros módulos si es necesario
export default app;
