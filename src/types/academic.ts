/**
 * Academic Management System for PNF (Programa Nacional de Formación)
 * Types and Data Contracts with Multi-Sede, Academic Pensum,
 * Evaluation Engine and Google Drive Storage Config.
 */

export type UserRole =
  | 'estudiante'
  | 'profesor'
  | 'asistente_docente'
  | 'coordinador_pnf'
  | 'asistente_pnf'
  | 'coordinador_carsce'
  | 'asistente_carsce'
  | 'administrador';

export interface User {
  id: string;
  cedula: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  pnfId?: string;
  sedeId?: string;
  avatar: string;
  title?: string;
  status: 'Activo' | 'Inactivo' | 'Suspendido';
}

export type PnfModality = 'trimestral' | 'semestral';

export interface PnfColorTheme {
  primary: string;       // e.g. 'blue', 'emerald', 'slate', 'amber'
  bgLight: string;       // Tailwind class for light card background
  bgPill: string;        // Badge pill background
  border: string;        // Border color
  text: string;          // Main text color
  darkText: string;      // Readable dark text
  accentBg: string;      // Accent button/tag bg
}

export interface PNF {
  id: string;
  code: string; // e.g. "PNF-INF", "PNF-VET", "PNF-NUT", "PNF-AGRO"
  name: string;
  modality: PnfModality;
  tramosPerTrayecto: number; // 3 for trimestral, 2 for semestral
  totalTrayectos: number; // typically 4 + Inicial (0, 1, 2, 3, 4)
  description: string;
  sedeIds: string[]; // Sedes where this PNF is offered
  coordinatorId: string;
  colorTheme: PnfColorTheme;
}

export interface Sede {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  pnfIdsOffered: string[];
  carsceCoordinatorId?: string; // ID del Coordinador de Control de Estudio de esta sede
  pnfCoordinatorsMap?: Record<string, string>; // pnfId -> coordinatorUserId asignado para esta sede
}

export type PeriodType = 'Pregrado_Regular' | 'Intensivo' | 'PER';

export interface AcademicPeriod {
  id: string;
  code: string; // e.g. "2026-I", "2026-INT", "2026-PER"
  name: string;
  year: number; // e.g. 2026
  type: PeriodType; // Pregrado_Regular, Intensivo, o PER (Plan Especial de Recuperación)
  season?: string; // e.g. "Primer Semestre (Feb - Jun)", "Intersemestral / Vacacional (Jul - Ago)", "Fin de Año / Extraordinario (Nov - Dic)"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'Planificación' | 'En_Curso' | 'Cierre_Notas' | 'Finalizado';
  recoveryNotesClosingRequired?: boolean; // Para PER, depende del cierre de notas ordinario
  notesClosingStatus?: 'Pendiente' | 'En_Carga' | 'Culminada'; // Estatus de carga de notas del que depende la habilitación
  perRegistrationOpen?: boolean;
}

export interface PerRecoveryRecord {
  id: string;
  periodId: string; // El período PER activo
  studentId: string;
  curricularUnitId: string;
  sectionCode?: string;
  originalPeriodCode: string;
  originalScore: number;
  recoveryScore?: number;
  recoveryStatus: 'Inscrito' | 'Evaluado_Aprobado' | 'Evaluado_Reprobado' | 'No_Presento';
  evaluationDate?: string;
  teacherObservation?: string; // Observaciones para el Consejo Docente
  evaluatorId?: string;
  evaluatorName?: string;
  updatedAt: string;
}

export interface SyllabusUnit {
  number: number;
  title: string;
  description: string;
  hours: number;
}

export interface CurricularUnit {
  id: string;
  pnfId: string;
  code: string;
  name: string;
  trayecto: number; // 0 (Inicial), 1, 2, 3, 4
  tramo: number;    // 1, 2, or 3
  horasAcademicasSemanales: number;
  totalPlannedSessions: number; // expected sessions in the tramo
  isProject: boolean;           // Proyecto Sociointegrador (PSI)
  synopsis?: string;            // Resumen curricular
  unitsContent?: SyllabusUnit[]; // Contenidos programáticos / Temas
  sedeIds?: string[];           // Oferta por sede específica
}

export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';

export interface DaySchedule {
  day: DayOfWeek;
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "10:15"
  classroom: string; // e.g. "Laboratorio 3", "Aula 104"
}

export interface Section {
  id: string;
  curricularUnitId: string;
  pnfId: string;
  sedeId: string;
  code: string; // e.g. "INF-T1T1-D1"
  periodId: string;
  trayecto: number;
  tramo: number;
  professorId: string;
  assistantId?: string;
  maxCapacity: number;
  shift: 'Diurno' | 'Vespertino' | 'Nocturno';
  schedules: DaySchedule[];
  actaStatus: 'Borrador' | 'En_Revision' | 'Validada_PNF' | 'Cerrada_CARSCE';
}

export type AttendanceStatus = 'P' | 'A' | 'J' | 'R'; // Presente, Ausente, Justificado, Retardo

