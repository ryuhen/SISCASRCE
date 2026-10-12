# Especificación del Sistema: Gestión de Sedes, Oferta Académica y Roles

Este documento detalla la estructura del dominio, el modelo de datos y la matriz de control de acceso basada en roles (RBAC) para la gestión de sedes, oferta académica (PNF) y coordinaciones.

---

## 1. Roles del Sistema

### 1.1 Administrador (Director de CASRCE)
* **Descripción**: Representa la máxima autoridad administrativa del sistema (Director de CASRCE - Centro / Control de Admisión, Registro y Control de Estudio).
* **Alcance**: Global (todas las sedes y toda la oferta académica).
* **Permisos**:
  * Crear, consultar, editar y actualizar datos institucionales de las **Sedes** (nombre, código, dirección, ubicación, datos generales).
  * Gestionar la **Oferta Académica** de cada sede: agregar nuevos Programas Nacionales de Formación (PNF) a la oferta de una sede, modificar la oferta existente o desactivar PNFs.
  * Asignar y gestionar los usuarios con rol de **Coordinador de Control de Estudios** por sede.
  * Asignar y gestionar los usuarios con rol de **Coordinador de PNF** asociados a la oferta académica de cada sede.

### 1.2 Coordinador de Control de Estudios (por Sede)
* **Descripción**: Responsable de la gestión técnico-académica y registro estudiantil en una sede específica.
* **Alcance**: Restringido a su **Sede asignada**.
* **Permisos**:
  * Consultar la información de su sede y la oferta académica habilitada.
  * Gestionar y procesar la información de Control de Estudios de su sede (inscripciones, notas, expedientes estudiantiles, certificaciones y reportes locales).

### 1.3 Coordinador de PNF (por Oferta Académica de Sede)
* **Descripción**: Responsable académico de un PNF específico dentro de una sede determinada.
* **Alcance**: Restringido a la combinación de su **Sede y PNF asignado** (Oferta Académica).
* **Relación**: Existe **un Coordinador de PNF por cada PNF ofertado en cada sede** (tantos coordinadores de PNF como programas existan en la oferta académica de la sede).
* **Permisos**:
  * Consultar y gestionar la planificación académica, carga docente, asignaturas y estudiantes pertenecientes a su PNF específico dentro de la sede asignada.

---

## 2. Modelo de Entidades y Relaciones

```
+-----------------------------------+
|             Director              |
|        (Administrador)            |
+-----------------------------------+
                  |
                  v
+-----------------------------------+
|               Sede                |
| - id                              |
| - codigo                          |
| - nombre                          |
| - direccion / datos               |
+-----------------------------------+
         |                   |
         | 1                 | 1
         v N                 v 1
+--------------------+   +------------------------------------+
|  Oferta Académica  |   | Coordinador de Control de Estudios |
|     (SedePNF)      |   |            (por Sede)              |
| - id_sede          |   +------------------------------------+
| - id_pnf           |
| - estado           |
+--------------------+
         | 1
         v 1
+------------------------------------+
|         Coordinador de PNF         |
|     (asociado a Oferta/Sede)       |
+------------------------------------+
```

### Reglas de Negocio
1. **Edición de Sedes**: El Administrador (Director de CASRCE) puede modificar cualquier campo de la sede (nombre, datos de contacto, dirección) y actualizar la oferta de PNF en cualquier momento.
2. **Coordinación de Control de Estudio**: Cada sede cuenta con su correspondiente Coordinador de Control de Estudio, con permisos acotados exclusivamente a los registros e información de dicha sede.
3. **Coordinación de PNF**: La cantidad de Coordinadores de PNF en una sede es exactamente igual a la cantidad de PNFs activos en la oferta académica de dicha sede ($N_{\text{Coordinadores PNF}} = N_{\text{PNF ofertados}}$).
