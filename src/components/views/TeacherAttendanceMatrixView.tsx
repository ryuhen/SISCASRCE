import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { AttendanceStatus } from '../../types/academic';
import { PnfBadge } from '../common/PnfBadge';
import {
  Calendar,
  Check,
  PlusCircle,
  Users,
  Printer,
  TrendingUp,
  AlertTriangle,
  MapPin,
  X,
} from 'lucide-react';

export const TeacherAttendanceMatrixView: React.FC = () => {
  const {
    currentUser,
    sections,
    curricularUnits,
    getAttendanceMatrixForSection,
    addSessionWithAttendance,
    updateAttendanceStatus,
    getStudentsForSection,
    pnfs,
    sedes,
  } = useAcademic();

  const relevantSections = sections.filter(s => {
    if (currentUser.role === 'profesor' || currentUser.role === 'asistente_docente') {
      return s.professorId === currentUser.id || s.assistantId === currentUser.id;
    }
    return true;
  });

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    relevantSections[0]?.id || sections[0]?.id || ''
  );

  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<string | null>(null);

  // New session form state
  const [newSessionDate, setNewSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [newSessionTopic, setNewSessionTopic] = useState('');
  const [newSessionObjective, setNewSessionObjective] = useState('');
  const [newAttendanceList, setNewAttendanceList] = useState<{
    [studentId: string]: { status: AttendanceStatus; justificationReason?: string };
  }>({});

  const matrixData = getAttendanceMatrixForSection(selectedSectionId);
  const currentSection = sections.find(s => s.id === selectedSectionId);
  const currentUC = curricularUnits.find(u => u.id === currentSection?.curricularUnitId);
  const currentPNF = pnfs.find(p => p.id === currentSection?.pnfId);
  const currentSede = sedes.find(s => s.id === currentSection?.sedeId);
  const students = getStudentsForSection(selectedSectionId);

  const handleOpenAddSession = () => {
    const initialMap: { [studentId: string]: { status: AttendanceStatus } } = {};
    students.forEach(st => {
      initialMap[st.id] = { status: 'P' };
    });
    setNewAttendanceList(initialMap);
    setNewSessionTopic('');
    setNewSessionObjective('');
    setShowAddSessionModal(true);
  };

  const handleBulkMarkStatus = (status: AttendanceStatus) => {
    const updated = { ...newAttendanceList };
    students.forEach(st => {
      updated[st.id] = { status };
    });
    setNewAttendanceList(updated);
  };

  const handleSubmitNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTopic.trim()) {
      alert('Por favor ingrese el contenido temático desarrollado en la sesión.');
      return;
    }

    const attendancesPayload = students.map(st => ({
      studentId: st.id,
      status: newAttendanceList[st.id]?.status || 'P',
      justificationReason: newAttendanceList[st.id]?.justificationReason,
    }));

    addSessionWithAttendance(
      {
        sectionId: selectedSectionId,
        date: newSessionDate,
        topic: newSessionTopic,
        objective: newSessionObjective || 'Desarrollo de contenidos según pensum analítico',
      },
      attendancesPayload
    );

    setShowAddSessionModal(false);
  };

  const handleCycleStatus = (sessionId: string, studentId: string, currentStatus?: AttendanceStatus) => {
    let nextStatus: AttendanceStatus = 'P';
    if (currentStatus === 'P') nextStatus = 'A';
    else if (currentStatus === 'A') nextStatus = 'J';
    else if (currentStatus === 'J') nextStatus = 'R';
    else if (currentStatus === 'R') nextStatus = 'P';

    updateAttendanceStatus(sessionId, studentId, nextStatus);
  };

  if (!matrixData || !currentSection || !currentUC) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        No se encontró información para la sección seleccionada.
      </div>
    );
  }

  const criticallyFailedCount = matrixData.students.filter(
    s => s.attendanceSummary.isCriticallyFailed
  ).length;

  const atRiskCount = matrixData.students.filter(
    s => s.attendanceSummary.isAtRisk
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Section Selector (Light theme) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <PnfBadge pnf={currentPNF} size="sm" />
              {currentSede && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {currentSede.name}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Matriz de Asistencia por Sesión de Clase
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Unidad Curricular: <strong className="text-slate-900">{currentUC.name}</strong> ({currentUC.code}) • Sección: <strong className="text-slate-900">{currentSection.code}</strong> • Turno: {currentSection.shift}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <label htmlFor="teacher-section-select" className="text-xs font-semibold text-slate-600">Sección:</label>
              <select
                id="teacher-section-select"
                aria-label="Seleccionar Sección para Asistencia"
                value={selectedSectionId}
                onChange={e => setSelectedSectionId(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500"
              >
                {relevantSections.map(sec => {
                  const uc = curricularUnits.find(u => u.id === sec.curricularUnitId);
                  return (
                    <option key={sec.id} value={sec.id}>
                      {sec.code} - {uc?.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={handleOpenAddSession}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Levantar Asistencia</span>
            </button>

            <button
              onClick={() => window.print()}
              title="Imprimir Planilla Oficial"
              className="p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time KPI summary cards (Light theme) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Sesiones Ejecutadas</span>
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {matrixData.executedSessionsCount}
              </span>
              <span className="text-xs text-slate-500">
                / {matrixData.totalPlannedSessions} planificadas
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${matrixData.curricularProgressPercentage}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-blue-700 font-semibold mt-1 inline-block">
              {matrixData.curricularProgressPercentage}% avance del pensum
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Promedio Asistencia</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">
                {matrixData.overallAttendancePercentage}%
              </span>
              <span className="text-xs text-slate-500">sección</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">
              Mínimo exigido: ≥ 75%
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Alumnos en Alerta</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">
                {atRiskCount}
              </span>
              <span className="text-xs text-slate-500">alumnos (15%-24% faltas)</span>
            </div>
            <span className="text-[10px] text-amber-700 mt-2 block font-medium">
              Alerta preventiva para Consejo
            </span>
          </div>

          <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Reprobación por Faltas</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600">
                {criticallyFailedCount}
              </span>
              <span className="text-xs text-slate-500">alumnos (&gt;25% faltas)</span>
            </div>
            <span className="text-[10px] text-rose-700 mt-2 block font-semibold">
              Art. 42 Reglamento PNF
            </span>
          </div>
        </div>
      </div>

      {/* Conventions & Hints (Light) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800">Convenciones:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
              P
            </span>
            Presente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-300">
              A
            </span>
            Ausente
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] bg-sky-100 text-sky-800 border border-sky-300">
              J
            </span>
            Justificado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
              R
            </span>
            Retardo
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          💡 <em>Haga clic directamente en una casilla para alternar (P ➔ A ➔ J ➔ R)</em>
        </div>
      </div>

      {/* Attendance Matrix Table (Clean Light) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3 w-8 text-center font-bold text-slate-500 sticky left-0 bg-slate-50 z-20">
                  #
                </th>
                <th className="py-3 px-4 min-w-[200px] font-bold sticky left-8 bg-slate-50 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                  Estudiante / Cédula
                </th>

                {matrixData.sessions.map(session => (
                  <th
                    key={session.id}
                    onClick={() => setSelectedSessionForDetails(session.id)}
                    className="py-2.5 px-2 text-center min-w-[56px] cursor-pointer hover:bg-slate-100 transition border-l border-slate-200 group"
                    title={`Sesión #${session.sessionNumber} (${session.date}): ${session.topic}`}
                  >
                    <div className="text-[11px] font-bold text-blue-700 group-hover:text-blue-900">
                      S-{session.sessionNumber}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">
                      {session.date.split('-').slice(1).join('/')}
                    </div>
                  </th>
                ))}

                <th className="py-3 px-2 text-center font-bold text-emerald-700 bg-emerald-50/50 border-l border-slate-200 min-w-[42px]">
                  P
                </th>
                <th className="py-3 px-2 text-center font-bold text-rose-700 bg-rose-50/50 min-w-[42px]">
                  A
                </th>
                <th className="py-3 px-2 text-center font-bold text-sky-700 bg-sky-50/50 min-w-[42px]">
                  J
                </th>
                <th className="py-3 px-3 text-center font-bold text-slate-900 bg-slate-50 min-w-[65px]">
                  % Asist.
                </th>
                <th className="py-3 px-4 text-center font-bold text-slate-900 bg-slate-50 min-w-[120px]">
                  Condición
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {matrixData.students.map((student, idx) => {
                const summary = student.attendanceSummary;

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50 transition ${
                      summary.isCriticallyFailed
                        ? 'bg-rose-50/50'
                        : summary.isAtRisk
                        ? 'bg-amber-50/40'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono sticky left-0 bg-white z-10">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-4 sticky left-8 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-7 h-7 rounded-md object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate max-w-[150px]">
                            {student.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {student.cedula}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Attendance per session */}
                    {matrixData.sessions.map(session => {
                      const record = student.recordsBySessionId[session.id];
                      const status = record?.status;

                      let cellBadgeClass = 'bg-slate-100 text-slate-500 border-slate-200';
                      if (status === 'P') {
                        cellBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
                      } else if (status === 'A') {
                        cellBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200';
                      } else if (status === 'J') {
                        cellBadgeClass = 'bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200';
                      } else if (status === 'R') {
                        cellBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200';
                      }

                      return (
                        <td
                          key={session.id}
                          className="py-2 px-1 text-center border-l border-slate-100"
                        >
                          <button
                            type="button"
                            onClick={() => handleCycleStatus(session.id, student.id, status)}
                            className={`w-7 h-7 mx-auto rounded font-bold text-xs flex items-center justify-center border transition transform active:scale-90 ${cellBadgeClass}`}
                            title={`${student.name}: ${status || 'Sin Registro'}`}
                          >
                            {status || '-'}
                          </button>
                        </td>
                      );
                    })}

                    {/* Summary columns */}
                    <td className="py-2.5 px-2 text-center font-bold text-emerald-700 bg-emerald-50/30 border-l border-slate-200">
                      {summary.presentCount}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-rose-700 bg-rose-50/30">
                      {summary.absentCount}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-sky-700 bg-sky-50/30">
                      {summary.justifiedCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                          summary.attendancePercentage >= 80
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : summary.attendancePercentage >= 75
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {summary.attendancePercentage}%
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      {summary.isCriticallyFailed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          Reprobado (&gt;25% Faltas)
                        </span>
                      ) : summary.isAtRisk ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          Alerta ({summary.absencePercentage}% Faltas)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          Regular
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>
              Total estudiantes inscritos: <strong className="text-slate-800">{students.length}</strong>
            </span>
          </div>
          <div>
            Docente Titular: <strong className="text-slate-800">{matrixData.professor.name}</strong>
          </div>
        </div>
      </div>

      {/* Modal: Registrar Nueva Sesión */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  Levantar Asistencia - Sesión #{matrixData.executedSessionsCount + 1}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentUC.name} • {currentSection.code}
                </p>
              </div>
              <button
                onClick={() => setShowAddSessionModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewSession} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha de la Clase *
                  </label>
                  <input
                    type="date"
                    required
                    value={newSessionDate}
                    onChange={e => setNewSessionDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Marcar Asistencia Rápida
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkMarkStatus('P')}
                      className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 text-xs py-2 px-2 rounded-lg font-bold transition"
                    >
                      Todos Presentes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkMarkStatus('A')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs py-2 px-3 rounded-lg font-semibold transition"
                    >
                      Todos Ausentes
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contenido Temático Desarrollado *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Funciones recursivas, modularidad y memoria..."
                  value={newSessionTopic}
                  onChange={e => setNewSessionTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Objetivo / Observaciones de la Sesión
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Desarrollo práctico en laboratorio de computación..."
                  value={newSessionObjective}
                  onChange={e => setNewSessionObjective(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                ></textarea>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-2.5 bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-between">
                  <span>Listado de Alumnos ({students.length})</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    P: Presente | A: Ausente | J: Justificado | R: Retardo
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {students.map(st => {
                    const currentVal = newAttendanceList[st.id]?.status || 'P';
                    return (
                      <div
                        key={st.id}
                        className="p-2.5 flex items-center justify-between hover:bg-slate-50 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className="w-6 h-6 rounded-md object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900">{st.name}</span>
                            <span className="text-[10px] text-slate-500 ml-2 font-mono">
                              {st.cedula}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {(['P', 'A', 'J', 'R'] as AttendanceStatus[]).map(statusOption => (
                            <button
                              key={statusOption}
                              type="button"
                              onClick={() =>
                                setNewAttendanceList(prev => ({
                                  ...prev,
                                  [st.id]: { ...prev[st.id], status: statusOption },
                                }))
                              }
                              className={`w-7 h-7 rounded text-xs font-bold transition ${
                                currentVal === statusOption
                                  ? statusOption === 'P'
                                    ? 'bg-emerald-600 text-white'
                                    : statusOption === 'A'
                                    ? 'bg-rose-600 text-white'
                                    : statusOption === 'J'
                                    ? 'bg-sky-600 text-white'
                                    : 'bg-amber-600 text-white'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {statusOption}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSessionModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Guardar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
