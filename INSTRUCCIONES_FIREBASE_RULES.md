# 🔥 INSTRUCCIONES: Configuración Completa de Clasificación

## ⚠️ PASOS REQUERIDOS

Hay **DOS pasos críticos** para que la clasificación funcione correctamente:

1. **Actualizar Firebase Security Rules** (OBLIGATORIO)
2. **Migrar datos a Firebase** (RECOMENDADO para 1ª fase)

---

## PASO 1: Actualizar Firebase Security Rules ⚠️ CRÍTICO

**Error:** "Missing or insufficient permissions" al intentar leer/escribir en la colección `clasificacion`

**Causa:** Las reglas de seguridad de Firestore no incluyen permisos para la colección `clasificacion`

---

## ✅ SOLUCIÓN PARTE A: Actualizar las Firebase Security Rules

### Pasos a seguir:

1. **Ir a Firebase Console:**
   - Abre [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Selecciona tu proyecto: **cbc-manises**

2. **Navegar a Firestore Database:**
   - En el menú lateral, haz clic en **"Firestore Database"**
   - Luego haz clic en la pestaña **"Rules"** (Reglas)

3. **Actualizar las reglas:**
   - Copia y pega el siguiente código en el editor de reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================
    // PARTIDOS: Todos leen, solo admins escriben
    // ============================================
    match /partidos/{partidoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // ============================================
    // ACTAS: Todos leen, solo admins escriben
    // ============================================
    match /actas/{actaId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // ============================================
    // CLASIFICACIÓN: Todos leen, solo admins escriben
    // ============================================
    match /clasificacion/{clasificacionId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

4. **Publicar las reglas:**
   - Haz clic en el botón **"Publish"** (Publicar)
   - Espera la confirmación: "Rules published successfully"

5. **Verificar:**
   - Recarga tu aplicación web
   - Verifica en la consola del navegador que ya no aparece el error de permisos
   - Los logs deberían mostrar: `"✅ Clasificación de primera fase actualizada desde Firebase"`

---

## 📋 Explicación de las reglas

### Regla para `clasificacion`:

```javascript
match /clasificacion/{clasificacionId} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

- **`allow read: if true;`** → Cualquier usuario puede leer la clasificación (público)
- **`allow write: if request.auth != null;`** → Solo usuarios autenticados pueden escribir (admins)

### Seguridad:

✅ **Usuarios públicos:**
- Pueden ver la clasificación
- NO pueden modificarla

✅ **Administradores autenticados:**
- Pueden ver la clasificación
- Pueden añadir, editar y eliminar equipos

---

## 🔍 Cómo verificar que funciona:

### En la consola del navegador (F12):

**Antes de actualizar las reglas:**
```
❌ Error cargando clasificación desde Firebase:
FirebaseError: Missing or insufficient permissions.
```

**Después de actualizar las reglas:**
```
✅ Clasificación de primera fase actualizada desde Firebase (6 equipos)
✅ Tabla actualizada con datos fallback y botones de admin activados
```

---

## 🚨 IMPORTANTE

- **NO uses estas reglas en producción sin revisar tu modelo de seguridad**
- Estas reglas son apropiadas para una app pública donde:
  - Cualquiera puede ver datos
  - Solo admins autenticados pueden modificar

- Si necesitas mayor seguridad:
  - Añade validación de roles específicos
  - Limita qué usuarios pueden autenticarse
  - Añade reglas de validación de datos

---

## ✅ SOLUCIÓN PARTE B: Crear Índice Compuesto en Firestore

**Error posible:** "The query requires an index" al intentar filtrar por fase y ordenar por posición

**Causa:** Firestore necesita un índice compuesto para consultas con `where()` + `orderBy()`

### Pasos para crear el índice:

**Opción 1: Creación Automática (Recomendado)**

1. **Intenta cargar la clasificación** en la web
2. **Abre la consola del navegador** (F12)
3. Si ves un error con un **link azul** que dice "Create index", haz click en él
4. Te llevará a Firebase Console con el índice pre-configurado
5. Haz click en **"Create Index"**
6. Espera 2-3 minutos a que se construya el índice
7. Recarga la web

**Opción 2: Creación Manual**

1. **Ir a Firebase Console:**
   - Abre [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Selecciona tu proyecto: **cbc-manises**

2. **Navegar a Firestore Indexes:**
   - En el menú lateral, haz clic en **"Firestore Database"**
   - Luego haz clic en la pestaña **"Indexes"** (Índices)

3. **Crear índice compuesto:**
   - Haz clic en **"Create Index"** (Crear índice)
   - **Collection ID**: `clasificacion`
   - **Fields** (Campos):
     1. Campo: `fase` → Order: **Ascending** ⬆️
     2. Campo: `posicion` → Order: **Ascending** ⬆️
   - Query scope: **Collection**

4. **Guardar y esperar:**
   - Haz clic en **"Create"**
   - Estado: **Building...** (construyendo)
   - Espera 2-3 minutos hasta que cambie a **Enabled** (habilitado)

5. **Verificar:**
   - Recarga tu aplicación web
   - Ve a la pestaña "🏅 Clasificación"
   - Verifica en la consola que ya no aparece el error del índice
   - Los logs deberían mostrar: `"✅ Clasificación de primera fase actualizada desde Firebase (X equipos)"`

### ¿Por qué se necesita este índice?

Firestore requiere índices compuestos cuando haces consultas que combinan:
- **Filtro (`where`)**: `where('fase', '==', 'primera')`
- **Ordenamiento (`orderBy`)**: `orderBy('posicion')`

Sin el índice, Firebase no puede ejecutar la consulta y devuelve un error.

**Query que necesita el índice** (en js/clasificacion.js):
```javascript
const q = query(
    collection(this.db, 'clasificacion'),
    where('fase', '==', fase),      // ← Requiere índice
    orderBy('posicion')              // ← Requiere índice
);
```

### Verificación del índice:

En Firebase Console → Firestore Database → Indexes, deberías ver:

| Collection | Fields indexed | Query scope | Status |
|------------|---------------|-------------|--------|
| clasificacion | fase (Asc), posicion (Asc) | Collection | Enabled ✅ |

---

## PASO 2: Migrar Clasificación a Firebase (RECOMENDADO) 📤

Una vez hayas actualizado las Firebase Security Rules, es hora de poblar la base de datos.

### ¿Por qué migrar?

- **Problema:** Los datos de constants.js no tienen IDs de Firebase → no se pueden editar inline
- **Solución:** Migrar una vez a Firebase → todos los equipos son editables
- **Beneficio:** Edición completa con botones ✏️ ⬆️ ⬇️ 🗑️

---

### Opción A: Migración Automática (1ª Fase)

**Recomendado si necesitas los datos finales de la 1ª fase**

1. **Loguéate como admin** en la web
2. **Ve a la pestaña "🏅 Clasificación"**
3. **Selecciona "🟡 Primera Fase"**
4. Verás una pantalla vacía con el botón **"📤 Migrar Datos de 1ª Fase a Firebase"**
5. **Haz clic en el botón**
6. Confirma la migración
7. **¡Listo!** Los 6 equipos finales de la 1ª fase se copiarán automáticamente:
   - PICKEN MA A (1º - 20 pts)
   - PICANYA BASQUET FUTURPISO 10 (2º - 16 pts)
   - CB MONCADA "A" (3º - 15 pts)
   - ISOLIA NB TORRENT B (4º - 14 pts)
   - CRISCOLOR C.B.C MANISES-QUART (5º - 14 pts)
   - MISLATA BC VERDE (6º - 11 pts)

**Resultado esperado en consola:**
```
📤 Iniciando migración de clasificación de 1ª fase...
✅ Migrado 1/6: PICKEN MA A
✅ Migrado 2/6: PICANYA BASQUET FUTURPISO 10
✅ Migrado 3/6: CB MONCADA "A"
✅ Migrado 4/6: ISOLIA NB TORRENT B
✅ Migrado 5/6: CRISCOLOR C.B.C MANISES-QUART
✅ Migrado 6/6: MISLATA BC VERDE
🎉 Migración completada exitosamente
```

---

### Opción B: Añadir Manualmente

**Para 2ª fase o equipos personalizados**

1. **Loguéate como admin**
2. **Ve a Clasificación → selecciona la fase**
3. **Haz clic en "➕ Añadir Equipos Manualmente"**
4. Se creará una tabla vacía con una fila editable
5. **Rellena los datos:**
   - Nombre del equipo
   - J (partidos jugados)
   - V (victorias)
   - P (derrotas)
   - NP (no presentado)
   - PF (puntos a favor)
   - PC (puntos en contra)
   - PTS (puntos de clasificación)
6. **Haz clic en ✅ para guardar**
7. Repite para cada equipo

---

## 🎯 Flujo Completo Recomendado

### Primera vez configurando:

1. ✅ **Actualizar Firebase Security Rules** (PASO 1 - Parte A)
2. ✅ **Crear índice compuesto** (PASO 1 - Parte B)
3. ✅ **Migrar 1ª fase automáticamente** (PASO 2 - Opción A)
4. ✅ **Añadir equipos de 2ª fase manualmente** (PASO 2 - Opción B)
5. ✅ **Verificar que todo funciona** (ver logs abajo)

### Logs esperados después de configuración completa:

```
🔗 AdminManager vinculado a la app principal
👤 Usuario autenticado: edgarmereno@gmail.com
🔄 Re-renderizando UI con estado admin actualizado
🎨 Ejecutando re-render post-autenticación
🔍 mostrarClasificacion - esAdmin: true
🔍 cargarClasificacionFirebase - esAdmin: true
🔍 clasificaciones desde Firebase: 6 equipos
✅ Banner de admin añadido (Firebase path)
✅ Columna "Acciones" añadida al thead (Firebase path)
✅ Clasificación de primera fase actualizada desde Firebase (6 equipos)
```

---

## ❓ FAQ

### ¿Puedo volver a los datos de constants.js?

No. Una vez migrados a Firebase, los datos se gestionan desde la base de datos. Si quieres volver:
1. Elimina toda la clasificación desde el panel de admin
2. Los datos de constants.js ya no se usan como fallback (se eliminaron)

### ¿Qué pasa si migro dos veces?

Se duplicarán los equipos. Si ocurre:
1. Ve al panel de admin → "Gestión de Clasificación"
2. Usa "🗑️ Eliminar Toda la Clasificación"
3. Vuelve a migrar UNA vez

### ¿Los datos de constants.js se eliminan?

Técnicamente siguen en el archivo, pero la UI ya no los usa. Puedes vaciar los arrays manualmente si quieres:

```javascript
// En js/constants.js
export const CLASIFICACION_PRIMERA_FASE = [];
export const CLASIFICACION_SEGUNDA_FASE = [];
```

### ¿Puedo editar equipos después de migrar?

¡Sí! Ese es el objetivo. Una vez en Firebase, todos los equipos tienen:
- ✏️ Botón de editar (inline)
- ⬆️ Subir posición
- ⬇️ Bajar posición
- 🗑️ Eliminar equipo

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que has publicado las reglas correctamente
2. Comprueba que estás logueado como admin
3. Revisa la consola del navegador para ver los logs
4. Contacta a: cbcmanisesweb@gmail.com

---

**Temporada 2025/26 • CBC Manises-Quart** 🏀
