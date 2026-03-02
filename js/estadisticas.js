/**
 * Módulo de Gestión de Estadísticas y Gráficas
 *
 * Responsabilidades:
 * - Procesamiento de datos de jugadores
 * - Creación de gráficas con Chart.js
 * - Cálculos de estadísticas del equipo
 * - Estadísticas individuales por jugador
 */

import { JUGADORES_EQUIPO } from './constants.js';

export class EstadisticasManager {
    constructor() {
        this.datosJugadores = {};
        this.jugadores = JUGADORES_EQUIPO; // Plantilla oficial con dorsales correctos
        this.jugadorSeleccionado = '';
        this.filtroFase = 'todas'; // 'todas', 'primera', 'segunda'
    }

    /**
     * Establece el filtro de fase para estadísticas
     * @param {string} fase - 'todas', 'primera', 'segunda'
     */
    setFiltroFase(fase) {
        this.filtroFase = fase;
    }

    /**
     * Obtiene el filtro de fase actual
     * @returns {string} Filtro actual
     */
    getFiltroFase() {
        return this.filtroFase;
    }

    /**
     * Filtra actas por fase
     * @param {Array} actas - Lista de actas
     * @param {string} fase - 'todas', 'primera', 'segunda'
     * @returns {Array} Actas filtradas
     */
    obtenerActasPorFase(actas, fase) {
        if (fase === 'todas') return actas;
        return actas.filter(acta => (acta.fase || 'primera') === fase);
    }

    /**
     * Procesa todas las actas para generar datos de jugadores
     * @param {Array} actas - Lista de actas oficiales
     */
    procesarDatosJugadores(actas) {
        this.datosJugadores = {};

        // NO aplicar filtro de fase - el selector debe mostrar TODOS los jugadores de TODA la temporada
        // const actasFiltradas = this.obtenerActasPorFase(actas, this.filtroFase);

        actas.forEach(acta => {
            if (!acta.jugadores || !Array.isArray(acta.jugadores)) {
                return;
            }

            acta.jugadores.forEach(jugador => {
                if (!this.datosJugadores[jugador.nombre]) {
                    this.datosJugadores[jugador.nombre] = {
                        nombre: jugador.nombre,
                        dorsal: jugador.dorsal,
                        partidos: [],
                        totalPts: 0,
                        totalMin: 0,
                        totalTL_an: 0,
                        totalTL_int: 0,
                        totalT2_an: 0,
                        totalT2_int: 0,
                        totalT3_an: 0,
                        totalT3_int: 0,
                        totalFC: 0
                    };
                }

                this.datosJugadores[jugador.nombre].partidos.push({
                    jornada: acta.jornada,
                    pts: jugador.pts,
                    min: jugador.min,
                    tl_an: jugador.tl.anotados,
                    tl_int: jugador.tl.intentos,
                    t2_an: jugador.t2.anotados,
                    t2_int: jugador.t2.intentos,
                    t3_an: jugador.t3.anotados,
                    t3_int: jugador.t3.intentos,
                    fc: jugador.fc
                });

                this.datosJugadores[jugador.nombre].totalPts += jugador.pts;
                this.datosJugadores[jugador.nombre].totalMin += jugador.min;
                this.datosJugadores[jugador.nombre].totalTL_an += jugador.tl.anotados;
                this.datosJugadores[jugador.nombre].totalTL_int += jugador.tl.intentos;
                this.datosJugadores[jugador.nombre].totalT2_an += jugador.t2.anotados;
                this.datosJugadores[jugador.nombre].totalT2_int += jugador.t2.intentos;
                this.datosJugadores[jugador.nombre].totalT3_an += jugador.t3.anotados;
                this.datosJugadores[jugador.nombre].totalT3_int += jugador.t3.intentos;
                this.datosJugadores[jugador.nombre].totalFC += jugador.fc;
            });
        });
    }

    /**
     * Obtiene los datos procesados de jugadores
     * @returns {Object} Datos de jugadores
     */
    getDatosJugadores() {
        return this.datosJugadores;
    }

    /**
     * Obtiene datos de un jugador específico
     * @param {string} nombre - Nombre del jugador
     * @returns {Object|null} Datos del jugador
     */
    getDatosJugador(nombre) {
        return this.datosJugadores[nombre] || null;
    }

    /**
     * Selecciona un jugador para ver sus estadísticas
     * @param {string} nombre - Nombre del jugador
     */
    seleccionarJugador(nombre) {
        this.jugadorSeleccionado = nombre;
    }

    /**
     * Obtiene el jugador actualmente seleccionado
     * @returns {string} Nombre del jugador seleccionado
     */
    getJugadorSeleccionado() {
        return this.jugadorSeleccionado;
    }

