# 🏀 CBC Manises-Quart - Web Oficial

Web oficial del equipo Cadete Masculino del CBC Manises-Quart para la temporada 2025/26.

## 🌟 Características

### ✅ Implementado

- 📅 **Calendario de partidos** - Todos los partidos de la temporada con filtros por fase
- 🔴 **Marcadores en directo** - Seguimiento en tiempo real durante los partidos
- 📝 **Anotaciones en vivo** - Sistema opcional para registrar anotadores durante el partido
  - Selector de jugador al anotar puntos (+1, +2, +3)
  - Visualización pública de anotaciones
  - Resumen organizado por jugador con sugerencias para el acta
  - Opción de saltar registro si no se desea usar
- 🏆 **Resultados** - Historial completo de partidos finalizados con filtros por fase
- 📊 **Actas oficiales** - Estadísticas detalladas de cada jugador por partido
  - Gestión completa de actas (crear, editar, eliminar)
  - Editor intuitivo con validaciones
  - Visualización con estadísticas calculadas
  - Panel de gestión de actas para administrador
- 📈 **Gráficas de estadísticas** - Visualización de evolución del equipo e individual
  - Estadísticas del equipo por jornada (puntos, faltas, tiros, % TL)
  - Estadísticas individuales por jugador (% TL, puntos T2/T3, faltas)
  - Selector de jugador con resumen de totales
  - Gráficas interactivas con Chart.js
  - Filtros por fase (1ª, 2ª, todas)
- 🏅 **Clasificación de la liga** - Tabla de posiciones del Grupo D
  - Visualización completa de 1ª fase con todas las columnas (J, V, P, NP, PF, PC, Dif., PTS)
  - Resaltado de CBC Manises-Quart
  - Diferencia de puntos con colores (verde/rojo)
  - Placeholder para 2ª fase (enero 2026)
- 📱 **Diseño responsive** - Optimizado para móvil, tablet y escritorio
- ⚡ **Rendimiento excelente** - 99/100 en PageSpeed Insights (móvil y desktop)
- 💬 **Canal de WhatsApp** - Botón directo para unirse al canal oficial
- 🔐 **Panel de administración** - Gestión completa
  - Crear/editar/eliminar partidos
  - Crear/editar/eliminar actas
  - Visualización de logs de cambios
  - Tabla de gestión de actas con delete buttons
- 🎨 **Galería de fotos** - Fondo rotativo con imágenes del equipo
- ✏️ **Edición intuitiva** - Modales para editar partidos desde cualquier vista
- 🔄 **Filtro de fases** - Sistema completo de filtrado por 1ª/2ª fase en todas las vistas
  - Calendario: filtrado automático por fase
  - Resultados: filtrado por fase
  - Estadísticas: gráficas filtradas por fase
  - Almacenamiento en localStorage

### 🔧 Mejoras Recientes (Última sesión)

- ✅ Sistema de fases implementado (1ª/2ª fase con filtrado completo)
- ✅ Bug de marcador corregido (puntos a equipos correctos)
- ✅ Selector de jugadores mejorado (obtiene de todas las actas, dorsales siempre correctos)
- ✅ Gestión de actas mejorada (delete functionality, confirmación)
- ✅ Tab de clasificación completamente funcional
- ✅ Interfaz mejorada con botones responsive

## 🛠️ Tecnologías

- **Frontend**: HTML5, JavaScript ES6 Modules, Tailwind CSS 3
- **Gráficas**: Chart.js 4.4.0
- **Backend**: Firebase Firestore (base de datos en tiempo real)
- **Autenticación**: Firebase Auth
- **Hosting**: Vercel con CI/CD automático
- **Analytics**: Vercel Analytics + Speed Insights
- **Arquitectura**: Clean Architecture (5 capas)

## 📁 Estructura del Proyecto

