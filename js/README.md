# 📁 JavaScript - Módulos del Proyecto

**Última actualización:** 9 de enero de 2026

Arquitectura modular del sistema de gestión deportiva CBC Manises-Quart.

---

## 📦 Módulos Principales

### `app.js` - Punto de Entrada 🎯

**Responsabilidad:** Orquestador principal de la aplicación

**Funciones:**
- Inicialización de Firebase (Firestore + Auth)
- Coordinación entre managers (Partidos, Actas, Estadísticas, Admin, Anotaciones)
- Gestión del estado global de la aplicación
- Exposición de funciones globales en `window` para acceso desde HTML
- Listeners de eventos en tiempo real

**Funciones globales expuestas:**
```javascript
window.añadirPartidoGlobal()
window.actualizarPartidoGlobal()
window.eliminarPartidoGlobal()
window.toggleUbicacionCustom()
window.toggleUbicacionCustomEditar()
```

**Dependencias:**
- `config.js` - Configuración de Firebase
- `partidos.js` - Manager de partidos
- `actas.js` - Manager de actas
- `estadisticas.js` - Manager de estadísticas
- `admin.js` - Manager de administración
- `anotaciones.js` - Manager de anotaciones
- `ui.js` - Manager de interfaz

---

### `config.js` - Configuración ⚙️

**Responsabilidad:** Almacenar configuración de la aplicación

**Contenido:**
- **firebaseConfig** - Credenciales de Firebase (públicas por diseño)
- **EQUIPOS_RIVALES** - Array de equipos con mapeo de logos
  - Primera fase: 5 equipos
  - Segunda fase: 6 equipos
- **UBICACIONES** - Array de pabellones con indicador local/visitante

**Ejemplo:**
```javascript
export const EQUIPOS_RIVALES = [
  { nombre: 'Picanya Bàsquet FuturPiso 10', logo: 'picanya.jpg' },
  { nombre: 'C.B. Tabernes Blanques A', logo: 'tabernes.jpg' },
  // ...
];

export const UBICACIONES = [
  { nombre: 'Pabellón Alberto Arnal (Manises)', esLocal: true },
  { nombre: 'PAB MUNI TABERNES BLANQUES', esLocal: false },
  // ...
];
```

---

### `constants.js` - Constantes Globales 📊

**Responsabilidad:** Definir constantes utilizadas en toda la app

**Contenido:**
- **JUGADORES_EQUIPO** - Plantilla oficial con dorsales y nombres completos
- **CLASIFICACION_PRIMERA_FASE** - Tabla de clasificación final de 1ª fase
- **CLASIFICACION_SEGUNDA_FASE** - Tabla de clasificación de 2ª fase
- **TABS** - Identificadores de pestañas (calendario, resultados, estadísticas, clasificación)
- **ESTADOS_PARTIDO** - Estados posibles (pendiente, enDirecto, finalizado)
- **CUARTOS** - Definición de cuartos (Q1, Q2, Q3, Q4, OT)
- **INFO_EQUIPO** - Información general del equipo
- **COLORES_GRAFICAS** - Paleta de colores para Chart.js
- **MENSAJES_EXITO / ERRORES** - Mensajes de la aplicación

**Ejemplo:**
```javascript
export const JUGADORES_EQUIPO = [
  { dorsal: '0', nombre: 'CARLOS LAGO VALLDECABRES' },
  { dorsal: '7', nombre: 'JORGE FERREIRA SÁNCHEZ' },
  // ... 11 jugadores total
];
```

---

### `partidos.js` - Gestor de Partidos 🏀

**Responsabilidad:** CRUD completo de partidos + listeners en tiempo real

**Funcionalidades:**
- **Crear partidos** con validaciones
- **Actualizar partidos** (marcador, cuarto, estado)
- **Eliminar partidos** con confirmación
- **Listeners en tiempo real** - Sincronización automática
- **Consultas filtradas** - Por fase, estado, fecha

**Métodos principales:**
```javascript
async añadirPartido(data)
async actualizarPartido(id, data)
async eliminarPartido(id)
obtenerPartidos() // con listener onSnapshot
```

**Datos manejados:**
- fecha, hora, rival, ubicación, jornada, fase
- esLocal (boolean)
- resultadoLocal, resultadoVisitante
- enDirecto, finalizado
- cuartoActual
- anotaciones (array opcional)

---

### `actas.js` - Gestor de Actas 📝

**Responsabilidad:** CRUD de actas oficiales de partidos

**Funcionalidades:**
- **Crear actas** desde plantilla JUGADORES_EQUIPO
- **Heredan automáticamente la fase del partido**
- **Editar actas** existentes
- **Eliminar actas** con confirmación
- **Listeners en tiempo real**
- **Validaciones** de campos obligatorios

