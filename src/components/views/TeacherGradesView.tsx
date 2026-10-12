import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { ObservationCategory } from '../../types/academic';
import { PnfBadge } from '../common/PnfBadge';
import {
  FileSpreadsheet,
  Plus,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Award,
  MessageSquare,
  Users,
  Trash2,
  HelpCircle,
} from 'lucide-react';

export const TeacherGradesView: React.FC = () => {
  const {
    currentUser,
    sections,
    curricularUnits,
    evaluationPlans,
    grades,
    observations,
    saveGrade,
    addEvaluationItem,
    toggleEvaluationPublish,
    updateSectionActaStatus,
    addStudentObservation,
    deleteStudentObservation,
    getStudentsForSection,
    getSectionGradeStatus,
    pnfs,
    evaluationEngine,
    perRecoveries,
    gradePerRecovery,
    currentPeriod,
    users,
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

  const [activeSubView, setActiveSubView] = useState<'grades' | 'observations' | 'per_recoveries'>('grades');

  // Local PER grade state map
  const [perScores, setPerScores] = useState<Record<string, number>>({});
  const [perObs, setPerObs] = useState<Record<string, string>>({});

  // Evaluation cut form state (max 25%)
  const [showAddEvalModal, setShowAddEvalModal] = useState(false);
  const [newEvalTitle, setNewEvalTitle] = useState('');
  const [newEvalWeight, setNewEvalWeight] = useState(25); // Max 25%
  const [newEvalInstrument, setNewEvalInstrument] = useState('Prueba Teórico-Práctica');
  const [newEvalDueDate, setNewEvalDueDate] = useState('');
  const [newEvalCorte, setNewEvalCorte] = useState(1);

  // Council Observation form state
  const [showAddObsModal, setShowAddObsModal] = useState(false);
  const [selectedStudentForObs, setSelectedStudentForObs] = useState<string>('');
  const [obsCategory, setObsCategory] = useState<ObservationCategory>('Desempeño Académico');
  const [obsNote, setObsNote] = useState('');
  const [obsRecommendation, setObsRecommendation] = useState('');

  const currentSection = sections.find(s => s.id === selectedSectionId);
  const currentUC = curricularUnits.find(u => u.id === currentSection?.curricularUnitId);
  const currentPNF = pnfs.find(p => p.id === currentSection?.pnfId);
  const students = getStudentsForSection(selectedSectionId);
  const sectionEvalPlans = evaluationPlans
    .filter(e => e.sectionId === selectedSectionId)
    .sort((a, b) => a.corteNumber - b.corteNumber);

  const gradeStatus = getSectionGradeStatus(selectedSectionId);
  const totalWeight = sectionEvalPlans.reduce((sum, item) => sum + item.weightPercentage, 0);

  const handleGradeChange = (
    evalItemId: string,
    studentId: string,
    rawVal: string
  ) => {
    if (rawVal === '') return;
    const num = parseFloat(rawVal);
    if (isNaN(num)) return;
    const clamped = Math.min(20, Math.max(0, num));
    saveGrade(evalItemId, selectedSectionId, studentId, clamped);
  };

  const handleCreateEvalItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvalTitle.trim()) return;

    if (newEvalWeight > 25) {
      alert('Regla institucional: El porcentaje máximo permitido por corte es 25%.');
      return;
    }

    const ok = addEvaluationItem({
      sectionId: selectedSectionId,
      corteNumber: Number(newEvalCorte),
      title: newEvalTitle,
      weightPercentage: Number(newEvalWeight),
      maxScore: 20,
      instrument: newEvalInstrument,
      dueDate: newEvalDueDate || new Date().toISOString().split('T')[0],
      isPublished: false,
    });

    if (ok) {
      setShowAddEvalModal(false);
      setNewEvalTitle('');
    }
  };

  const handleCreateObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForObs || !obsNote.trim()) {
      alert('Por favor seleccione un estudiante e ingrese la observación.');
      return;
    }

    addStudentObservation({
      studentId: selectedStudentForObs,
      sectionId: selectedSectionId,
      date: new Date().toISOString().split('T')[0],
      category: obsCategory,
      note: obsNote,
      recommendationCouncil: obsRecommendation || 'Someter a deliberación en Consejo Docente',
    });

    setShowAddObsModal(false);
    setObsNote('');
    setObsRecommendation('');
  };

  const sectionObservations = observations.filter(o => o.sectionId === selectedSectionId);

  if (!currentSection || !currentUC) {
    return <div className="p-8 text-slate-500 text-center bg-white rounded-xl border border-slate-200">Sección no encontrada.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header (Clean Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <PnfBadge pnf={currentPNF} size="sm" />
              <span className="text-xs text-slate-500">
                Trayecto {currentSection.trayecto} - Tramo {currentSection.tramo}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Carga de Calificaciones & Bitácora de Consejo Docente
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              UC: <strong className="text-slate-900">{currentUC.name}</strong> ({currentUC.code}) • Sección: <strong className="text-slate-900">{currentSection.code}</strong> • Máx por corte:{' '}
              <strong className="text-blue-700">25% (4 cortes = 100%)</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <label htmlFor="eval-section-select" className="text-xs font-semibold text-slate-600">Sección:</label>
              <select
                id="eval-section-select"
                aria-label="Seleccionar Sección para Evaluación"
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

            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs flex-wrap gap-1">
              <button
                onClick={() => setActiveSubView('grades')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  activeSubView === 'grades'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Calificaciones (Cortes)
              </button>
              <button
                onClick={() => setActiveSubView('observations')}
                className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 ${
                  activeSubView === 'observations'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Consejo Docente ({sectionObservations.length})</span>
              </button>
              <button
                onClick={() => setActiveSubView('per_recoveries')}
                className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 ${
                  activeSubView === 'per_recoveries'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-800 hover:text-amber-950 bg-amber-50/80 border border-amber-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Carga PER ({perRecoveries.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Status Counter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Carga en Tiempo Real</span>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {gradeStatus.statusLabel} ({gradeStatus.percentageLoaded}%)
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border-4 border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700 bg-white">
              {gradeStatus.percentageLoaded}%
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Ponderación Planificada</span>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {totalWeight}% de 100%{' '}
                {totalWeight === 100 ? (
                  <span className="text-emerald-700 text-xs font-bold">✓ Completa (4 Cortes de 25%)</span>
                ) : (
                  <span className="text-amber-700 text-xs font-bold">⚠️ Falta {100 - totalWeight}%</span>
                )}
              </div>
            </div>
            <Award className="w-6 h-6 text-amber-500" />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Estatus del Acta</span>
              <div className="text-lg font-black text-blue-700 mt-0.5">
                {currentSection.actaStatus.replace('_', ' ')}
              </div>
            </div>
            {currentSection.actaStatus === 'Borrador' ? (
              <button
                onClick={() => updateSectionActaStatus(selectedSectionId, 'En_Revision')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Cerrar Acta
              </button>
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            )}
          </div>
        </div>
      </div>

      {activeSubView === 'grades' ? (
        <>
          {/* Action Bar for Evaluations */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Cortes de Evaluación Planificados (Máximo 25% por corte)</span>
            </h2>
            <button
              onClick={() => setShowAddEvalModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Corte (≤ 25%)</span>
            </button>
          </div>

          {/* Cuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {sectionEvalPlans.map(item => {
              const loadedInThis = grades.filter(
                g => g.evaluationPlanItemId === item.id && students.some(s => s.id === g.studentId)
              ).length;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Corte {item.corteNumber} • {item.weightPercentage}%
                      </span>
                      <button
                        onClick={() => toggleEvaluationPublish(item.id)}
                        className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded transition ${
                          item.isPublished
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.isPublished ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Publicado</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-400" />
                            <span>Borrador</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {item.instrument}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Vence: {item.dueDate}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Notas: <strong>{loadedInThis}</strong> / {students.length}
                    </span>
                    <span className="font-bold text-blue-700 text-xs">
                      {Math.round((loadedInThis / (students.length || 1)) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Gradebook Grid (Light) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Libro de Calificaciones Oficial (Escala 00 a 20)
              </span>
              <span className="text-[11px] text-slate-500">
                Mínimo Aprobatorio: <strong className="text-emerald-700">{evaluationEngine.minPassingGradeRegular} Ptos</strong> (16 Ptos para Proyecto)
              </span>
            </div>

            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-3 px-3 w-8 text-center text-slate-500">#</th>
                    <th className="py-3 px-4 min-w-[200px]">Estudiante / Cédula</th>
                    {sectionEvalPlans.map(evalItem => (
                      <th
                        key={evalItem.id}
                        className="py-3 px-3 text-center min-w-[110px] border-l border-slate-200"
                      >
                        <div>Corte {evalItem.corteNumber}</div>
                        <div className="text-[10px] text-blue-700 font-normal">
                          ({evalItem.weightPercentage}%)
                        </div>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center min-w-[100px] border-l border-slate-200 font-bold text-slate-900 bg-slate-100">
                      Definitiva
                    </th>
                    <th className="py-3 px-4 text-center min-w-[110px] font-bold text-slate-800 bg-slate-100">
                      Condición
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {students.map((st, idx) => {
                    let totalWeightedScore = 0;
                    let totalWeightCounted = 0;

                    sectionEvalPlans.forEach(evalItem => {
                      const gr = grades.find(
                        g => g.evaluationPlanItemId === evalItem.id && g.studentId === st.id
                      );
                      if (gr !== undefined) {
                        totalWeightedScore += gr.score * (evalItem.weightPercentage / 100);
                        totalWeightCounted += evalItem.weightPercentage;
                      }
                    });

                    const definitive = Math.round(totalWeightedScore * 10) / 10;
                    const minPassing = currentUC.isProject
                      ? evaluationEngine.minPassingGradeProject
                      : evaluationEngine.minPassingGradeRegular;
                    const isPassing = definitive >= minPassing;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={st.avatar}
                              alt={st.name}
                              className="w-7 h-7 rounded-md object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{st.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{st.cedula}</div>
                            </div>
                          </div>
                        </td>

                        {sectionEvalPlans.map(evalItem => {
                          const gr = grades.find(
                            g => g.evaluationPlanItemId === evalItem.id && g.studentId === st.id
                          );
                          const scoreVal = gr?.score ?? '';

                          return (
                            <td
                              key={evalItem.id}
                              className="py-2.5 px-3 text-center border-l border-slate-100"
                            >
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                placeholder="--"
                                value={scoreVal}
                                onChange={e =>
                                  handleGradeChange(evalItem.id, st.id, e.target.value)
                                }
                                className={`w-14 text-center font-bold text-xs py-1.5 px-1 rounded-md border transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  scoreVal !== ''
                                    ? Number(scoreVal) >= minPassing
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : 'bg-rose-50 text-rose-800 border-rose-300'
                                    : 'bg-slate-50 text-slate-400 border-slate-200'
                                }`}
                              />
                            </td>
                          );
                        })}

                        <td className="py-3 px-4 text-center border-l border-slate-200 font-mono font-bold text-sm bg-slate-50">
                          <span
                            className={`inline-block px-2 py-0.5 rounded ${
                              isPassing
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {definitive.toFixed(1)} / 20
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center bg-slate-50">
                          {isPassing ? (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              APROBADO
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                              REPROBADO
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeSubView === 'observations' ? (
        /* BITÁCORA DE OBSERVACIONES PARA CONSEJO DOCENTE */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Bitácora de Observaciones de Desempeño para Discusión en Consejo Docente</span>
              </h2>
              <p className="text-xs text-slate-500">
                Registre incidencias pedagógicas, méritos extraordinarios o situaciones socioeconómicas para someter a deliberación de la comisión.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedStudentForObs(students[0]?.id || '');
                setShowAddObsModal(true);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Observación de Alumno</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionObservations.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                No hay observaciones asentadas para esta sección. Haga clic en "Añadir Observación" para registrar una nota de desempeño.
              </div>
            ) : (
              sectionObservations.map(obs => {
                const student = students.find(s => s.id === obs.studentId);
                return (
                  <div
                    key={obs.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={student?.avatar}
                          alt={student?.name}
                          className="w-8 h-8 rounded-md object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">
                            {student?.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {student?.cedula}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {obs.category}
                        </span>
                        <button
                          onClick={() => deleteStudentObservation(obs.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Eliminar observación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                      <strong>Observación:</strong> {obs.note}
                    </div>

                    <div className="text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
                      <strong>Propuesta a Consejo:</strong> {obs.recommendationCouncil}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>Docente: <strong>{obs.authorName}</strong></span>
                      <span>{obs.date}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* PANEL DE CARGA DE CALIFICACIONES PER (PLAN ESPECIAL DE RECUPERACIÓN) */
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-600 text-white rounded-lg shadow-xs">
                    <Award className="w-5 h-5" />
                  </span>
                  <h2 className="text-base font-black text-slate-900">
                    Plan Especial de Recuperación (PER) • Calificaciones Extraordinarias
                  </h2>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  El <strong>PER</strong> es la oportunidad académica formal de recuperación para estudiantes que no alcanzaron la nota mínima en el régimen ordinario (mínimo 12/20 pts en regulares o 16/20 pts en proyecto). 
                  Al asentar la nota recuperatoria y la observación para el Consejo Docente, la unidad curricular queda convalidada en el récord académico del estudiante con mención especial.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-amber-900 block">
                  Período Activo:
                </span>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 border border-amber-300">
                  {currentPeriod.code}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800">
                  Estudiantes Asignados a Recuperación por PER
                </span>
                <p className="text-[11px] text-slate-500">
                  Total de alumnos en proceso de evaluación recuperatoria: <strong>{perRecoveries.length}</strong>
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                Oportunidad Extraordinaria PER
              </span>
            </div>

            <div className="p-4 space-y-4">
              {perRecoveries.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No hay postulaciones registradas en el PER actualmente. Los estudiantes pueden postularse desde su portal al culminar la carga de notas regulares.
                </div>
              ) : (
                perRecoveries.map(rec => {
                  const student = users.find(u => u.id === rec.studentId);
                  const uc = curricularUnits.find(u => u.id === rec.curricularUnitId);
                  const isAlreadyGraded = rec.recoveryScore !== undefined;
                  const currentScoreInput = perScores[rec.id] !== undefined ? perScores[rec.id] : (rec.recoveryScore ?? 14);
                  const currentObsInput = perObs[rec.id] !== undefined ? perObs[rec.id] : (rec.teacherObservation || '');

                  return (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={student?.avatar}
                            alt={student?.name}
                            className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">
                                {student?.name}
                              </span>
                              <span className="font-mono text-xs text-slate-500">
                                ({student?.cedula})
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Unidad a Recuperar: <strong className="text-blue-700">{uc?.code} - {uc?.name}</strong> • Origen:{' '}
                              <span className="font-mono text-slate-500">{rec.originalPeriodCode}</span> (Nota previa:{' '}
                              <strong className="text-rose-600 font-mono">{rec.originalScore}/20</strong>)
                            </p>
                          </div>
                        </div>

                        <div>
                          {rec.recoveryStatus === 'Evaluado_Aprobado' ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300">
                              ✓ Aprobado en PER ({rec.recoveryScore}/20)
                            </span>
                          ) : rec.recoveryStatus === 'Evaluado_Reprobado' ? (
                            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-900 font-black text-xs border border-rose-300">
                              ✗ Reprobado en PER ({rec.recoveryScore}/20)
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                              Pendiente de Calificar
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Grade and Observation inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200 text-xs">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            Nota de Evaluación PER (0 a 20 pts) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={currentScoreInput}
                            onChange={e => setPerScores(prev => ({ ...prev, [rec.id]: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-black text-slate-900 text-sm"
                          />
                          <span className="text-[10px] text-slate-500 mt-0.5 block">
                            Mínimo aprobatorio regular: 12 / 20 pts
                          </span>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">
                            Observación Pedagógica para el Consejo Docente *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Estudiante superó exitosamente la prueba práctica de recuperación de Algorítmica."
                            value={currentObsInput}
                            onChange={e => setPerObs(prev => ({ ...prev, [rec.id]: e.target.value }))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            const finalScore = currentScoreInput;
                            const finalObs = currentObsInput || 'Recuperación efectuada en convocatoria oficial de PER.';
                            gradePerRecovery(rec.id, finalScore, finalObs);
                            alert(`Calificación de PER (${finalScore}/20 pts) asentada exitosamente para ${student?.name}. Se ha actualizado el récord académico.`);
                          }}
                          className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{isAlreadyGraded ? 'Actualizar Calificación PER' : 'Asentar Calificación PER'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Añadir Corte (≤ 25%) */}
      {showAddEvalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Nuevo Corte de Evaluación
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Restricción institucional: Máximo <strong className="text-blue-700">25%</strong> por corte.
            </p>

            <form onSubmit={handleCreateEvalItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Número de Corte
                </label>
                <select
                  value={newEvalCorte}
                  onChange={e => setNewEvalCorte(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value={1}>Corte 1</option>
                  <option value={2}>Corte 2</option>
                  <option value={3}>Corte 3</option>
                  <option value={4}>Corte 4</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Título de la Evaluación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Taller Práctico Evaluado Nº 1"
                  value={newEvalTitle}
                  onChange={e => setNewEvalTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Ponderación (Máx 25%) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="25"
                    required
                    value={newEvalWeight}
                    onChange={e => setNewEvalWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Fecha de Entrega *
                  </label>
                  <input
                    type="date"
                    required
                    value={newEvalDueDate}
                    onChange={e => setNewEvalDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Instrumento de Evaluación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Rúbrica en Laboratorio, Prueba Escrita..."
                  value={newEvalInstrument}
                  onChange={e => setNewEvalInstrument(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEvalModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Guardar Corte (25%)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Añadir Observación para Consejo Docente */}
      {showAddObsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>Registrar Observación para Consejo Docente</span>
            </h3>

            <form onSubmit={handleCreateObservation} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Seleccionar Alumno *
                </label>
                <select
                  value={selectedStudentForObs}
                  onChange={e => setSelectedStudentForObs(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                >
                  {students.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.cedula})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Categoría de la Observación *
                </label>
                <select
                  value={obsCategory}
                  onChange={e => setObsCategory(e.target.value as ObservationCategory)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                >
                  <option value="Desempeño Académico">Desempeño Académico</option>
                  <option value="Práctica y Laboratorio">Práctica y Laboratorio</option>
                  <option value="Actitud y Asistencia">Actitud y Asistencia</option>
                  <option value="Socioeconómico y Salud">Socioeconómico y Salud</option>
                  <option value="Mérito y Liderazgo">Mérito y Liderazgo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Descripción Detallada del Desempeño *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalle la conducta, evolución o dificultad evidenciada en clases..."
                  value={obsNote}
                  onChange={e => setObsNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Propuesta / Recomendación a Discutir en Consejo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Postulación a beca, plan de nivelación remedial, felicitación..."
                  value={obsRecommendation}
                  onChange={e => setObsRecommendation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddObsModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Asentar en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
