# Guía de Contribución - CBC Manises Web

¡Gracias por tu interés en contribuir al proyecto CBC Manises! Esta guía te ayudará a configurar el entorno de desarrollo y entender el flujo de trabajo.

## Requisitos Previos

- **Editor:** VS Code (recomendado) con la extensión Live Server
- **Navegador:** Chrome, Firefox o Edge (versiones recientes)
- **Cuenta Firebase:** Para testing local (opcional)
- **Git:** Para control de versiones

## Configuración del Entorno

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/CBCManises25-26.git
cd CBCManises25-26
```

### 2. Configurar Firebase (opcional para desarrollo)

Si quieres trabajar con datos reales:

1. Copia `.env.example` a `.env` (no commitear)
2. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
3. Actualiza `js/config.js` con tus credenciales

### 3. Iniciar servidor local

Con VS Code:
1. Instala la extensión "Live Server"
2. Click derecho en `index.html` → "Open with Live Server"
3. El navegador abrirá automáticamente en `http://localhost:5500`

## Estructura del Proyecto

```
CBCManises25-26/
├── index.html              # Punto de entrada
├── css/
│   └── styles.css          # Estilos personalizados
├── js/
│   ├── app.js              # Orquestador principal
│   ├── ui.js               # Gestión de interfaz
│   ├── partidos.js         # Lógica de partidos
│   ├── actas.js            # Estadísticas oficiales
│   ├── estadisticas.js     # Procesamiento de datos
│   ├── admin.js            # Panel de administración
│   ├── anotaciones.js      # Anotaciones en vivo
│   ├── config.js           # Configuración Firebase
│   ├── constants.js        # Constantes globales
│   └── utils.js            # Utilidades
├── imagenes/               # Fotos de fondo
└── logos/                  # Logos de equipos
```

## Arquitectura

El proyecto sigue **Clean Architecture** con 5 capas:

```
PRESENTATION (ui.js)
    ↓
APPLICATION (app.js)
    ↓
DOMAIN (partidos, actas, estadisticas, admin, anotaciones)
    ↓
INFRASTRUCTURE (Firebase)
    ↓
UTILITIES (utils, constants, config)
```

### Principios clave:

- **Separación de concerns:** Cada módulo tiene una responsabilidad única
- **Event-driven:** Comunicación mediante `eventBus.js`
- **Single source of truth:** Firebase como fuente de datos
- **Modular:** ES6 modules para mejor mantenibilidad

## Flujo de Trabajo

### 1. Crear una rama para tu feature

```bash
git checkout -b feature/nombre-descriptivo
```

### 2. Hacer cambios

- **Sigue el estilo del código existente**
- **Usa nombres en español** para variables/funciones
- **Comenta código complejo** con JSDoc
- **No rompas funcionalidades existentes**

### 3. Testing manual

- Prueba en móvil, tablet y desktop
- Verifica que no hay errores en la consola
- Comprueba que Firebase sincroniza correctamente

### 4. Commit

```bash
git add .
git commit -m "feat: descripción clara del cambio"
```

Tipos de commits:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `refactor:` Mejora de código sin cambiar funcionalidad
- `style:` Cambios visuales/CSS
- `docs:` Documentación
- `perf:` Mejoras de rendimiento

### 5. Push y Pull Request

```bash
git push origin feature/nombre-descriptivo
```

Crea un PR en GitHub con:
- Título descriptivo
- Descripción de los cambios
- Capturas de pantalla si hay cambios visuales

## Buenas Prácticas

### JavaScript

```javascript
// ✅ BIEN
/**
 * Obtiene el partido por ID
 * @param {string} id - ID del partido
 * @returns {Object|null} Partido encontrado
 */
function obtenerPartidoPorId(id) {
    return partidos.find(p => p.id === id) || null;
}

// ❌ MAL
function getMatch(id) { // No usar inglés
    return partidos.find(p => p.id === id);
}
```

### CSS

```css
/* ✅ BIEN - Usa Tailwind cuando sea posible */
<div class="bg-white rounded-lg shadow-md p-4">

/* ⚠️ Solo usa CSS custom para casos específicos */
.jugador-card {
    border-left: 4px solid #FF6B35;
}
```

### Accesibilidad

```html
<!-- ✅ BIEN -->
<button aria-label="Cerrar modal" onclick="cerrarModal()">
    ✕
</button>

<!-- ❌ MAL -->
<div onclick="cerrarModal()">✕</div>
```

## Cosas que NO hacer

- ❌ No commitear credenciales de Firebase
- ❌ No usar frameworks (React, Vue, etc.) - es vanilla JS
- ❌ No romper la arquitectura modular
- ❌ No añadir dependencias npm (usa CDN si es necesario)
- ❌ No modificar `.gitignore` sin justificación
- ❌ No usar `var` (usa `const` o `let`)
- ❌ No hacer commits gigantes (divide en commits pequeños)

## Debugging

### Ver logs en consola

El proyecto usa console.log con emojis:

```javascript
console.log('🏀 CBC Manises - Aplicación inicializada');
console.log(`🔄 Partidos actualizados: ${partidos.length}`);
console.error('❌ Error al cargar partidos:', error);
```

### Herramientas de desarrollo

- **Chrome DevTools:** F12 → Console/Network/Performance
- **Firebase Console:** Ver datos en tiempo real
- **Lighthouse:** Auditoría de rendimiento (F12 → Lighthouse)

## Preguntas Frecuentes

**¿Puedo usar TypeScript?**
No, el proyecto usa vanilla JavaScript para mantener simplicidad.

**¿Por qué no hay package.json?**
Es un proyecto estático sin build step. Todo se carga vía CDN.

**¿Cómo actualizo los logos de equipos?**
Añade la imagen en `/logos/` y actualiza `EQUIPOS_RIVALES` en `config.js`.

**¿Puedo cambiar el diseño?**
Sí, pero mantén la identidad visual (naranja #FF6B35, fuentes actuales).

## Contacto

- **Desarrollador:** Edgar MP
- **Email:** cbcmanisesweb@gmail.com
- **Instagram:** @edgarmp06

## Licencia

Este proyecto es de código abierto para uso educativo y deportivo.

---

¡Gracias por contribuir! 🏀