**Métodos principales:**
```javascript
async crearActa(data)
async actualizarActa(id, data)
async eliminarActa(id)
obtenerActas() // con listener
obtenerActaPorPartido(partidoId)
```

**Estructura de datos:**
- Metadatos del partido (fecha, rival, ubicación, resultado, jornada, fase)
- Array de jugadores con estadísticas:
  - dorsal, nombre, pts, min
  - tl_anotados, tl_intentos
  - t2_anotados, t2_intentos
  - t3_anotados, t3_intentos
  - fc (faltas cometidas)

---

### `estadisticas.js` - Procesamiento y Gráficas 📈

**Responsabilidad:** Cálculos estadísticos y generación de gráficas

**Funcionalidades:**
- **Procesamiento de actas** - Extrae y calcula estadísticas
- **Filtrado por fase** - 1ª, 2ª o todas
- **Gráficas del equipo** - Puntos, faltas, tiros, % TL por jornada
- **Gráficas individuales** - Estadísticas por jugador
- **Uso de Chart.js** - Configuración y renderizado

**Métodos principales:**
```javascript
procesarEstadisticas(actas, fase)
generarGraficasEquipo(datos)
generarGraficasJugador(jugador, datos)
calcularTotalesJugador(jugador)
```

**Gráficas generadas:**
- Puntos totales por jornada (barras)
- Faltas por jornada (línea)
- Tiros anotados T2/T3/TL (línea múltiple)
- Porcentaje TL (línea)
- Por jugador: % TL, puntos T2, puntos T3, faltas

---

### `admin.js` - Panel de Administración 🔐

**Responsabilidad:** Autenticación y gestión administrativa

**Funcionalidades:**
- **Login/Logout** con Firebase Auth
- **Gestión de sesión** persistente
- **Protección de rutas** administrativas
- **Logs de acciones** (crear, editar, eliminar)

**Métodos principales:**
```javascript
async login(email, password)
async logout()
verificarSesion()
```

**Seguridad:**
- Solo usuarios autenticados pueden escribir en Firestore
- Firebase Security Rules controlan el acceso
- Sesión persistente en el navegador

---

### `anotaciones.js` - Sistema de Anotaciones en Vivo 🎯

**Responsabilidad:** Registro opcional de anotadores durante el partido

**Funcionalidades:**
- **Añadir anotación** (jugador, puntos, cuarto)
- **Eliminar anotación**
- **Listeners en tiempo real** - Visible para todos
- **Resumen automático** por jugador
- **Sugerencias para el acta** basadas en anotaciones

**Métodos principales:**
```javascript
async añadirAnotacion(partidoId, anotacion, anotacionesActuales)
async eliminarAnotacion(partidoId, index, anotacionesActuales)
```

**Estructura de anotación:**
```javascript
{
  jugador: "DARIO MEROÑO PALOMO",
  dorsal: "31",
  puntos: 2,  // 1, 2 o 3
  cuarto: "Q1",
  timestamp: "2025-11-19T18:30:00.000Z"
}
```

---

### `clasificacion.js` - Gestor de Clasificación 🏅 ⭐ NUEVO

**Responsabilidad:** CRUD completo de clasificación + auto-ordenamiento

**Funcionalidades:**
- **Crear equipos** con validaciones
- **Actualizar equipos** (estadísticas y posición)
- **Eliminar equipos** con confirmación
- **Listeners en tiempo real** - Sincronización automática
- **Consultas filtradas** - Por fase (primera/segunda)
- **Auto-ordenamiento** - Función de corrección por puntos

**Métodos principales:**
```javascript
async añadirEquipoClasificacion(data)
async actualizarEquipoClasificacion(id, data)
async eliminarEquipoClasificacion(id)
obtenerClasificaciones(fase, callback) // con listener onSnapshot
async obtenerClasificacionesUnaVez(fase) // sin listener
detenerListener()
```

**Datos manejados:**
- equipo (nombre), fase (primera/segunda), posicion
- j (jugados), v (victorias), p (derrotas), np (no presentado)
- pf (puntos a favor), pc (puntos en contra)
- pts (puntos de clasificación)
- timestamp (fecha de creación/modificación)

**Estructura de documento Firebase:**
```javascript
{
  id: "auto-generated",
  equipo: "PICKEN MA A",
  fase: "primera",
  posicion: 1,
  j: 10,
  v: 10,
  p: 0,
  np: 0,
  pf: 715,
  pc: 352,
  pts: 20,
  timestamp: "2025-01-05T12:00:00.000Z"
}
```

