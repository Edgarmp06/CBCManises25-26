# 🏀 CBC Manises-Quart - Sistema de Gestión Deportiva

> Plataforma integral de seguimiento, estadísticas y administración para el equipo Cadete Masculino - Temporada 2025/26

**Última actualización:** 8 de enero de 2026

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://cbc-manises.vercel.app)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-orange?logo=firebase)](https://firebase.google.com)
[![Performance](https://img.shields.io/badge/PageSpeed-99%2F100-brightgreen)](https://pagespeed.web.dev/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Arquitectura](#-arquitectura-de-la-aplicación)
- [Instalación](#-desarrollo)
- [Estructura de Datos Firebase](#-estructura-de-datos)
- [Deployment](#-deployment)
- [Rendimiento](#-estadísticas-de-rendimiento)
- [Enlaces](#-enlaces)
- [Autor](#-desarrollo)

---

## 🌟 Características

### ✅ Gestión de Partidos

#### 📅 Calendario Inteligente
- Visualización completa de todos los partidos de la temporada
- **Sistema de fases dual** (1ª y 2ª fase) con filtrado sincronizado
- Badges visuales de fase: 🟡 Primera Fase / 🔵 Segunda Fase
- Próximos partidos destacados con cuenta regresiva
- Indicadores de partido en directo (🔴 LIVE)

#### 🔴 Marcadores en Directo
- Seguimiento en tiempo real durante los partidos
- **Control independiente de marcador local/visitante** (bug corregido)
- Gestión por cuartos (Q1, Q2, Q3, Q4, OT)
- Actualización automática visible para todos los usuarios
- Sistema de anotaciones en vivo opcional

#### 📝 Anotaciones en Vivo
- Registro opcional de anotadores durante el partido
- Selector de jugador desde JUGADORES_EQUIPO con dorsales correctos
- Registro de puntos (+1, +2, +3) por cuarto
- Visualización pública en tiempo real
- Resumen organizado por jugador
- **Sugerencias automáticas para el acta oficial**

### 📊 Sistema de Actas Oficiales

#### ✏️ Gestión Completa
- **Creación de actas** con editor intuitivo
- **Heredan automáticamente la fase del partido** (1ª/2ª)
- Selector de jugadores desde plantilla oficial (JUGADORES_EQUIPO)
- Dorsales siempre correctos y sincronizados
- **Validaciones automáticas** de campos obligatorios
- **Edición y eliminación** con confirmaciones de seguridad
- Panel de gestión exclusivo para administradores

#### 📈 Estadísticas Automáticas
Las actas calculan automáticamente:
- Porcentajes de tiro libre, T2, T3
- Puntos totales por jugador
- Minutos jugados
- Faltas cometidas
- Eficiencia de tiro

### 📈 Gráficas Interactivas (Chart.js)

#### Estadísticas del Equipo
- **Puntos por jornada** - Gráfica de barras con evolución
- **Faltas por jornada** - Línea de tendencia
- **Tiros anotados** - Comparativa T2, T3, TL
- **Porcentaje TL** - Evolución del acierto

#### Estadísticas Individuales
- Selector de jugador con resumen de totales (PJ, PTS, MIN, TL%, FC)
- **% Tiros Libres** por jornada
- **Puntos T2/T3** por partido
- **Faltas** por partido
- **Filtros por fase** sincronizados con el resto de la app

### 🏅 Clasificación de Liga

#### 📊 Sistema de Clasificación Editable (Firebase)
- **Gestión completa desde Firebase** - Datos persistentes en tiempo real
- **Edición inline para administradores** - Sin modales, edición directa en la tabla
- **Migración automática** - Botón de migración de datos de 1ª fase desde constants.js
- **Creación dinámica** - Añadir equipos manualmente con formulario inline
- **Auto-ordenamiento** - Función de corrección automática por puntos (PTS)

#### ✏️ Funcionalidades de Administración
- **➕ Añadir equipo**: Botón inline que crea fila editable en la tabla
- **✏️ Editar inline**: Click en lápiz → fila se convierte en inputs → guardar/cancelar
- **⬆️⬇️ Cambiar posición**: Botones para subir/bajar equipos manualmente
- **🗑️ Eliminar equipo**: Con confirmación de seguridad
- **🔧 Auto-ordenar**: Función `window.corregirPosicionesClasificacion(fase)` ordena por puntos

#### 🎯 Ordenamiento Inteligente
Dos opciones para reordenar la clasificación:

**Opción A - Manual (Botones ⬆️⬇️)**:
- Admins pueden subir/bajar equipos uno a uno
- Cambios inmediatos en Firebase
- Control total sobre el orden

**Opción B - Automático (Consola)**:
```javascript
// Ordenar por puntos automáticamente
await window.corregirPosicionesClasificacion('primera')
await window.corregirPosicionesClasificacion('segunda')
```
- Ordena por puntos (PTS) descendente
- Desempata por diferencia de gol (PF - PC)
- Actualiza todas las posiciones en Firebase
- Recarga la tabla automáticamente

#### 📋 Tabla Completa por Fases
- **1ª Fase**: Clasificación con todas las columnas (J, V, P, NP, PF, PC, Dif., PTS)
- **2ª Fase**: Sistema independiente para el campeonato zonal
- Resaltado especial para CBC Manises-Quart
- Diferencia de puntos con colores (verde/rojo)
- **Estado vacío**: Pantalla con opciones de migración o añadir manual

### 🎨 Interfaz y UX

#### 📱 Diseño Responsive
- **Móvil first** con navegación optimizada
- Tabs adaptativas (Calendario, Resultados, Estadísticas, Clasificación)
- Modales responsive para edición
- Galería de fotos rotativa en fondo

#### ⚡ Rendimiento Excelente
- **99/100 en PageSpeed Insights** (móvil y desktop)
- < 1 segundo tiempo de carga
- Optimizado para conexiones lentas
- Sin frameworks pesados (Vanilla JS)
- < 100KB total del bundle

#### 🔐 Panel de Administración
- Autenticación con Firebase Auth
- **CRUD completo de partidos** con modal intuitivo
- **CRUD completo de actas** con tabla de gestión
- **Ubicaciones personalizadas** con opción Local/Visitante
- Actualización de marcadores en directo
- Logs de cambios y confirmaciones

### 🔄 Sistema de Fases (Nueva Funcionalidad)

#### Implementación Completa
- **Filtros sincronizados** en todas las vistas:
  - Calendario: muestra solo partidos de la fase seleccionada
  - Resultados: filtra por fase
  - Estadísticas: gráficas filtradas por fase
  - Clasificación: tabla por fase
- **Persistencia en localStorage** - recuerda la fase seleccionada
- **Badges visuales** 🟡/🔵 en tarjetas de partidos
- **Las actas heredan automáticamente** la fase del partido

### 🌐 Integración Social

- 💬 **Canal de WhatsApp oficial** con botón directo
- 📱 **Compartir resultados** en redes sociales
- 📊 **Analytics integrado** (Vercel Analytics)

---

## 🛠️ Tecnologías

### Frontend
- **HTML5** - Estructura semántica
- **JavaScript ES6 Modules** - Arquitectura modular
- **Tailwind CSS 3** - Diseño responsive y utilidades

### Gráficas y Visualización
- **Chart.js 4.4.0** - Gráficas interactivas
- **CSS Custom Properties** - Tematización

### Backend y Base de Datos
- **Firebase Firestore** - Base de datos en tiempo real
- **Firebase Auth** - Autenticación segura
- **Firebase Security Rules** - Control de acceso

### Hosting y CI/CD
- **Vercel** - Hosting con despliegue automático
- **GitHub** - Control de versiones
- **Vercel Analytics** - Métricas de rendimiento

### Arquitectura
- **Clean Architecture (5 capas)** - Separación de responsabilidades
- **Event-Driven** - Comunicación entre módulos
- **Real-time listeners** - Sincronización automática

---

## 📁 Estructura del Proyecto

```
CBCManises25-26-main/
├── index.html                 # Página principal
├── css/
│   └── styles.css             # Estilos personalizados
├── js/
│   ├── app.js                 # 🎯 Orquestador principal
│   ├── config.js              # ⚙️ Configuración Firebase + equipos + ubicaciones
│   ├── constants.js           # 📊 Constantes (JUGADORES_EQUIPO, CLASIFICACION)
│   ├── partidos.js            # 🏀 Gestor de partidos (CRUD + listeners)
│   ├── actas.js               # 📝 Gestor de actas (CRUD + listeners)
│   ├── clasificacion.js       # 🏅 Gestor de clasificación (CRUD + auto-ordenamiento)
│   ├── estadisticas.js        # 📈 Procesamiento y gráficas
│   ├── admin.js               # 🔐 Panel admin + autenticación
│   ├── anotaciones.js         # 🎯 Sistema de anotaciones en vivo
│   ├── ui.js                  # 🎨 Gestión de interfaz (2000+ líneas)
│   ├── utils.js               # 🛠️ Funciones auxiliares
│   └── eventBus.js            # 📡 Sistema de eventos
├── imagenes/                  # 🖼️ Galería de fotos (6 imágenes rotativas)
├── logos/                     # 🏆 Logos equipos (1ª y 2ª fase)
│   ├── README.md              # Documentación de logos
│   ├── cbc-manises.jpg        # Logo oficial CBC
│   ├── picanya.jpg            # Primera fase
│   ├── torrent.jpg
│   ├── mislata.jpg
│   ├── moncada.jpg
│   ├── picken.jpg
│   ├── tabernes.jpg           # Segunda fase
│   ├── abastos.jpg
│   ├── escolapias.jpg
│   ├── riba-roja.jpg
│   ├── petraher.jpg
│   └── el-pilar.jpg
├── .gitignore                 # Archivos ignorados
├── robots.txt                 # SEO - Configuración crawlers
├── sitemap.xml                # SEO - Mapa del sitio
├── CLEAN_ARCHITECTURE.md      # 📐 Documentación arquitectura
├── loaderio-*.txt             # Token verificación de carga
└── README.md                  # Este archivo
```

---

## 🏗️ Arquitectura de la Aplicación

### Patrón: Clean Architecture (5 capas)

```
┌─────────────────────────────────────────┐
│  1. PRESENTATION (ui.js)                │
│  - Renderizado HTML                     │
│  - Manejo de eventos DOM                │
│  - Generación de vistas                 │
└─────────────────┬───────────────────────┘
                  ↓ (eventos DOM)
┌─────────────────────────────────────────┐
│  2. APPLICATION (app.js)                │
│  - Orquestación de managers             │
│  - Coordinación de estado global        │
│  - Funciones window.* para HTML         │
└─────────────────┬───────────────────────┘
                  ↓ (llamadas a managers)
┌─────────────────────────────────────────┐
│  3. DOMAIN (partidos, actas, etc.)      │
│  - Lógica de negocio                    │
│  - Reglas de validación                 │
│  - Procesamiento de datos               │
└─────────────────┬───────────────────────┘
                  ↓ (operaciones DB)
┌─────────────────────────────────────────┐
│  4. INFRASTRUCTURE (Firebase)           │
│  - Persistencia en Firestore            │
│  - Listeners en tiempo real             │
│  - Autenticación                        │
└─────────────────┬───────────────────────┘
                  ↓ (utilidades)
┌─────────────────────────────────────────┐
│  5. UTILITIES (utils.js, constants.js)  │
│  - Funciones auxiliares                 │
│  - Formateo de datos                    │
│  - Constantes globales                  │
└─────────────────────────────────────────┘
```

### Características Arquitectónicas

- **Modularización ES6**: Cada archivo es un módulo independiente
- **Singleton pattern**: UIManager y app como instancias únicas
- **Real-time listeners**: Firebase onSnapshot para actualizaciones automáticas
- **Separación de responsabilidades**: UI ≠ Lógica ≠ Datos
- **Sin frameworks**: Vanilla JS puro para máxima ligereza
- **Event-driven**: EventBus para comunicación desacoplada

### Flujo de Datos

```
Firebase (Firestore) ← onSnapshot listeners →
         ↓
   Managers (Partidos, Actas, Estadísticas, Admin)
         ↓
   App.js (orquestación + estado global)
         ↓
   UIManager (generación HTML)
         ↓
   DOM (interfaz usuario)
         ↓
   Eventos usuario → Managers → Firebase
```

---

## 🎯 Estructura de Datos

### Colección: `partidos`

```javascript
{
  id: "auto-generated",
  fecha: "2026-01-10",           // ISO 8601
  hora: "19:00",
  rival: "C.B. Tabernes Blanques A",
  logoRival: "tabernes.jpg",     // Mapeo automático
  esLocal: false,                 // true = en casa, false = visitante
  ubicacion: "PAB MUNI TABERNES BLANQUES",  // Puede ser personalizada
  jornada: "12",
  fase: "segunda",                // "primera" | "segunda"
  finalizado: false,
  enDirecto: false,
  resultadoLocal: "",             // Se rellena al finalizar
  resultadoVisitante: "",
  cuartoActual: "",               // "Q1" | "Q2" | "Q3" | "Q4" | "OT"
  sinActa: false,                 // Incidencia: partido sin acta
  anotaciones: [                  // Array opcional
    {
      jugador: "DARIO MEROÑO PALOMO",
      dorsal: "31",
      puntos: 2,                  // 1, 2 o 3
      cuarto: "Q1",
      timestamp: "2025-11-19T18:30:00.000Z"
    }
  ]
}
```

### Colección: `actas`

```javascript
{
  id: "auto-generated",
  partidoId: "abc123",            // Referencia al partido
  fecha: "2026-01-10",
  rival: "C.B. Tabernes Blanques A",
  logoRival: "tabernes.jpg",
  esLocal: false,
  ubicacion: "PAB MUNI TABERNES BLANQUES",
  resultadoLocal: "58",
  resultadoVisitante: "62",
  jornada: "12",
  fase: "segunda",                // ⭐ Hereda automáticamente del partido
  jugadores: [
    {
      dorsal: "31",               // Desde JUGADORES_EQUIPO
      nombre: "DARIO MEROÑO PALOMO",
      pts: 14,                    // Puntos totales
      min: 28,                    // Minutos jugados
      tl_anotados: 4,
      tl_intentos: 6,
      t2_anotados: 4,
      t2_intentos: 8,
      t3_anotados: 1,
      t3_intentos: 3,
      fc: 3                       // Faltas cometidas
    }
    // ... más jugadores
  ]
}
```

### Configuración: `js/config.js`

```javascript
// Equipos rivales con mapeo de logos
export const EQUIPOS_RIVALES = [
  // PRIMERA FASE
  { nombre: 'Picanya Bàsquet FuturPiso 10', logo: 'picanya.jpg' },
  { nombre: 'Isolia NB Torrent B', logo: 'torrent.jpg' },
  { nombre: 'Mislata BC Verde', logo: 'mislata.jpg' },
  { nombre: 'CB Moncada A', logo: 'moncada.jpg' },
  { nombre: 'Picken MA A', logo: 'picken.jpg' },

  // SEGUNDA FASE
  { nombre: 'C.B. Tabernes Blanques A', logo: 'tabernes.jpg' },
  { nombre: 'CB TLLA Abastos C', logo: 'abastos.jpg' },
  { nombre: 'CB Escolapias CMV', logo: 'escolapias.jpg' },
  { nombre: 'Flex Básquet Riba-Roja', logo: 'riba-roja.jpg' },
  { nombre: 'Academia Petraher B', logo: 'petraher.jpg' },
  { nombre: 'S.D. El Pilar Valencia A', logo: 'el-pilar.jpg' }
];

// Ubicaciones con indicador local/visitante
export const UBICACIONES = [
  { nombre: 'Pabellón Alberto Arnal (Manises)', esLocal: true },

  // PRIMERA FASE
  { nombre: 'Pabellón Municipal Picanya', esLocal: false },
  { nombre: 'Pabellón El Vedat (Torrent)', esLocal: false },
  // ... más ubicaciones

  // SEGUNDA FASE
  { nombre: 'PAB MUNI TABERNES BLANQUES', esLocal: false },
  { nombre: 'IES Cid Campeador (Valencia)', esLocal: false },
  // ... más ubicaciones
];
```

### Colección: `clasificacion` ⭐ NUEVO

```javascript
{
  id: "auto-generated",
  equipo: "PICKEN MA A",            // Nombre del equipo
  fase: "primera",                   // "primera" | "segunda"
  posicion: 1,                       // Posición en la tabla
  j: 10,                             // Partidos jugados
  v: 10,                             // Victorias
  p: 0,                              // Derrotas
  np: 0,                             // No presentado
  pf: 715,                           // Puntos a favor
  pc: 352,                           // Puntos en contra
  pts: 20,                           // Puntos de clasificación
  timestamp: "2025-01-05T12:00:00.000Z"  // Fecha de creación
}
```

**Índice compuesto requerido**:
- Campos: `fase` (Ascending) + `posicion` (Ascending)
- Necesario para consultas con `where('fase', '==', X)` + `orderBy('posicion')`

**Funciones de gestión**:
- `window.migrarClasificacionAFirebase()` - Migración automática de 1ª fase
- `window.mostrarFormAñadirEquipoInline(fase)` - Añadir equipo manualmente
- `window.editarEquipoInline(id)` - Editar equipo inline
- `window.guardarEdicionInline(id)` - Guardar cambios
- `window.cancelarEdicionInline(id)` - Cancelar edición
- `window.subirPosicionEquipo(id)` - Subir posición (swap con anterior)
- `window.bajarPosicionEquipo(id)` - Bajar posición (swap con siguiente)
- `window.eliminarEquipoClasificacionInline(id)` - Eliminar equipo
- `window.corregirPosicionesClasificacion(fase)` - Auto-ordenar por puntos

### Constantes: `js/constants.js`

```javascript
// Plantilla oficial del equipo
export const JUGADORES_EQUIPO = [
  { dorsal: '0', nombre: 'CARLOS LAGO VALLDECABRES' },
  { dorsal: '7', nombre: 'JORGE FERREIRA SÁNCHEZ' },
  { dorsal: '9', nombre: 'HÉCTOR POQUET LIRON' },
  { dorsal: '31', nombre: 'DARIO MEROÑO PALOMO' },
  { dorsal: '33', nombre: 'DANIEL DÍAZ FOLGADO' },
  { dorsal: '37', nombre: 'VICTOR ARDID HERRERO' },
  { dorsal: '43', nombre: 'MARC LUCENA ALIAGA' },
  { dorsal: '45', nombre: 'GUILLEM RUIZ SOLER' },
  { dorsal: '55', nombre: 'RUBEN GIL MUÑOZ' },
  { dorsal: '91', nombre: 'RAUL RUIZ ROCHINA' },
  { dorsal: '96', nombre: 'RAUL GIL MUÑOZ' }
];

// Clasificación por fases (DEPRECATED - Usar colección Firebase 'clasificacion')
export const CLASIFICACION_PRIMERA_FASE = [ /* migrado a Firebase */ ];
export const CLASIFICACION_SEGUNDA_FASE = [ /* migrado a Firebase */ ];
```

---

## 👨‍💻 Desarrollo

### Requerimientos

- Node.js 14+ (opcional, solo para servidor local)
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Cuenta de Firebase (Firestore + Auth)

### Setup Local

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd CBCManises25-26-main

# 2. Configurar Firebase
# Actualizar js/config.js con tus credenciales de Firebase

# 3. Iniciar servidor local (opcional)
# Opción A: Python
python -m http.server 8000

# Opción B: Node.js
npx serve .

# Opción C: VS Code Live Server
# Instalar extensión "Live Server" y click derecho > Open with Live Server

# 4. Abrir en navegador
# http://localhost:8000
```

### Convenciones de Código

- **Comentarios JSDoc**: Todas las funciones documentadas
- **Nombres descriptivos**: Variables y funciones en español
- **Funciones globales**: Expuestas en `window` para acceso desde HTML
- **Console.logs**: Incluidos para debugging con emojis (🔥, ✅, ❌, etc.)
- **ES6 Modules**: Imports/exports explícitos

### Testing Manual

```bash
# Probar en móvil
npm run build && npx serve -s dist

# Verificar rendimiento
# https://pagespeed.web.dev/

# Comprobar base de datos
# https://console.firebase.google.com
```

---

## 🚀 Deployment

### Configuración Vercel

El proyecto se despliega automáticamente en Vercel cuando se hace push a la rama `main`.

**Configuración**:
- Build Command: Ninguno (HTML estático)
- Output Directory: `.` (raíz del proyecto)
- Framework Preset: Other

### Seguridad Firebase

Las credenciales de Firebase en `js/config.js` son **públicas por diseño**. La seguridad se gestiona mediante:

- **Firebase Security Rules**: Controlan acceso a lectura/escritura
- **Firebase Auth**: Autenticación para panel admin
- **Validación en servidor**: Reglas de Firestore, no en cliente

**Ejemplo de Security Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Partidos: todos leen, solo admins escriben
    match /partidos/{partidoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Actas: todos leen, solo admins escriben
    match /actas/{actaId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Clasificación: todos leen, solo admins escriben
    match /clasificacion/{clasificacionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Índices compuestos requeridos en Firestore**:
1. **Colección `clasificacion`**:
   - Campos: `fase` (Ascending) + `posicion` (Ascending)
   - Crear en: Firebase Console → Firestore Database → Indexes
   - Necesario para consultas filtradas por fase ordenadas por posición

📝 **Ver instrucciones completas**: [INSTRUCCIONES_FIREBASE_RULES.md](INSTRUCCIONES_FIREBASE_RULES.md)

### CI/CD Automático

```bash
# Hacer cambios en local
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# → Vercel detecta el push
# → Ejecuta build automático
# → Despliega a producción
# → URL: https://cbc-manises.vercel.app
```

---

## 📈 Estadísticas de Rendimiento

### Velocidad (PageSpeed Insights)

- 🚀 **Móvil**: 99/100
- 🖥️ **Desktop**: 99/100

### Métricas Core Web Vitals

- **LCP** (Largest Contentful Paint): < 1.2s
- **FID** (First Input Delay): < 50ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Capacidad

- ✅ Soporta 10,000+ usuarios simultáneos
- ✅ Tiempo de carga < 1 segundo
- ✅ Optimizado para conexiones 3G

### Bundle Size

- HTML + CSS + JS: < 100KB
- Chart.js: 200KB (CDN)
- Firebase SDK: 400KB (CDN)
- **Total First Load**: < 700KB

---

## 📊 Contenido Actual

### Clasificación Grupo D - 1ª Fase (Final)

| Pos | Equipo | J | V | P | NP | PF | PC | Dif. | PTS |
|-----|--------|---|---|---|----|----|-------|------|-----|
| 🥇 | PICKEN MA A | 10 | 10 | 0 | 0 | 715 | 352 | +363 | 20 |
| 🥈 | PICANYA BASQUET | 10 | 6 | 4 | 0 | 627 | 606 | +21 | 16 |
| 🥉 | CB MONCADA "A" | 10 | 5 | 5 | 0 | 587 | 640 | -53 | 15 |
| 4 | ISOLIA NB TORRENT B | 10 | 4 | 6 | 0 | 567 | 630 | -63 | 14 |
| **5** | **CBC MANISES-QUART** | 10 | 4 | 6 | 0 | 625 | 687 | -62 | 14 |
| 6 | MISLATA BC VERDE | 10 | 1 | 9 | 0 | 390 | 596 | -206 | 11 |

### Segunda Fase - Campeonato 1ª Zonal Grupo D

Inicio: **10 de enero de 2026**

**Equipos participantes** (7 equipos):
- CBC Manises-Quart
- Mislata BC Verde (repite de 1ª fase)
- C.B. Tabernes Blanques A
- CB TLLA Abastos C
- CB Escolapias CMV
- Flex Básquet Riba-Roja
- Academia Petraher B
- S.D. El Pilar Valencia A

### Plantilla Oficial

**11 jugadores** - Cadete Masculino 2025/26

| Dorsal | Nombre Completo |
|--------|-----------------|
| 0 | CARLOS LAGO VALLDECABRES |
| 7 | JORGE FERREIRA SÁNCHEZ |
| 9 | HÉCTOR POQUET LIRON |
| 31 | DARIO MEROÑO PALOMO |
| 33 | DANIEL DÍAZ FOLGADO |
| 37 | VICTOR ARDID HERRERO |
| 43 | MARC LUCENA ALIAGA |
| 45 | GUILLEM RUIZ SOLER |
| 55 | RUBEN GIL MUÑOZ |
| 91 | RAUL RUIZ ROCHINA |
| 96 | RAUL GIL MUÑOZ |

---

## 🔗 Enlaces

- **🌐 Web Oficial**: [cbc-manises.vercel.app](https://cbc-manises.vercel.app)
- **💬 Canal WhatsApp**: [Únete aquí](https://whatsapp.com/channel/0029VbBc5Eh4SpkD0kfaV93T)
- **📱 Instagram**: [@edgarmp06](https://instagram.com/edgarmp06)
- **📧 Email**: cbcmanisesweb@gmail.com

---

## 📱 Funcionalidades por Rol

### Para Usuarios (Sin autenticación)

- ✅ Ver calendario de próximos partidos
- ✅ Seguir partidos en directo con marcador actualizado
- ✅ Ver anotaciones en vivo durante los partidos
- ✅ Consultar resultados históricos con filtros por fase
- ✅ Ver actas oficiales con estadísticas detalladas
- ✅ Analizar gráficas de evolución del equipo
- ✅ Ver estadísticas personales por jugador
- ✅ Seguir la clasificación de liga
- ✅ Filtrar por fase (1ª/2ª) en todas las vistas
- ✅ Unirse al canal de WhatsApp

### Para Administradores (Con autenticación)

- 🔐 Acceso al panel de administración
- ➕ Crear partidos con ubicaciones normales o personalizadas
- ✏️ Editar partidos desde cualquier vista (modal intuitivo)
- 🗑️ Eliminar partidos con confirmación
- 🔴 Actualizar marcadores en directo
- 🎯 Registrar anotadores opcionalmente durante el partido
- 📝 Crear actas oficiales desde plantilla
- 📊 Ver sugerencias automáticas basadas en anotaciones
- 🗂️ Gestionar actas (editar/eliminar)
- 📍 Usar ubicaciones personalizadas con opción Local/Visitante
- 🏅 **Gestionar clasificación inline** (añadir, editar, reordenar, eliminar equipos)
- 🔧 **Auto-ordenar clasificación** por puntos con función de consola
- 📤 **Migrar datos** de constants.js a Firebase con un solo click

---

## 🎉 Hitos del Proyecto

- **9 Oct 2025**: 🚀 Lanzamiento inicial de la web
- **18 Oct 2025**: ⚡ Primer partido con seguimiento en directo
- **19 Oct 2025**: 📊 Implementación de actas oficiales e indicador de cuarto
- **22 Oct 2025**: 💬 Creación del canal de WhatsApp oficial
- **31 Oct 2025**: 🗳️ Cierre de encuesta de funcionalidades (9 votos para gráficas)
- **3 Nov 2025**: 📈 Gráficas de estadísticas implementadas
- **19 Nov 2025**: 🎯 Sistema de anotaciones en vivo y modal de edición
- **26 Dic 2025**: 🏆 Finalización de 1ª fase con clasificación completa
- **31 Dic 2025**: 🔄 Sistema de fases completo + ubicaciones personalizadas
- **5 Ene 2026**: 🏅 Sistema de clasificación editable inline con Firebase
- **8 Ene 2026**: 🔧 Función de auto-ordenamiento de clasificación por puntos

---

## 🗺️ Roadmap

### ✅ Completado

- [x] Calendario y resultados
- [x] Marcadores en directo
- [x] Anotaciones en vivo
- [x] Actas oficiales con CRUD
- [x] Gráficas interactivas
- [x] Clasificación de liga
- [x] Sistema de fases (1ª/2ª)
- [x] Ubicaciones personalizadas
- [x] Filtros persistentes
- [x] Panel de administración completo
- [x] **Clasificación editable inline** (Firebase) ⭐ NUEVO
- [x] **Auto-ordenamiento por puntos** ⭐ NUEVO
- [x] **Migración automática de datos** ⭐ NUEVO

### 🔮 Futuras Mejoras

- [ ] Exportar actas a PDF
- [ ] Comparador de jugadores
- [ ] Histórico de temporadas
- [ ] Notificaciones push
- [ ] App móvil nativa (PWA)
- [ ] Modo offline
- [ ] Galería de fotos por partido

---

## 📄 Aviso Legal

Esta web es informativa y muestra datos públicos del equipo Cadete Masculino del CBC Manises-Quart. Los nombres y estadísticas publicados corresponden a jugadores federados en competición oficial.

**Privacidad**:
- No recopila datos personales
- No usa cookies de seguimiento
- Utiliza Firebase (Google) para almacenamiento de datos deportivos
- Cumple con RGPD

---

## 👨‍💻 Autor

Desarrollado con ❤️ por **Edgar MP** para el CBC Manises-Quart

**Contacto**:
- 📧 Email: cbcmanisesweb@gmail.com
- 📱 Instagram: [@edgarmp06](https://instagram.com/edgarmp06)
- 🌐 Web: [cbc-manises.vercel.app](https://cbc-manises.vercel.app)

---

## 📄 Licencia

Este proyecto es privado y pertenece a Edgar MP.

© 2025 Edgar MP - Todos los derechos reservados

---

**Temporada 2025/26 • Preferente Cadete Masculino Grupo D → IR Campeonato 1ª Zonal Grupo D**

🔗 [cbc-manises.vercel.app](https://cbc-manises.vercel.app) | 💬 [Canal WhatsApp](https://whatsapp.com/channel/0029VbBc5Eh4SpkD0kfaV93T) | 📱 [Instagram](https://instagram.com/edgarmp06)