```
web_balonmcesto/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos personalizados (complementa Tailwind)
├── js/
│   ├── config.js           # Configuración Firebase y ubicaciones
│   ├── constants.js        # Constantes globales (TABS, JUGADORES, CLASIFICACION, etc.)
│   ├── partidos.js         # Gestor de partidos (CRUD + listeners)
│   ├── actas.js            # Gestor de actas oficiales (CRUD + listeners)
│   ├── estadisticas.js     # Procesamiento de datos y generación de gráficas
│   ├── admin.js            # Panel de administración y autenticación
│   ├── anotaciones.js      # Sistema de anotaciones en vivo
│   ├── ui.js               # Gestión de interfaz (2000+ líneas, todas las vistas)
│   ├── app.js              # Orquestador principal y punto de entrada
│   ├── utils.js            # Funciones auxiliares (formateo, validación)
│   ├── eventBus.js         # Sistema de eventos (comunicación entre módulos)
│   └── constants.js        # Constantes (TABS, CLASIFICACION, JUGADORES_EQUIPO, etc.)
├── imagenes/               # Imágenes de fondo rotativo (6 imágenes)
├── logos/                  # Logos de equipos rivales (6 equipos)
├── .gitignore              # Archivos ignorados por Git
├── robots.txt              # Configuración SEO para crawlers
├── sitemap.xml             # Mapa del sitio para SEO
├── CLEAN_ARCHITECTURE.md   # Documentación detallada de arquitectura
├── loaderio-*.txt          # Token de verificación de carga
└── README.md               # Este archivo
```

## 🏗️ Arquitectura de la Aplicación

### Patrón: Clean Architecture (5 capas)

```
1. PRESENTATION (ui.js)
   ↓ (eventos DOM)
2. APPLICATION (app.js)
   ↓ (orquestación)
3. DOMAIN (partidos.js, actas.js, etc.)
   ↓ (lógica de negocio)
4. INFRASTRUCTURE (firebase)
   ↓ (persistencia)
5. UTILITIES (utils.js, constants.js)
```

### Características arquitectónicas:

- **Modularización ES6**: Cada archivo es un módulo independiente
- **Singleton pattern**: UIManager y app como instancias únicas
- **Listeners en tiempo real**: Firebase onSnapshot para actualizaciones automáticas
- **Separación de responsabilidades**: UI ≠ Lógica ≠ Datos
- **Sin frameworks**: Vanilla JS puro para máxima ligereza (< 100KB total)

## 🎯 Flujo de Datos

```
Firebase (Firestore)
    ↓ (onSnapshot listeners)
Managers (Partidos, Actas, Estadísticas, Admin)
    ↓ (procesamiento)
App.js (orquestación)
    ↓ (cambios de estado)
UIManager (generación HTML)
    ↓ (renderizado)
DOM (interfaz usuario)
```

## 📊 Contenido Actual

### Clasificación Grupo D - 1ª Fase
| Pos | Equipo | J | V | P | PF | PC | PTS |
|-----|--------|---|---|---|----|----|-----|
| 1 | PICKEN MA A | 10 | 10 | 0 | 715 | 352 | 20 |
| 2 | PICANYA BASQUET | 10 | 6 | 4 | 627 | 606 | 16 |
| 3 | CB MONCADA "A" | 10 | 5 | 5 | 587 | 640 | 15 |
| 4 | ISOLIA NB TORRENT B | 10 | 4 | 6 | 567 | 630 | 14 |
| 5 | **CBC MANISES-QUART** | 10 | 4 | 6 | 625 | 687 | 14 |
| 6 | MISLATA BC VERDE | 10 | 1 | 9 | 390 | 596 | 11 |

### Plantilla de Jugadores
- 11 jugadores en plantilla oficial
- Dorsales: 0, 7, 9, 31, 33, 37, 43, 45, 55, 91, 96
- Sistema de actualización de estadísticas por acta

## 🔗 Enlaces

