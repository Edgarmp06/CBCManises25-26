# 🏀 CBC Manises-Quart - Sistema de Gestión Deportiva

> Plataforma integral de seguimiento, estadísticas y administración para el equipo Junior Masculino - Temporada 2025/26

**Última actualización:** 27 de abril de 2026

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
- **Ordenación por fecha cronológica** (no por jornada)
  - Si J2 es antes que J1, aparece primero
  - Ideal para gestionar aplazamientos y partidos fuera de orden
  - Próximos partidos: ordenados del más cercano al más lejano
  - Partidos pasados: ordenados del más reciente al más antiguo
- **Sistema de fases múltiple** (1ª Fase, 2ª Fase, Amistosos, Copa Valenciana) con filtrado sincronizado
- Badges visuales de fase: 🟡 1ª Fase / 🔵 2ª Fase / 🤝 Amistoso / 🏆 Copa Valenciana
- Indicadores de partido en directo (🔴 LIVE)

#### 🔴 Marcadores en Directo
- Seguimiento en tiempo real durante los partidos
- **Control independiente de marcador local/visitante**
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
- **Heredan automáticamente la fase del partido**
- Selector de jugadores desde plantilla oficial (JUGADORES_EQUIPO)
- Dorsales siempre correctos y sincronizados
- **Validaciones automáticas** de campos obligatorios
- **Edición y eliminación** con confirmaciones de seguridad
- Panel de gestión exclusivo para administradores
- **🖨️ Exportar a PDF** — botón directo en la vista del acta

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
- **Filtros por fase** — gráficas individuales filtradas por 1ª Fase, 2ª Fase o Temporada Completa

#### 🏆 Tabla de Líderes
- **Top 3 por categoría** visible en la pestaña de Estadísticas:
  - 🏅 Máximo Anotador (puntos totales)
  - 📈 Mejor Media (puntos por partido)
  - ⭐ Valoración (pts + triples − faltas)
  - 🎯 Más Triples Anotados
- **🔥 Racha actual** del equipo — victorias o derrotas consecutivas con indicador de color

#### ⚔️ Rivalidades

**Entre equipos:**
- Compara enfrentamientos directos entre CBC Manises-Quart y cualquier rival
- Historial completo de partidos, marcadores y balance de victorias

**👤⚔️👤 Entre jugadores:**
- Selecciona dos jugadores del CBC y compara 9 categorías:
  Partidos jugados, Puntos totales, Media por partido, Máx. puntos, Triples anotados, % T3, % T2, % TL y Faltas
- El ganador de cada categoría resaltado con 🏆, empates con 🤝

### 🏅 Clasificación de Liga

#### 📊 Sistema de Clasificación Editable (Firebase)
- **Gestión completa desde Firebase** - Datos persistentes en tiempo real
- **Edición inline para administradores** - Sin modales, edición directa en la tabla
- **Creación dinámica** - Añadir equipos manualmente con formulario inline
- **Auto-ordenamiento** - Función de corrección automática por puntos (PTS)

#### 📋 Tabla Completa por Fases
- **1ª Fase**: Clasificación con todas las columnas (J, V, P, NP, PF, PC, Dif., PTS)
- **2ª Fase**: Sistema independiente para el campeonato zonal
- **Copa Valenciana**: Tabla independiente
- Resaltado especial para CBC Manises-Quart
- Diferencia de puntos con colores (verde/rojo)

### 🎨 Interfaz y UX

#### 📱 Diseño Responsive
- **Móvil first** con navegación optimizada
- Tabs adaptativas (Calendario, Resultados, Estadísticas, Clasificación)
- Modales responsive para edición
- Galería de fotos rotativa en fondo

#### ⚡ Rendimiento Excelente
- **99/100 en PageSpeed Insights** (móvil y desktop)
- < 1 segundo tiempo de carga
- Sin frameworks pesados (Vanilla JS)

#### 🔐 Panel de Administración
- Autenticación con Firebase Auth
- **CRUD completo de partidos** con modal intuitivo
- **CRUD completo de actas** con tabla de gestión
- **Ubicaciones personalizadas** con opción Local/Visitante
- Actualización de marcadores en directo

### 🛠️ Sistema de Autocuración
- **Detector de Fallos Críticos**: Refresco automático si la app no carga en 8s
- **Gestión de Caché Inteligente**: Detección inmediata de nuevas versiones
- **Botón de Emergencia**: Opción "Reset App" para usuarios con problemas de carga

---

## 🛠️ Tecnologías

### Frontend
- **HTML5** - Estructura semántica
- **JavaScript ES6 Modules** - Arquitectura modular
- **Tailwind CSS 3** - Diseño responsive y utilidades

