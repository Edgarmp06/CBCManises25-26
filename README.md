# 🏀 CBC Manises-Quart - Web Oficial

Web oficial del equipo Cadete Masculino del CBC Manises-Quart para la temporada 2025/26.

## 🌟 Características

### ✅ Implementado

- 📅 **Calendario de partidos** - Todos los partidos de la temporada
- 🔴 **Marcadores en directo** - Seguimiento en tiempo real durante los partidos
- 📝 **Anotaciones en vivo** - Sistema opcional para registrar anotadores durante el partido
  - Selector de jugador al anotar puntos (+1, +2, +3)
  - Visualización pública de anotaciones
  - Resumen organizado por jugador con sugerencias para el acta
  - Opción de saltar registro si no se desea usar
- 🏆 **Resultados** - Historial completo de partidos finalizados
- 📊 **Actas oficiales** - Estadísticas detalladas de cada jugador por partido
- 📈 **Gráficas de estadísticas** - Visualización de evolución del equipo e individual
  - Estadísticas del equipo por jornada (puntos, faltas, tiros, % TL)
  - Estadísticas individuales por jugador (% TL, puntos T2/T3, faltas)
  - Selector de jugador con resumen de totales
  - Gráficas interactivas con Chart.js
- 📱 **Diseño responsive** - Optimizado para móvil, tablet y escritorio
- ⚡ **Rendimiento excelente** - 99/100 en PageSpeed Insights (móvil y desktop)
- 💬 **Canal de WhatsApp** - Botón directo para unirse al canal oficial
- 🔐 **Panel de administración** - Gestión completa de partidos, actas y estadísticas
- 🎨 **Galería de fotos** - Fondo rotativo con imágenes del equipo
- ✏️ **Edición de partidos** - Modal intuitivo para editar partidos desde cualquier vista

### 🚀 Próximamente

- 🏅 **Clasificación de la liga** (próxima funcionalidad - 4 votos en encuesta)

## 🛠️ Tecnologías

- **Frontend**: HTML, JavaScript ES6 Modules, Tailwind CSS
- **Gráficas**: Chart.js 4.4.0
- **Backend**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Hosting**: Vercel
- **Analytics**: Vercel Analytics + Speed Insights

## 📁 Estructura del Proyecto

```
web_balonmcesto/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos personalizados
├── js/
│   ├── config.js           # Configuración Firebase y constantes
│   ├── partidos.js         # Gestión de partidos
│   ├── actas.js            # Gestión de actas
│   ├── estadisticas.js     # Procesamiento de estadísticas y gráficas
│   ├── admin.js            # Panel de administración
│   ├── anotaciones.js      # Sistema de anotaciones en vivo
│   ├── ui.js               # Gestión de interfaz y modales
│   ├── app.js              # Archivo principal (punto de entrada)
│   ├── utils.js            # Funciones auxiliares
│   ├── eventBus.js         # Sistema de eventos
│   └── constants.js        # Constantes de la aplicación
├── imagenes/               # Imágenes de fondo del equipo
├── logos/                  # Logos de equipos rivales
├── .gitignore              # Archivos ignorados por Git
├── robots.txt              # Configuración SEO para crawlers
├── sitemap.xml             # Mapa del sitio para SEO
├── CLEAN_ARCHITECTURE.md   # Documentación de arquitectura
└── README.md               # Este archivo
```

### 🏗️ Arquitectura de la Aplicación

- **HTML estático**: Sin frameworks, solo vanilla JavaScript ES6 Modules
- **Modularización**: Cada funcionalidad en su propio módulo JS
- **Firebase**: Base de datos en tiempo real sin servidor backend
- **Despliegue**: GitHub → Vercel (automático en cada push)

## 📊 Estadísticas (19 de noviembre de 2025)

### Rendimiento
- **PageSpeed Insights**:
  - 🚀 Móvil: **99/100**
  - 🖥️ Desktop: **99/100**
- **Test de carga**: ✅ Soporta 10,000 usuarios simultáneos

### Engagement (últimos 7 días)
- **Visitantes únicos**: 34
- **Páginas vistas**: 56
- **Bounce Rate**: 71%
- **Seguidores del canal WhatsApp**: 22 personas

### Contenido
- **Actas subidas**: Múltiples partidos con estadísticas completas
- **Gráficas generadas**: Dinámicas en tiempo real
- **Anotaciones registradas**: Sistema activo y funcionando

## 🔗 Enlaces

- **Web**: [cbc-manises.vercel.app](https://cbc-manises.vercel.app)
- **Canal WhatsApp**: [Únete aquí](https://whatsapp.com/channel/0029VbBc5Eh4SpkD0kfaV93T)
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