- **Web**: [cbc-manises.vercel.app](https://cbc-manises.vercel.app)
- **Canal WhatsApp**: [Únete aquí](https://whatsapp.com/channel/0029VbBc5Eh4SpkD0kfaV93T)
- **Instagram**: [Síguenos](https://instagram.com/edgarmp06)

## 📈 Estadísticas de Rendimiento

### Velocidad (PageSpeed Insights)
- 🚀 **Móvil**: 99/100
- 🖥️ **Desktop**: 99/100

### Capacidad
- ✅ Soporta 10,000+ usuarios simultáneos
- ✅ Tiempo de carga < 1 segundo
- ✅ Optimizado para conexiones lentas

### Engagement
- 📱 Totalmente responsive
- 💬 Integración WhatsApp
- 📊 Analytics integrado

## 🚀 Deployment

### Desde GitHub
```bash
git push origin main
```
→ Se despliega automáticamente en Vercel

### Variables de entorno necesarias
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 👨‍💻 Desarrollo

### Requerimientos
- Node.js 14+
- npm o yarn
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Setup Local
```bash
# 1. Clonar repositorio
git clone <repo-url>

# 2. Instalar dependencias
npm install

# 3. Configurar Firebase
# Actualizar js/config.js con tus credenciales

# 4. Iniciar servidor
npm start

# 5. Abrir en navegador
# http://localhost:3000
```

## 📝 Notas de Desarrollo

### Convenciones de Código
- **Comentarios JSDoc**: Cada función documentada
- **Nombres descriptivos**: Variables y funciones en español para claridad
- **Funciones globales**: Expuestas en `window` para acceso desde HTML
- **Console.logs**: Incluidos para debugging con emojis

### Testing Manual
- Probar en móvil: `npm run build && serve -s dist`
- Verificar rendimiento: PageSpeed Insights
- Comprobar BD: Firebase Console

## 📄 Licencia

Proyecto educativo para CBC Manises-Quart
Temporada 2025/26
- **Instagram**: [@edgarmp06](https://instagram.com/edgarmp06)
- **Email**: cbcmanisesweb@gmail.com

## 📱 Funcionalidades por Rol

### Para Usuarios

- Ver calendario de próximos partidos
- Seguir partidos en directo
- **Ver anotaciones en vivo durante los partidos**
- Consultar resultados históricos
- Ver actas oficiales con estadísticas detalladas
- **📊 Ver gráficas de evolución del equipo**
- **👤 Ver estadísticas personales por jugador**
- **📈 Seguir la evolución jornada a jornada**
- Unirse al canal de WhatsApp para recibir avisos

### Para Administradores

- Añadir y editar partidos mediante modal intuitivo
- Actualizar marcadores en tiempo real
- **Registrar anotadores opcionalmente durante el partido**
- Gestionar cuartos del partido
- Crear actas oficiales con estadísticas de jugadores
- **Ver sugerencias automáticas de estadísticas basadas en anotaciones**
- **Las gráficas se generan automáticamente al subir actas**
- Control completo del contenido

## 🎯 Estructura de Datos

### Partidos
```javascript
{
  fecha: "2025-10-27",
  hora: "19:00",
  rival: "Isolia NB Torrent B",
  logoRival: "torrent.jpg",
  esLocal: false,
  ubicacion: "Pabellón El Vedat (Torrent)",
  jornada: "2",
  finalizado: false,
  resultadoLocal: "",
  resultadoVisitante: "",
  enDirecto: false,
  cuartoActual: "",
  anotaciones: []  // Array de anotaciones en vivo
}
```

### Anotaciones (Nuevo)
```javascript
{
  jugador: "DARIO MEROÑO PALOMO",
  puntos: 2,  // 1, 2 o 3
  cuarto: "Q1",
  timestamp: "2025-11-19T18:30:00.000Z"
}
```

### Actas
```javascript
{
  partidoId: "abc123",
  fecha: "2025-10-20",
  rival: "Picanya Bàsquet",
  logoRival: "picanya.jpg",
  esLocal: true,
  ubicacion: "Pabellón Alberto Arnal (Manises)",
  resultadoLocal: "45",
  resultadoVisitante: "42",
  jornada: "1",
  jugadores: [
    {
      dorsal: "7",
      nombre: "NOMBRE APELLIDOS",
      pts: 12,
      min: 25,
      tl: { anotados: 3, intentos: 4, porcentaje: 75 },
      t2: { anotados: 3, intentos: 6 },
      t3: { anotados: 1, intentos: 3 },
      fc: 2
    }
  ]
}
```

### Procesamiento de Estadísticas

Las estadísticas se procesan automáticamente desde las actas:
- **Por equipo**: Suma de todos los jugadores por jornada
- **Por jugador**: Evolución individual a lo largo de la temporada
- **Cálculos**: Porcentajes de acierto, totales acumulados, medias
- **Sugerencias**: El sistema de anotaciones genera sugerencias automáticas para el acta

## 📈 Tipos de Gráficas

### Estadísticas del Equipo
1. **Puntos por Jornada** - Gráfica de barras con puntos totales
2. **Faltas por Jornada** - Línea de evolución de faltas
3. **Tiros Anotados** - Línea múltiple (T2, T3, TL anotados)
4. **% Tiros Libres** - Evolución del porcentaje de acierto en TL

### Estadísticas Individuales
1. **% Tiros Libres** - Porcentaje por jornada
2. **Puntos T2** - Puntos conseguidos en tiros de 2
3. **Puntos T3** - Puntos conseguidos en tiros de 3
4. **Faltas** - Evolución de faltas por partido
5. **Resumen** - Totales de PJ, PTS, MIN, TL%, FC

## 🚀 Deployment

El proyecto se despliega automáticamente en Vercel cuando se hace push a la rama `main`.

### Configuración de Despliegue

1. **Repositorio**: GitHub (público o privado)
2. **Plataforma**: Vercel
3. **Configuración**:
   - Build Command: Ninguno (HTML estático)
   - Output Directory: `.` (raíz del proyecto)
   - Framework Preset: Other
4. **Variables de entorno**: No necesarias (Firebase usa credenciales públicas de frontend)

### Seguridad Firebase

Las credenciales de Firebase en `js/config.js` son públicas por diseño. La seguridad se gestiona mediante:
- **Firebase Security Rules**: Controlan quién puede leer/escribir en la base de datos
- **Firebase Auth**: Autenticación para el panel de administración
- **Validación**: En las reglas de Firestore, no en el cliente

**Ejemplo de Security Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /partidos/{partidoId} {
      allow read: if true;  // Cualquiera puede leer
      allow write: if request.auth != null;  // Solo autenticados
    }
  }
}
```

## 🎉 Hitos del Proyecto

- **9 Oct 2025**: 🚀 Lanzamiento inicial de la web
- **18 Oct 2025**: ⚡ Primer partido con seguimiento en directo
- **19 Oct 2025**: 📊 Implementación de actas oficiales e indicador de cuarto
- **22 Oct 2025**: 💬 Creación del canal de WhatsApp oficial
- **31 Oct 2025**: 🗳️ Cierre de encuesta de funcionalidades (9 votos para gráficas)
- **3 Nov 2025**: 📈 Gráficas de estadísticas implementadas
- **19 Nov 2025**: 🎯 Sistema de anotaciones en vivo y modal de edición

## 🗳️ Encuesta de Funcionalidades (27-31 Oct 2025)

**Resultados:**
1. 🏆 Gráficas de evolución - **9 votos** ✅ IMPLEMENTADO
2. 🏅 Clasificación de liga - **4 votos** 📋 Próximamente

## 👨‍💻 Desarrollo

Desarrollado por **Edgar MP** para el CBC Manises.

**Contacto**:
- 📧 Email: cbcmanisesweb@gmail.com
- 📱 Instagram: [@edgarmp06](https://instagram.com/edgarmp06)

## 📄 Aviso Legal

Esta web es informativa y muestra datos públicos del equipo Cadete Masculino. Los nombres y estadísticas publicados corresponden a jugadores federados en competición oficial. La web no recopila datos personales ni usa cookies de seguimiento. Utiliza Firebase (Google) para almacenar información deportiva del equipo.

## 📄 Licencia

Este proyecto es privado y pertenece a Edgar MP.

---

**Temporada 2025/26 • Preferente Cadete Masculino Grupo D**

🔗 [cbc-manises.vercel.app](https://cbc-manises.vercel.app) | 💬 [Canal WhatsApp](https://whatsapp.com/channel/0029VbBc5Eh4SpkD0kfaV93T)
