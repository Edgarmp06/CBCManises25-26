# 🏀 CBC Manises-Quart - Web Oficial

Web oficial del equipo Cadete Masculino del CBC Manises-Quart para la temporada 2025/26.

## 🌟 Características

### ✅ Implementado
- 📅 **Calendario de partidos** - Todos los partidos de la temporada
- 🔴 **Marcadores en directo** - Seguimiento en tiempo real durante los partidos
- 🏆 **Resultados** - Historial completo de partidos finalizados
- 📊 **Actas oficiales** - Estadísticas detalladas de cada jugador por partido
- 📱 **Diseño responsive** - Optimizado para móvil, tablet y escritorio
- ⚡ **Rendimiento excelente** - 94-96/100 en PageSpeed Insights
- 💬 **Canal de WhatsApp** - Botón directo para unirse al canal oficial
- 🔐 **Panel de administración** - Gestión completa de partidos y actas
- 🎨 **Galería de fotos** - Fondo rotativo con imágenes (futaramente del equipo)

### 🚀 Próximas mejoras (a implementar después del 27 de octubre)
1. Estadísticas acumuladas de la temporada
2. Clasificación de la liga
3. Próximo partido destacado en portada
4. Comparador de jugadores
5. Gráficas de evolución

## 🛠️ Tecnologías

- **Frontend**: HTML, JavaScript (Vanilla), Tailwind CSS
- **Backend**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Hosting**: Vercel
- **Analytics**: Vercel Analytics + Speed Insights

## 📊 Estadísticas (22 de octubre de 2025)

- **Visitantes**: +150 visitantes únicos
- **Páginas vistas**: +400
- **Rendimiento**: 96/100 desktop, 95/100 mobile
- **Seguidores del canal**: 10 personas
- **Test de carga**: ✅ Soporta 10,000 usuarios simultáneos

## 🔗 Enlaces

- **Web**: [cbc-manises.vercel.app](https://cbc-manises.vercel.app)
- **Canal WhatsApp**: [Únete aquí](https://whatsapp.com/channel/0029VbBc5Eh4SpkD0kfaV93T)

## 📱 Funcionalidades por Rol

### Para Usuarios
- Ver calendario de próximos partidos
- Seguir partidos en directo
- Consultar resultados históricos
- Ver actas oficiales con estadísticas detalladas
- Unirse al canal de WhatsApp para recibir avisos

### Para Administradores
- Añadir y editar partidos
- Actualizar marcadores en tiempo real
- Gestionar cuartos del partido
- Crear actas oficiales con estadísticas de jugadores
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
  cuartoActual: ""
}
```

### Actas
```javascript
{
  partidoId: "abc123",
  fecha: "2025-10-20",
  rival: "Picanya Bàsquet",
  jugadores: [
    {
      dorsal: "7",
      nombre: "NOMBRE APELLIDOS",
      pts: 12,
      min: 25,
      tl: { anotados: 3, intentos: 4, porcentaje: 75 },
      t2: { anotados: 3, intentos: 3 },
      t3: { anotados: 1, intentos: 1 },
      fc: 2
    }
  ]
}
```

## 🚀 Deployment

El proyecto se despliega automáticamente en Vercel cuando se hace push a la rama `main`.

## 👨‍💻 Desarrollo

Desarrollado por **Edgar MP** para el CBC Manises.

## 📄 Licencia

Este proyecto es privado y pertenece al CBC Manises-Quart.

---

**Temporada 2025/26 • Preferente Cadete Masculino Grupo D**