    /**
     * Destruye una gráfica si existe
     * @param {string} canvasId - ID del canvas
     */
    destruirGrafica(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const chart = Chart.getChart(canvas);
            if (chart) chart.destroy();
        }
    }

    /**
     * Destruye todas las gráficas del equipo
     */
    destruirGraficasEquipo() {
        const graficasEquipo = [
            'chartPuntosEquipo',
            'chartFaltasEquipo',
            'chartTirosEquipo',
            'chartPorcentajeTLEquipo'
        ];

        graficasEquipo.forEach(id => this.destruirGrafica(id));
    }

    /**
     * Destruye todas las gráficas de jugador
     */
    destruirGraficasJugador() {
        const graficasJugador = [
            'chartJugadorTL',
            'chartJugadorT2',
            'chartJugadorT3',
            'chartJugadorFaltas'
        ];

        graficasJugador.forEach(id => this.destruirGrafica(id));
    }

    /**
     * Crea las gráficas de estadísticas del equipo
     * @param {Array} actas - Lista de actas oficiales
     */
    crearGraficasEquipo(actas) {
        // Destruir gráficas anteriores
        this.destruirGraficasEquipo();

        // Aplicar filtro de fase
        const actasFiltradas = this.obtenerActasPorFase(actas, this.filtroFase);

        if (actasFiltradas.length === 0) {
            return;
        }

        // Filtrar solo actas válidas con jugadores
        const actasValidas = actasFiltradas.filter(a =>
            a.jugadores && Array.isArray(a.jugadores) && a.jugadores.length > 0
        );

        if (actasValidas.length === 0) {
            return;
        }

        const actasOrdenadas = [...actasValidas].sort((a, b) =>
            parseInt(a.jornada) - parseInt(b.jornada)
        );

        // Preparar datos
        const jornadas = actasOrdenadas.map(a => `J${a.jornada}`);
        const puntosEquipo = actasOrdenadas.map(a =>
            a.jugadores.reduce((sum, j) => sum + (j.pts || 0), 0)
        );
        const faltasEquipo = actasOrdenadas.map(a =>
            a.jugadores.reduce((sum, j) => sum + (j.fc || 0), 0)
        );
        const t2_anotados = actasOrdenadas.map(a =>
            a.jugadores.reduce((sum, j) => sum + (j.t2?.anotados || 0), 0)
        );
        const t3_anotados = actasOrdenadas.map(a =>
            a.jugadores.reduce((sum, j) => sum + (j.t3?.anotados || 0), 0)
        );
        const tl_anotados = actasOrdenadas.map(a =>
            a.jugadores.reduce((sum, j) => sum + (j.tl?.anotados || 0), 0)
        );
        const porcentajesTL = actasOrdenadas.map(a => {
            const totalAn = a.jugadores.reduce((sum, j) => sum + j.tl.anotados, 0);
            const totalInt = a.jugadores.reduce((sum, j) => sum + j.tl.intentos, 0);
            return totalInt > 0 ? Math.round((totalAn / totalInt) * 100) : 0;
        });

        // Gráfica 1: Puntos del equipo
        this._crearGraficaPuntosEquipo(jornadas, puntosEquipo);

        // Gráfica 2: Faltas del equipo
        this._crearGraficaFaltasEquipo(jornadas, faltasEquipo);

        // Gráfica 3: Tiros anotados por tipo
        this._crearGraficaTirosEquipo(jornadas, t2_anotados, t3_anotados, tl_anotados);

        // Gráfica 4: Porcentaje de tiros libres
        this._crearGraficaPorcentajeTLEquipo(jornadas, porcentajesTL);
    }

    /**
     * Crea la gráfica de puntos del equipo
     * @private
     */
    _crearGraficaPuntosEquipo(jornadas, puntosEquipo) {
        const ctx = document.getElementById('chartPuntosEquipo');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: jornadas,
                datasets: [{
                    label: 'Puntos',
                    data: puntosEquipo,
                    backgroundColor: 'rgba(255, 107, 53, 0.8)',
                    borderColor: 'rgba(255, 107, 53, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Puntos del Equipo por Jornada',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Puntos' }
                    }
                }
            }
        });
    }

    /**
     * Crea la gráfica de faltas del equipo
     * @private
     */
    _crearGraficaFaltasEquipo(jornadas, faltasEquipo) {
        const ctx = document.getElementById('chartFaltasEquipo');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: jornadas,
                datasets: [{
                    label: 'Faltas',
                    data: faltasEquipo,
                    borderColor: 'rgba(220, 38, 38, 1)',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Faltas del Equipo por Jornada',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Faltas' }
                    }
                }
            }
        });
    }

    /**
     * Crea la gráfica de tiros anotados del equipo
     * @private
     */
    _crearGraficaTirosEquipo(jornadas, t2_anotados, t3_anotados, tl_anotados) {
        const ctx = document.getElementById('chartTirosEquipo');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: jornadas,
                datasets: [
                    {
                        label: 'T2 anotados',
                        data: t2_anotados,
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        tension: 0.3
                    },
                    {
                        label: 'T3 anotados',
                        data: t3_anotados,
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        tension: 0.3
                    },
                    {
                        label: 'TL anotados',
                        data: tl_anotados,
                        borderColor: 'rgba(245, 158, 11, 1)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    title: {
                        display: true,
                        text: 'Tiros Anotados por Tipo',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Tiros anotados' }
                    }
                }
            }
        });
    }

    /**
     * Crea la gráfica de porcentaje de tiros libres del equipo
     * @private
     */
    _crearGraficaPorcentajeTLEquipo(jornadas, porcentajesTL) {
        const ctx = document.getElementById('chartPorcentajeTLEquipo');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: jornadas,
                datasets: [{
                    label: '% TL',
                    data: porcentajesTL,
                    borderColor: 'rgba(168, 85, 247, 1)',
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: '% de Acierto en Tiros Libres',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Porcentaje (%)' }
                    }
                }
            }
        });
    }

    /**
     * Crea las gráficas de un jugador específico
     * @param {string} nombre - Nombre del jugador
     */
    crearGraficasJugador(nombre) {
        // Destruir gráficas anteriores
        this.destruirGraficasJugador();

        const datos = this.datosJugadores[nombre];
        if (!datos || datos.partidos.length === 0) {
            return;
        }

        const partidosOrdenados = [...datos.partidos].sort((a, b) =>
            parseInt(a.jornada) - parseInt(b.jornada)
        );
        const jornadas = partidosOrdenados.map(p => `J${p.jornada}`);

        // Preparar datos
        const porcTL = partidosOrdenados.map(p =>
            p.tl_int > 0 ? Math.round((p.tl_an / p.tl_int) * 100) : 0
        );
        const puntosT2 = partidosOrdenados.map(p => p.t2_an * 2);
        const puntosT3 = partidosOrdenados.map(p => p.t3_an * 3);
        const faltas = partidosOrdenados.map(p => p.fc);

        // Crear gráficas
        this._crearGraficaJugadorTL(jornadas, porcTL);
        this._crearGraficaJugadorT2(jornadas, puntosT2);
        this._crearGraficaJugadorT3(jornadas, puntosT3);
        this._crearGraficaJugadorFaltas(jornadas, faltas);
    }

    /**
     * Crea la gráfica de porcentaje TL del jugador
     * @private
     */
    _crearGraficaJugadorTL(jornadas, porcTL) {
        const ctx = document.getElementById('chartJugadorTL');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: jornadas,
                datasets: [{
                    label: '% TL',
                    data: porcTL,
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: '% Tiros Libres por Jornada',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: '%' }
                    }
                }
            }
        });
    }

    /**
     * Crea la gráfica de puntos T2 del jugador
     * @private
     */
    _crearGraficaJugadorT2(jornadas, puntosT2) {
        const ctx = document.getElementById('chartJugadorT2');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: jornadas,
                datasets: [{
                    label: 'Puntos T2',
                    data: puntosT2,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Puntos de Tiros de 2 por Jornada',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Puntos' }
                    }
                }
            }
        });
    }

    /**
     * Crea la gráfica de puntos T3 del jugador
     * @private
     */
    _crearGraficaJugadorT3(jornadas, puntosT3) {
        const ctx = document.getElementById('chartJugadorT3');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: jornadas,
                datasets: [{
                    label: 'Puntos T3',
                    data: puntosT3,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Puntos de tiros de 3 por Jornada',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Puntos' }
                    }
                }
            }
        });
    }

    /**
     * Crea la gráfica de faltas del jugador
     * @private
     */
    _crearGraficaJugadorFaltas(jornadas, faltas) {
        const ctx = document.getElementById('chartJugadorFaltas');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: jornadas,
                datasets: [{
                    label: 'Faltas',
                    data: faltas,
                    borderColor: 'rgba(220, 38, 38, 1)',
                    backgroundColor: 'rgba(220, 38, 38, 0.2)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Faltas por Jornada',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Faltas' }
                    }
                }
            }
        });
    }

    /**
     * Obtiene las estadísticas totales del equipo
     * @param {Array} actas - Lista de actas
     * @returns {Object} Estadísticas totales
     */
    getEstadisticasTotalesEquipo(actas) {
        if (!actas || actas.length === 0) {
            return null;
        }

        let totalPuntos = 0;
        let totalFaltas = 0;
        let totalTL_an = 0;
        let totalTL_int = 0;
        let totalT2_an = 0;
        let totalT3_an = 0;

        actas.forEach(acta => {
            if (acta.jugadores) {
                acta.jugadores.forEach(j => {
                    totalPuntos += j.pts || 0;
                    totalFaltas += j.fc || 0;
                    totalTL_an += j.tl?.anotados || 0;
                    totalTL_int += j.tl?.intentos || 0;
                    totalT2_an += j.t2?.anotados || 0;
                    totalT3_an += j.t3?.anotados || 0;
                });
            }
        });

        const porcentajeTL = totalTL_int > 0
            ? Math.round((totalTL_an / totalTL_int) * 100)
            : 0;

        return {
            partidos: actas.length,
            totalPuntos,
            promedioPuntos: Math.round(totalPuntos / actas.length),
            totalFaltas,
            promedioFaltas: Math.round(totalFaltas / actas.length),
            porcentajeTL,
            totalT2: totalT2_an,
            totalT3: totalT3_an
        };
    }
}