export interface ClassSession {
  id: string;
  sectionId: string;
  sessionNumber: number;
  date: string; // YYYY-MM-DD
  topic: string;
  objective: string;
  registeredBy: string; // User ID
  registeredAt: string;
  isCompleted: boolean;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  sectionId: string;
  studentId: string;
  status: AttendanceStatus;
  justificationReason?: string;
  updatedAt: string;
}

export interface EvaluationPlanItem {
  id: string;
  sectionId: string;
  corteNumber: number; // 1, 2, 3, 4
  title: string;
  weightPercentage: number; // Max 25% per requirement
  maxScore: number; // 20
  instrument: string; // "Prueba Escrita", "Proyecto", "Defensa", "Taller"
  dueDate: string;
  isPublished: boolean;
}

export interface GradeRecord {
  id: string;
  evaluationPlanItemId: string;
  sectionId: string;
  studentId: string;
  score: number; // 0 - 20
  feedback?: string;
  updatedBy: string;
  updatedAt: string;
}

export type ObservationCategory =
  | 'Desempeño Académico'
  | 'Práctica y Laboratorio'
  | 'Actitud y Asistencia'
  | 'Socioeconómico y Salud'
  | 'Mérito y Liderazgo';

export interface StudentObservation {
  id: string;
  studentId: string;
  sectionId: string;
  date: string;
  category: ObservationCategory;
  note: string;
  recommendationCouncil: string; // Para discutir en Consejo Docente
  authorId: string;
  authorName: string;
  createdAt: string;
}

export type EnrollmentStatus =
  | 'Inscrito'
  | 'Aprobado'
  | 'Reprobado'
  | 'Retirado'
  | 'Reprobado_Inasistencias';

export interface Enrollment {
  id: string;
  studentId: string;
  sectionId: string;
  periodId: string;
  status: EnrollmentStatus;
  enrollmentDate: string;
  finalGrade?: number;
}

export interface PreRegistration {
  id: string;
  cedula: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pnfId: string;
  sedeId: string;
  birthDate: string;
  highSchool: string;
  graduationYear: number;
  address: string;
  shiftPreference: 'Diurno' | 'Vespertino' | 'Nocturno';
  status: 'Pendiente' | 'Aprobada' | 'Observada' | 'Formalizada';
  reviewNotes?: string;
  // Lightweight metadata: Only stores text / Drive URLs or hashes, NO heavy binaries!
  documents: {
    cedulaCopy: boolean;
    cedulaDriveLink?: string;
    titleCopy: boolean;
    titleDriveLink?: string;
    gradesCertificate: boolean;
    gradesDriveLink?: string;
    photo: boolean;
    photoDriveLink?: string;
  };
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface SystemNotification {
  id: string;
  targetRole?: UserRole;
  targetUserId?: string;
  targetPnfId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  createdAt: string;
  read: boolean;
  category: 'asistencia' | 'calificaciones' | 'preinscripcion' | 'actas' | 'consejo' | 'general';
}

export interface AttendanceSummary {
  studentId: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  justifiedCount: number;
  tardyCount: number;
  attendancePercentage: number;
  absencePercentage: number;
  isAtRisk: boolean; // > 15%
  isCriticallyFailed: boolean; // > 25% faltas
}

// Evaluation Engine Rules Configuration (CARSCE)
export interface EvaluationEngineConfig {
  minPassingGradeRegular: number; // e.g. 12 / 20
  minPassingGradeProject: number; // e.g. 16 / 20 for PSI
  maxCutWeightPercentage: number; // 25% max per cut
  requireProjectToAdvanceTrayecto: boolean; // Must approve Project to advance
  maxFailedUnitsAllowedToAdvance: number; // e.g. 1 unit in drag
  minAttendanceRequiredPercentage: number; // e.g. 75%
  scaleMax: number; // 20
}

// Google Drive Storage Configuration (for light database usage)
export interface DriveStorageConfig {
  institutionalDriveEmail: string; // e.g. "archivo.carsce.drive@universidad.edu.ve"
  driveFolderId: string;          // e.g. "1B2c3D4e5F_PNF_DOCUMENTOS_2026"
  enableDriveSync: boolean;
  maxFilesPerStudent: number;
  storageUsedBytes: number;
  syncStatus: 'Sincronizado' | 'En Cola' | 'Pendiente';
}

// Student Complete Academic Record Item
export interface AcademicRecordItem {
  id: string;
  periodCode: string;
  trayecto: number;
  tramo: number;
  curricularUnitCode: string;
  curricularUnitName: string;
  isProject: boolean;
  finalScore: number;
  letterGrade: string;
  status: 'Aprobado' | 'Reprobado' | 'En Curso';
  approvalDate: string;
  approvalMode?: 'Pregrado_Regular' | 'PER' | 'Intensivo'; // Modo de aprobación ordinario, Intensivo o por Plan Especial de Recuperación
}