**Índice compuesto requerido:**
- Campos: `fase` (Ascending) + `posicion` (Ascending)
- Necesario para: `where('fase', '==', X)` + `orderBy('posicion')`

**Funciones globales asociadas (en app.js):**
- `window.migrarClasificacionAFirebase()` - Migración 1ª fase
- `window.mostrarFormAñadirEquipoInline(fase)` - Añadir manual
- `window.editarEquipoInline(id)` - Modo edición
- `window.guardarEdicionInline(id)` - Guardar cambios
- `window.cancelarEdicionInline(id)` - Cancelar edición
- `window.subirPosicionEquipo(id)` - Subir en tabla
- `window.bajarPosicionEquipo(id)` - Bajar en tabla
- `window.eliminarEquipoClasificacionInline(id)` - Eliminar
- `window.corregirPosicionesClasificacion(fase)` - Auto-ordenar ⭐

**Auto-Ordenamiento:**
```javascript
// Ordena por puntos (PTS) descendente
// Desempata por diferencia de gol (PF - PC)
await window.corregirPosicionesClasificacion('primera');
await window.corregirPosicionesClasificacion('segunda');
```

---

### `ui.js` - Gestión de Interfaz 🎨

**Responsabilidad:** Renderizado de todas las vistas y componentes

**Funcionalidades:**
- **Generación dinámica de HTML** con template literals
- **Renderizado de tabs** (calendario, resultados, estadísticas, clasificación)
- **Modales** para edición de partidos y actas
- **Formularios** con validaciones
- **Manejo de eventos DOM**
- **Actualización reactiva** cuando cambian los datos
- **Ordenación inteligente de partidos** por fecha cronológica ⭐ NUEVO

**Métodos principales:**
```javascript
render(estado)
generarLayoutPrincipal(estado)
generarCalendario(partidos, fase)
generarResultados(partidos, fase)
generarEstadisticas(actas, fase)
generarClasificacion(fase)
generarPanelAdmin(estado)
mostrarModalEditarPartido(partido)
```

**Ordenación de Partidos (líneas 949-970):**

**Partidos próximos** (`!finalizado`):
- Ordenados por fecha cronológica ascendente (más cercano primero)
- Código: `.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))`
- Ejemplo: Si J2 es el 17 Ene y J1 es el 21 Ene → J2 aparece primero

**Partidos pasados** (`finalizado`):
- Ordenados por fecha cronológica descendente (más reciente primero)
- Código: `.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))`
- Filtro adicional por fase (primera/segunda/todas)

**Ventajas:**
- ✅ Gestión automática de aplazamientos
- ✅ Partidos fuera de orden jornada aparecen en orden real
- ✅ Ideal para 2ª fase con 14 jornadas flexibles
- ✅ El "próximo partido" es siempre el más cercano cronológicamente

**Tamaño:** 2000+ líneas (archivo más grande del proyecto)

**Vistas generadas:**
- Header con navegación
- Tabs responsive
- Tarjetas de partidos
- Tablas de clasificación
- Formularios de admin
- Modales de edición
- Gráficas interactivas

---

### `utils.js` - Funciones Auxiliares 🛠️

**Responsabilidad:** Funciones de utilidad reutilizables

**Funcionalidades:**
- **Formateo de fechas** (ISO → español)
- **Formateo de horas**
- **Validaciones** de formularios
- **Helpers** para manipulación de datos

**Métodos principales:**
```javascript
formatearFecha(fechaISO) // "2025-10-27" → "27 oct 2025"
formatearFechaCorta(fechaISO) // "2025-10-27" → "27/10"
validarEmail(email)
validarFecha(fecha)
```

---

### `eventBus.js` - Sistema de Eventos 📡

**Responsabilidad:** Comunicación desacoplada entre módulos

**Funcionalidades:**
- **Publicar eventos** (emit)
- **Suscribirse a eventos** (on)
- **Desuscribirse** (off)

**Uso:**
```javascript
// Publicar
eventBus.emit('partidoActualizado', { id: '123' });

// Suscribir
eventBus.on('partidoActualizado', (data) => {
  console.log('Partido actualizado:', data);
});
```

