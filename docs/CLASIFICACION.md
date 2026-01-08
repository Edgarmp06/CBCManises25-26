# 🏅 Sistema de Clasificación Editable - Documentación Técnica

**Última actualización:** 8 de enero de 2026
**Versión:** 2.0.0
**Módulo:** `js/clasificacion.js`

---

## 📋 Tabla de Contenidos

- [Resumen](#-resumen)
- [Arquitectura](#-arquitectura)
- [Estructura de Datos](#-estructura-de-datos)
- [API ClasificacionManager](#-api-clasificacionmanager)
- [Funciones Globales](#-funciones-globales)
- [Flujo de Datos](#-flujo-de-datos)
- [Edición Inline](#%EF%B8%8F-edición-inline)
- [Auto-Ordenamiento](#-auto-ordenamiento)
- [Migración de Datos](#-migración-de-datos)
- [Firebase Configuration](#-firebase-configuration)
- [Troubleshooting](#-troubleshooting)
- [Screenshots Sugeridos](#-screenshots-sugeridos)

---

## 🎯 Resumen

El Sistema de Clasificación Editable permite gestionar la tabla de clasificación de liga de forma dinámica y persistente mediante Firebase Firestore.

### Características Principales

✅ **CRUD Completo**: Crear, leer, actualizar y eliminar equipos
✅ **Edición Inline**: Edición directa en la tabla sin modales
✅ **Auto-Ordenamiento**: Función de corrección automática por puntos
✅ **Tiempo Real**: Sincronización automática con Firebase
✅ **Migración Automática**: Botón para migrar datos de 1ª fase desde constants.js
✅ **Gestión de Posiciones**: Botones ⬆️⬇️ para reordenar manualmente
✅ **Pantalla Vacía**: UI específica cuando no hay datos en Firebase

### Datos Gestionados

- Nombre del equipo
- Fase (primera/segunda)
- Posición en tabla
- Estadísticas: J, V, P, NP, PF, PC, PTS
- Timestamps de creación/modificación

---

## 🏗️ Arquitectura

### Componentes del Sistema

```
┌──────────────────────────────────────────────────┐
│  Firebase Firestore                              │
│  ├── colección: clasificacion                    │
│  │   ├── documento 1 (equipo 1ª fase, pos 1)     │
│  │   ├── documento 2 (equipo 1ª fase, pos 2)     │
│  │   ├── documento N (equipo 2ª fase, pos 1)     │
│  └── índice compuesto: fase + posicion           │
└──────────────────┬───────────────────────────────┘
                   ↓ (onSnapshot listeners)
┌──────────────────────────────────────────────────┐
│  ClasificacionManager (js/clasificacion.js)      │
│  ├── añadirEquipoClasificacion()                 │
│  ├── actualizarEquipoClasificacion()             │
│  ├── eliminarEquipoClasificacion()               │
│  ├── obtenerClasificaciones() [real-time]        │
│  └── obtenerClasificacionesUnaVez() [once]       │
└──────────────────┬───────────────────────────────┘
                   ↓ (usado por)
┌──────────────────────────────────────────────────┐
│  App.js - Funciones Globales                     │
│  ├── window.migrarClasificacionAFirebase()       │
│  ├── window.editarEquipoInline()                 │
│  ├── window.guardarEdicionInline()               │
│  ├── window.cancelarEdicionInline()              │
│  ├── window.subirPosicionEquipo()                │
│  ├── window.bajarPosicionEquipo()                │
│  ├── window.eliminarEquipoClasificacionInline()  │
│  └── window.corregirPosicionesClasificacion() ⭐ │
└──────────────────┬───────────────────────────────┘
                   ↓ (llaman a)
┌──────────────────────────────────────────────────┐
│  UIManager (js/ui.js)                            │
│  ├── mostrarClasificacion(fase)                  │
│  ├── cargarClasificacionFirebase(fase)           │
│  └── mostrarFormAñadirEquipoInline(fase)         │
└──────────────────┬───────────────────────────────┘
                   ↓ (renderiza)
┌──────────────────────────────────────────────────┐
│  DOM - Tabla HTML                                │
│  ├── Fila normal (usuarios)                      │
│  ├── Fila editable (admin en modo edición)       │
│  ├── Fila nueva (admin añadiendo equipo)         │
│  └── Botones admin: ✏️ ⬆️ ⬇️ ➕ 🗑️               │
└──────────────────────────────────────────────────┘
```

### Patrón de Diseño

- **Repository Pattern**: `ClasificacionManager` encapsula acceso a Firestore
- **Dependency Injection**: Recibe `db` en constructor, no lo importa directamente
- **Observer Pattern**: Listeners en tiempo real con `onSnapshot()`
- **Command Pattern**: Funciones globales encapsulan operaciones complejas

---

## 📊 Estructura de Datos

### Documento en Firestore

**Colección:** `clasificacion`

```javascript
{
  id: "abc123xyz", // Auto-generado por Firebase
  equipo: "PICKEN MA A",
  fase: "primera", // "primera" | "segunda"
  posicion: 1,
  j: 10,  // Partidos jugados
  v: 10,  // Victorias
  p: 0,   // Derrotas
  np: 0,  // No presentado
  pf: 715, // Puntos a favor
  pc: 352, // Puntos en contra
  pts: 20, // Puntos de clasificación
  timestamp: "2025-01-05T12:00:00.000Z"
}
```

### Campos Requeridos

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|------------|
| `equipo` | string | Nombre del equipo | Obligatorio, trimmed |
| `fase` | string | "primera" o "segunda" | Obligatorio |
| `posicion` | number | Posición en tabla | Obligatorio, integer |
| `j` | number | Partidos jugados | Obligatorio, integer |
| `v` | number | Victorias | Obligatorio, integer |
| `p` | number | Derrotas | Obligatorio, integer |
| `np` | number | No presentado | Opcional, default 0 |
| `pf` | number | Puntos a favor | Obligatorio, integer |
| `pc` | number | Puntos en contra | Obligatorio, integer |
| `pts` | number | Puntos clasificación | Obligatorio, integer |
| `timestamp` | string | ISO timestamp | Auto-generado |

### Índice Compuesto (Firebase)

**Requerido para consultas**:

- **Campos**: `fase` (Ascending) + `posicion` (Ascending)
- **Colección**: `clasificacion`
- **Scope**: Collection

Sin este índice, las consultas `where('fase', '==', X) + orderBy('posicion')` fallan.

---

## 🔧 API ClasificacionManager

### Constructor

```javascript
constructor(db)
```

**Parámetros:**
- `db` (Firestore): Instancia de Firebase Firestore

**Ejemplo:**
```javascript
const clasificacionManager = new ClasificacionManager(db);
```

### Métodos Principales

#### 1. `añadirEquipoClasificacion(data)`

Añade un nuevo equipo a la clasificación.

```javascript
async añadirEquipoClasificacion(data): Promise<string>
```

**Parámetros:**
```javascript
{
  equipo: string,
  fase: "primera" | "segunda",
  posicion: number,
  j: number,
  v: number,
  p: number,
  np?: number, // Opcional, default 0
  pf: number,
  pc: number,
  pts: number
}
```

**Retorna:** ID del documento creado

**Ejemplo:**
```javascript
const id = await clasificacionManager.añadirEquipoClasificacion({
  equipo: "PICKEN MA A",
  fase: "primera",
  posicion: 1,
  j: 10,
  v: 10,
  p: 0,
  pf: 715,
  pc: 352,
  pts: 20
});
```

#### 2. `actualizarEquipoClasificacion(id, data)`

Actualiza un equipo existente.

```javascript
async actualizarEquipoClasificacion(id: string, data: Object): Promise<void>
```

**Ejemplo:**
```javascript
await clasificacionManager.actualizarEquipoClasificacion("abc123", {
  equipo: "PICKEN MA A",
  posicion: 1,
  pts: 22 // Actualizado
});
```

#### 3. `eliminarEquipoClasificacion(id)`

Elimina un equipo de la clasificación.

```javascript
async eliminarEquipoClasificacion(id: string): Promise<void>
```

**Ejemplo:**
```javascript
await clasificacionManager.eliminarEquipoClasificacion("abc123");
```

#### 4. `obtenerClasificaciones(fase, callback)`

Obtiene clasificaciones con listener en tiempo real.

```javascript
obtenerClasificaciones(
  fase: "primera" | "segunda" | "todas",
  callback?: Function
): Function
```

**Retorna:** Función para detener el listener

**Ejemplo:**
```javascript
const unsubscribe = clasificacionManager.obtenerClasificaciones(
  "primera",
  (clasificaciones) => {
    console.log("Datos actualizados:", clasificaciones);
  }
);

// Detener listener cuando sea necesario
unsubscribe();
```

#### 5. `obtenerClasificacionesUnaVez(fase)`

Obtiene clasificaciones una sola vez (sin listener).

```javascript
async obtenerClasificacionesUnaVez(
  fase: "primera" | "segunda" | "todas"
): Promise<Array>
```

**Ejemplo:**
```javascript
const equipos = await clasificacionManager.obtenerClasificacionesUnaVez("primera");
console.log(`${equipos.length} equipos cargados`);
```

#### 6. `detenerListener()`

Detiene el listener activo de tiempo real.

```javascript
detenerListener(): void
```

**Ejemplo:**
```javascript
clasificacionManager.detenerListener();
```

---

## 🌐 Funciones Globales

Todas estas funciones están expuestas en `window` y son llamadas desde eventos `onclick` en el HTML.

### 1. `window.migrarClasificacionAFirebase()`

Migra automáticamente los 6 equipos finales de 1ª fase desde constants.js a Firebase.

```javascript
window.migrarClasificacionAFirebase(): Promise<void>
```

**Uso:**
- Admin debe estar logueado
- Se ejecuta con confirmación del usuario
- Migra: PICKEN MA A, PICANYA, CB MONCADA, ISOLIA, CBC MANISES-QUART, MISLATA

**Logs esperados:**
```
📤 Iniciando migración de clasificación de 1ª fase...
✅ Migrado 1/6: PICKEN MA A
✅ Migrado 2/6: PICANYA BASQUET FUTURPISO 10
...
🎉 Migración completada exitosamente
```

### 2. `window.mostrarFormAñadirEquipoInline(fase)`

Muestra formulario inline para añadir equipo manualmente.

```javascript
window.mostrarFormAñadirEquipoInline(fase: string): void
```

**Uso:**
- Crea tabla si no existe
- Añade fila editable vacía
- Admin rellena datos y hace click en ✅

### 3. `window.editarEquipoInline(id)`

Activa modo edición para un equipo.

```javascript
window.editarEquipoInline(id: string): void
```

**Comportamiento:**
- Convierte `<td>` en `<input>`
- Muestra botones ✅ Guardar y ❌ Cancelar
- Oculta botones ✏️ ⬆️ ⬇️ 🗑️

### 4. `window.guardarEdicionInline(id)`

Guarda cambios de edición inline.

```javascript
window.guardarEdicionInline(id: string): Promise<void>
```

**Validaciones:**
- Nombre de equipo obligatorio
- Todos los campos numéricos deben ser válidos
- Actualiza Firebase
- Recarga tabla automáticamente

### 5. `window.cancelarEdicionInline(id)`

Cancela edición inline sin guardar.

```javascript
window.cancelarEdicionInline(id: string): Promise<void>
```

**Comportamiento:**
- Descarta cambios
- Recarga tabla desde Firebase
- Restaura estado original

### 6. `window.subirPosicionEquipo(id)`

Sube un equipo una posición en la tabla.

```javascript
window.subirPosicionEquipo(id: string): Promise<void>
```

**Lógica:**
- Intercambia posición con equipo anterior
- Actualiza ambos equipos en Firebase
- Recarga tabla

**Ejemplo:** Equipo en posición 3 → posición 2 (y el de pos 2 → pos 3)

### 7. `window.bajarPosicionEquipo(id)`

Baja un equipo una posición en la tabla.

```javascript
window.bajarPosicionEquipo(id: string): Promise<void>
```

**Lógica:**
- Intercambia posición con equipo siguiente
- Actualiza ambos equipos en Firebase
- Recarga tabla

### 8. `window.eliminarEquipoClasificacionInline(id)`

Elimina un equipo de la clasificación.

```javascript
window.eliminarEquipoClasificacionInline(id: string): Promise<void>
```

**Seguridad:**
- Requiere confirmación del admin
- Elimina de Firebase
- Recarga tabla

### 9. `window.corregirPosicionesClasificacion(fase)` ⭐

**FUNCIÓN ESTRELLA**: Ordena automáticamente todos los equipos por puntos.

```javascript
window.corregirPosicionesClasificacion(fase: string): Promise<void>
```

**Algoritmo de Ordenamiento:**
1. Obtiene todos los equipos de la fase
2. Ordena por puntos (PTS) descendente
3. En caso de empate, ordena por diferencia de gol (PF - PC) descendente
4. Asigna posiciones correctas (1, 2, 3, ...)
5. Actualiza en Firebase solo los que cambiaron
6. Recarga tabla

**Uso desde consola:**
```javascript
// Ordenar 1ª fase
await window.corregirPosicionesClasificacion('primera');

// Ordenar 2ª fase
await window.corregirPosicionesClasificacion('segunda');
```

**Logs esperados:**
```
🔧 Corrigiendo posiciones de primera fase...
📊 6 equipos encontrados
📋 Orden correcto por puntos:
1. PICKEN MA A - 20 pts (posición actual: 2)
2. PICANYA BASQUET FUTURPISO 10 - 16 pts (posición actual: 1)
...
✅ PICKEN MA A: 2 → 1
✅ PICANYA BASQUET FUTURPISO 10: 1 → 2
✅ ¡Corrección completada!
```

---

## 🔄 Flujo de Datos

### Flujo de Creación

```
Usuario admin hace click en "➕ Añadir Equipo"
         ↓
window.mostrarFormAñadirEquipoInline(fase)
         ↓
Se crea fila editable en tabla HTML
         ↓
Admin rellena datos y hace click en ✅
         ↓
window.guardarNuevoEquipoInline(fase)
         ↓
Validaciones de campos
         ↓
window.app.clasificacionManager.añadirEquipoClasificacion(data)
         ↓
addDoc() a Firebase → documento creado
         ↓
window.uiManager.cargarClasificacionFirebase(fase)
         ↓
Tabla recargada con nuevo equipo
```

### Flujo de Edición

```
Admin hace click en ✏️ junto a equipo
         ↓
window.editarEquipoInline(id)
         ↓
<td> se convierten en <input>
         ↓
Admin modifica valores
         ↓
Admin hace click en ✅
         ↓
window.guardarEdicionInline(id)
         ↓
window.app.clasificacionManager.actualizarEquipoClasificacion(id, data)
         ↓
updateDoc() en Firebase
         ↓
window.uiManager.cargarClasificacionFirebase(fase)
         ↓
Tabla recargada con cambios
```

### Flujo de Auto-Ordenamiento

```
Admin abre consola (F12)
         ↓
Ejecuta: await window.corregirPosicionesClasificacion('primera')
         ↓
window.app.clasificacionManager.obtenerClasificacionesUnaVez('primera')
         ↓
Array de equipos desde Firebase
         ↓
Ordenar por PTS desc, luego por (PF-PC) desc
         ↓
Asignar posiciones: 1, 2, 3, ...
         ↓
Para cada equipo con posición incorrecta:
    window.app.clasificacionManager.actualizarEquipoClasificacion(id, {...equipo, posicion})
         ↓
window.uiManager.cargarClasificacionFirebase(fase)
         ↓
Tabla recargada ordenada correctamente
```

---

## ✏️ Edición Inline

### Estados de una Fila

**1. Estado Normal (Usuario o Admin sin editar)**

```html
<tr id="fila-abc123">
  <td>1</td>
  <td>PICKEN MA A</td>
  <td>10</td>
  <td>10</td>
  <td>0</td>
  <td>0</td>
  <td>715</td>
  <td>352</td>
  <td>20</td>
  <td> <!-- Solo visible para admin -->
    <button onclick="editarEquipoInline('abc123')">✏️</button>
    <button onclick="subirPosicionEquipo('abc123')">⬆️</button>
    <button onclick="bajarPosicionEquipo('abc123')">⬇️</button>
    <button onclick="eliminarEquipoClasificacionInline('abc123')">🗑️</button>
  </td>
</tr>
```

**2. Estado Edición (Admin editando)**

```html
<tr id="fila-abc123">
  <td id="posicion-abc123">1</td>
  <td><input id="equipo-abc123" value="PICKEN MA A" /></td>
  <td><input id="j-abc123" type="number" value="10" /></td>
  <td><input id="v-abc123" type="number" value="10" /></td>
  <td><input id="p-abc123" type="number" value="0" /></td>
  <td><input id="np-abc123" type="number" value="0" /></td>
  <td><input id="pf-abc123" type="number" value="715" /></td>
  <td><input id="pc-abc123" type="number" value="352" /></td>
  <td><input id="pts-abc123" type="number" value="20" /></td>
  <td>
    <button onclick="guardarEdicionInline('abc123')">✅</button>
    <button onclick="cancelarEdicionInline('abc123')">❌</button>
  </td>
</tr>
```

**3. Estado Nueva Fila (Admin añadiendo)**

```html
<tr id="fila-nuevo-equipo">
  <td id="posicion-nuevo">-</td>
  <td><input id="equipo-nuevo" placeholder="Nombre del equipo" /></td>
  <td><input id="j-nuevo" type="number" value="0" /></td>
  <td><input id="v-nuevo" type="number" value="0" /></td>
  <td><input id="p-nuevo" type="number" value="0" /></td>
  <td><input id="np-nuevo" type="number" value="0" /></td>
  <td><input id="pf-nuevo" type="number" value="0" /></td>
  <td><input id="pc-nuevo" type="number" value="0" /></td>
  <td><input id="pts-nuevo" type="number" value="0" /></td>
  <td>
    <button onclick="guardarNuevoEquipoInline('primera')">✅</button>
    <button onclick="cancelarNuevoEquipoInline()">❌</button>
  </td>
</tr>
```

### Conversión de Estados

```javascript
// De normal a edición
function editarEquipoInline(id) {
  const fila = document.getElementById(`fila-${id}`);

  // Obtener valores actuales
  const equipo = document.getElementById(`equipo-${id}`).textContent;
  const j = document.getElementById(`j-${id}`).textContent;
  // ...más campos

  // Reemplazar <td> con <input>
  document.getElementById(`equipo-${id}`).innerHTML =
    `<input id="equipo-${id}" value="${equipo}" />`;
  // ...más conversiones

  // Cambiar botones
  document.getElementById(`acciones-${id}`).innerHTML = `
    <button onclick="guardarEdicionInline('${id}')">✅</button>
    <button onclick="cancelarEdicionInline('${id}')">❌</button>
  `;
}
```

---

## 🔧 Auto-Ordenamiento

### Algoritmo Detallado

```javascript
async function corregirPosicionesClasificacion(fase) {
  // 1. Obtener equipos
  const equipos = await clasificacionManager.obtenerClasificacionesUnaVez(fase);

  // 2. Ordenar
  equipos.sort((a, b) => {
    // Primero por puntos
    if (b.pts !== a.pts) {
      return b.pts - a.pts; // Descendente
    }

    // Desempate por diferencia de gol
    const difA = a.pf - a.pc;
    const difB = b.pf - b.pc;
    return difB - difA; // Descendente
  });

  // 3. Asignar posiciones
  for (let i = 0; i < equipos.length; i++) {
    const posicionCorrecta = i + 1;
    const equipo = equipos[i];

    // 4. Actualizar solo si cambió
    if (equipo.posicion !== posicionCorrecta) {
      await clasificacionManager.actualizarEquipoClasificacion(
        equipo.id,
        { ...equipo, posicion: posicionCorrecta }
      );
    }
  }

  // 5. Recargar UI
  await uiManager.cargarClasificacionFirebase(fase);
}
```

### Casos de Uso

**Caso 1: Equipos desordenados tras ediciones manuales**
```
Antes:
1. Equipo B - 18 pts
2. Equipo A - 20 pts  ← Incorrecto
3. Equipo C - 16 pts

Ejecutar: await window.corregirPosicionesClasificacion('primera')

Después:
1. Equipo A - 20 pts ✅
2. Equipo B - 18 pts ✅
3. Equipo C - 16 pts ✅
```

**Caso 2: Desempate por diferencia de gol**
```
Antes:
1. Equipo A - 14 pts (PF: 500, PC: 550, Dif: -50)
2. Equipo B - 14 pts (PF: 625, PC: 687, Dif: -62)

Ejecutar: await window.corregirPosicionesClasificacion('primera')

Después:
1. Equipo A - 14 pts (Dif: -50) ✅ Mejor diferencia
2. Equipo B - 14 pts (Dif: -62) ✅
```

---

## 📤 Migración de Datos

### Flujo de Migración Automática

**Botón de Migración** (solo visible en pantalla vacía para 1ª fase)

```javascript
window.migrarClasificacionAFirebase = async () => {
  const confirmacion = confirm(
    "¿Migrar los 6 equipos finales de 1ª fase a Firebase?\n\n" +
    "Esta acción copiará:\n" +
    "- PICKEN MA A (1º - 20 pts)\n" +
    "- PICANYA BASQUET FUTURPISO 10 (2º - 16 pts)\n" +
    "- CB MONCADA \"A\" (3º - 15 pts)\n" +
    "- ISOLIA NB TORRENT B (4º - 14 pts)\n" +
    "- CRISCOLOR C.B.C MANISES-QUART (5º - 14 pts)\n" +
    "- MISLATA BC VERDE (6º - 11 pts)"
  );

  if (!confirmacion) return;

  const equipos = [
    { equipo: 'PICKEN MA A', posicion: 1, j: 10, v: 10, p: 0, np: 0, pf: 715, pc: 352, pts: 20 },
    { equipo: 'PICANYA BASQUET FUTURPISO 10', posicion: 2, j: 10, v: 6, p: 4, np: 0, pf: 627, pc: 606, pts: 16 },
    { equipo: 'CB MONCADA "A"', posicion: 3, j: 10, v: 5, p: 5, np: 0, pf: 587, pc: 640, pts: 15 },
    { equipo: 'ISOLIA NB TORRENT B', posicion: 4, j: 10, v: 4, p: 6, np: 0, pf: 567, pc: 630, pts: 14 },
    { equipo: 'CRISCOLOR C.B.C MANISES-QUART', posicion: 5, j: 10, v: 4, p: 6, np: 0, pf: 625, pc: 687, pts: 14 },
    { equipo: 'MISLATA BC VERDE', posicion: 6, j: 10, v: 1, p: 9, np: 0, pf: 390, pc: 596, pts: 11 }
  ];

  for (const eq of equipos) {
    await window.app.clasificacionManager.añadirEquipoClasificacion({
      ...eq,
      fase: 'primera'
    });
    console.log(`✅ Migrado: ${eq.equipo}`);
  }

  alert("✅ Migración completada!");
  window.app.renderizar();
};
```

### Prevención de Duplicados

⚠️ **IMPORTANTE**: La migración NO verifica duplicados. Si se ejecuta dos veces:
- Se duplicarán todos los equipos
- Solución: Usar función de eliminación completa y volver a migrar

---

## 🔥 Firebase Configuration

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clasificacion/{clasificacionId} {
      allow read: if true; // Público
      allow write: if request.auth != null; // Solo admins
    }
  }
}
```

### Índice Compuesto

**Firebase Console → Firestore Database → Indexes**

| Collection | Fields indexed | Query scope | Status |
|-----------|---------------|-------------|--------|
| clasificacion | fase (Asc), posicion (Asc) | Collection | Enabled ✅ |

**Crear manualmente:**
1. Ir a Firebase Console
2. Firestore Database → Indexes
3. Create Index
   - Collection ID: `clasificacion`
   - Field 1: `fase` → Ascending
   - Field 2: `posicion` → Ascending
4. Create → Esperar 2-3 minutos

**Crear automáticamente:**
- Intentar cargar clasificación
- En consola aparecerá link azul "Create index"
- Click → Te lleva a Firebase Console con índice pre-configurado

---

## 🐛 Troubleshooting

### Error: "Missing or insufficient permissions"

**Causa:** Security Rules no incluyen colección `clasificacion`

**Solución:**
```javascript
// Añadir a Security Rules
match /clasificacion/{clasificacionId} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

### Error: "The query requires an index"

**Causa:** Falta índice compuesto

**Solución:**
- Click en link azul en error de consola
- O crear manualmente (ver sección Firebase Configuration)

### Error: "Cannot read properties of undefined (reading 'cargarClasificacionFirebase')"

**Causa:** `uiManager` no está expuesto globalmente

**Solución verificada:**
```javascript
// En js/app.js
window.uiManager = uiManager; // ✅ Añadido en línea 250
```

### Error: "Cannot read properties of undefined (reading 'clasificacionManager')"

**Causa:** `window.app` no está expuesto

**Solución verificada:**
```javascript
// En js/app.js
window.app = app; // ✅ Añadido en línea 249
```

### Posiciones incorrectas tras migración

**Causa:** Datos migrados tienen posiciones manuales, no ordenadas por puntos

**Solución:**
```javascript
await window.corregirPosicionesClasificacion('primera');
```

### Tabla vacía tras login de admin

**Causa:** Re-render no se ejecuta después de autenticación

**Solución verificada:**
```javascript
// En js/admin.js - líneas 57-64
if (this.appInstance && this.appInstance.uiManager) {
  setTimeout(() => {
    console.log('🎨 Ejecutando re-render post-autenticación');
    this.appInstance.renderizar();
  }, 100);
}
```

---

## 📸 Screenshots Sugeridos

Documentar con capturas de pantalla:

### 1. Pantalla Vacía (Admin)
- Botón "📤 Migrar Datos de 1ª Fase a Firebase"
- Botón "➕ Añadir Equipos Manualmente"

### 2. Tabla con Datos (Usuario)
- Clasificación completa sin botones de admin
- Resaltado del equipo CBC Manises-Quart

### 3. Tabla con Datos (Admin)
- Columna "Acciones" visible
- Botones ✏️ ⬆️ ⬇️ 🗑️ en cada fila
- Banner naranja "🔑 Modo Administrador"

### 4. Modo Edición Inline
- Fila convertida en inputs
- Botones ✅ Guardar y ❌ Cancelar
- Otros botones ocultos

### 5. Firebase Console
- Colección `clasificacion` con documentos
- Índice compuesto habilitado
- Security Rules actualizadas

### 6. Consola del Navegador
- Logs de migración exitosa
- Logs de corrección de posiciones
- Logs de carga desde Firebase

---

## 📝 Changelog

### v2.0.0 (8 Ene 2026)
- ✅ Sistema de clasificación editable inline implementado
- ✅ Función de auto-ordenamiento por puntos
- ✅ Migración automática de 1ª fase
- ✅ Re-render post-autenticación
- ✅ Pantalla de estado vacío
- ✅ Índice compuesto en Firestore

### v1.0.0 (31 Dic 2025)
- 📊 Clasificación estática desde constants.js
- 🏆 Finalización de 1ª fase

---

## 📞 Contacto

**Desarrollador:** Edgar MP
**Email:** cbcmanisesweb@gmail.com
**Instagram:** [@edgarmp06](https://instagram.com/edgarmp06)
**Web:** [cbc-manises.vercel.app](https://cbc-manises.vercel.app)

---

**Temporada 2025/26 • CBC Manises-Quart** 🏀
