# 🏀 Logos de Equipos Rivales

Esta carpeta contiene los logos de los equipos de la temporada 2025/26 del Grupo D - Preferente (Cadete Masculino).

## 📋 Equipos del Grupo D - 1ª Fase

### Clasificación Actual
| Pos | Equipo | J | V | P | PF | PC | PTS |
|-----|--------|---|---|---|----|----|-----|
| 🥇 | PICKEN MA A | 10 | 10 | 0 | 715 | 352 | 20 |
| 🥈 | PICANYA BASQUET FUTURPISO 10 | 10 | 6 | 4 | 627 | 606 | 16 |
| 🥉 | CB MONCADA "A" | 10 | 5 | 5 | 587 | 640 | 15 |
| 4️⃣ | ISOLIA NB TORRENT B | 10 | 4 | 6 | 567 | 630 | 14 |
| **5️⃣** | **CBC MANISES-QUART** | 10 | 4 | 6 | 625 | 687 | 14 |
| 6️⃣ | MISLATA BC VERDE | 10 | 1 | 9 | 390 | 596 | 11 |

## 📁 Logos Incluidos

- **cbc-manises.jpg** - Club Baloncesto Manises-Quart (equipo local) 🏀
- **picanya.jpg** - Picanya Bàsquet FuturPiso 10
- **torrent.jpg** - Isolia NB Torrent B
- **mislata.jpg** - Mislata BC Verde
- **moncada.jpg** - CB Moncada A
- **picken.jpg** - Picken MA A

## 🎨 Especificaciones Técnicas

- **Formato**: JPG
- **Resolución recomendada**: 200x200 px mínimo
- **Fondo**: Preferiblemente transparente o blanco
- **Tamaño máximo**: < 50KB por imagen
- **Color space**: RGB

## 🔍 Uso en la Aplicación

Los logos se utilizan automáticamente en:
- 📅 **Calendario de partidos** - Identificación visual de equipos
- 🔴 **Partidos en directo** - Tarjetas con logo de local y visitante
- 📝 **Actas oficiales** - Encabezado de estadísticas
- 🏆 **Resultados históricos** - Historial con logos
- 🏅 **Clasificación** - Tabla de posiciones

## ⚙️ Configuración de Mapeo

La asignación automática de logos se realiza en **`js/config.js`** mediante el nombre del equipo:

```javascript
export const UBICACIONES = {
    'PICKEN MA A': { logo: 'logos/picken.jpg', ciudad: 'Torrent' },
    'PICANYA BASQUET FUTURPISO 10': { logo: 'logos/picanya.jpg', ciudad: 'Picanya' },
    'ISOLIA NB TORRENT B': { logo: 'logos/torrent.jpg', ciudad: 'Torrent' },
    'MISLATA BC VERDE': { logo: 'logos/mislata.jpg', ciudad: 'Mislata' },
    'CB MONCADA "A"': { logo: 'logos/moncada.jpg', ciudad: 'Moncada' }
};
```

## 📸 Cómo Añadir Nuevos Logos

1. Preparar la imagen (200x200px, JPG, < 50KB)
2. Guardar en esta carpeta con nombre descriptivo: `nombreequipo.jpg`
3. Actualizar el mapeo en `js/config.js`
4. Hacer commit: `git add . && git commit -m "Add logo for [Team Name]"`

## 🚀 Próximas Mejoras

- [ ] Logos en formato WebP para mejor compresión
- [ ] Versión SVG para escalabilidad infinita
- [ ] Logos para 2ª fase cuando comience (enero 2026)
- [ ] Galería de logos históricos

---

**Última actualización**: 26 de diciembre de 2025  
**Temporada**: 2025/26  
**Categoría**: Cadete Masculino  
**Grupo**: D - Preferente