### Gráficas y Visualización
- **Chart.js 4.4.0** - Gráficas interactivas

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
├── index.html                 # Página principal y estructura PWA
├── css/
│   └── styles.css             # Design System (naranja/vibrante) + Print CSS
├── js/
│   ├── app.js                 # 🎯 Orquestador y funciones globales
│   ├── config.js              # ⚙️ Equipos rivales y ubicaciones
│   ├── constants.js           # 📊 Datos estáticos (Jugadores/Equipos)
│   ├── partidos.js            # 🏀 Entidad Partidos
│   ├── actas.js               # 📝 Entidad Actas
│   ├── clasificacion.js       # 🏅 Entidad Clasificación
│   ├── estadisticas.js        # 📈 Motor de gráficas (Chart.js)
│   ├── ui.js                  # 🎨 Renderizado y UX
│   └── ...                    # Otros módulos (admin, utils, eventBus)
├── imagenes/                  # 🖼️ Fondos de la aplicación
├── logos/                     # 🏆 Escudos de los rivales
├── README.md                  # Este archivo
├── CLEAN_ARCHITECTURE.md      # Detalles técnicos de arquitectura
├── vercel.json                # Configuración de hosting e Headers
├── sw.js                      # Service Worker (Modo Offline)
└── manifest.json              # Configuración PWA
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
                  ↓
┌─────────────────────────────────────────┐
│  2. APPLICATION (app.js)                │
│  - Orquestación de managers             │
│  - Coordinación de estado global        │
│  - Funciones window.* para HTML         │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  3. DOMAIN (partidos, actas, etc.)      │
│  - Lógica de negocio                    │
│  - Reglas de validación                 │
│  - Procesamiento de datos               │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  4. INFRASTRUCTURE (Firebase)           │
│  - Persistencia en Firestore            │
│  - Listeners en tiempo real             │
│  - Autenticación                        │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  5. UTILITIES (utils.js, constants.js)  │
│  - Funciones auxiliares                 │
│  - Formateo de datos                    │
│  - Constantes globales                  │
└─────────────────────────────────────────┘
```

---

## 🎯 Estructura de Datos

### Colección: `partidos`

```javascript
{
  id: "auto-generated",
  fecha: "2026-05-02",
  hora: "16:30",
  rival: "Barnices Mora CB Chiva",
  logoRival: "chiva.jpg",
  esLocal: false,
  ubicacion: "Centro Deportivo Municipal (Chiva)",
  jornada: "1",
  fase: "segunda",          // "primera" | "segunda" | "amistosos" | "copa_valenciana"
  finalizado: false,
  enDirecto: false,
  resultadoLocal: "",
  resultadoVisitante: "",
  cuartoActual: "",         // "Q1" | "Q2" | "Q3" | "Q4" | "OT"
  sinActa: false
}
```

### Colección: `actas`

```javascript
{
  id: "auto-generated",
  partidoId: "abc123",
  fecha: "2026-05-02",
  rival: "Barnices Mora CB Chiva",
  logoRival: "chiva.jpg",
  esLocal: false,
  ubicacion: "Centro Deportivo Municipal (Chiva)",
  resultadoLocal: "58",
  resultadoVisitante: "62",
  jornada: "1",
  fase: "segunda",          // ⭐ Hereda automáticamente del partido
  jugadores: [
    {
      dorsal: "31",
      nombre: "DARIO MEROÑO PALOMO",
      pts: 14,
      min: 28,
      tl: { anotados: 4, intentos: 6 },
      t2: { anotados: 4, intentos: 8 },
      t3: { anotados: 1, intentos: 3 },
      fc: 3
    }
  ]
}
```

### Configuración: `js/config.js`

```javascript
export const EQUIPOS_RIVALES = [
  // PRIMERA FASE
  { nombre: 'Picanya Bàsquet FuturPiso 10', logo: 'picanya.jpg' },
  { nombre: 'Isolia NB Torrent B',          logo: 'torrent.jpg' },
  { nombre: 'Mislata BC Verde',             logo: 'mislata.jpg' },
  { nombre: 'CB Moncada A',                 logo: 'moncada.jpg' },
  { nombre: 'Picken MA A',                  logo: 'picken.jpg' },

  // SEGUNDA FASE (Campeonato 1ª Zonal)
  { nombre: 'C.B. Tabernes Blanques A',     logo: 'tabernes.jpg' },
  { nombre: 'CB TLLA Abastos C',            logo: 'abastos.jpg' },
  { nombre: 'CB Escolapias CMV',            logo: 'escolapias.jpg' },
  { nombre: 'Flex Básquet Riba-Roja',       logo: 'riba-roja.jpg' },
  { nombre: 'Academia Petraher B',          logo: 'petraher.jpg' },
  { nombre: 'S.D. El Pilar Valencia A',     logo: 'el-pilar.jpg' },

  // SEGUNDA FASE (TF26 Junior Masculino Segunda)
  { nombre: 'Barnices Mora CB Chiva',               logo: 'chiva.jpg' },
  { nombre: 'Picanya Bàsquet FuturPiso 09',         logo: 'picanya.jpg' },
  { nombre: 'Tapas del Sur Jovens L\'Eliana',       logo: 'eliana.jpg' },

  // AMISTOSOS (pretemporada, sin acta)
  { nombre: 'Godella Infantil',             logo: 'godella.jpg' },
  { nombre: 'Valencia Basket Infantil',     logo: 'valencia-basket.jpg' },
  { nombre: 'Valencia Basket Azul',         logo: 'valencia-basket.jpg' }
];
```

### Colección: `clasificacion`

```javascript
{
  id: "auto-generated",
  equipo: "PICKEN MA A",
  fase: "primera",          // "primera" | "segunda" | "copa_valenciana"
  posicion: 1,
  j: 10, v: 10, p: 0, np: 0,
  pf: 715, pc: 352, pts: 20,
  timestamp: "2025-01-05T12:00:00.000Z"
}
```

### Constantes: `js/constants.js`

```javascript
export const JUGADORES_EQUIPO = [
  { dorsal: '0',  nombre: 'CARLOS LAGO VALLDECABRES' },
  { dorsal: '7',  nombre: 'JORGE FERREIRA SÁNCHEZ' },
  { dorsal: '9',  nombre: 'HÉCTOR POQUET LIRON' },
  { dorsal: '31', nombre: 'DARIO MEROÑO PALOMO' },
  { dorsal: '33', nombre: 'DANIEL DÍAZ FOLGADO' },
  { dorsal: '37', nombre: 'VICTOR ARDID HERRERO' },
  { dorsal: '43', nombre: 'MARC LUCENA ALIAGA' },
  { dorsal: '45', nombre: 'GUILLEM RUIZ SOLER' },
  { dorsal: '55', nombre: 'RUBEN GIL MUÑOZ' },
  { dorsal: '91', nombre: 'RAUL RUIZ ROCHINA' },
  { dorsal: '96', nombre: 'RAUL GIL MUÑOZ' }
];
```

---

## 👨‍💻 Desarrollo

### Setup Local

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd CBCManises25-26-main

# 2. Configurar Firebase
# Actualizar js/config.js con tus credenciales de Firebase

# 3. Iniciar servidor local
# Opción A: VS Code Live Server (recomendado)
# Opción B: Python
python -m http.server 8000
# Opción C: Node.js
npx serve .
```