**Eventos disponibles:**
- `partidoActualizado`
- `actaCreada`
- `estadisticasActualizadas`
- `authChange`
- `tabChange`

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────┐
│  Usuario interactúa con UI (ui.js)          │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Evento capturado por app.js                │
│  (ej: click en "Añadir Partido")            │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  app.js llama al manager correspondiente    │
│  (ej: partidosManager.añadirPartido())      │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Manager (partidos.js) valida y guarda      │
│  en Firebase Firestore                      │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Firebase onSnapshot detecta cambio         │
│  y actualiza el estado local                │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  app.js renderiza UI con nuevos datos       │
│  llamando a ui.render(estado)               │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Usuario ve cambios reflejados              │
│  automáticamente en tiempo real             │
└─────────────────────────────────────────────┘
```

---

## 📐 Arquitectura: Clean Architecture (5 capas)

### Capa 1: Presentation (ui.js)
- Renderizado de HTML
- Manejo de eventos DOM
- Generación de vistas

### Capa 2: Application (app.js)
- Orquestación de managers
- Coordinación de estado global
- Funciones globales window.*

### Capa 3: Domain (partidos.js, actas.js, etc.)
- Lógica de negocio
- Reglas de validación
- Procesamiento de datos

### Capa 4: Infrastructure (Firebase)
- Persistencia en Firestore
- Listeners en tiempo real
- Autenticación

### Capa 5: Utilities (utils.js, constants.js)
- Funciones auxiliares
- Formateo de datos
- Constantes globales

---

## 🎯 Principios de Diseño

### Modularización ES6
- Cada archivo es un módulo independiente
- Imports/exports explícitos
- Sin dependencias circulares

### Singleton Pattern
- UIManager como instancia única
- App como instancia única
- Managers como servicios singleton

### Real-time Listeners
- Firebase onSnapshot para sincronización automática
- Actualización reactiva sin polling

### Separación de Responsabilidades
- UI ≠ Lógica ≠ Datos
- Cada módulo tiene una única responsabilidad
- Fácil de testear y mantener

### Sin Frameworks
- Vanilla JS puro
- < 100KB total del bundle (sin dependencias externas)
- Máximo rendimiento

---

## 📊 Métricas del Código

### Tamaño de archivos

| Archivo | Líneas | Tamaño | Responsabilidad |
|---------|--------|--------|-----------------|
| ui.js | ~2000 | ~80KB | Interfaz completa |
| app.js | ~830 | ~32KB | Orquestación + funciones globales |
| partidos.js | ~200 | ~8KB | CRUD partidos |
| actas.js | ~150 | ~6KB | CRUD actas |
| clasificacion.js | ~200 | ~8KB | CRUD clasificación ⭐ NUEVO |
| estadisticas.js | ~300 | ~12KB | Gráficas |
| admin.js | ~210 | ~8KB | Autenticación + re-render |
| anotaciones.js | ~80 | ~3KB | Anotaciones |
| constants.js | ~300 | ~12KB | Constantes |
| config.js | ~50 | ~2KB | Configuración |
| utils.js | ~50 | ~2KB | Utilidades |
| eventBus.js | ~30 | ~1KB | Eventos |

**Total:** ~4400 líneas, ~174KB (+700 líneas, +29KB por sistema de clasificación)

---

## 🚀 Mejores Prácticas

### Comentarios JSDoc
Todas las funciones públicas están documentadas:
```javascript
/**
 * Añade un nuevo partido a la base de datos
 * @param {Object} data - Datos del partido
 * @returns {Promise<string>} ID del partido creado
 */
async añadirPartido(data) { ... }
```

### Console.logs con emojis
Para debugging más visual:
```javascript
console.log('🏀 Partido creado:', partidoId);
console.log('✅ Acta guardada correctamente');
console.log('❌ Error al actualizar:', error);
```

### Validaciones
Siempre validar antes de guardar:
```javascript
if (!data.fecha || !data.rival) {
  throw new Error('Campos obligatorios faltantes');
}
```

### Error Handling
Try-catch en todas las operaciones async:
```javascript
try {
  await firebase.collection('partidos').add(data);
} catch (error) {
  console.error('Error:', error);
  alert('Error al guardar');
}
```

---

## 🔧 Mantenimiento

### Añadir nueva funcionalidad

1. **Crear nuevo módulo** si es necesario (ej: `estadisticas-avanzadas.js`)
2. **Importar en app.js**
3. **Inicializar manager** en app.js
4. **Añadir vista** en ui.js si es necesario
5. **Exponer funciones** en window si se usan desde HTML

### Actualizar jugadores

Editar `constants.js` → `JUGADORES_EQUIPO`:
```javascript
export const JUGADORES_EQUIPO = [
  { dorsal: '12', nombre: 'NUEVO JUGADOR' },
  // ...
];
```

### Añadir equipos de 3ª fase

Editar `config.js` → `EQUIPOS_RIVALES`:
```javascript
// TERCERA FASE
{ nombre: 'Nuevo Equipo', logo: 'nuevo.jpg' }
```

---

## 📞 Soporte

**Contacto:** cbcmanisesweb@gmail.com
**Desarrollador:** Edgar MP ([@edgarmp06](https://instagram.com/edgarmp06))

---

**Temporada 2025/26 • CBC Manises-Quart** 🏀
