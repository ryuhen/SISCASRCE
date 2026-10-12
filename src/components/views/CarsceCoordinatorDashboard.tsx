import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PnfBadge } from '../common/PnfBadge';
import {
  Building2,
  Users,
  CheckCircle,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  Layers,
  Award,
  Cpu,
  ShieldCheck,
  MapPin,
  Settings,
  HardDrive,
  Save,
} from 'lucide-react';

interface CarsceCoordinatorDashboardProps {
  onNavigateToPreReg?: () => void;
  onNavigateToReports?: () => void;
}

export const CarsceCoordinatorDashboard: React.FC<CarsceCoordinatorDashboardProps> = ({
  onNavigateToPreReg,
  onNavigateToReports,
}) => {
  const {
    currentUser,
    pnfs,
    sedes,
    curricularUnits,
    sections,
    classSessions,
    enrollments,
    preRegistrations,
    getSectionGradeStatus,
    updateSectionActaStatus,
    evaluationEngine,
    updateEvaluationEngine,
    driveStorage,
    updateDriveStorage,
    periods,
    currentPeriod,
    closeRegularPeriodNotes,
    perRecoveries,
    users,
    updateAcademicPeriod,
  } = useAcademic();

  const isCentralDirector = currentUser.role === 'administrador';
  const [selectedSedeId, setSelectedSedeId] = useState<string>(
    isCentralDirector ? 'all' : (currentUser.sedeId || 'all')
  );

  const activeSedeScopeId = isCentralDirector
    ? (selectedSedeId === 'all' ? null : selectedSedeId)
    : (currentUser.sedeId || null);

  const activeSedeObj = sedes.find(s => s.id === (activeSedeScopeId || currentUser.sedeId));

  // Scoped data by Sede
  const scopedSections = activeSedeScopeId
    ? sections.filter(s => s.sedeId === activeSedeScopeId)
    : sections;

  const scopedPnfs = activeSedeScopeId && activeSedeObj
    ? pnfs.filter(p => activeSedeObj.pnfIdsOffered.includes(p.id))
    : pnfs;

  const scopedPreRegistrations = activeSedeScopeId
    ? preRegistrations.filter(p => p.sedeId === activeSedeScopeId)
    : preRegistrations;

  const scopedEnrollments = activeSedeScopeId
    ? enrollments.filter(e => {
        const sec = sections.find(sc => sc.id === e.sectionId);
        return sec?.sedeId === activeSedeScopeId;
      })
    : enrollments;

  const [activeTab, setActiveTab] = useState<'overview' | 'engine' | 'sedes' | 'per_control'>('overview');

  // Evaluation engine local form state
  const [minRegular, setMinRegular] = useState(evaluationEngine.minPassingGradeRegular);
  const [minProject, setMinProject] = useState(evaluationEngine.minPassingGradeProject);
  const [maxCut, setMaxCut] = useState(evaluationEngine.maxCutWeightPercentage);
  const [reqProject, setReqProject] = useState(evaluationEngine.requireProjectToAdvanceTrayecto);
  const [maxFailed, setMaxFailed] = useState(evaluationEngine.maxFailedUnitsAllowedToAdvance);
  const [minAttendance, setMinAttendance] = useState(evaluationEngine.minAttendanceRequiredPercentage);

  // Drive config local state
  const [driveEmail, setDriveEmail] = useState(driveStorage.institutionalDriveEmail);
  const [driveFolder, setDriveFolder] = useState(driveStorage.driveFolderId);

  const pendingPreRegCount = scopedPreRegistrations.filter(p => p.status === 'Pendiente').length;

  const actasPendingClosure = scopedSections.filter(
    s => s.actaStatus === 'Validada_PNF' || s.actaStatus === 'En_Revision'
  );

  const handleSaveEvaluationRules = (e: React.FormEvent) => {
    e.preventDefault();
    updateEvaluationEngine({
      minPassingGradeRegular: Number(minRegular),
      minPassingGradeProject: Number(minProject),
      maxCutWeightPercentage: Number(maxCut),
      requireProjectToAdvanceTrayecto: Boolean(reqProject),
      maxFailedUnitsAllowedToAdvance: Number(maxFailed),
      minAttendanceRequiredPercentage: Number(minAttendance),
    });
    alert('Reglas del Motor de Evaluación de CARSCE actualizadas correctamente.');
  };

  const handleSaveDriveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateDriveStorage({
      institutionalDriveEmail: driveEmail,
      driveFolderId: driveFolder,
    });
    alert('Configuración de Google Drive Institucional guardada.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {isCentralDirector
                  ? 'Dirección General de Admisión, Registro y Control de Estudio (CASRCE)'
                  : `Control de Estudio (CARSCE) • ${activeSedeObj?.name || 'Sede'}`}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {isCentralDirector
                  ? `${sedes.length} Sedes & ${pnfs.length} PNFs`
                  : `Sede ${activeSedeObj?.code || ''} (${scopedPnfs.length} PNFs Ofertados)`}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isCentralDirector
                ? 'Supervisión Central de Control de Estudio & Motor de Evaluación PNF'
                : `Gestión de Control de Estudio • ${activeSedeObj?.name || 'Sede'}`}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              {isCentralDirector
                ? `Director Central: Dr. Roberto Salazar. Monitoreo unificado multisede, actas de notas, reglas de evaluación y aprobación de periodos (Pregrado, Intensivo, PER).`
                : `Coordinador(a) responsable: ${currentUser.name} (${currentUser.cedula}). Administración de actas, récord académico, estudiantes y oferta académica de esta sede.`}
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isCentralDirector && selectedSedeId === 'all'
                ? 'Consolidado Multiprograma'
                : `Resumen de Sede`}
            </button>
            <button
              onClick={() => setActiveTab('engine')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'engine'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Motor de Evaluación</span>
            </button>
            <button
              onClick={() => setActiveTab('per_control')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'per_control'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>PER & Periodos Lectivos</span>
            </button>
            <button
              onClick={() => setActiveTab('sedes')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'sedes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Red de Sedes ({sedes.length})</span>
            </button>
          </div>
        </div>

        {/* Filter bar for Director de CASRCE */}
        {isCentralDirector && (
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-xs font-bold text-slate-800">
                Filtrar Ámbito Territorial (Director de CASRCE):
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSedeId}
                onChange={e => setSelectedSedeId(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              >
                <option value="all">🌍 Todas las Sedes (Consolidado Institucional)</option>
                {sedes.map(s => (
                  <option key={s.id} value={s.id}>
                    🏢 {s.code} - {s.name} ({s.city})
                  </option>
                ))}
              </select>

              {selectedSedeId !== 'all' && (
                <button
                  onClick={() => setSelectedSedeId('all')}
                  className="px-2.5 py-1.5 text-xs text-blue-700 hover:bg-blue-50 rounded-lg font-bold border border-blue-200 transition"
                >
                  Ver Todo
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* PER (Plan Especial de Recuperación) & Intensivo Management Card */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                    Oportunidad de Recuperación de Unidades
                  </span>
                  <span className="text-xs text-amber-900 font-bold">
                    PER (Plan Especial de Recuperación) & Periodos Intensivos
                  </span>
                </div>
                <h3 className="text-base font-bold text-amber-950">
                  Activación del Periodo PER según Cierre de Notas
                </h3>
                <p className="text-xs text-amber-800 max-w-2xl leading-relaxed">
                  El PER ofrece a los estudiantes con asignaturas no aprobadas la oportunidad reglamentaria de recuperar sus unidades curriculares sin atrasar su prosecución al siguiente Trayecto. Se habilita formalmente una vez completado el cierre de actas del periodo ordinario de Pregrado.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {currentPeriod.notesClosingStatus !== 'Culminada' ? (
                  <button
                    onClick={() => {
                      if (window.confirm('¿Confirmar cierre de carga de notas ordinarias? Se habilitará la convocatoria oficial del PER.')) {
                        closeRegularPeriodNotes(currentPeriod.id);
                      }
                    }}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg shadow-xs transition"
                  >
                    Culminar Notas & Habilitar PER
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('per_control')}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>✓ PER Habilitado • Ver Censo ({perRecoveries.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Global Cross-PNF Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Comparativo en Tiempo Real por Programa Nacional de Formación
              </span>
              <span className="text-[11px] text-slate-500">
                Colores oficiales por disciplina
              </span>
            </div>

            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-3 px-4">Programa (PNF) & Color</th>
                    <th className="py-3 px-3 text-center">Modalidad</th>
                    <th className="py-3 px-3 text-center">Sedes Ofertadas</th>
                    <th className="py-3 px-4 text-center">Avance Clases</th>
                    <th className="py-3 px-4 text-center">Carga de Notas</th>
                    <th className="py-3 px-3 text-center">Actas CARSCE</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {scopedPnfs.map(pnf => {
                    const pnfUnits = curricularUnits.filter(u => u.pnfId === pnf.id);
                    const pnfSections = scopedSections.filter(s => s.pnfId === pnf.id);

                    let totalExecuted = 0;
                    let totalPlanned = 0;
                    let totalGradePct = 0;

                    pnfSections.forEach(sec => {
                      totalExecuted += classSessions.filter(cs => cs.sectionId === sec.id).length;
                      const unit = pnfUnits.find(u => u.id === sec.curricularUnitId);
                      totalPlanned += unit?.totalPlannedSessions || 16;
                      totalGradePct += getSectionGradeStatus(sec.id).percentageLoaded;
                    });

                    const sessionProgress =
                      totalPlanned > 0 ? Math.round((totalExecuted / totalPlanned) * 100) : 0;
                    const avgGrade =
                      pnfSections.length > 0 ? Math.round(totalGradePct / pnfSections.length) : 0;

                    const pnfSedesNames = sedes
                      .filter(s => pnf.sedeIds.includes(s.id))
                      .map(s => s.name.split('-')[0].trim());

                    return (
                      <tr key={pnf.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4">
                          <PnfBadge pnf={pnf} size="md" showModality={false} />
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                            {pnf.description}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center font-semibold">
                          <span className="capitalize">{pnf.modality}</span> ({pnf.tramosPerTrayecto} Tramos)
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {pnfSedesNames.map((sn, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {sn}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span>{totalExecuted} / {totalPlanned} ses.</span>
                            <span className="font-bold text-slate-900">{sessionProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${sessionProgress}%` }}
                            ></div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span>En vivo</span>
                            <span className="font-bold text-indigo-700">{avgGrade}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${avgGrade}%` }}
                            ></div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {pnfSections.filter(s => s.actaStatus === 'Cerrada_CARSCE').length} Cerradas
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actas Closure Queue */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Actas de Notas Pendientes de Firma y Cierre Definitivo en CARSCE</span>
            </h3>
            {actasPendingClosure.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No hay actas pendientes por firmar en este momento.</p>
            ) : (
              <div className="space-y-2">
                {actasPendingClosure.map(sec => {
                  const uc = curricularUnits.find(u => u.id === sec.curricularUnitId);
                  const pnf = pnfs.find(p => p.id === sec.pnfId);
                  return (
                    <div
                      key={sec.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {uc?.name} ({sec.code})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {pnf?.name} • Estado: {sec.actaStatus.replace('_', ' ')}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSectionActaStatus(sec.id, 'Cerrada_CARSCE');
                          alert(`Acta de ${uc?.name} cerrada institucionalmente.`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Firmar y Asentar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'engine' && (
        /* MOTOR DE EVALUACIÓN CONFIGURATOR */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rules Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-4">
              <Cpu className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Parámetros del Motor de Evaluación y Prelaciones
                </h3>
                <p className="text-xs text-slate-500">
                  Reglas reglamentarias aplicadas a calificaciones y prosecución estudiantil.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEvaluationRules} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nota Mínima UCs Ordinarias *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={minRegular}
                    onChange={e => setMinRegular(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Escala de 00 a 20 (Normalmente 12)</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nota Mínima Proyecto (PSI) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={minProject}
                    onChange={e => setMinProject(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Exigencia PNF (Normalmente 16)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Porcentaje Máximo por Corte (%) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="25"
                    required
                    value={maxCut}
                    onChange={e => setMaxCut(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                  />
                  <span className="text-[10px] text-blue-700 font-bold">Regla: Máximo 25% por corte</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Asistencia Mínima (%) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    required
                    value={minAttendance}
                    onChange={e => setMinAttendance(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Límite de faltas es 25% (75% asist.)</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                  <input
                    type="checkbox"
                    checked={reqProject}
                    onChange={e => setReqProject(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-0"
                  />
                  <span>Condición Obligatoria: Aprobar Proyecto (PSI) para Avanzar de Trayecto</span>
                </label>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Si está marcado, ningún estudiante podrá inscribir ni ser promovido al siguiente Trayecto sin haber aprobado el Proyecto Sociointegrador con un mínimo de {minProject} puntos.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Máximo de Unidades en Arrastre para Avanzar
                </label>
                <select
                  value={maxFailed}
                  onChange={e => setMaxFailed(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                >
                  <option value={0}>0 unidades (Pase limpio estricto)</option>
                  <option value={1}>1 unidad en arrastre (Recomendado)</option>
                  <option value={2}>2 unidades en arrastre</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Parámetros de Evaluación</span>
              </button>
            </form>
          </div>

          {/* Drive Configuration Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-4">
                <HardDrive className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Almacenamiento Ultraligero & Google Drive
                  </h3>
                  <p className="text-xs text-slate-500">
                    La base de datos almacena exclusivamente texto y enlaces de Drive para evitar sobrecostos en nube.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveDriveConfig} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Correo Institucional de Google Drive (Recepción de Expedientes) *
                  </label>
                  <input
                    type="email"
                    required
                    value={driveEmail}
                    onChange={e => setDriveEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    ID Carpeta Raíz de Drive (Folder ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={driveFolder}
                    onChange={e => setDriveFolder(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Espacio Ocupado en BD (Solo Texto):</span>
                    <strong className="text-emerald-700 font-mono">
                      {(driveStorage.storageUsedBytes / 1024).toFixed(1)} KB (Ultraligero)
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Estado de Sincronización Drive:</span>
                    <strong className="text-blue-700">✓ Activo</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Actualizar Configuración de Google Drive</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sedes' && (
        /* 4 SEDES OVERVIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sedes.map(sede => {
            const pnfsOfferedInSede = pnfs.filter(p => sede.pnfIdsOffered.includes(p.id));
            return (
              <div
                key={sede.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {sede.code}
                  </span>
                  <span className="text-xs text-slate-500">{sede.city}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{sede.name}</h3>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{sede.address}</span>
                </p>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    Oferta Académica de la Sede:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pnfsOfferedInSede.map(p => (
                      <PnfBadge key={p.id} pnf={p} size="sm" />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'per_control' && (
        /* PER & AÑOS LECTIVOS CONTROL VIEW */
        <div className="space-y-6">
          {/* Executive Header Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-blue-50 border border-amber-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-600 text-white rounded-lg shadow-xs">
                    <Award className="w-5 h-5" />
                  </span>
                  <h2 className="text-base font-black text-slate-900">
                    Control de Años Lectivos, Intensivos y Convocatorias PER
                  </h2>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  Supervisión del calendario por épocas del año. El <strong>Plan Especial de Recuperación (PER)</strong> depende del <strong>cierre de carga de notas ordinarias</strong> para determinar a los estudiantes candidatos con materias reprobadas (&lt; 12 regular o &lt; 16 proyecto).
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    alert('Generando Acta Oficial Consolidada del Plan Especial de Recuperación (PER) con firmas de CARSCE y Coordinación de PNF...');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Generar Acta General PER</span>
                </button>
              </div>
            </div>
          </div>

          {/* Regular Notes Closing Semaphore Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="font-bold text-sm text-slate-900 block">
                  Semáforo de Carga de Notas Ordinarias y Habilitación del PER
                </span>
                <p className="text-xs text-slate-500">
                  Período Ordinario: <strong className="text-blue-700">{currentPeriod.code}</strong> • {currentPeriod.season || 'Primer Semestre (Feb-Jun)'}
                </p>
              </div>

              <div>
                {currentPeriod.notesClosingStatus === 'Culminada' ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300">
                    ✓ Carga Ordinaria Cerrada • PER Habilitado
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                    En Proceso de Carga de Notas
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[11px] block">Secciones con Notas al 100%:</span>
                <div className="text-xl font-black text-slate-900">
                  {sections.filter(s => getSectionGradeStatus(s.id).percentageLoaded === 100).length} de {sections.length} secciones
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[11px] block">Actas Cerradas CARSCE:</span>
                <div className="text-xl font-black text-emerald-700">
                  {sections.filter(s => s.actaStatus === 'Cerrada_CARSCE').length} de {sections.length} actas
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[11px] block">Estudiantes en Convocatoria PER:</span>
                <div className="text-xl font-black text-amber-700">
                  {perRecoveries.length} estudiantes inscritos
                </div>
              </div>
            </div>

            {currentPeriod.notesClosingStatus !== 'Culminada' && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span>
                  <strong>Condición de Apertura del PER:</strong> Al culminar la carga de notas, haga clic en el botón para cerrar formalmente el período regular y abrir la oportunidad de recuperación en el PER.
                </span>
                <button
                  onClick={() => {
                    closeRegularPeriodNotes(currentPeriod.id);
                    alert('Carga de notas ordinarias cerrada exitosamente. Convocatoria del Plan Especial de Recuperación (PER) habilitada para todas las sedes y PNFs.');
                  }}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg shadow-xs transition shrink-0"
                >
                  Cerrar Notas Ordinarias & Habilitar PER
                </button>
              </div>
            )}
          </div>

          {/* Comprehensive Table of Students in PER */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-3 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Censo y Control de Evaluaciones en el Plan Especial de Recuperación (PER)
                </h3>
                <p className="text-xs text-slate-500">
                  Auditoría institucional de notas recuperatorias e integración automática con el Récord Académico de SisCasrce.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
                {perRecoveries.length} Casos Registrados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3">Estudiante</th>
                    <th className="py-2.5 px-3">Cédula</th>
                    <th className="py-2.5 px-3">Unidad Curricular</th>
                    <th className="py-2.5 px-3 text-center">Período Previo</th>
                    <th className="py-2.5 px-3 text-center">Nota Origen</th>
                    <th className="py-2.5 px-3 text-center">Nota PER (0-20)</th>
                    <th className="py-2.5 px-3 text-center">Dictamen</th>
                    <th className="py-2.5 px-3">Observación para Consejo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {perRecoveries.map(rec => {
                    const st = users.find(u => u.id === rec.studentId);
                    const uc = curricularUnits.find(u => u.id === rec.curricularUnitId);

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{st?.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{st?.cedula}</td>
                        <td className="py-2.5 px-3">
                          <strong className="text-blue-700">{uc?.code}</strong> • {uc?.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{rec.originalPeriodCode}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-rose-600 font-mono">
                          {rec.originalScore}/20
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono">
                          {rec.recoveryScore !== undefined ? (
                            <span className={rec.recoveryScore >= 12 ? 'text-emerald-700 font-black text-sm' : 'text-rose-600'}>
                              {rec.recoveryScore} / 20
                            </span>
                          ) : (
                            <span className="text-slate-400">Pendiente</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {rec.recoveryStatus === 'Evaluado_Aprobado' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                              Aprobada en PER
                            </span>
                          ) : rec.recoveryStatus === 'Inscrito' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                              Inscrito en PER
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              {rec.recoveryStatus}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-600 italic max-w-xs truncate" title={rec.teacherObservation}>
                          {rec.teacherObservation || 'Pendiente de evaluación'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
