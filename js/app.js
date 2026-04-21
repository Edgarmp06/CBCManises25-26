/**
 * Archivo Principal de la Aplicación
 *
 * Este archivo coordina todos los módulos y gestiona el estado global
 * de la aplicación del CBC Manises.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js';

import { firebaseConfig } from './config.js';
import { PartidosManager } from './partidos.js';
import { ActasManager } from './actas.js';
import { EstadisticasManager } from './estadisticas.js';
import { AdminManager } from './admin.js';
import { AnotacionesManager } from './anotaciones.js';
import ClasificacionManager from './clasificacion.js';
import { INFO_EQUIPO } from './constants.js';
import { mostrarNotificacion, compartirResultado } from './utils.js';
import uiManager from './ui.js';

/**
 * Clase principal de la aplicación
 */
class CBCManisesApp {
    constructor() {
        // Inicializar Firebase
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
        
        try {
            this.messaging = getMessaging(this.app);
            
            // Listener para cuando tenemos la web abierta (Foreground)
            onMessage(this.messaging, (payload) => {
                console.log('Mensaje recibido en primer plano: ', payload);
                const notificationTitle = payload.notification?.title || 'CBC Manises';
                const notificationOptions = payload.notification?.body || 'Nueva notificación';
                
                // Mostramos un aviso visual en nuestra propia web
                mostrarNotificacion(`${notificationTitle}: ${notificationOptions}`, 'info', 5000);
                
                // Opcional: Si quisiéramos forzar una notificación del sistema operativo incluso con la web abierta:
                // new Notification(notificationTitle, { body: notificationOptions, icon: '/icons/icon-192x192.png' });
            });
        } catch (error) {
            console.error("FCM Background no soportado", error);
        }

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

        // Iniciar rotación de fotos de fondo
        this.iniciarRotacionFotos();
    }

    /**
     * Inicia la aplicación
     */
    async iniciar() {
        // Iniciar listeners
        this.partidosManager.iniciarListener();
        this.actasManager.iniciarListener();
        this.adminManager.iniciarListenerAuth();

        // Iniciar rotación de fotos de fondo
        this.iniciarRotacionFotos();

        // Renderizar la aplicación inicialmente
        this.renderizar();
    }

    /**
     * Callback cuando se actualizan los partidos
     * @param {Array} partidos - Lista actualizada de partidos
     */
    onPartidosUpdate(partidos) {
        // Solo renderizar si la aplicación ya está inicializada
        if (this.activeTab !== undefined) {
            this.renderizar();
        }
    }

    /**
     * Callback cuando se actualizan las actas
     * @param {Array} actas - Lista actualizada de actas
     */
    onActasUpdate(actas) {
        // Procesar datos de jugadores para estadísticas
        if (this.estadisticasManager) {
            this.estadisticasManager.procesarDatosJugadores(actas);
        }
        // Solo renderizar si la aplicación ya está inicializada
        if (this.activeTab !== undefined) {
            this.renderizar();
        }
    }

    /**
     * Callback cuando cambia el estado de autenticación
     * @param {boolean} isAdmin - Si el usuario es admin
     */
    onAuthChange(isAdmin) {
        this.renderizar();
    }

