# 📋 Sistema de Cumplimientos (Compliances) - Frontend

## ✅ Implementación Completa

Sistema completo de gestión de cumplimientos derivados de resoluciones de reclamos, implementado siguiendo el estilo y estructura del frontend de Conexia.

---

## 📁 Estructura de Archivos Creados

```
src/
├── constants/
│   └── compliances.js                        ✅ Enums, tipos, estados, helpers
│
├── service/
│   └── compliances/
│       └── index.js                          ✅ API service (6 endpoints)
│
├── hooks/
│   └── compliances/
│       ├── index.js                          ✅ Exports
│       ├── useCompliances.js                 ✅ Lista con polling
│       ├── useComplianceSubmit.js            ✅ Subir evidencias
│       ├── usePeerReview.js                  ✅ Peer review
│       └── useCompliancePolling.js           ✅ Badge polling
│
├── components/
│   └── compliances/
│       ├── index.js                          ✅ Exports
│       ├── ComplianceStatusBadge.jsx         ✅ Badge de estado
│       ├── UrgencyBadge.jsx                  ✅ Badge de urgencia
│       ├── CountdownTimer.jsx                ✅ Timer con actualización
│       ├── ComplianceTypeBadge.jsx           ✅ Badge de tipo
│       ├── ComplianceCard.jsx                ✅ Tarjeta individual
│       ├── SubmitComplianceModal.jsx         ✅ Modal con drag & drop
│       ├── PeerReviewPanel.jsx               ✅ Panel de revisión
│       ├── CompliancesList.jsx               ✅ Lista con paginación
│       ├── CompliancesFilters.jsx            ✅ Filtros
│       ├── ComplianceBadge.jsx               ✅ Badge para navbar
│       └── ModeratorReviewModal.jsx          ✅ Modal de moderador
│
├── app/
│   └── compliances/
│       ├── page.js                           ✅ Página usuario
│       └── moderator/
│           └── page.js                       ✅ Dashboard moderador
│
└── components/navbar/
    ├── NavbarCommunity.jsx                   ✅ Badge integrado
    └── NavbarModerator.jsx                   ✅ Link agregado
```

---

## 🚀 Características Implementadas

### 1. **Constantes y Configuración**

- ✅ 11 tipos de compliance
- ✅ 11 estados de compliance
- ✅ 4 niveles de urgencia (normal, warning, urgent, critical)
- ✅ Helpers para cálculo de urgencia, validaciones, formato de tiempo
- ✅ Configuración de colores, iconos y labels

### 2. **Servicios API**

- ✅ `getCompliances()` - Lista con filtros y paginación
- ✅ `getComplianceById()` - Detalle individual
- ✅ `submitCompliance()` - Subir evidencia con archivos
- ✅ `peerReviewCompliance()` - Pre-aprobar/objetar
- ✅ `moderatorReviewCompliance()` - Decisión final del moderador
- ✅ `getUserComplianceStats()` - Estadísticas del usuario
- ✅ Validación de archivos (tipo, tamaño)

### 3. **Hooks Personalizados**

- ✅ `useCompliances` - Lista con polling automático
- ✅ `useComplianceSubmit` - Manejo de evidencias y validación
- ✅ `usePeerReview` - Peer review con objeción
- ✅ `useCompliancePolling` - Contador para badge en navbar

### 4. **Componentes UI**

- ✅ Badges: Estado, Urgencia, Tipo
- ✅ CountdownTimer con actualización en tiempo real
- ✅ ComplianceCard con indicadores visuales de urgencia
- ✅ Modal de subir evidencia con drag & drop
- ✅ Panel de peer review con aprobar/objetar
- ✅ Lista con paginación y filtros
- ✅ Modal de revisión del moderador

### 5. **Páginas**

- ✅ `/compliances` - Mis cumplimientos (usuario)
- ✅ `/compliances/moderator` - Dashboard del moderador

### 6. **Integración en Navbar**

