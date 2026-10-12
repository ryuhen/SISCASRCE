import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  PNF,
  Sede,
  AcademicPeriod,
  CurricularUnit,
  Section,
  ClassSession,
  AttendanceRecord,
  EvaluationPlanItem,
  GradeRecord,
  Enrollment,
  PreRegistration,
  SystemNotification,
  AttendanceStatus,
  AttendanceSummary,
  StudentObservation,
  EvaluationEngineConfig,
  DriveStorageConfig,
  AcademicRecordItem,
  PerRecoveryRecord,
} from '../types/academic';
import {
  INITIAL_USERS,
  INITIAL_PNFS,
  INITIAL_SEDES,
  INITIAL_PERIODS,
  INITIAL_CURRICULAR_UNITS,
  INITIAL_SECTIONS,
  INITIAL_CLASS_SESSIONS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_EVALUATION_PLAN,
  INITIAL_GRADES,
  INITIAL_ENROLLMENTS,
  INITIAL_OBSERVATIONS,
  INITIAL_ACADEMIC_RECORDS,
  INITIAL_PRE_REGISTRATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EVALUATION_ENGINE,
  INITIAL_DRIVE_STORAGE,
  INITIAL_PER_RECOVERIES,
} from '../mock/initialData';

interface SectionGradeStatus {
  totalRequiredGrades: number;
  loadedGradesCount: number;
  percentageLoaded: number;
  statusLabel: 'Sin Iniciar' | 'En Proceso' | 'Completado' | 'Acta Cerrada';
  cortesSummary: {
    id: string;
    corteNumber: number;
    title: string;
    weightPercentage: number;
    loadedCount: number;
    totalCount: number;
    isPublished: boolean;
  }[];
}

interface StudentInMatrix extends User {
  attendanceSummary: AttendanceSummary;
  recordsBySessionId: Record<string, AttendanceRecord | undefined>;
  corteGrades: Record<string, number | undefined>;
  definitiveGrade?: number;
  observations: StudentObservation[];
}

interface AttendanceMatrixData {
  section: Section;
  curricularUnit: CurricularUnit;
  professor: User;
  sede?: Sede;
  sessions: ClassSession[];
  students: StudentInMatrix[];
  overallAttendancePercentage: number;
  totalPlannedSessions: number;
  executedSessionsCount: number;
  curricularProgressPercentage: number;
}

interface AcademicContextType {
  // Core State
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
  users: User[];
  pnfs: PNF[];
  sedes: Sede[];
  periods: AcademicPeriod[];
  currentPeriod: AcademicPeriod;
  setCurrentPeriodId: (periodId: string) => void;
  curricularUnits: CurricularUnit[];
  sections: Section[];
  classSessions: ClassSession[];
  attendanceRecords: AttendanceRecord[];
  evaluationPlans: EvaluationPlanItem[];
  grades: GradeRecord[];
  observations: StudentObservation[];
  academicRecords: AcademicRecordItem[];
  enrollments: Enrollment[];
  preRegistrations: PreRegistration[];
  notifications: SystemNotification[];
  evaluationEngine: EvaluationEngineConfig;
  driveStorage: DriveStorageConfig;
  perRecoveries: PerRecoveryRecord[];