---

## 🚀 Deployment

### Configuración Vercel

- Build Command: Ninguno (HTML estático)
- Output Directory: `.` (raíz del proyecto)
- Framework Preset: Other

### Seguridad Firebase

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /partidos/{partidoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /actas/{actaId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /clasificacion/{clasificacionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Índice compuesto requerido**: colección `clasificacion` → `fase` (Asc) + `posicion` (Asc)

---

## 📈 Estadísticas de Rendimiento

- 🚀 **Móvil**: 99/100 | 🖥️ **Desktop**: 99/100
- **LCP**: < 1.2s | **FID**: < 50ms | **CLS**: < 0.1
- Bundle total: < 700KB (incluyendo Chart.js y Firebase SDK por CDN)

---

## 📊 Contenido Actual

### 1ª Fase - Preferente Cadete Grupo D (Final)

| Pos | Equipo | J | V | P | PTS |
|-----|--------|---|---|---|-----|
| 🥇 | PICKEN MA A | 10 | 10 | 0 | 20 |
| 🥈 | PICANYA BASQUET FuturPiso 10 | 10 | 6 | 4 | 16 |
| 🥉 | CB MONCADA "A" | 10 | 5 | 5 | 15 |
| 4 | ISOLIA NB TORRENT B | 10 | 4 | 6 | 14 |
| **5** | **CBC MANISES-QUART** | **10** | **4** | **6** | **14** |
| 6 | MISLATA BC VERDE | 10 | 1 | 9 | 11 |

### 2ª Fase - Campeonato 1ª Zonal Grupo D (Finalizada)

Inicio: 10 enero 2026 — Rivales: Tabernes Blanques A, CB TLLA Abastos C, CB Escolapias CMV, Flex Básquet Riba-Roja, Academia Petraher B, S.D. El Pilar Valencia A

### TF26 Junior Masculino Segunda (En curso)

Inicio: 2 mayo 2026 — Grupo 03

| Jornada | Fecha | Local | Visitante |
|---------|-------|-------|-----------|
| 1 | 02/05/2026 16:30 | Barnices Mora CB Chiva | **CBC Manises-Quart** |
| 2 | 10/05/2026 10:00 | **CBC Manises-Quart** | Picanya Bàsquet FuturPiso 09 |
| 3 | 17/05/2026 16:30 | Tapas del Sur Jovens L'Eliana | **CBC Manises-Quart** |

### Amistosos de Pretemporada (sin acta)

- Godella Infantil
- Valencia Basket Infantil
- Valencia Basket Azul

### Plantilla Oficial — 11 jugadores

| Dorsal | Nombre |
|--------|--------|
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

## 📱 Funcionalidades por Rol

### Para Usuarios
- ✅ Ver calendario de próximos partidos
- ✅ Seguir partidos en directo
- ✅ Ver anotaciones en vivo
- ✅ Consultar resultados con filtros por fase
- ✅ Ver actas oficiales con estadísticas detalladas
- ✅ Exportar acta a PDF
- ✅ Analizar gráficas del equipo e individuales por fase
- ✅ Tabla de líderes y racha actual
- ✅ Rivalidad entre equipos y entre jugadores
- ✅ Seguir la clasificación de liga

### Para Administradores
- 🔐 CRUD completo de partidos y actas
- 🔴 Marcadores en directo y anotaciones
- 🏅 Gestión inline de clasificación (añadir, editar, reordenar, eliminar)
- 🔧 Auto-ordenar clasificación por puntos
- ⚙️ Reset de caché global

---

## 🎉 Hitos del Proyecto

- **9 Oct 2025**: 🚀 Lanzamiento inicial
- **18 Oct 2025**: ⚡ Primer partido en directo
- **19 Oct 2025**: 📊 Actas oficiales e indicador de cuarto
- **22 Oct 2025**: 💬 Canal de WhatsApp oficial
- **3 Nov 2025**: 📈 Gráficas de estadísticas
- **19 Nov 2025**: 🎯 Anotaciones en vivo y modal de edición
- **26 Dic 2025**: 🏆 Fin de 1ª fase — clasificación completa
- **31 Dic 2025**: 🔄 Sistema de fases + ubicaciones personalizadas
- **5 Ene 2026**: 🏅 Clasificación editable inline con Firebase
- **9 Ene 2026**: 📅 Ordenación inteligente del calendario por fecha
- **2 Mar 2026**: 🛠️ Sistema de autocuración de caché
- **27 Abr 2026**: ⚔️ Rivalidad equipos/jugadores, Tabla de líderes, Racha, PDF, nueva competición TF26

---

## 🗺️ Roadmap

### ✅ Completado

- [x] Calendario y resultados
- [x] Marcadores en directo y anotaciones en vivo
- [x] Actas oficiales con CRUD
- [x] Gráficas interactivas (equipo e individuales por fase)
- [x] Clasificación editable inline con Firebase
- [x] Sistema de fases completo (1ª, 2ª, Amistosos, Copa Valenciana)
- [x] Rivalidad entre equipos
- [x] Rivalidad entre jugadores (duelo estadístico)
- [x] Tabla de líderes con racha actual
- [x] Exportar acta a PDF

---

## 🔗 Enlaces

- **🌐 Web Oficial**: [cbc-manises.vercel.app](https://cbc-manises.vercel.app)
- **💬 Canal WhatsApp**: [Únete aquí](https://whatsapp.com/channel/0029VbBc5Eh4SpkD0kfaV93T)
- **📱 Instagram**: [@edgarmp06](https://instagram.com/edgarmp06)
- **📧 Email**: cbcmanisesweb@gmail.com

---

## 📄 Aviso Legal

Esta web es informativa y muestra datos públicos del equipo Junior Masculino del CBC Manises-Quart. Los nombres y estadísticas publicados corresponden a jugadores federados en competición oficial. No recopila datos personales ni usa cookies de seguimiento.

---

## 👨‍💻 Autor

Desarrollado con ❤️ por **Edgar MP** para el CBC Manises-Quart

---

## 📄 Licencia

Este proyecto es privado y pertenece a Edgar MP. © 2026 Edgar MP - Todos los derechos reservados

---

**Temporada 2025/26 • TF26 Junior Masculino Segunda**

🔗 [cbc-manises.vercel.app](https://cbc-manises.vercel.app) | 💬 [Canal WhatsApp](https://whatsapp.com/channel/0029VbBc5Eh4SpkD0kfaV93T) | 📱 [Instagram](https://instagram.com/edgarmp06)