- ✅ Badge con contador en tiempo real (polling cada 60s)
- ✅ Icono FileText para acceso rápido
- ✅ Integrado en desktop y mobile
- ✅ Link en menú de moderador

---

## 📖 Uso y Flujo

### **Usuario Responsable (tiene cumplimientos pendientes)**

1. **Notificación**: Usuario recibe email cuando se le asigna un cumplimiento
2. **Badge en Navbar**: Ve contador rojo con número de pendientes
3. **Acceso**: Click en icono FileText → `/compliances`
4. **Vista de Lista**:
   - Cards con información del compliance
   - Badges de urgencia (normal, warning, urgent, critical)
   - Countdown timer mostrando tiempo restante
   - Estado actual (pending, submitted, etc.)
5. **Subir Evidencia**:
   - Click en card o botón "Subir Evidencia"
   - Modal con drag & drop de archivos
   - Validación automática (tipo, tamaño, cantidad)
   - Campo de notas explicativas
   - Submit → Estado cambia a `submitted`
6. **Esperar Revisión**: Recibe email cuando haya actualización

### **Otra Parte (Peer Review)**

1. **Notificación**: Email cuando la otra parte sube evidencia
2. **Acceso**: Link directo o buscar en compliances relacionados
3. **Revisar Evidencia**:
   - Ver archivos subidos
   - Leer notas del usuario
   - Opciones:
     - ✅ **Aprobar**: Pre-aprueba para el moderador
     - ⚠️ **Objetar**: Indica que no cumple (con motivo)
     - ⏭️ **Omitir**: Dejar que el moderador decida solo
4. **Resultado**: Moderador ve el peer review en su revisión

### **Moderador**

1. **Dashboard**: `/compliances/moderator`
2. **Stats Cards**:
   - Total pendientes de revisión
   - Pre-aprobados por peers
   - Objetados por peers
   - En revisión
3. **Lista de Compliances**:
   - Filtros por estado
   - Cards con indicador de peer review
   - Click para revisar
4. **Modal de Revisión**:
   - Ver instrucciones originales
   - Ver peer review (si existe)
   - Ver evidencia y notas
   - Decisión:
     - ✅ **Aprobar**: Compliance completado
     - ❌ **Rechazar**: Usuario debe reintentar (deadline reducido)
     - ✏️ **Ajustar**: Requiere complementar evidencia
5. **Resultado**:
   - Si TODOS los compliances del claim están aprobados → Claim se cierra
   - Usuario recibe email con la decisión

---

## ⚙️ Sistema de Consecuencias Progresivas

El backend maneja automáticamente vencimientos (cron job cada 6 horas):

1. **Nivel 0 → 1 (OVERDUE)**:
   - Estado: `overdue`
   - Deadline extendido +50%
   - Email de advertencia

2. **Nivel 1 → 2 (WARNING)**:
   - Estado: `warning`
   - Deadline extendido +25%
   - Email crítico
   - Badge rojo parpadeante

3. **Nivel 2 → 3 (ESCALATED)**:
   - Estado: `escalated`
   - Sin más extensiones
   - Preparando sanciones (suspensión/ban)

---

## 🎨 Indicadores Visuales

### **Niveles de Urgencia (borders en cards)**

```
🟢 Normal    - Más de 72 horas | border-blue-500
🟡 Warning   - Menos de 72h    | border-yellow-500
🟠 Urgent    - Menos de 24h    | border-orange-500
🔴 Critical  - Vencido/Level 2+| border-red-500 (animate-pulse)
```

### **Estados de Compliance**

```
⏳ Pending             - Pendiente de acción
📤 Submitted           - Enviado, esperando revisión
✅ Peer Approved       - Pre-aprobado por otra parte
⚠️ Peer Objected      - Objetado por otra parte
👀 In Review          - Moderador revisando
✏️ Requires Adjustment - Requiere corrección
✅ Approved            - Completado exitosamente
❌ Rejected            - Rechazado, reintentar
🔴 Overdue            - Vencido (nivel 1)
⚠️ Warning            - Crítico (nivel 2)
❌ Escalated          - Escalado (nivel 3)
```

