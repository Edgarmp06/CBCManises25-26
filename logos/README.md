# 📁 Logos de Equipos Rivales

**Última actualización:** 31 de diciembre de 2025

Esta carpeta contiene los logos de todos los equipos rivales del CBC Manises-Quart para la temporada 2025/26.

---

## 📋 Equipos Primera Fase (Grupo D - Preferente)

### Logos Incluidos

- **cbc-manises.jpg** - CBC Manises-Quart (logo oficial) 🏠
- **picanya.jpg** - Picanya Bàsquet FuturPiso 10
- **torrent.jpg** - Isolia NB Torrent B
- **mislata.jpg** - Mislata BC Verde
- **moncada.jpg** - CB Moncada "A"
- **picken.jpg** - Picken MA A

### Clasificación Final 1ª Fase

| Pos | Equipo | J | V | P | PF | PC | PTS |
|-----|--------|---|---|---|----|----|-----|
| 🥇 | PICKEN MA A | 10 | 10 | 0 | 715 | 352 | 20 |
| 🥈 | PICANYA BASQUET | 10 | 6 | 4 | 627 | 606 | 16 |
| 🥉 | CB MONCADA "A" | 10 | 5 | 5 | 587 | 640 | 15 |
| 4 | ISOLIA NB TORRENT B | 10 | 4 | 6 | 567 | 630 | 14 |
| **5** | **CBC MANISES-QUART** | 10 | 4 | 6 | 625 | 687 | 14 |
| 6 | MISLATA BC VERDE | 10 | 1 | 9 | 390 | 596 | 11 |

---

## 📋 Equipos Segunda Fase (IR Campeonato 1ª Zonal Grupo D)

**Inicio:** 10 de enero de 2026

### Logos Incluidos

- **tabernes.jpg** - C.B. Tabernes Blanques A
- **abastos.jpg** - CB TLLA Abastos C
- **escolapias.jpg** - CB Escolapias CMV
- **riba-roja.jpg** - Flex Básquet Riba-Roja
- **petraher.jpg** - Academia Petraher B
- **el-pilar.jpg** - S.D. El Pilar Valencia A

**Nota:** Mislata BC Verde repite de la primera fase (logo ya incluido).

---

## 📐 Especificaciones Técnicas

### Formato
- **Extensión**: JPG o PNG
- **Resolución recomendada**: 200x200 px (mínimo)
- **Tamaño máximo**: < 50KB por imagen
- **Fondo**: Preferiblemente transparente o blanco
- **Color space**: RGB

### Optimización
Los logos están optimizados para web:
- Compresión sin pérdida de calidad
- Carga rápida en dispositivos móviles
- Compatibilidad con todos los navegadores

---

## 🔍 Uso en la Aplicación

Los logos se utilizan automáticamente en:

- 📅 **Calendario de partidos** - Identificación visual de equipos rivales
- 🔴 **Partidos en directo** - Tarjetas con logos de local y visitante
- 📝 **Actas oficiales** - Encabezado de estadísticas por partido
- 🏆 **Resultados históricos** - Historial completo con logos
- 🏅 **Clasificación** - Tabla de posiciones (opcional)

---

## ⚙️ Configuración de Mapeo

La asignación automática de logos se realiza en **`js/config.js`** mediante el array `EQUIPOS_RIVALES`:

```javascript
export const EQUIPOS_RIVALES = [
  // EQUIPOS DE PRIMERA FASE
  { nombre: 'Picanya Bàsquet FuturPiso 10', logo: 'picanya.jpg' },
  { nombre: 'Isolia NB Torrent B', logo: 'torrent.jpg' },
  { nombre: 'Mislata BC Verde', logo: 'mislata.jpg' },
  { nombre: 'CB Moncada A', logo: 'moncada.jpg' },
  { nombre: 'Picken MA A', logo: 'picken.jpg' },

  // EQUIPOS DE SEGUNDA FASE
  { nombre: 'C.B. Tabernes Blanques A', logo: 'tabernes.jpg' },
  { nombre: 'CB TLLA Abastos C', logo: 'abastos.jpg' },
  { nombre: 'CB Escolapias CMV', logo: 'escolapias.jpg' },
  { nombre: 'Flex Básquet Riba-Roja', logo: 'riba-roja.jpg' },
  { nombre: 'Academia Petraher B', logo: 'petraher.jpg' },
  { nombre: 'S.D. El Pilar Valencia A', logo: 'el-pilar.jpg' }
];
```