  // Mutations
  addSessionWithAttendance: (
    sessionData: { sectionId: string; date: string; topic: string; objective: string },
    attendances: { studentId: string; status: AttendanceStatus; justificationReason?: string }[]
  ) => ClassSession;
  updateAttendanceStatus: (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    justificationReason?: string
  ) => void;
  saveGrade: (
    evaluationPlanItemId: string,
    sectionId: string,
    studentId: string,
    score: number,
    feedback?: string
  ) => void;
  addEvaluationItem: (item: Omit<EvaluationPlanItem, 'id'>) => boolean;
  toggleEvaluationPublish: (evaluationPlanItemId: string) => void;
  updateSectionActaStatus: (sectionId: string, status: Section['actaStatus']) => void;
  addStudentObservation: (
    obs: Omit<StudentObservation, 'id' | 'createdAt' | 'authorId' | 'authorName'>
  ) => void;
  deleteStudentObservation: (id: string) => void;
  submitPreRegistration: (data: Omit<PreRegistration, 'id' | 'status' | 'createdAt'>) => PreRegistration;
  reviewPreRegistration: (id: string, status: PreRegistration['status'], notes?: string) => void;
  formalizeEnrollment: (preRegId: string, sectionId: string) => void;
  addCurricularUnit: (unit: Omit<CurricularUnit, 'id'>) => void;
  updateCurricularUnit: (id: string, updates: Partial<CurricularUnit>) => void;
  addSection: (section: Omit<Section, 'id' | 'actaStatus'>) => void;
  addPnf: (pnf: Omit<PNF, 'id'>) => PNF;
  updatePnfSettings: (pnfId: string, updates: Partial<PNF>) => void;
  addSede: (sede: Omit<Sede, 'id'>) => void;
  updateSede: (id: string, updates: Partial<Sede>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  addUser: (user: Omit<User, 'id'>) => User;
  assignCarsceCoordinatorToSede: (sedeId: string, userId: string) => void;
  assignPnfCoordinatorToSede: (sedeId: string, pnfId: string, userId: string) => void;
  addNewAcademicPeriod: (period: Omit<AcademicPeriod, 'id' | 'isCurrent'>) => void;
  updateAcademicPeriod: (id: string, updates: Partial<AcademicPeriod>) => void;
  closeRegularPeriodNotes: (periodId: string) => void;
  applyForPerRecovery: (
    studentId: string,
    curricularUnitId: string,
    originalScore: number,
    originalPeriodCode: string,
    sectionCode?: string
  ) => void;
  gradePerRecovery: (recoveryId: string, score: number, observation: string) => void;
  updateEvaluationEngine: (config: Partial<EvaluationEngineConfig>) => void;
  updateDriveStorage: (config: Partial<DriveStorageConfig>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<SystemNotification, 'id' | 'createdAt' | 'read'>) => void;
  resetAllData: () => void;

  // Calculators & Selectors
  getAttendanceMatrixForSection: (sectionId: string) => AttendanceMatrixData | null;
  getSectionGradeStatus: (sectionId: string) => SectionGradeStatus;
  getStudentsForSection: (sectionId: string) => User[];
  getAcademicRecordForStudent: (studentId: string) => {
    records: AcademicRecordItem[];
    cumulativeGpa: number;
    totalApprovedUnits: number;
    projectApproved: boolean;
    canAdvanceToNextTrayecto: boolean;
    advanceMessage: string;
  };
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'siscasrce_pnf_v2_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = loadFromStorage<User | null>('currentUser', null);
    if (savedUser && INITIAL_USERS.some(u => u.id === savedUser.id)) {
      return savedUser;
    }
    return INITIAL_USERS[3]; // Prof. Carlos Mendoza
  });

  const [pnfs, setPnfs] = useState<PNF[]>(() => loadFromStorage('pnfs', INITIAL_PNFS));
  const [sedes, setSedes] = useState<Sede[]>(() => loadFromStorage('sedes', INITIAL_SEDES));
  const [periods, setPeriods] = useState<AcademicPeriod[]>(() => loadFromStorage('periods', INITIAL_PERIODS));
  const [currentPeriodId, setCurrentPeriodId] = useState<string>(() => {
    const saved = loadFromStorage<string>('currentPeriodId', 'per-2026-1');
    return saved;
  });

  const [curricularUnits, setCurricularUnits] = useState<CurricularUnit[]>(() =>
    loadFromStorage('curricularUnits', INITIAL_CURRICULAR_UNITS)
  );
  const [sections, setSections] = useState<Section[]>(() =>
    loadFromStorage('sections', INITIAL_SECTIONS)
  );
  const [classSessions, setClassSessions] = useState<ClassSession[]>(() =>
    loadFromStorage('classSessions', INITIAL_CLASS_SESSIONS)
  );
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    loadFromStorage('attendanceRecords', INITIAL_ATTENDANCE_RECORDS)
  );
  const [evaluationPlans, setEvaluationPlans] = useState<EvaluationPlanItem[]>(() =>
    loadFromStorage('evaluationPlans', INITIAL_EVALUATION_PLAN)
  );
  const [grades, setGrades] = useState<GradeRecord[]>(() =>
    loadFromStorage('grades', INITIAL_GRADES)
  );
  const [observations, setObservations] = useState<StudentObservation[]>(() =>
    loadFromStorage('observations', INITIAL_OBSERVATIONS)
  );
  const [academicRecords, setAcademicRecords] = useState<AcademicRecordItem[]>(() =>
    loadFromStorage('academicRecords', INITIAL_ACADEMIC_RECORDS)
  );
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() =>
    loadFromStorage('enrollments', INITIAL_ENROLLMENTS)
  );
  const [preRegistrations, setPreRegistrations] = useState<PreRegistration[]>(() =>
    loadFromStorage('preRegistrations', INITIAL_PRE_REGISTRATIONS)
  );
  const [notifications, setNotifications] = useState<SystemNotification[]>(() =>
    loadFromStorage('notifications', INITIAL_NOTIFICATIONS)
  );
  const [evaluationEngine, setEvaluationEngine] = useState<EvaluationEngineConfig>(() =>
    loadFromStorage('evaluationEngine', INITIAL_EVALUATION_ENGINE)
  );
  const [driveStorage, setDriveStorage] = useState<DriveStorageConfig>(() =>
    loadFromStorage('driveStorage', INITIAL_DRIVE_STORAGE)
  );
  const [perRecoveries, setPerRecoveries] = useState<PerRecoveryRecord[]>(() =>
    loadFromStorage('perRecoveries', INITIAL_PER_RECOVERIES)
  );

  // Sync to LocalStorage
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('currentUser', currentUser), [currentUser]);
  useEffect(() => saveToStorage('pnfs', pnfs), [pnfs]);
  useEffect(() => saveToStorage('sedes', sedes), [sedes]);
  useEffect(() => saveToStorage('periods', periods), [periods]);
  useEffect(() => saveToStorage('currentPeriodId', currentPeriodId), [currentPeriodId]);
  useEffect(() => saveToStorage('curricularUnits', curricularUnits), [curricularUnits]);
  useEffect(() => saveToStorage('sections', sections), [sections]);
  useEffect(() => saveToStorage('classSessions', classSessions), [classSessions]);
  useEffect(() => saveToStorage('attendanceRecords', attendanceRecords), [attendanceRecords]);
  useEffect(() => saveToStorage('evaluationPlans', evaluationPlans), [evaluationPlans]);
  useEffect(() => saveToStorage('grades', grades), [grades]);
  useEffect(() => saveToStorage('observations', observations), [observations]);
  useEffect(() => saveToStorage('academicRecords', academicRecords), [academicRecords]);
  useEffect(() => saveToStorage('enrollments', enrollments), [enrollments]);
  useEffect(() => saveToStorage('preRegistrations', preRegistrations), [preRegistrations]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('evaluationEngine', evaluationEngine), [evaluationEngine]);
  useEffect(() => saveToStorage('driveStorage', driveStorage), [driveStorage]);
  useEffect(() => saveToStorage('perRecoveries', perRecoveries), [perRecoveries]);

  const currentPeriod = useMemo(() => {
    return periods.find(p => p.id === currentPeriodId) || periods[0];
  }, [periods, currentPeriodId]);

  const switchUserById = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const getStudentsForSection = (sectionId: string): User[] => {
    const studentIds = enrollments
      .filter(e => e.sectionId === sectionId && e.status === 'Inscrito')
      .map(e => e.studentId);
    return users.filter(u => studentIds.includes(u.id));
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addSessionWithAttendance = (
    sessionData: { sectionId: string; date: string; topic: string; objective: string },
    attendances: { studentId: string; status: AttendanceStatus; justificationReason?: string }[]
  ): ClassSession => {
    const sectionSessions = classSessions.filter(s => s.sectionId === sessionData.sectionId);
    const nextSessionNumber = sectionSessions.length + 1;
    const sessionId = `ses-${Date.now()}`;

    const newSession: ClassSession = {
      id: sessionId,
      sectionId: sessionData.sectionId,
      sessionNumber: nextSessionNumber,
      date: sessionData.date,
      topic: sessionData.topic,
      objective: sessionData.objective,
      registeredBy: currentUser.id,
      registeredAt: new Date().toISOString(),
      isCompleted: true,
    };

    const newAttendanceRecords: AttendanceRecord[] = attendances.map((att, idx) => ({
      id: `att-${sessionId}-${idx}`,
      sessionId: sessionId,
      sectionId: sessionData.sectionId,
      studentId: att.studentId,
      status: att.status,
      justificationReason: att.justificationReason,
      updatedAt: new Date().toISOString(),
    }));

    setClassSessions(prev => [...prev, newSession]);
    setAttendanceRecords(prev => [...prev, ...newAttendanceRecords]);

    // Check alert threshold
    attendances.forEach(att => {
      const student = users.find(u => u.id === att.studentId);
      if (!student) return;

      const pastAbsences = attendanceRecords.filter(
        ar => ar.studentId === att.studentId && ar.sectionId === sessionData.sectionId && ar.status === 'A'
      ).length;
      const totalAbsences = pastAbsences + (att.status === 'A' ? 1 : 0);
      const totalSessionsSoFar = nextSessionNumber;
      const absencePct = (totalAbsences / totalSessionsSoFar) * 100;

      if (absencePct >= 25 && totalSessionsSoFar >= 4) {
        addNotification({
          targetRole: 'profesor',
          targetUserId: currentUser.id,
          title: '🚨 Alerta: Límite de Inasistencias Superado (>25%)',
          message: `El estudiante ${student.name} (${student.cedula}) acumuló ${totalAbsences} faltas (${absencePct.toFixed(1)}%). En riesgo de reprobación por inasistencias.`,
          type: 'alert',
          category: 'asistencia',
        });
      }
    });

    return newSession;
  };

  const updateAttendanceStatus = (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    justificationReason?: string
  ) => {
    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(
        r => r.sessionId === sessionId && r.studentId === studentId
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          status,
          justificationReason: justificationReason || copy[existingIndex].justificationReason,
          updatedAt: new Date().toISOString(),
        };
        return copy;
      } else {
        const session = classSessions.find(s => s.id === sessionId);
        const newRecord: AttendanceRecord = {
          id: `att-dyn-${Date.now()}`,
          sessionId,
          sectionId: session?.sectionId || '',
          studentId,
          status,
          justificationReason,
          updatedAt: new Date().toISOString(),
        };
        return [...prev, newRecord];
      }
    });
  };

  const saveGrade = (
    evaluationPlanItemId: string,
    sectionId: string,
    studentId: string,
    score: number,
    feedback?: string
  ) => {
    const validScore = Math.min(20, Math.max(0, Number(score)));
    setGrades(prev => {
      const existingIndex = prev.findIndex(
        g => g.evaluationPlanItemId === evaluationPlanItemId && g.studentId === studentId
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          score: validScore,
          feedback,
          updatedBy: currentUser.id,
          updatedAt: new Date().toISOString(),
        };
        return copy;
      } else {
        const newGrade: GradeRecord = {
          id: `grd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          evaluationPlanItemId,
          sectionId,
          studentId,
          score: validScore,
          feedback,
          updatedBy: currentUser.id,
          updatedAt: new Date().toISOString(),
        };
        return [...prev, newGrade];
      }
    });
  };

  const addEvaluationItem = (item: Omit<EvaluationPlanItem, 'id'>): boolean => {
    // Check constraint: max cut weight cannot exceed configured max (25%)
    const maxAllowed = evaluationEngine.maxCutWeightPercentage || 25;
    if (item.weightPercentage > maxAllowed) {
      alert(`El peso de un corte no puede exceder el límite establecido por Control de Estudio de ${maxAllowed}%.`);
      return false;
    }

    const newItem: EvaluationPlanItem = {
      ...item,
      id: `eval-${Date.now()}`,
    };
    setEvaluationPlans(prev => [...prev, newItem]);
    return true;
  };

  const toggleEvaluationPublish = (evaluationPlanItemId: string) => {
    setEvaluationPlans(prev =>
      prev.map(item => {
        if (item.id === evaluationPlanItemId) {
          const nextState = !item.isPublished;
          if (nextState) {
            addNotification({
              targetRole: 'estudiante',
              title: `Notas Publicadas: ${item.title}`,
              message: `El docente ha publicado las calificaciones del corte. Consulta tu récord en línea.`,
              type: 'info',
              category: 'calificaciones',
            });
          }
          return { ...item, isPublished: nextState };
        }
        return item;
      })
    );
  };

  const updateSectionActaStatus = (sectionId: string, status: Section['actaStatus']) => {
    setSections(prev => prev.map(s => (s.id === sectionId ? { ...s, actaStatus: status } : s)));
  };

  const addStudentObservation = (
    obs: Omit<StudentObservation, 'id' | 'createdAt' | 'authorId' | 'authorName'>
  ) => {
    const newObs: StudentObservation = {
      ...obs,
      id: `obs-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setObservations(prev => [newObs, ...prev]);

    addNotification({
      targetRole: 'coordinador_pnf',
      title: 'Nueva Observación para Consejo Docente',
      message: `${currentUser.name} ha registrado una observación académica para discusión en el próximo Consejo Docente.`,
      type: 'info',
      category: 'consejo',
    });
  };

  const deleteStudentObservation = (id: string) => {
    setObservations(prev => prev.filter(o => o.id !== id));
  };

  const submitPreRegistration = (
    data: Omit<PreRegistration, 'id' | 'status' | 'createdAt'>
  ): PreRegistration => {
    const newPreReg: PreRegistration = {
      ...data,
      id: `prereg-${Date.now()}`,
      status: 'Pendiente',
      createdAt: new Date().toISOString(),
    };
    setPreRegistrations(prev => [newPreReg, ...prev]);

    // Update storage usage stats in bytes (lightweight text metadata only)
    setDriveStorage(prev => ({
      ...prev,
      storageUsedBytes: prev.storageUsedBytes + 1024,
    }));

    addNotification({
      targetRole: 'coordinador_carsce',
      title: 'Nueva Preinscripción en Cola',
      message: `Aspirante ${data.firstName} ${data.lastName} (${data.cedula}) registrada con recaudos en Drive.`,
      type: 'info',
      category: 'preinscripcion',
    });

    return newPreReg;
  };

  const reviewPreRegistration = (
    id: string,
    status: PreRegistration['status'],
    notes?: string
  ) => {
    setPreRegistrations(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status,
              reviewNotes: notes || p.reviewNotes,
              reviewedBy: currentUser.id,
              reviewedAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const formalizeEnrollment = (preRegId: string, sectionId: string) => {
    const preReg = preRegistrations.find(p => p.id === preRegId);
    if (!preReg) return;

    const existingUser = users.find(u => u.cedula === preReg.cedula);
    let studentId = existingUser?.id;

    if (!existingUser) {
      const newUserId = `usr-est-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        cedula: preReg.cedula,
        name: `${preReg.firstName} ${preReg.lastName}`,
        email: preReg.email,
        phone: preReg.phone,
        role: 'estudiante',
        pnfId: preReg.pnfId,
        sedeId: preReg.sedeId,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        title: 'Estudiante Nuevo Ingreso',
        status: 'Activo',
      };
      setUsers(prev => [...prev, newUser]);
      studentId = newUserId;
    }

    if (studentId) {
      const newEnrollment: Enrollment = {
        id: `enr-${Date.now()}`,
        studentId,
        sectionId,
        periodId: currentPeriod.id,
        status: 'Inscrito',
        enrollmentDate: new Date().toISOString(),
      };
      setEnrollments(prev => [...prev, newEnrollment]);

      setPreRegistrations(prev =>
        prev.map(p => (p.id === preRegId ? { ...p, status: 'Formalizada' } : p))
      );
    }
  };

  const addCurricularUnit = (unit: Omit<CurricularUnit, 'id'>) => {
    const newUnit: CurricularUnit = {
      ...unit,
      id: `uc-${Date.now()}`,
    };
    setCurricularUnits(prev => [...prev, newUnit]);
  };

  const updateCurricularUnit = (id: string, updates: Partial<CurricularUnit>) => {
    setCurricularUnits(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
  };

  const addSection = (section: Omit<Section, 'id' | 'actaStatus'>) => {
    const newSection: Section = {
      ...section,
      id: `sec-${Date.now()}`,
      actaStatus: 'Borrador',
    };
    setSections(prev => [...prev, newSection]);
  };

  const addPnf = (pnf: Omit<PNF, 'id'>): PNF => {
    const newPnf: PNF = {
      ...pnf,
      id: `pnf-${Date.now()}`,
    };
    setPnfs(prev => [...prev, newPnf]);
    return newPnf;
  };

  const updatePnfSettings = (pnfId: string, updates: Partial<PNF>) => {
    setPnfs(prev => prev.map(p => (p.id === pnfId ? { ...p, ...updates } : p)));
  };

  const addSede = (sede: Omit<Sede, 'id'>) => {
    const newSedeId = `sede-${Date.now()}`;
    const newSede: Sede = {
      ...sede,
      id: newSedeId,
    };
    setSedes(prev => [...prev, newSede]);

    // Sincronizar oferta con PNFs
    if (newSede.pnfIdsOffered && newSede.pnfIdsOffered.length > 0) {
      setPnfs(prev =>
        prev.map(p => {
          if (newSede.pnfIdsOffered.includes(p.id) && !p.sedeIds.includes(newSedeId)) {
            return { ...p, sedeIds: [...p.sedeIds, newSedeId] };
          }
          return p;
        })
      );
    }
  };

  const updateSede = (id: string, updates: Partial<Sede>) => {
    setSedes(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));

    // Si se modificó la oferta de PNFs, sincronizar bidireccionalmente sedeIds en PNFs
    if (updates.pnfIdsOffered) {
      const offeredList = updates.pnfIdsOffered;
      setPnfs(prevPnfs =>
        prevPnfs.map(pnf => {
          const isOfferedHere = offeredList.includes(pnf.id);
          const alreadyLinked = pnf.sedeIds.includes(id);
          if (isOfferedHere && !alreadyLinked) {
            return { ...pnf, sedeIds: [...pnf.sedeIds, id] };
          } else if (!isOfferedHere && alreadyLinked) {
            return { ...pnf, sedeIds: pnf.sedeIds.filter(sId => sId !== id) };
          }
          return pnf;
        })
      );
    }
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updates } : u)));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  };

  const addUser = (user: Omit<User, 'id'>): User => {
    const newUserId = `usr-${Date.now()}`;
    const newUser: User = {
      ...user,
      id: newUserId,
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const assignCarsceCoordinatorToSede = (sedeId: string, userId: string) => {
    updateSede(sedeId, { carsceCoordinatorId: userId });
    updateUser(userId, { sedeId, role: 'coordinador_carsce' });
  };

  const assignPnfCoordinatorToSede = (sedeId: string, pnfId: string, userId: string) => {
    setSedes(prev =>
      prev.map(s => {
        if (s.id !== sedeId) return s;
        const pnfCoordinatorsMap = { ...(s.pnfCoordinatorsMap || {}), [pnfId]: userId };
        return { ...s, pnfCoordinatorsMap };
      })
    );
    updateUser(userId, { sedeId, pnfId, role: 'coordinador_pnf' });
  };

  const addNewAcademicPeriod = (period: Omit<AcademicPeriod, 'id' | 'isCurrent'>) => {
    const newPeriod: AcademicPeriod = {
      ...period,
      id: `per-${Date.now()}`,
      isCurrent: true,
    };
    // Mark previous as non-current
    setPeriods(prev => [newPeriod, ...prev.map(p => ({ ...p, isCurrent: false }))]);
    setCurrentPeriodId(newPeriod.id);
  };

  const updateAcademicPeriod = (id: string, updates: Partial<AcademicPeriod>) => {
    setPeriods(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const closeRegularPeriodNotes = (periodId: string) => {
    const targetPeriod = periods.find(p => p.id === periodId);
    setPeriods(prev =>
      prev.map(p => {
        if (p.id === periodId) {
          return { ...p, status: 'Cierre_Notas', notesClosingStatus: 'Culminada' };
        }
        // Habilitar PER para el mismo año lectivo si está en planificación
        if (p.type === 'PER' && p.year === targetPeriod?.year) {
          return { ...p, status: 'En_Curso', perRegistrationOpen: true };
        }
        return p;
      })
    );

    addNotification({
      targetRole: 'coordinador_carsce',
      title: 'Cierre de Carga de Notas Ordinarias Culminada',
      message: `La carga de notas del período ordinario ${targetPeriod?.code} ha sido completada y cerrada. El Plan Especial de Recuperación (PER) queda habilitado para convalidar asignaturas pendientes.`,
      type: 'success',
      category: 'calificaciones',
    });
  };

  const applyForPerRecovery = (
    studentId: string,
    curricularUnitId: string,
    originalScore: number,
    originalPeriodCode: string,
    sectionCode?: string
  ) => {
    const activePerPeriod = periods.find(p => p.type === 'PER') || currentPeriod;
    const existing = perRecoveries.find(
      r => r.studentId === studentId && r.curricularUnitId === curricularUnitId && r.periodId === activePerPeriod.id
    );
    if (existing) return;

    const newRec: PerRecoveryRecord = {
      id: `per-rec-${Date.now()}`,
      periodId: activePerPeriod.id,
      studentId,
      curricularUnitId,
      sectionCode: sectionCode || 'SEC-PER-REC',
      originalPeriodCode,
      originalScore,
      recoveryStatus: 'Inscrito',
      updatedAt: new Date().toISOString(),
    };
    setPerRecoveries(prev => [newRec, ...prev]);

    const student = users.find(u => u.id === studentId);
    const uc = curricularUnits.find(u => u.id === curricularUnitId);
    addNotification({
      targetRole: 'coordinador_carsce',
      title: 'Nueva Postulación a Convocatoria PER',
      message: `El estudiante ${student?.name || 'Estudiante'} (C.I. ${student?.cedula}) se ha postulado para recuperar la UC ${uc?.name || curricularUnitId} en el período PER.`,
      type: 'info',
      category: 'calificaciones',
    });
  };

  const gradePerRecovery = (recoveryId: string, score: number, observation: string) => {
    const isPassing = score >= (evaluationEngine.minPassingGradeRegular || 12);
    const targetRec = perRecoveries.find(r => r.id === recoveryId);

    setPerRecoveries(prev =>
      prev.map(r =>
        r.id === recoveryId
          ? {
              ...r,
              recoveryScore: score,
              recoveryStatus: isPassing ? 'Evaluado_Aprobado' : 'Evaluado_Reprobado',
              evaluationDate: new Date().toISOString().split('T')[0],
              teacherObservation: observation,
              evaluatorId: currentUser.id,
              evaluatorName: currentUser.name,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    if (targetRec) {
      const student = users.find(u => u.id === targetRec.studentId);
      const uc = curricularUnits.find(u => u.id === targetRec.curricularUnitId);

      // Si aprobó, actualizar o insertar en récord académico
      if (isPassing) {
        setAcademicRecords(prev => {
          const ucCode = uc?.code || 'UC-REC';
          const existingIndex = prev.findIndex(item => item.curricularUnitCode === ucCode);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              finalScore: score,
              letterGrade:
                score >= 19
                  ? 'DIECINUEVE (SOBRESALIENTE)'
                  : score >= 16
                  ? 'DIECISÉIS (MUY BUENO)'
                  : 'DOCE (APROBADO)',
              status: 'Aprobado',
              approvalDate: new Date().toISOString().split('T')[0],
              approvalMode: 'PER',
            };
            return updated;
          } else {
            const newItem: AcademicRecordItem = {
              id: `rec-per-${Date.now()}`,
              periodCode: currentPeriod.code,
              trayecto: uc?.trayecto || 1,
              tramo: uc?.tramo || 1,
              curricularUnitCode: uc?.code || 'UC-REC',
              curricularUnitName: uc?.name || 'Unidad Curricular',
              isProject: uc?.isProject || false,
              finalScore: score,
              letterGrade:
                score >= 19
                  ? 'DIECINUEVE'
                  : score >= 16
                  ? 'DIECISÉIS'
                  : 'DOCE',
              status: 'Aprobado',
              approvalDate: new Date().toISOString().split('T')[0],
              approvalMode: 'PER',
            };
            return [...prev, newItem];
          }
        });
      }

      addNotification({
        targetUserId: targetRec.studentId,
        title: isPassing ? '¡Unidad Aprobada en PER!' : 'Calificación de Recuperación Asentada',
        message: `Se ha asentado tu nota recuperatoria en ${uc?.name}: ${score}/20 pts (${isPassing ? 'Aprobada en PER' : 'No aprobada'}). ${observation}`,
        type: isPassing ? 'success' : 'alert',
        category: 'calificaciones',
      });
    }
  };

  const updateEvaluationEngine = (config: Partial<EvaluationEngineConfig>) => {
    setEvaluationEngine(prev => ({ ...prev, ...config }));
  };

  const updateDriveStorage = (config: Partial<DriveStorageConfig>) => {
    setDriveStorage(prev => ({ ...prev, ...config }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[3]);
    setPnfs(INITIAL_PNFS);
    setSedes(INITIAL_SEDES);
    setPeriods(INITIAL_PERIODS);
    setCurrentPeriodId(INITIAL_PERIODS[0].id);
    setCurricularUnits(INITIAL_CURRICULAR_UNITS);
    setSections(INITIAL_SECTIONS);
    setClassSessions(INITIAL_CLASS_SESSIONS);
    setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
    setEvaluationPlans(INITIAL_EVALUATION_PLAN);
    setGrades(INITIAL_GRADES);
    setObservations(INITIAL_OBSERVATIONS);
    setAcademicRecords(INITIAL_ACADEMIC_RECORDS);
    setEnrollments(INITIAL_ENROLLMENTS);
    setPreRegistrations(INITIAL_PRE_REGISTRATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setEvaluationEngine(INITIAL_EVALUATION_ENGINE);
    setDriveStorage(INITIAL_DRIVE_STORAGE);
    setPerRecoveries(INITIAL_PER_RECOVERIES);
  };

  const getAttendanceMatrixForSection = (sectionId: string): AttendanceMatrixData | null => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return null;

    const curricularUnit = curricularUnits.find(u => u.id === section.curricularUnitId);
    if (!curricularUnit) return null;

    const professor = users.find(u => u.id === section.professorId) || {
      id: 'usr-unknown',
      cedula: 'N/A',
      name: 'Sin Docente Asignado',
      email: '',
      phone: '',
      role: 'profesor',
      avatar: '',
      status: 'Activo',
    };

    const sede = sedes.find(s => s.id === section.sedeId);

    const sectionSessions = classSessions
      .filter(s => s.sectionId === sectionId)
      .sort((a, b) => a.sessionNumber - b.sessionNumber);

    const enrolledStudents = getStudentsForSection(sectionId);
    const sectionEvalPlans = evaluationPlans.filter(e => e.sectionId === sectionId);

    const studentsInMatrix: StudentInMatrix[] = enrolledStudents.map(student => {
      const recordsBySessionId: Record<string, AttendanceRecord | undefined> = {};
      let presentCount = 0;
      let absentCount = 0;
      let justifiedCount = 0;
      let tardyCount = 0;

      sectionSessions.forEach(session => {
        const record = attendanceRecords.find(
          ar => ar.sessionId === session.id && ar.studentId === student.id
        );
        recordsBySessionId[session.id] = record;

        if (record) {
          if (record.status === 'P') presentCount++;
          else if (record.status === 'A') absentCount++;
          else if (record.status === 'J') justifiedCount++;
          else if (record.status === 'R') tardyCount++;
        }
      });

      const totalRecorded = sectionSessions.length;
      const effectivePresents = presentCount + justifiedCount + tardyCount;
      const attendancePercentage =
        totalRecorded > 0 ? Math.round((effectivePresents / totalRecorded) * 100) : 100;
      const absencePercentage =
        totalRecorded > 0 ? Math.round((absentCount / totalRecorded) * 100) : 0;

      const isCriticallyFailed = absencePercentage >= 25 && totalRecorded >= 4;
      const isAtRisk = absencePercentage >= 15 && !isCriticallyFailed;

      const attendanceSummary: AttendanceSummary = {
        studentId: student.id,
        totalSessions: totalRecorded,
        presentCount,
        absentCount,
        justifiedCount,
        tardyCount,
        attendancePercentage,
        absencePercentage,
        isAtRisk,
        isCriticallyFailed,
      };

      const corteGrades: Record<string, number | undefined> = {};
      let weightedSum = 0;
      let totalWeightConsidered = 0;

      sectionEvalPlans.forEach(evalItem => {
        const grade = grades.find(
          g => g.evaluationPlanItemId === evalItem.id && g.studentId === student.id
        );
        if (grade !== undefined) {
          corteGrades[evalItem.id] = grade.score;
          weightedSum += grade.score * (evalItem.weightPercentage / 100);
          totalWeightConsidered += evalItem.weightPercentage;
        }
      });

      const definitiveGrade =
        totalWeightConsidered > 0 ? Math.round(weightedSum * 10) / 10 : undefined;

      // Observations for this student in this section
      const studentObs = observations.filter(
        o => o.studentId === student.id && o.sectionId === sectionId
      );

      return {
        ...student,
        attendanceSummary,
        recordsBySessionId,
        corteGrades,
        definitiveGrade,
        observations: studentObs,
      };
    });

    const totalStudents = studentsInMatrix.length;
    const overallAttendancePercentage =
      totalStudents > 0
        ? Math.round(
            studentsInMatrix.reduce((acc, s) => acc + s.attendanceSummary.attendancePercentage, 0) /
              totalStudents
          )
        : 100;

    const totalPlannedSessions = curricularUnit.totalPlannedSessions || 16;
    const executedSessionsCount = sectionSessions.length;
    const curricularProgressPercentage = Math.min(
      100,
      Math.round((executedSessionsCount / totalPlannedSessions) * 100)
    );

    return {
      section,
      curricularUnit,
      professor,
      sede,
      sessions: sectionSessions,
      students: studentsInMatrix,
      overallAttendancePercentage,
      totalPlannedSessions,
      executedSessionsCount,
      curricularProgressPercentage,
    };
  };

  const getSectionGradeStatus = (sectionId: string): SectionGradeStatus => {
    const enrolledStudents = getStudentsForSection(sectionId);
    const sectionEvalPlans = evaluationPlans.filter(e => e.sectionId === sectionId);

    const totalStudents = enrolledStudents.length;
    const totalRequiredGrades = totalStudents * sectionEvalPlans.length;

    let loadedGradesCount = 0;
    const cortesSummary = sectionEvalPlans.map(item => {
      const loadedForThis = grades.filter(
        g => g.evaluationPlanItemId === item.id && enrolledStudents.some(s => s.id === g.studentId)
      ).length;
      loadedGradesCount += loadedForThis;

      return {
        id: item.id,
        corteNumber: item.corteNumber,
        title: item.title,
        weightPercentage: item.weightPercentage,
        loadedCount: loadedForThis,
        totalCount: totalStudents,
        isPublished: item.isPublished,
      };
    });

    const percentageLoaded =
      totalRequiredGrades > 0 ? Math.round((loadedGradesCount / totalRequiredGrades) * 100) : 0;

    const section = sections.find(s => s.id === sectionId);
    let statusLabel: SectionGradeStatus['statusLabel'] = 'Sin Iniciar';

    if (section?.actaStatus === 'Cerrada_CARSCE' || section?.actaStatus === 'Validada_PNF') {
      statusLabel = 'Acta Cerrada';
    } else if (percentageLoaded === 100) {
      statusLabel = 'Completado';
    } else if (percentageLoaded > 0) {
      statusLabel = 'En Proceso';
    }

    return {
      totalRequiredGrades,
      loadedGradesCount,
      percentageLoaded,
      statusLabel,
      cortesSummary,
    };
  };

  // Evaluation Engine Rules: Academic Record and Advance Eligibility
  const getAcademicRecordForStudent = (studentId: string) => {
    const records = academicRecords;
    const approvedRecords = records.filter(r => r.status === 'Aprobado');
    const totalApprovedUnits = approvedRecords.length;

    const sumScores = approvedRecords.reduce((acc, r) => acc + r.finalScore, 0);
    const cumulativeGpa =
      totalApprovedUnits > 0 ? Math.round((sumScores / totalApprovedUnits) * 10) / 10 : 0;

    // Project Sociointegrador approval check
    const projectRecord = records.find(r => r.isProject);
    const minProject = evaluationEngine.minPassingGradeProject || 16;
    const projectApproved = projectRecord
      ? projectRecord.finalScore >= minProject
      : false;

    // Failed regular units count
    const failedUnits = records.filter(r => !r.isProject && r.status === 'Reprobado').length;
    const maxFailedAllowed = evaluationEngine.maxFailedUnitsAllowedToAdvance || 1;

    let canAdvanceToNextTrayecto = true;
    let advanceMessage = 'Cumple satisfactoriamente con los requisitos para avanzar al siguiente Trayecto.';

    if (evaluationEngine.requireProjectToAdvanceTrayecto && !projectApproved) {
      canAdvanceToNextTrayecto = false;
      advanceMessage = `Prelación activa: Es requisito indispensable e inexcusable haber aprobado el Proyecto Sociointegrador (PSI) con un mínimo de ${minProject}/20 pts.`;
    } else if (failedUnits > maxFailedAllowed) {
      canAdvanceToNextTrayecto = false;
      advanceMessage = `Límite de arrastre superado: Tiene ${failedUnits} unidades reprobadas (máximo permitido: ${maxFailedAllowed}).`;
    }

    return {
      records,
      cumulativeGpa,
      totalApprovedUnits,
      projectApproved,
      canAdvanceToNextTrayecto,
      advanceMessage,
    };
  };

  return (
    <AcademicContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserById,
        users,
        pnfs,
        sedes,
        periods,
        currentPeriod,
        setCurrentPeriodId,
        curricularUnits,
        sections,
        classSessions,
        attendanceRecords,
        evaluationPlans,
        grades,
        observations,
        academicRecords,
        enrollments,
        preRegistrations,
        notifications,
        evaluationEngine,
        driveStorage,
        perRecoveries,
        addSessionWithAttendance,
        updateAttendanceStatus,
        saveGrade,
        addEvaluationItem,
        toggleEvaluationPublish,
        updateSectionActaStatus,
        addStudentObservation,
        deleteStudentObservation,
        submitPreRegistration,
        reviewPreRegistration,
        formalizeEnrollment,
        addCurricularUnit,
        updateCurricularUnit,
        addSection,
        addPnf,
        updatePnfSettings,
        addSede,
        updateSede,
        updateUser,
        addUser,
        assignCarsceCoordinatorToSede,
        assignPnfCoordinatorToSede,
        addNewAcademicPeriod,
        updateAcademicPeriod,
        closeRegularPeriodNotes,
        applyForPerRecovery,
        gradePerRecovery,
        updateEvaluationEngine,
        updateDriveStorage,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        resetAllData,
        getAttendanceMatrixForSection,
        getSectionGradeStatus,
        getStudentsForSection,
        getAcademicRecordForStudent,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = () => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
};