    /**
     * Cambia la pestaña activa
     * @param {string} tab - Nombre de la pestaña ('calendario', 'resultados', 'estadisticas', 'clasificacion')
     */
    cambiarTab(tab) {
        this.activeTab = tab;

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
            mostrarNotificacion('No hay acta para este partido', 'info');
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
            activeTab: this.activeTab || 'calendario',
            partidos: (this.partidosManager && this.partidosManager.getPartidos) ? this.partidosManager.getPartidos() : [],
            actas: (this.actasManager && this.actasManager.getActas) ? this.actasManager.getActas() : [],
            datosJugadores: (this.estadisticasManager && this.estadisticasManager.getDatosJugadores) ? this.estadisticasManager.getDatosJugadores() : {},
            jugadorSeleccionado: (this.estadisticasManager && this.estadisticasManager.getJugadorSeleccionado) ? this.estadisticasManager.getJugadorSeleccionado() : null,
            isAdmin: (this.adminManager && this.adminManager.esAdmin) ? this.adminManager.esAdmin() : false,
            showAdminPanel: (this.adminManager && this.adminManager.panelVisible) ? this.adminManager.panelVisible() : false,
            viendoActa: this.viendoActa || null
        };
    }

    /**
     * Solicita permiso para enviar notificaciones Push
     */
    async solicitarPermisosNotificaciones() {
        try {
            console.log('Intentando solicitar permisos...');
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('Permiso concedido. Registrando Service Worker especial para FCM...');
                
                // 1. Hay que registrar o obtener el Service Worker para las notificaciones
                let swRegistration;
                if ('serviceWorker' in navigator) {
                    try {
                       swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                       console.log('Service Worker de FCM registrado:', swRegistration);
                    } catch (swError) {
                       console.error('Error al registrar el SW de FCM:', swError);
                    }
                }

                console.log('Obteniendo Token FCM...');
                // 2. Pasamos el registro del service worker en las opciones
                const token = await getToken(this.messaging, {
                    vapidKey: 'BMCvO2stmPhCTM3Ndn3v_7CZ59OnOTM_3RxDNtr5Dijw0Hqvm1SQeQFQrXkyKV4jrkhcM9tq4HSFd6y0y7UcH1A',
                    serviceWorkerRegistration: swRegistration
                });
                
                if (token) {
                    console.log('✅ FCM Token Exitoso:', token);
                    mostrarNotificacion('¡Notificaciones activadas!', 'success');
                    
                    // Guardamos en localStorage para esconder el cartelito de aviso de la UI
                    localStorage.setItem('notificacionesActivadas', 'true');
                    
                    // Si el botón está en pantalla, lo ocultamos visualmente sin tener que recargar
                    const bannerNotificaciones = document.getElementById('banner-notificaciones');
                    if(bannerNotificaciones) bannerNotificaciones.style.display = 'none';
                    
                } else {
                    console.warn('No se obtuvo token');
                    mostrarNotificacion('No se pudo activar el modo notificaciones', 'error');
                }
            } else {
                console.warn('Permiso de notificaciones denegado.');
                mostrarNotificacion('Permisos de notificación bloqueados', 'warning');
            }
        } catch (error) {
            console.error('Error al pedir permisos', error);
            mostrarNotificacion('Error técnico al activar alertas', 'error');
        }
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
window.solicitarNotificacionesGlobal = () => app.solicitarPermisosNotificaciones();
window.cambiarJugadorGlobal = (nombre) => app.cambiarJugador(nombre);
window.compartirPartidoGlobal = async (id) => {
    const partido = app.partidosManager.getPartidoById(id);
    if (!partido) return;

    const equipoPrincipal = INFO_EQUIPO.NOMBRE;
    const rival = partido.rival;
    const equipoLocal = partido.esLocal ? equipoPrincipal : rival;
    const equipoVisitante = partido.esLocal ? rival : equipoPrincipal;

    let texto = `🏀 *${INFO_EQUIPO.NOMBRE} - ${INFO_EQUIPO.CATEGORIA}*\n`;
    texto += `🏆 J${partido.jornada || '?'}${partido.fase ? ` - ${partido.fase === 'primera' ? '1ª Fase' : '2ª Fase'}` : ''}\n\n`;

    if (partido.finalizado) {
        texto += `✅ *Resultado:* ${equipoLocal} ${partido.resultadoLocal} - ${partido.resultadoVisitante} ${equipoVisitante}\n`;
    } else if (partido.enDirecto) {
        texto += `🔴 *EN DIRECTO:* ${equipoLocal} ${partido.resultadoLocal} - ${partido.resultadoVisitante} ${equipoVisitante}\n`;
    } else {
        texto += `⏳ *Próximo partido:* ${equipoLocal} vs ${equipoVisitante}\n`;
    }

    texto += `📅 ${partido.fecha || 'Sin fecha'}\n`;
    if (partido.hora) texto += `🕒 ${partido.hora}\n`;
    if (partido.ubicacion) texto += `📍 ${partido.ubicacion}\n`;

    await compartirResultado({
        title: `${INFO_EQUIPO.NOMBRE} 25/26`,
        text: texto,
        url: window.location.href
    });
};

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
        mostrarNotificacion('Partido añadido correctamente', 'success');
    } catch (error) {
        mostrarNotificacion(`Error: ${error.message}`, 'error');
    }
};

window.actualizarPartidoGlobal = async (id, data) => {
    try {
        await window.app.partidosManager.actualizarPartido(id, data);
        mostrarNotificacion('Partido actualizado correctamente', 'success');
    } catch (error) {
        mostrarNotificacion(`Error: ${error.message}`, 'error');
    }
};

