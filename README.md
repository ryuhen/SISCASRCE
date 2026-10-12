<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>Gestión de Sedes, Oferta Académica (PNF) y Coordinaciones</h1>

  <p>Sistema de gestión para el control de admisiones, registro y control de estudio (CASRCE).</p>

</div>

---

## Estructura de Roles y Sedes

Para más información detallada sobre la arquitectura del sistema, consulte la especificación completa en [SISTEMA_SEDES_Y_ROLES.md](./SISTEMA_SEDES_Y_ROLES.md).

### Resumen de Funcionalidades y Roles:

1. **Administrador (Director de CASRCE)**:
   - Edición y actualización de datos de Sedes (nombre, dirección, datos generales).
   - Gestión de la Oferta Académica (agregar o modificar PNFs por Sede).
   - Asignación global de coordinadores.

2. **Coordinador de Control de Estudios**:
   - Asignado a una Sede específica.
   - Manejo y gestión exclusiva de la información de Control de Estudios de su sede.

3. **Coordinador de PNF**:
   - Ligado a la oferta académica (Sede - PNF).
   - Existen tantos coordinadores de PNF como programas ofertados existan en cada sede.
