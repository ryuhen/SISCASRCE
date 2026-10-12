import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PnfBadge } from '../common/PnfBadge';
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Award,
  FileText,
  Printer,
  QrCode,
  MapPin,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const StudentPortalView: React.FC = () => {
  const {
    currentUser,
    enrollments,
    sections,
    curricularUnits,
    pnfs,
    sedes,
    currentPeriod,
    classSessions,
    attendanceRecords,
    evaluationPlans,
    grades,
    users,
    getAcademicRecordForStudent,
    perRecoveries,
    applyForPerRecovery,
  } = useAcademic();

  const [activeTab, setActiveTab] = useState<'current_courses' | 'academic_record' | 'schedule' | 'per_recovery'>('current_courses');
  const [showConstanciaModal, setShowConstanciaModal] = useState(false);

  const studentId =
    currentUser.role === 'estudiante' ? currentUser.id : 'usr-est-valeria';
  const studentUser = users.find(u => u.id === studentId) || currentUser;

  const studentEnrollments = enrollments.filter(e => e.studentId === studentId);
  const enrolledSectionIds = studentEnrollments.map(e => e.sectionId);
  const enrolledSections = sections.filter(s => enrolledSectionIds.includes(s.id));

  const currentPnf = pnfs.find(p => p.id === studentUser.pnfId) || pnfs[0];
  const studentSede = sedes.find(s => s.id === studentUser.sedeId);

  // Student PER Recoveries
  const myPerRecoveries = perRecoveries.filter(r => r.studentId === studentId);

  // Evaluation engine advance analysis
  const recordAnalysis = getAcademicRecordForStudent(studentId);

  // Compute attendance and grades per curricular unit for current period
  const studentCourseData = enrolledSections.map(section => {
    const uc = curricularUnits.find(u => u.id === section.curricularUnitId);
    const professor = users.find(u => u.id === section.professorId);
    const sede = sedes.find(s => s.id === section.sedeId);

    const sectionSessions = classSessions
      .filter(s => s.sectionId === section.id)
      .sort((a, b) => a.sessionNumber - b.sessionNumber);

    let presents = 0;
    let absences = 0;
    let justified = 0;
    let tardies = 0;

    sectionSessions.forEach(session => {
      const record = attendanceRecords.find(
        ar => ar.sessionId === session.id && ar.studentId === studentId
      );
      if (record) {
        if (record.status === 'P') presents++;
        else if (record.status === 'A') absences++;
        else if (record.status === 'J') justified++;
        else if (record.status === 'R') tardies++;
      }
    });

    const totalSessionsRecorded = sectionSessions.length;
    const effectiveAttended = presents + justified + tardies;
    const attendancePct =
      totalSessionsRecorded > 0
        ? Math.round((effectiveAttended / totalSessionsRecorded) * 100)
        : 100;
    const absencePct =
      totalSessionsRecorded > 0
        ? Math.round((absences / totalSessionsRecorded) * 100)
        : 0;

    const isAtRisk = absencePct >= 15 && absencePct < 25 && totalSessionsRecorded >= 4;
    const isFailedAttendance = absencePct >= 25 && totalSessionsRecorded >= 4;

    const evalItems = evaluationPlans
      .filter(e => e.sectionId === section.id)
      .sort((a, b) => a.corteNumber - b.corteNumber);

    let weightedSum = 0;
    let weightAssessed = 0;

    const cuts = evalItems.map(item => {
      const grade = grades.find(
        g => g.evaluationPlanItemId === item.id && g.studentId === studentId
      );

      if (grade !== undefined && item.isPublished) {
        weightedSum += grade.score * (item.weightPercentage / 100);
        weightAssessed += item.weightPercentage;
      }

      return {
        ...item,
        gradeRecord: item.isPublished ? grade : undefined,
      };
    });

    const currentDefinitive =
      weightAssessed > 0 ? Math.round(weightedSum * 10) / 10 : undefined;

    return {
      section,
      uc,
      professor,
      sede,
      totalSessionsRecorded,
      presents,
      absences,
      justified,
      attendancePct,
      absencePct,
      isAtRisk,
      isFailedAttendance,
      cuts,
      currentDefinitive,
      weightAssessed,
    };
  });

  return (
    <div className="space-y-6">
      {/* Student Profile Card (Clean Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={studentUser.avatar}
              alt={studentUser.name}
              className="w-16 h-16 rounded-xl object-cover ring-2 ring-blue-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <PnfBadge pnf={currentPnf} size="sm" />
                {studentSede && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                    {studentSede.name}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {studentUser.name}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Cédula: <strong className="text-slate-900 font-mono">{studentUser.cedula}</strong> • Correo:{' '}
                <span className="text-slate-700">{studentUser.email}</span> • Periodo:{' '}
                <strong className="text-blue-700">{currentPeriod.code}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowConstanciaModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <FileText className="w-4 h-4" />
              <span>Constancia de Estudio Digital</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold mt-5 w-fit">
          <button
            onClick={() => setActiveTab('current_courses')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'current_courses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Materias en Curso (Periodo {currentPeriod.code})
          </button>
          <button
            onClick={() => setActiveTab('academic_record')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'academic_record'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Récord Académico Histórico</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Mi Horario Semanal</span>
          </button>
          <button
            onClick={() => setActiveTab('per_recovery')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'per_recovery'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-800 hover:text-amber-950 bg-amber-50/70 border border-amber-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Oportunidad PER ({myPerRecoveries.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'current_courses' && (
        /* CURRENT COURSES VIEW */
        <div className="space-y-4">
          {studentCourseData.map(course => {
            if (!course.uc) return null;

            return (
              <div
                key={course.section.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-700 px-2 py-0.5 bg-blue-50 rounded border border-blue-200">
                        {course.uc.code}
                      </span>
                      <span className="text-xs text-slate-500">
                        Sección: <strong className="text-slate-800">{course.section.code}</strong>
                      </span>
                      <span className="text-xs text-slate-500">
                        • Docente: <strong className="text-slate-800">{course.professor?.name}</strong>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {course.uc.name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Definitiva Acumulada
                    </span>
                    <span className="text-xl font-black font-mono">
                      {course.currentDefinitive !== undefined ? (
                        <span className={course.currentDefinitive >= 12 ? 'text-emerald-700' : 'text-rose-700'}>
                          {course.currentDefinitive} / 20 Pts
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Sin cortes publicados</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Attendance Bar */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-800">
                      Asistencia Registrada:
                    </span>
                    <span className="text-slate-600">
                      {course.presents} Asistencias • {course.absences} Faltas • {course.justified} Justificadas
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Porcentaje:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                        course.attendancePct >= 75
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {course.attendancePct}%
                    </span>
                  </div>
                </div>

                {/* Cuts (Max 25%) */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {course.cuts.map(cut => {
                    const score = cut.gradeRecord?.score;
                    return (
                      <div
                        key={cut.id}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">
                            Corte {cut.corteNumber} ({cut.weightPercentage}%)
                          </span>
                          {cut.isPublished ? (
                            <span className="text-[10px] text-emerald-700 font-bold">✓ Publicada</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">En revisión</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {cut.title}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-baseline">
                          <span className="text-[11px] text-slate-500">Nota:</span>
                          <span className="font-mono font-bold text-sm">
                            {score !== undefined ? (
                              <span className={score >= 12 ? 'text-emerald-700' : 'text-rose-700'}>
                                {score} / 20
                              </span>
                            ) : (
                              <span className="text-slate-400">--</span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'academic_record' && (
        /* HISTORICAL ACADEMIC RECORD & MOTOR DE EVALUACIÓN STATUS */
        <div className="space-y-5">
          {/* Motor de Evaluación: Condiciones de Avance */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Auditoría del Motor de Evaluación de CARSCE (Condición de Prosecución)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Índice Académico Acumulado:</span>
                <strong className="text-xl font-black text-slate-900">
                  {recordAnalysis.cumulativeGpa} / 20 Pts
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Unidades Aprobadas:</span>
                <strong className="text-xl font-black text-emerald-700">
                  {recordAnalysis.totalApprovedUnits} materias
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Proyecto Sociointegrador (PSI):</span>
                <strong className="text-sm font-bold text-blue-700 block mt-1">
                  En Desarrollo (Trayecto I)
                </strong>
              </div>
            </div>

            <div className={`p-3.5 rounded-lg border text-xs flex items-center gap-2.5 ${
              recordAnalysis.canAdvanceToNextTrayecto
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              <CheckCircle className="w-4 h-4 shrink-0" />
              <div>
                <strong>Estatus de Avance al Siguiente Trayecto:</strong> {recordAnalysis.advanceMessage}
              </div>
            </div>
          </div>

          {/* Historical Transcripts Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="font-bold text-xs text-slate-800">
                  Historial de Unidades Curriculares Cursadas y Aprobadas
                </span>
                <p className="text-[11px] text-slate-500">
                  Incluye periodos regulares, Intensivos y unidades aprobadas por el <strong>PER (Plan Especial de Recuperación)</strong>.
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-bold w-fit">
                Oportunidad PER activa tras cierre de actas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-3 px-4">Periodo</th>
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-4">Unidad Curricular</th>
                    <th className="py-3 px-3 text-center">Trayecto/Tramo</th>
                    <th className="py-3 px-3 text-center">Nota (0-20)</th>
                    <th className="py-3 px-3 text-center">Nota en Letras</th>
                    <th className="py-3 px-3 text-center">Modo de Aprobación</th>
                    <th className="py-3 px-3 text-center">Estatus</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recordAnalysis.records.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-600">{rec.periodCode}</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{rec.curricularUnitCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{rec.curricularUnitName}</td>
                      <td className="py-3 px-3 text-center">Trayecto {rec.trayecto}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700 font-mono text-sm">
                        {rec.finalScore}
                      </td>
                      <td className="py-3 px-3 text-center text-[10px] uppercase font-bold text-slate-500">
                        {rec.letterGrade}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {rec.approvalMode === 'PER' ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                            Recuperada por PER
                          </span>
                        ) : rec.approvalMode === 'Intensivo' ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold text-[10px] border border-purple-300">
                            Intensivo
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                            Pregrado Regular
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        /* STUDENT SCHEDULE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Mi Cronograma Semanal de Clases</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {studentCourseData.map(c => {
              if (!c.uc) return null;
              return (
                <div
                  key={c.section.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                        {c.section.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{c.uc.name}</h4>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-1">
                    {c.section.schedules.map((sch, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-700">
                        <strong className="text-blue-700">{sch.day}:</strong>
                        <span>{sch.startTime} - {sch.endTime}</span>
                        <span className="text-slate-400">•</span>
                        <span className="flex items-center gap-1 text-emerald-700 font-medium">
                          <MapPin className="w-3 h-3" />
                          {sch.classroom}
                        </span>
                      </div>
                    ))}
                    <div className="text-[11px] text-slate-500 mt-1">
                      Docente: <strong>{c.professor?.name}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'per_recovery' && (
        /* PER (PLAN ESPECIAL DE RECUPERACIÓN) VIEW */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-600 text-white rounded-lg shadow-xs">
                    <Award className="w-5 h-5" />
                  </span>
                  <h2 className="text-base font-black text-slate-900">
                    Plan Especial de Recuperación (PER) • Oportunidad de Prosecución Académica
                  </h2>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  El <strong>PER</strong> es una convocatoria extraordinaria activada por Control de Estudio (SisCasrce) según la época del año y tras la culminación de la carga de notas del período regular. 
                  Te brinda la oportunidad formal de recuperar unidades curriculares reprobadas para evitar el arrastre y avanzar con normalidad hacia el siguiente trayecto.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-amber-900 block">
                  Período Vigente:
                </span>
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-amber-200/80 text-amber-950 border border-amber-300">
                  {currentPeriod.code} • {currentPeriod.type.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Recovery Applications & Candidates */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Mis Unidades en el Plan Especial de Recuperación (PER)
                </h3>
                <p className="text-xs text-slate-500">
                  Postulaciones, estatus de evaluación y convalidaciones automáticas al Récord Académico.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {myPerRecoveries.length} Asignatura(s) Registrada(s)
              </span>
            </div>

            {myPerRecoveries.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Sin Asignaturas Reprobadas Pendientes
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    No posees unidades curriculares reprobadas registradas en el PER. Si durante el cierre de notas del período actual obtienes una calificación menor a 12 pts, podrás postularte formalmente aquí.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myPerRecoveries.map(rec => {
                  const uc = curricularUnits.find(u => u.id === rec.curricularUnitId);
                  const isApproved = rec.recoveryStatus === 'Evaluado_Aprobado';
                  const isGraded = rec.recoveryScore !== undefined;

                  return (
                    <div
                      key={rec.id}
                      className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-blue-100 text-blue-900 border border-blue-200">
                            {uc?.code || 'UC-REC'}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">
                            {uc?.name || 'Unidad Curricular en Recuperación'}
                          </h4>
                        </div>

                        <div>
                          {isApproved ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Aprobada por PER ({rec.recoveryScore}/20 pts)</span>
                            </span>
                          ) : isGraded ? (
                            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-900 font-bold text-xs border border-rose-300">
                              No Aprobada en PER ({rec.recoveryScore}/20 pts)
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                              Postulación Activa • En Espera de Evaluación
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[11px]">Período de Origen:</span>
                          <strong className="text-slate-800 font-mono">{rec.originalPeriodCode}</strong>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[11px]">Nota Regular Previa:</span>
                          <strong className="text-rose-600 font-mono text-sm">{rec.originalScore} / 20 pts</strong>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block text-[11px]">Nota Definitiva PER:</span>
                          <strong className="text-emerald-700 font-mono text-sm">
                            {rec.recoveryScore !== undefined ? `${rec.recoveryScore} / 20 pts` : 'Por Evaluar'}
                          </strong>
                        </div>
                      </div>

                      {rec.teacherObservation && (
                        <div className="text-xs bg-white p-3 rounded-lg border border-slate-200 text-slate-700">
                          <strong className="text-slate-900 block mb-0.5">Observación para Consejo Docente:</strong>
                          <p className="italic">{rec.teacherObservation}</p>
                          {rec.evaluatorName && (
                            <span className="text-[11px] text-slate-400 mt-1 block">
                              Evaluador: <strong>{rec.evaluatorName}</strong>
                            </span>
                          )}
                        </div>
                      )}

                      {isApproved && (
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>
                            <strong>Récord Actualizado:</strong> Esta unidad curricular ya está acreditada en tu historial académico con mención aprobatoria de PER.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Constancia de Estudio */}
      {showConstanciaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-xl max-w-2xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh] relative border border-slate-200">
            <button
              onClick={() => setShowConstanciaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 font-bold text-lg"
            >
              ✕
            </button>

            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <div className="text-[11px] uppercase tracking-wider text-slate-600 font-serif">
                República Bolivariana de Venezuela
                <br />
                Ministerio del Poder Popular para la Educación Universitaria
                <br />
                Dirección de Admisión, Registro y Control de Estudio (CARSCE)
              </div>
              <h2 className="text-lg font-bold uppercase mt-3 tracking-wide">
                Constancia de Estudio Oficial
              </h2>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                Folio Electrónico: CARSCE-{currentPeriod.code}-{Math.floor(100000 + Math.random() * 900000)}
              </div>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-justify text-slate-800 font-serif">
              <p>
                Quien suscribe, la Dirección Central de Control de Estudio (CARSCE), hace constar por medio de la presente que el (la) ciudadano(a):
              </p>

              <div className="bg-slate-50 p-4 rounded border border-slate-300 my-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <strong>Estudiante:</strong> {studentUser.name}
                  </div>
                  <div>
                    <strong>Cédula:</strong> {studentUser.cedula}
                  </div>
                  <div>
                    <strong>Programa:</strong> {currentPnf.name}
                  </div>
                  <div>
                    <strong>Sede:</strong> {studentSede?.name || 'Sede Central'}
                  </div>
                  <div>
                    <strong>Periodo Lectivo:</strong> {currentPeriod.name}
                  </div>
                  <div>
                    <strong>Condición:</strong> Alumno Regular Activo
                  </div>
                </div>
              </div>

              <p>
                Cursa satisfactoriamente las unidades curriculares correspondientes a su malla de formación profesional. Constancia que se expide para los fines legales pertinentes.
              </p>

              <div className="pt-8 flex items-center justify-between text-center">
                <div className="w-44 border-t border-slate-800 pt-1 text-[10px]">
                  <strong>Lic. Carmen Lucena</strong>
                  <br />
                  Coordinadora Central CARSCE
                </div>

                <div className="flex flex-col items-center">
                  <QrCode className="w-12 h-12 text-slate-800" />
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">Validación QR</span>
                </div>

                <div className="w-44 border-t border-slate-800 pt-1 text-[10px]">
                  <strong>Sello Oficial Húmedo</strong>
                  <br />
                  Control de Estudio
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Constancia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