// === FUNCIÓN PARA UBICACIÓN PERSONALIZADA ===
window.toggleUbicacionCustom = function () {
    const checkbox = document.getElementById('ubicacion-custom-checkbox');
    const container = document.getElementById('ubicacion-custom-container');
    const select = document.getElementById('ubicacion');

    if (checkbox && checkbox.checked) {
        if (container) {
            container.classList.remove('hidden');
        }
        if (select) {
            select.disabled = true;
            select.classList.add('opacity-50');
        }
    } else {
        if (container) {
            container.classList.add('hidden');
        }
        if (select) {
            select.disabled = false;
            select.classList.remove('opacity-50');
        }
        const customInput = document.getElementById('ubicacion-custom');
        if (customInput) customInput.value = '';
    }
};

// Función similar para el modal de editar
window.toggleUbicacionCustomEditar = function () {
    const checkbox = document.getElementById('editar-ubicacion-custom-checkbox');
    const container = document.getElementById('editar-ubicacion-custom-container');
    const select = document.getElementById('editar-ubicacion');

    if (checkbox && checkbox.checked) {
        if (container) {
            container.style.display = 'block';
        }
        if (select) {
            select.disabled = true;
            select.classList.add('opacity-50');
        }
    } else {
        if (container) {
            container.style.display = 'none';
        }
        if (select) {
            select.disabled = false;
            select.classList.remove('opacity-50');
        }
        const customInput = document.getElementById('editar-ubicacion-custom');
        if (customInput) customInput.value = '';
    }
};