---

## 🔄 Polling y Actualizaciones

### **Badge en Navbar**

- Intervalo: 60 segundos
- Endpoint: `GET /compliances?userId={id}&status=pending,requires_adjustment,overdue,warning`
- Solo cuenta, no carga datos completos

### **Lista de Compliances**

- Intervalo: 30 segundos (configurable)
- Actualización automática en segundo plano
- Detecta nuevos compliances y muestra toast

### **Countdown Timers**

- Actualización: cada 60 segundos
- Cálculo local para performance
- Recalcula urgencia automáticamente

---

## 🧪 Testing Manual

### **Crear Compliance de Prueba**

1. Crear un reclamo en el sistema
2. Moderador resuelve el reclamo
3. Backend crea compliance automáticamente
4. Usuario recibe email

### **Flujo Completo**

```bash
# 1. Usuario ve badge en navbar
→ Click en FileText icon
→ Ve lista de compliances pendientes

# 2. Subir evidencia
→ Click en card
→ Drag & drop archivos (o seleccionar)
→ Agregar notas (min 10 chars)
→ Submit
→ Estado cambia a 'submitted'

# 3. Peer review (otra parte)
→ Accede al compliance
→ Revisa evidencia
→ Aprueba u objeta
→ Moderador recibe notificación

# 4. Moderador revisa
→ /compliances/moderator
→ Click en compliance
→ Revisa todo (evidencia + peer review)
→ Aprueba/Rechaza/Ajusta
→ Usuario recibe email
```

---

## 🛠️ Configuración Backend

### **URL Base**

```javascript
// src/config/env.js
const API_URL = "http://localhost:8080/api";
```

### **Endpoints**

```
GET    /api/compliances
GET    /api/compliances/:id
POST   /api/compliances/:id/submit
POST   /api/compliances/:id/peer-review
POST   /api/compliances/:id/review
GET    /api/compliances/stats/:userId
```

---

## 📧 Notificaciones por Email

El backend envía emails automáticamente para:

- ✅ Nuevo compliance asignado
- ✅ Evidencia recibida (a peer y moderador)
- ✅ Peer review completado
- ✅ Decisión del moderador
- ✅ Compliance vencido (niveles 1, 2, 3)
- ✅ Claim cerrado (todos compliances aprobados)

**Frontend muestra mensaje**: "Revisa tu correo para actualizaciones"

---

## 🎯 Características Destacadas

### **Innovación: Peer Review**

- Sistema único de pre-aprobación/objeción
- La otra parte puede opinar antes del moderador
- Ayuda a reducir carga de moderación
- Fomenta resolución colaborativa

### **Drag & Drop de Archivos**

- Zona de arrastre visual
- Preview de archivos seleccionados
- Validación en tiempo real
- Soporte para múltiples tipos (PDF, imágenes, Word, Excel)

### **Urgencia Visual**

- Bordes de colores según urgencia
- Countdown timer actualizado
- Badges animados para críticos
- Mensajes de advertencia progresivos

### **Responsive Design**

- Desktop: lista en 2 columnas
- Mobile: lista en 1 columna
- Badge integrado en navbar móvil
- Modales adaptables

---

## 🔐 Permisos y Validación

### **Usuario Responsable**

- Solo puede actuar en sus propios compliances
- Solo en estados: pending, requires_adjustment, rejected, overdue, warning
- No puede revisar compliances en estados finales

### **Peer (Otra Parte)**

- Solo puede revisar compliances del claim donde está involucrado
- Solo si el compliance está en estado `submitted`
- No puede revisar sus propios compliances

### **Moderador**

- Puede revisar todos los compliances
- Solo compliances en estados: submitted, peer_approved, peer_objected, in_review
- Decisión final es vinculante

---

## 🚨 Manejo de Errores

### **Validaciones Frontend**

- Archivos: tipo, tamaño (10MB max), cantidad (10 max)
- Notas: mínimo 10 caracteres
- Objeción: mínimo 20 caracteres
- Estados: solo permite acciones según estado actual

