import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PnfBadge } from '../common/PnfBadge';
import {
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  AlertTriangle,
  Search,
  MapPin,
} from 'lucide-react';

interface PnfCoordinatorDashboardProps {
  onNavigateToMatrix?: () => void;
}

export const PnfCoordinatorDashboard: React.FC<PnfCoordinatorDashboardProps> = () => {
  const {
    currentUser,
    pnfs,
    sedes,
    curricularUnits,
    sections,
    classSessions,
    users,
    getSectionGradeStatus,
    updateSectionActaStatus,
    addNotification,
  } = useAcademic();

  const [selectedPnfId, setSelectedPnfId] = useState<string>(
    currentUser.pnfId || 'pnf-info'
  );

  const [filterTrayecto, setFilterTrayecto] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentPnf = pnfs.find(p => p.id === selectedPnfId) || pnfs[0];
  const coordinatorUser = users.find(u => u.id === currentPnf.coordinatorId);

  const pnfUCs = curricularUnits.filter(u => u.pnfId === currentPnf.id);

  const enrichedUnits = pnfUCs
    .filter(uc => {
      if (filterTrayecto !== 'all' && uc.trayecto.toString() !== filterTrayecto) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          uc.name.toLowerCase().includes(query) ||
          uc.code.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .map(uc => {
      const section = sections.find(s => s.curricularUnitId === uc.id);
      const professor = section ? users.find(u => u.id === section.professorId) : null;
      const sede = section ? sedes.find(s => s.id === section.sedeId) : null;

      const executedSessions = section
        ? classSessions.filter(s => s.sectionId === section.id).length
        : 0;

      const plannedSessions = uc.totalPlannedSessions || 16;
      const sessionProgressPct = Math.min(
        100,
        Math.round((executedSessions / plannedSessions) * 100)
      );

      const gradeStatus = section
        ? getSectionGradeStatus(section.id)
        : {
            percentageLoaded: 0,
            statusLabel: 'Sin Iniciar' as const,
            cortesSummary: [],
            totalRequiredGrades: 0,
            loadedGradesCount: 0,
          };

      return {
        uc,
        section,
        professor,
        sede,
        executedSessions,
        plannedSessions,
        sessionProgressPct,
        gradeStatus,
      };
    });

  const totalUnitsCount = pnfUCs.length;
  const totalActiveSections = enrichedUnits.filter(item => item.section).length;
  const totalSessionsExecuted = enrichedUnits.reduce((acc, c) => acc + c.executedSessions, 0);
  const totalSessionsPlanned = enrichedUnits.reduce((acc, c) => acc + c.plannedSessions, 0);
  const globalProgress =
    totalSessionsPlanned > 0
      ? Math.round((totalSessionsExecuted / totalSessionsPlanned) * 100)
      : 0;

  const avgGradeLoad =
    enrichedUnits.length > 0
      ? Math.round(
          enrichedUnits.reduce((acc, c) => acc + c.gradeStatus.percentageLoaded, 0) /
            enrichedUnits.length
        )
      : 0;

  const handleSendReminder = (professorName: string, ucName: string, professorId?: string) => {
    if (professorId) {
      addNotification({
        targetUserId: professorId,
        targetRole: 'profesor',
        title: 'Recordatorio de Coordinación de PNF',
        message: `Se solicita actualizar la carga de notas y asistencia para la UC ${ucName}.`,
        type: 'warning',
        category: 'calificaciones',
      });
    }
    alert(`Notificación enviada a ${professorName} para ${ucName}.`);
  };

  const handleValidateActa = (sectionId: string, ucName: string) => {
    updateSectionActaStatus(sectionId, 'Validada_PNF');
    alert(`Acta de ${ucName} aprobada por Coordinación y remitida a CARSCE.`);
  };

  const pnfSedesList = sedes.filter(s => currentPnf.sedeIds.includes(s.id));

  return (
    <div className="space-y-6">
      {/* Top Banner (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <PnfBadge pnf={currentPnf} size="md" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Supervisión de Unidades Curriculares & Estatus de Notas
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {currentPnf.description}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
              <span>Coordinador/a: <strong className="text-slate-900">{coordinatorUser?.name || 'Prof. Designado'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Sedes Ofertadas: <strong className="text-slate-800">{pnfSedesList.map(s => s.name.split('-')[0]).join(', ')}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="coord-pnf-select" className="text-xs font-semibold text-slate-600">Cambiar PNF:</label>
            <select
              id="coord-pnf-select"
              aria-label="Seleccionar Programa Nacional de Formación a Supervisar"
              value={selectedPnfId}
              onChange={e => setSelectedPnfId(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-bold"
            >
              {pnfs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Real-Time Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[11px] font-semibold text-slate-500 block">Unidades Curriculares</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {totalUnitsCount}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {totalActiveSections} secciones activas
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[11px] font-semibold text-slate-500 block">Sesiones de Clase</span>
            <div className="text-2xl font-black text-blue-700 mt-0.5">
              {totalSessionsExecuted} <span className="text-xs text-slate-500 font-normal">/ {totalSessionsPlanned}</span>
            </div>
            <span className="text-[10px] text-blue-700 font-semibold mt-1 block">
              {globalProgress}% de avance en el PNF
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[11px] font-semibold text-slate-500 block">Carga de Notas</span>
            <div className="text-2xl font-black text-indigo-700 mt-0.5">
              {avgGradeLoad}%
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              En tiempo real por docentes
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[11px] font-semibold text-slate-500 block">Actas por Validar</span>
            <div className="text-2xl font-black text-amber-600 mt-0.5">
              {enrichedUnits.filter(u => u.section?.actaStatus === 'En_Revision').length}
            </div>
            <span className="text-[10px] text-amber-700 mt-1 block font-medium">
              Esperando firma de PNF
            </span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-lg text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-bold">Trayecto:</span>
          <div className="flex gap-1">
            {['all', '1', '2', '3', '4'].map(tray => (
              <button
                key={tray}
                onClick={() => setFilterTrayecto(tray)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                  filterTrayecto === tray
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tray === 'all' ? 'Todos' : `Trayecto ${tray}`}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar unidad curricular..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Grid of Curricular Units */}
      <div className="space-y-3">
        {enrichedUnits.map(item => {
          const { uc, section, professor, sede, executedSessions, plannedSessions, sessionProgressPct, gradeStatus } = item;

          return (
            <div
              key={uc.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {uc.code}
                    </span>
                    <span className="text-xs text-slate-600">
                      Trayecto {uc.trayecto} • Tramo {uc.tramo}
                    </span>
                    {sede && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        {sede.name.split('-')[0]}
                      </span>
                    )}
                    {uc.isProject && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Proyecto (PSI)
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {uc.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Docente: <strong className="text-slate-800">{professor?.name || 'Por designar'}</strong> • Sección: <strong className="text-slate-800">{section?.code || 'N/A'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {section?.actaStatus === 'En_Revision' && (
                    <button
                      onClick={() => handleValidateActa(section.id, uc.name)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Validar Acta
                    </button>
                  )}
                  <button
                    onClick={() => handleSendReminder(professor?.name || 'Docente', uc.name, professor?.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    <span>Notificar</span>
                  </button>
                </div>
              </div>

              {/* Progress & Live Grades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-600">Sesiones Impartidas:</span>
                    <strong className="text-slate-900 font-mono">{executedSessions} / {plannedSessions} ({sessionProgressPct}%)</strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${sessionProgressPct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Estatus de Notas:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700">{gradeStatus.percentageLoaded}% Cargado</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold">
                      {section?.actaStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