window.eliminarPartidoGlobal = async (id) => {
    if (confirm('¿Estás seguro de eliminar este partido?')) {
        try {
            await app.partidosManager.eliminarPartido(id);
            mostrarNotificacion('Partido eliminado', 'success');
        } catch (error) {
            mostrarNotificacion(`Error: ${error.message}`, 'error');
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
            mostrarNotificacion('Equipo no encontrado', 'error');
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
    } catch (error) {
        mostrarNotificacion('Error al editar equipo', 'error');
    }
};

/**
 * Guardar edición inline
 */
window.guardarEdicionInline = async (id) => {
    try {
        const v = parseInt(document.getElementById(`input-v-${id}`).value) || 0;
        const p = parseInt(document.getElementById(`input-p-${id}`).value) || 0;
        const np = parseInt(document.getElementById(`input-np-${id}`).value) || 0;

        // Cálculo automático de puntos: Victoria = 2, Derrota = 1, NP = 0
        const puntosCalculados = (v * 2) + (p * 1) + (np * 0);

        const data = {
            equipo: document.getElementById(`input-equipo-${id}`).value.trim(),
            posicion: parseInt(document.querySelector(`#fila-${id}`).dataset.posicion),
            j: v + p + np,
            v: v,
            p: p,
            np: np,
            pf: parseInt(document.getElementById(`input-pf-${id}`).value) || 0,
            pc: parseInt(document.getElementById(`input-pc-${id}`).value) || 0,
            pts: puntosCalculados
        };

        await window.app.clasificacionManager.actualizarEquipoClasificacion(id, data);

        // Recargar tabla
        const fase = window.faseClasificacionActual || 'primera';
        await window.uiManager.cargarClasificacionFirebase(fase);
    } catch (error) {
        mostrarNotificacion(`Error: ${error.message}`, 'error');
    }
};

/**
 * Cancelar edición inline
 */
window.cancelarEdicionInline = async (id) => {
    const fase = window.faseClasificacionActual || 'primera';
    await window.uiManager.cargarClasificacionFirebase(fase);
};

/**
 * Subir posición de un equipo
 */
window.subirPosicionEquipo = async (id) => {
    try {
        const fase = window.faseClasificacionActual || 'primera';
        const clasificaciones = await window.app.clasificacionManager.obtenerClasificacionesUnaVez(fase);
        const equipoIndex = clasificaciones.findIndex(e => e.id === id);
        if (equipoIndex === -1 || equipoIndex === 0) return;

        const equipo = clasificaciones[equipoIndex];
        const equipoArriba = clasificaciones[equipoIndex - 1];

        if (equipoArriba) {
            const posActual = equipo.posicion;
            const posArriba = equipoArriba.posicion;

            // Intercambiar posiciones
            await window.app.clasificacionManager.actualizarEquipoClasificacion(id, { ...equipo, posicion: posArriba });
            await window.app.clasificacionManager.actualizarEquipoClasificacion(equipoArriba.id, { ...equipoArriba, posicion: posActual });

            await window.uiManager.cargarClasificacionFirebase(fase);
        }
    } catch (error) {
        mostrarNotificacion(`Error: ${error.message}`, 'error');
    }
};

/**
 * Bajar posición de un equipo
 */
window.bajarPosicionEquipo = async (id) => {
    try {
        const fase = window.faseClasificacionActual || 'primera';
        const clasificaciones = await window.app.clasificacionManager.obtenerClasificacionesUnaVez(fase);
        const equipoIndex = clasificaciones.findIndex(e => e.id === id);
        if (equipoIndex === -1 || equipoIndex === clasificaciones.length - 1) return;

        const equipo = clasificaciones[equipoIndex];
        const equipoAbajo = clasificaciones[equipoIndex + 1];

        if (equipoAbajo) {
            const posActual = equipo.posicion;
            const posAbajo = equipoAbajo.posicion;

            // Intercambiar posiciones
            await window.app.clasificacionManager.actualizarEquipoClasificacion(id, { ...equipo, posicion: posAbajo });
            await window.app.clasificacionManager.actualizarEquipoClasificacion(equipoAbajo.id, { ...equipoAbajo, posicion: posActual });

            await window.uiManager.cargarClasificacionFirebase(fase);
        }
    } catch (error) {
        mostrarNotificacion(`Error: ${error.message}`, 'error');
    }
};

window.eliminarEquipoClasificacionInline = async (id) => {
    try {
        await window.app.clasificacionManager.eliminarEquipoClasificacion(id);

        const fase = window.faseClasificacionActual || 'primera';
        await window.uiManager.cargarClasificacionFirebase(fase);
    } catch (error) {
        mostrarNotificacion(`Error: ${error.message}`, 'error');
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

        if (!tbody) {
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

        // Añadir fila con inputs al final (J y PTS serán auto-calculados)
        const nuevaFila = document.createElement('tr');
        nuevaFila.id = 'fila-nuevo-equipo';
        nuevaFila.className = 'bg-green-50 border-2 border-green-400';
        nuevaFila.innerHTML = `
            <td class="px-2 md:px-4 py-3 font-bold text-orange-600">${nuevaPosicion}</td>
            <td class="px-2 md:px-4 py-3">
                <input type="text" id="nuevo-equipo" placeholder="Nombre" class="border rounded px-2 py-1 w-full text-sm" required>
            </td>
            <td class="px-2 md:px-4 py-3 text-center">-</td>
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
            <td class="px-2 md:px-4 py-3 text-center font-bold">-</td>
            <td class="px-2 md:px-4 py-3 text-center space-x-1">
                <button onclick="window.guardarNuevoEquipoInline('${fase}', ${nuevaPosicion})" class="text-green-600 hover:text-green-800 text-xl" title="Guardar">✅</button>
                <button onclick="window.cancelarNuevoEquipoInline()" class="text-red-600 hover:text-red-800 text-xl" title="Cancelar">❌</button>
            </td>
        `;

        tbody.appendChild(nuevaFila);
        document.getElementById('nuevo-equipo').focus();
    } catch (error) {
        // Error silencioso
    }
};

/**
 * Guardar nuevo equipo inline
 */
window.guardarNuevoEquipoInline = async (fase, posicion) => {
    try {
        const equipo = document.getElementById('nuevo-equipo').value.trim();
        if (!equipo) {
            mostrarNotificacion('El nombre del equipo es obligatorio', 'warning');
            return;
        }

        const v = parseInt(document.getElementById('nuevo-v').value) || 0;
        const p = parseInt(document.getElementById('nuevo-p').value) || 0;
        const np = parseInt(document.getElementById('nuevo-np').value) || 0;

        const data = {
            equipo,
            fase,
            posicion,
            j: v + p + np,
            v: v,
            p: p,
            np: np,
            pf: parseInt(document.getElementById('nuevo-pf').value) || 0,
            pc: parseInt(document.getElementById('nuevo-pc').value) || 0,
            pts: (v * 2) + (p * 1) + (np * 0)
        };

        await window.app.clasificacionManager.añadirEquipoClasificacion(data);

        // Eliminar fila del formulario
        const fila = document.getElementById('fila-nuevo-equipo');
        if (fila) fila.remove();

        await window.uiManager.cargarClasificacionFirebase(fase);
    } catch (error) {
        mostrarNotificacion(`Error: ${error.message}`, 'error');
    }
};

/**
 * Cancelar nuevo equipo inline
 */
window.cancelarNuevoEquipoInline = () => {
    const fila = document.getElementById('fila-nuevo-equipo');
    if (fila) fila.remove();
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
        }

        mostrarNotificacion('Migración completada correctamente', 'success');
        window.app.renderizar();
    } catch (error) {
        mostrarNotificacion(`Error: ${error.message}`, 'error');
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
        const clasificaciones = await window.app.clasificacionManager.obtenerClasificacionesUnaVez(fase);

        if (clasificaciones.length === 0) {
            mostrarNotificacion(`No hay equipos en la clasificación de ${fase === 'primera' ? '1ª' : '2ª'} fase`, 'info');
            return;
        }

        // Eliminar cada equipo
        for (const equipo of clasificaciones) {
            await window.app.clasificacionManager.eliminarEquipoClasificacion(equipo.id);
        }

        mostrarNotificacion(`Se han eliminado ${clasificaciones.length} equipos de la clasificación de ${fase === 'primera' ? '1ª' : '2ª'} fase`, 'success');
    } catch (error) {
        mostrarNotificacion(`Error: ${error.message}`, 'error');
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
        // 1. Obtener todos los equipos de la fase
        const equipos = await window.app.clasificacionManager.obtenerClasificacionesUnaVez(fase);

        if (equipos.length === 0) {
            mostrarNotificacion(`No hay equipos en ${fase} fase`, 'info');
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

        // 3. Actualizar posiciones en Firebase
        for (let i = 0; i < equipos.length; i++) {
            const posicionCorrecta = i + 1;
            const equipo = equipos[i];

            if (equipo.posicion !== posicionCorrecta) {
                await window.app.clasificacionManager.actualizarEquipoClasificacion(equipo.id, {
                    ...equipo,
                    posicion: posicionCorrecta
                });
            }
        }

        await window.uiManager.cargarClasificacionFirebase(fase);
        mostrarNotificacion(`Posiciones de ${fase} fase corregidas`, 'success');
    } catch (error) {
        mostrarNotificacion(`Error: ${error.message}`, 'error');
    }
};

window.actualizarMarcadorGlobal = async (id, campo, incremento) => {
    try {
        const partido = app.partidosManager.getPartidoById(id);

        // Determinar si es CBC quien está anotando
        const esCBCLocal = campo === 'resultadoLocal' && partido.esLocal;
        const esCBCVisitante = campo === 'resultadoVisitante' && !partido.esLocal;
        const esCBCEnDirecto = (esCBCLocal || esCBCVisitante) && incremento > 0;

        // Si es CBC anotando positivamente, mostrar selector de jugador
        if (esCBCEnDirecto) {
            window.mostrarSelectorJugadorGlobal(id, incremento, partido, campo);
        } else {
            // Si es rival o decremento, actualizar marcador directamente sin selector
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

// === FUNCIONES DE ADMINISTRACIÓN ===
window.handleAdminLoginGlobal = () => {
    app.adminManager.loginConPrompt();
};

window.toggleAdminPanel = () => {
    app.adminManager.toggleAdminPanel();
    app.renderizar();
};

window.logout = () => {
    app.adminManager.logout();
};

// === FUNCIONES DE ACTAS (VISTAS) ===
window.verActaGlobal = (partidoId) => window.app.verActa(partidoId);
window.cerrarActaGlobal = () => window.app.cerrarActa();

// === FUNCIONES DE GESTIÓN DE ACTAS (PANEL ADMIN) ===
window.eliminarActaGlobal = async (id) => {
    try {
        await app.actasManager.eliminarActa(id);
        mostrarNotificacion('Acta eliminada correctamente', 'success');
    } catch (error) {
        mostrarNotificacion(`Error: ${error.message}`, 'error');
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
        mostrarNotificacion('Partido no encontrado', 'error');
        return;
    }

    // Mostrar modal de edición
    uiManager.mostrarModalEditarPartido(partido);
};

window.eliminarPartidoGlobal = async (id) => {
    if (confirm('¿Estás seguro de eliminar este partido?')) {
        try {
            await app.partidosManager.eliminarPartido(id);
            mostrarNotificacion('Partido eliminado correctamente', 'success');
        } catch (error) {
            mostrarNotificacion(`Error: ${error.message}`, 'error');
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

        // Determinar campo final
        const campoFinal = campo || (partido.esLocal ? 'resultadoLocal' : 'resultadoVisitante');

        // Actualizar marcador en el campo correcto
        await app.partidosManager.actualizarMarcador(partidoId, campoFinal, puntos);
    } catch (error) {
        mostrarNotificacion('Error al registrar la anotación', 'error');
    }
};

window.saltarAnotacionGlobal = async (partidoId, puntos, campo) => {
    try {
        const partido = app.partidosManager.getPartidoById(partidoId);
        const campoFinal = campo || (partido.esLocal ? 'resultadoLocal' : 'resultadoVisitante');
        await app.partidosManager.actualizarMarcador(partidoId, campoFinal, puntos);
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

/**
 * Función auxiliar para obtener nombre de fase
 */
function getNombreFase(fase) {
    switch (fase) {
        case 'primera': return '1ª Fase';
        case 'segunda': return '2ª Fase';
        case 'amistosos': return 'Amistosos';
        case 'copa_valenciana': return 'Copa Valenciana';
        default: return fase;
    }
}

/**
 * Mostrar comparación de rivalidad entre CBC Manises-Quart y un rival
 */
window.mostrarRivalidad = () => {
    // Función auxiliar local
    function getNombreFase(fase) {
        switch (fase) {
            case 'primera': return '1ª Fase';
            case 'segunda': return '2ª Fase';
            case 'amistosos': return 'Amistosos';
            case 'copa_valenciana': return 'Copa Valenciana';
            default: return fase;
        }
    }

    const equipo1 = "CBC Manises-Quart"; // Siempre fijo
    const equipo2 = document.getElementById('equipo-rivalidad-2').value;

    if (!equipo2) {
        mostrarNotificacion('Por favor selecciona un rival', 'warning');
        return;
    }

    if (equipo1 === equipo2) {
        mostrarNotificacion('El rival debe ser diferente a CBC Manises-Quart', 'warning');
        return;
    }

    const partidos = window.app.partidosManager.getPartidos();
    const actas = window.app.actasManager.getActas();

    // Obtener partidos entre CBC Manises-Quart y el rival seleccionado
    const partidosRivalidad = window.app.estadisticasManager.obtenerPartidosRivalidad(partidos, equipo1, equipo2);

    if (partidosRivalidad.length === 0) {
        document.getElementById('resultados-rivalidad').innerHTML = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p class="text-yellow-800">⚠️ No se encontraron partidos entre CBC Manises-Quart y ${equipo2}</p>
                <p class="text-sm text-yellow-600 mt-2">Esto puede deberse a que aún no se han jugado partidos en esta fase o no están registrados.</p>
            </div>
        `;
        document.getElementById('resultados-rivalidad').classList.remove('hidden');
        return;
    }

    // Calcular estadísticas de rivalidad
    const estadisticas = window.app.estadisticasManager.calcularEstadisticasRivalidad(partidosRivalidad, actas, equipo1, equipo2);

    // Generar HTML de resultados
    const html = `
        <div class="space-y-6">
            <!-- Resumen de enfrentamientos -->
            <div class="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-6">
                <h3 class="text-xl font-bold text-center mb-4">⚔️ CBC Manises-Quart vs ${equipo2}</h3>
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div class="bg-orange-100 rounded-lg p-4 shadow">
                        <p class="text-2xl font-bold text-orange-600">${estadisticas.equipo1.victorias}</p>
                        <p class="text-sm text-gray-700">Victorias CBC</p>
                    </div>
                    <div class="bg-gray-100 rounded-lg p-4">
                        <p class="text-lg font-bold text-gray-700">${partidosRivalidad.length}</p>
                        <p class="text-sm text-gray-600">Partidos</p>
                    </div>
                    <div class="bg-blue-100 rounded-lg p-4 shadow">
                        <p class="text-2xl font-bold text-blue-600">${estadisticas.equipo2.victorias}</p>
                        <p class="text-sm text-gray-700">Victorias ${equipo2}</p>
                    </div>
                </div>
            </div>

            <!-- Lista de partidos -->
            <div class="space-y-3">
                <h4 class="text-lg font-bold text-gray-800">📅 Historial de Enfrentamientos</h4>
                ${estadisticas.partidos.map((partido, index) => `
                    <div class="bg-white border rounded-lg p-4 shadow-sm">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold text-gray-700">Jornada ${partido.jornada} • ${partido.fase ? getNombreFase(partido.fase) : 'Sin fase'}</span>
                            <span class="text-sm text-gray-500">${partido.fecha}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <div class="flex-1 text-center">
                                <p class="font-bold ${partido.ganador === partido.local ? 'text-green-600' : 'text-gray-700'}">
                                    ${partido.local}
                                </p>
                            </div>
                            <div class="px-4">
                                <p class="text-xl font-bold text-gray-800">${partido.resultado}</p>
                            </div>
                            <div class="flex-1 text-center">
                                <p class="font-bold ${partido.ganador === partido.visitante ? 'text-green-600' : 'text-gray-700'}">
                                    ${partido.visitante}
                                </p>
                            </div>
                        </div>
                        ${partido.estadisticas ? `
                            <div class="mt-3 pt-3 border-t border-gray-200">
                                <div class="grid grid-cols-2 gap-4 text-sm">
                                    <div class="text-center">
                                        <p class="font-semibold text-gray-700">Estadísticas ${partido.local}</p>
                                        <p>Puntos: ${partido.estadisticas[partido.local]?.totalPuntos || 0}</p>
                                        <p>Faltas: ${partido.estadisticas[partido.local]?.totalFaltas || 0}</p>
                                    </div>
                                    <div class="text-center">
                                        <p class="font-semibold text-gray-700">Estadísticas ${partido.visitante}</p>
                                        <p>Puntos: ${partido.estadisticas[partido.visitante]?.totalPuntos || 0}</p>
                                        <p>Faltas: ${partido.estadisticas[partido.visitante]?.totalFaltas || 0}</p>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('resultados-rivalidad').innerHTML = html;
    document.getElementById('resultados-rivalidad').classList.remove('hidden');
};

/**
 * Comparación de estadísticas entre dos jugadores del CBC
 */
window.mostrarDueloJugadores = () => {
    const nombre1 = document.getElementById('jugador-duelo-1').value;
    const nombre2 = document.getElementById('jugador-duelo-2').value;

    if (!nombre1 || !nombre2) {
        mostrarNotificacion('Selecciona dos jugadores para comparar', 'warning');
        return;
    }
    if (nombre1 === nombre2) {
        mostrarNotificacion('Selecciona dos jugadores diferentes', 'warning');
        return;
    }

    const datosJugadores = window.app.estadisticasManager.getDatosJugadores();
    const j1 = datosJugadores[nombre1];
    const j2 = datosJugadores[nombre2];

    if (!j1 || !j2) {
        mostrarNotificacion('No hay datos disponibles para estos jugadores', 'warning');
        return;
    }

    const pj1 = j1.partidos.length, pj2 = j2.partidos.length;
    const avg1 = pj1 > 0 ? j1.totalPts / pj1 : 0;
    const avg2 = pj2 > 0 ? j2.totalPts / pj2 : 0;
    const maxPts1 = Math.max(...j1.partidos.map(p => p.pts), 0);
    const maxPts2 = Math.max(...j2.partidos.map(p => p.pts), 0);
    const pctTL1 = j1.totalTL_int > 0 ? (j1.totalTL_an / j1.totalTL_int * 100) : 0;
    const pctTL2 = j2.totalTL_int > 0 ? (j2.totalTL_an / j2.totalTL_int * 100) : 0;
    const pctT2_1 = j1.totalT2_int > 0 ? (j1.totalT2_an / j1.totalT2_int * 100) : 0;
    const pctT2_2 = j2.totalT2_int > 0 ? (j2.totalT2_an / j2.totalT2_int * 100) : 0;
    const pctT3_1 = j1.totalT3_int > 0 ? (j1.totalT3_an / j1.totalT3_int * 100) : 0;
    const pctT3_2 = j2.totalT3_int > 0 ? (j2.totalT3_an / j2.totalT3_int * 100) : 0;

    function cmp(v1, v2, higherIsBetter = true) {
        if (v1 === v2) return 'tie';
        return (v1 > v2) === higherIsBetter ? 'j1' : 'j2';
    }

    const stats = [
        { label: 'Partidos Jugados',   d1: pj1,                    d2: pj2,                    winner: cmp(pj1, pj2) },
        { label: 'Puntos Totales',     d1: j1.totalPts,             d2: j2.totalPts,             winner: cmp(j1.totalPts, j2.totalPts) },
        { label: 'Media PTS/Partido',  d1: avg1.toFixed(1),         d2: avg2.toFixed(1),         winner: cmp(avg1, avg2) },
        { label: 'Máx. Puntos',        d1: maxPts1,                 d2: maxPts2,                 winner: cmp(maxPts1, maxPts2) },
        { label: 'Triples Anotados',   d1: j1.totalT3_an,           d2: j2.totalT3_an,           winner: cmp(j1.totalT3_an, j2.totalT3_an) },
        { label: '% Triples (T3)',     d1: pctT3_1.toFixed(0) + '%',d2: pctT3_2.toFixed(0) + '%',winner: cmp(pctT3_1, pctT3_2) },
        { label: '% Dobles (T2)',      d1: pctT2_1.toFixed(0) + '%',d2: pctT2_2.toFixed(0) + '%',winner: cmp(pctT2_1, pctT2_2) },
        { label: '% Tiros Libres',     d1: pctTL1.toFixed(0) + '%', d2: pctTL2.toFixed(0) + '%', winner: cmp(pctTL1, pctTL2) },
        { label: 'Faltas Totales',     d1: j1.totalFC,              d2: j2.totalFC,              winner: cmp(j1.totalFC, j2.totalFC, false) },
    ];

    const wins1 = stats.filter(s => s.winner === 'j1').length;
    const wins2 = stats.filter(s => s.winner === 'j2').length;

    const rowsHtml = stats.map(s => {
        const w1 = s.winner === 'j1';
        const w2 = s.winner === 'j2';
        const tie = s.winner === 'tie';
        const cls1 = w1 ? 'bg-orange-100 text-orange-700 font-black rounded-lg px-2 py-1' : tie ? 'text-gray-500 px-2 py-1' : 'text-gray-400 px-2 py-1';
        const cls2 = w2 ? 'bg-blue-100 text-blue-700 font-black rounded-lg px-2 py-1' : tie ? 'text-gray-500 px-2 py-1' : 'text-gray-400 px-2 py-1';
        const badge1 = w1 ? ' 🏆' : tie ? ' 🤝' : '';
        const badge2 = w2 ? '🏆 ' : tie ? '🤝 ' : '';
        return `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-2 px-3 text-right"><span class="text-base ${cls1}">${s.d1}${badge1}</span></td>
                <td class="py-2 px-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">${s.label}</td>
                <td class="py-2 px-3 text-left"><span class="text-base ${cls2}">${badge2}${s.d2}</span></td>
            </tr>`;
    }).join('');

    const nombre1Short = j1.nombre.split(' ').slice(0, 2).join(' ');
    const nombre2Short = j2.nombre.split(' ').slice(0, 2).join(' ');

    document.getElementById('resultados-duelo-jugadores').innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-3 gap-2 text-center items-center bg-gradient-to-r from-orange-50 via-white to-blue-50 rounded-xl p-4 border border-gray-200">
                <div>
                    <p class="text-xl font-black text-orange-600">#${j1.dorsal}</p>
                    <p class="text-sm font-bold text-gray-800 leading-tight">${nombre1Short}</p>
                    <div class="mt-2 bg-orange-600 text-white rounded-full px-3 py-1 inline-block text-xs font-bold">${wins1} victorias</div>
                </div>
                <div class="text-2xl">⚔️</div>
                <div>
                    <p class="text-xl font-black text-blue-600">#${j2.dorsal}</p>
                    <p class="text-sm font-bold text-gray-800 leading-tight">${nombre2Short}</p>
                    <div class="mt-2 bg-blue-600 text-white rounded-full px-3 py-1 inline-block text-xs font-bold">${wins2} victorias</div>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full"><tbody>${rowsHtml}</tbody></table>
            </div>
        </div>`;
    document.getElementById('resultados-duelo-jugadores').classList.remove('hidden');
};

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('DOM loaded, starting app...');
        await app.iniciar();
        console.log('App initialized and rendered successfully');

        // Esperar un poco más para asegurar que todo esté renderizado
        setTimeout(() => {
            const loader = document.getElementById('loading-screen');
            if (loader) {
                console.log('Hiding loading screen...');
                loader.classList.add('fade-out');
                // Eliminar del DOM tras la animación
                setTimeout(() => {
                    loader.remove();
                    console.log('Loading screen removed');
                }, 500);
            } else {
                console.warn('Loading screen not found');
            }
        }, 1000); // Aumentar el delay
    } catch (error) {
        console.error('Error during app initialization:', error);
        // Mostrar error en pantalla
        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.innerHTML = `
                <div class="loader-spinner"></div>
                <div class="loader-text">Error al cargar la aplicación</div>
                <div class="text-xs text-white mt-2">Revisa la consola para más detalles</div>
                <pre class="text-xs text-red-300 mt-2">${error.message}</pre>
            `;
        }
    }

    // Registro del Service Worker para PWA con detección de actualizaciones
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    // Detectar si hay una actualización esperando
                    registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    // Nueva versión disponible, se actualizará en la próxima recarga
                                    // o podemos forzarla
                                    mostrarNotificacion('Nueva versión disponible. Actualizando...', 'info');
                                    setTimeout(() => window.location.reload(), 1500);
                                }
                            }
                        };
                    };
                })
                .catch(error => {
                    // Error silencioso
                });
        });

        // Recargar la página cuando el nuevo service worker tome el control
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }

    // Detector de fallos críticos: Si tras 8 segundos la app no ha renderizado nada en el contenedor, forzar refresco
    setTimeout(() => {
        const appContainer = document.getElementById('app');
        if (appContainer && appContainer.innerHTML === "") {
            console.warn('⚠️ Detectado posible fallo de carga persistente. Forzando refresco de emergencia...');
            window.forzarRefrescoPersonalizado();
        }
    }, 8000);
});

// Exportar la app para uso en otros módulos si es necesario
export default app;