### **Mensajes de Error**

```javascript
COMPLIANCE_NOT_FOUND: "No se encontró el cumplimiento";
NOT_RESPONSIBLE: "No eres el responsable";
INVALID_STATUS: "No puedes realizar esta acción";
FILES_REQUIRED: "Debes subir archivos de evidencia";
NOT_OTHER_PARTY: "No puedes revisar tu propio cumplimiento";
ALREADY_REVIEWED: "Este cumplimiento ya fue revisado";
OBJECTION_REQUIRED: "Debes especificar por qué objetas";
```

---

## 🎨 Estilo y Diseño

### **Siguiendo Conexia Design System**

- ✅ Colores: Degradados azul-morado para acciones principales
- ✅ Tipografía: Mismo font stack que el resto de la app
- ✅ Shadows: Consistente con otros componentes
- ✅ Iconos: Lucide React (mismo que navbar)
- ✅ Buttons: Estilos reutilizados de otros modales
- ✅ Forms: InputField compatible
- ✅ Toast: Componente Toast existente

### **Paleta de Colores**

```
Primary:   Blue-600 → Purple-600 (gradients)
Success:   Green-600
Warning:   Yellow/Orange-600
Error:     Red-600
Info:      Blue-600
Neutral:   Gray-50/100/200/300/etc
```

---

## ✅ Checklist de Implementación

- [x] Constantes y enums
- [x] Servicios API
- [x] Hooks personalizados
- [x] Componentes UI base (badges, timer)
- [x] ComplianceCard
- [x] SubmitComplianceModal con drag & drop
- [x] PeerReviewPanel
- [x] CompliancesList con paginación
- [x] Filtros
- [x] Página de usuario (/compliances)
- [x] Dashboard de moderador
- [x] Modal de revisión del moderador
- [x] Badge en navbar con polling
- [x] Integración en navbar (desktop + mobile)
- [x] Exports en index.js
- [x] ESLint warnings fixed
- [x] Documentación completa

---

## 📚 Próximos Pasos (Opcional)

### **Mejoras Futuras**

1. **WebSocket Real-time**: Reemplazar polling por WebSocket
2. **Notificaciones Push**: Agregar notificaciones del navegador
3. **Preview de Archivos**: Modal para ver PDFs/imágenes inline
4. **Historial de Cambios**: Timeline de estados
5. **Apelaciones**: Sistema para apelar decisiones
6. **Bulk Actions**: Aprobar/rechazar múltiples compliances
7. **Exportar Reports**: Descargar PDF de compliance completado
8. **Estadísticas Avanzadas**: Gráficos de cumplimiento

### **Testing**

1. **Unit Tests**: Jest para hooks y helpers
2. **Integration Tests**: Testing Library para componentes
3. **E2E Tests**: Cypress para flujo completo

---

## 🆘 Troubleshooting

### **Badge no muestra contador**

- Verificar que el usuario esté autenticado
- Check console para errores de API
- Verificar que el endpoint devuelva datos

### **Polling no funciona**

- Verificar que `enablePolling` esté en `true`
- Check intervalos en `POLLING_INTERVALS`
- Verificar que el componente no se desmonte

### **Modal no se cierra**

- Verificar que `onClose` esté pasado correctamente
- Check estado `isOpen` en padre
- Verificar que no haya errores en submit

### **Archivos no se suben**

- Verificar validación de tipo y tamaño
- Check FormData en Network tab
- Verificar endpoint backend acepta multipart/form-data

---

## 📞 Soporte

Para dudas o problemas:

1. Revisar esta documentación
2. Check console del navegador
3. Verificar Network tab para llamadas API
4. Revisar backend logs

---

**¡Sistema de Cumplimientos Completamente Implementado!** 🎉

✅ 100% funcional  
✅ Siguiendo estilo Conexia  
✅ Responsive design  
✅ Polling integrado  
✅ Badge en navbar  
✅ Documentación completa