### Cómo Funciona

1. Al crear un partido, se selecciona el equipo rival
2. El sistema busca automáticamente el logo en este array
3. El logo se muestra en todas las vistas relacionadas con ese partido
4. No es necesario configurar nada más

---

## ➕ Añadir Nuevo Logo

### Proceso paso a paso:

1. **Preparar la imagen**
   - Formato: JPG o PNG
   - Tamaño: 200x200px mínimo
   - Optimizar para < 50KB

2. **Guardar en esta carpeta**
   ```bash
   logos/nombreequipo.jpg
   ```

3. **Actualizar config.js**
   ```javascript
   // Añadir al array EQUIPOS_RIVALES en js/config.js
   { nombre: 'Nombre del Equipo', logo: 'nombreequipo.jpg' }
   ```

4. **Commit y deploy**
   ```bash
   git add logos/nombreequipo.jpg js/config.js
   git commit -m "feat: add logo for [Nombre del Equipo]"
   git push origin main
   ```

5. **Verificar**
   - El logo aparecerá automáticamente en Vercel tras el deploy
   - Comprobar en calendario y resultados

---

## 🎨 Guía de Estilo

### Recomendaciones para logos:

✅ **Hacer:**
- Usar el logo oficial del equipo
- Mantener proporciones cuadradas
- Fondo transparente o blanco uniforme
- Alta calidad sin pixelación

❌ **Evitar:**
- Imágenes con marca de agua
- Logos con fondo complejo
- Resolución muy baja
- Archivos muy pesados (> 100KB)

---

## 🔄 Mantenimiento

### Actualización de logos

Si un equipo cambia su logo:

1. Reemplazar el archivo JPG en esta carpeta
2. Mantener el mismo nombre de archivo
3. Hacer commit y push
4. El cambio se reflejará automáticamente

### Limpieza

Los logos de equipos que ya no compiten se pueden:
- Mantener para histórico
- Mover a carpeta `logos/historico/`
- Eliminar si no se necesitan

---

## 📊 Inventario Completo

### Primera Fase (6 logos)

| Archivo | Equipo | Estado |
|---------|--------|--------|
| cbc-manises.jpg | CBC Manises-Quart | ✅ Activo |
| picanya.jpg | Picanya Bàsquet FuturPiso 10 | ✅ Activo |
| torrent.jpg | Isolia NB Torrent B | ✅ Activo |
| mislata.jpg | Mislata BC Verde | ✅ Activo (repite en 2ª) |
| moncada.jpg | CB Moncada A | ✅ Activo |
| picken.jpg | Picken MA A | ✅ Activo |

### Segunda Fase (6 logos nuevos)

| Archivo | Equipo | Estado |
|---------|--------|--------|
| tabernes.jpg | C.B. Tabernes Blanques A | ✅ Activo |
| abastos.jpg | CB TLLA Abastos C | ✅ Activo |
| escolapias.jpg | CB Escolapias CMV | ✅ Activo |
| riba-roja.jpg | Flex Básquet Riba-Roja | ✅ Activo |
| petraher.jpg | Academia Petraher B | ✅ Activo |
| el-pilar.jpg | S.D. El Pilar Valencia A | ✅ Activo |

**Total:** 12 logos (11 equipos + 1 propio)

---

## 🚀 Próximas Mejoras

- [ ] Convertir logos a formato WebP para mejor compresión
- [ ] Versión SVG para escalabilidad infinita
- [ ] Logos animados para partidos en directo
- [ ] Galería de logos históricos por temporada
- [ ] Script automatizado de optimización de imágenes

---

## 📞 Soporte

Si tienes problemas con los logos:

1. **Logo no aparece**: Verifica que el nombre en `config.js` coincide exactamente con el archivo
2. **Calidad baja**: Reemplaza con versión de mayor resolución
3. **Archivo muy pesado**: Usa [TinyPNG](https://tinypng.com/) o [Squoosh](https://squoosh.app/)

**Contacto**: cbcmanisesweb@gmail.com

---

**Temporada 2025/26 • Preferente Cadete Masculino Grupo D**
**CBC Manises-Quart** 🏀
