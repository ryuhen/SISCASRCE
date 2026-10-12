import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PnfBadge } from '../common/PnfBadge';
import {
  FileText,
  Printer,
  Award,
  Building2,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Users,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    pnfs,
    sedes,
    curricularUnits,
    sections,
    evaluationPlans,
    grades,
    users,
    currentPeriod,
    getStudentsForSection,
  } = useAcademic();

  const [reportType, setReportType] = useState<'acta_oficial' | 'rendimiento_comparativo'>('acta_oficial');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || '');

  const currentSection = sections.find(s => s.id === selectedSectionId);
  const currentUC = curricularUnits.find(u => u.id === currentSection?.curricularUnitId);
  const currentPNF = pnfs.find(p => p.id === currentSection?.pnfId);
  const currentProfessor = users.find(u => u.id === currentSection?.professorId);
  const currentSede = sedes.find(s => s.id === currentSection?.sedeId);
  const students = getStudentsForSection(selectedSectionId);
  const evalItems = evaluationPlans
    .filter(e => e.sectionId === selectedSectionId)
    .sort((a, b) => a.corteNumber - b.corteNumber);

  const numberToLetters = (num: number): string => {
    const rounded = Math.round(num);
    const words: Record<number, string> = {
      0: 'CERO CERO',
      1: 'CERO UNO',
      2: 'CERO DOS',
      3: 'CERO TRES',
      4: 'CERO CUATRO',
      5: 'CERO CINCO',
      6: 'CERO SEIS',
      7: 'CERO SIETE',
      8: 'CERO OCHO',
      9: 'CERO NUEVE',
      10: 'DIEZ',
      11: 'ONCE',
      12: 'DOCE',
      13: 'TRECE',
      14: 'CATORCE',
      15: 'QUINCE',
      16: 'DIECISÉIS',
      17: 'DIECISIETE',
      18: 'DIECIOCHO',
      19: 'DIECINUEVE',
      20: 'VEINTE',
    };
    return words[rounded] || `${rounded}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Reportes de Rendimiento y Actas Oficiales</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Generación de actas institucionales certificadas, récord por trayecto/tramo y balance semestral y trimestral.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setReportType('acta_oficial')}
                className={`px-3 py-1.5 rounded-md transition ${
                  reportType === 'acta_oficial' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Acta Oficial de Calificaciones
              </button>
              <button
                onClick={() => setReportType('rendimiento_comparativo')}
                className={`px-3 py-1.5 rounded-md transition ${
                  reportType === 'rendimiento_comparativo' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Balance de Rendimiento
              </button>
            </div>

            {reportType === 'acta_oficial' && (
              <select
                value={selectedSectionId}
                onChange={e => setSelectedSectionId(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-bold"
              >
                {sections.map(sec => {
                  const uc = curricularUnits.find(u => u.id === sec.curricularUnitId);
                  return (
                    <option key={sec.id} value={sec.id}>
                      {sec.code} - {uc?.name}
                    </option>
                  );
                })}
              </select>
            )}

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {reportType === 'acta_oficial' ? (
        /* OFFICIAL TRANSCRIPT (ACTA DE CALIFICACIONES) */
        <div className="bg-white text-slate-900 rounded-xl p-8 sm:p-12 shadow-md border border-slate-200 max-w-5xl mx-auto font-serif print:shadow-none print:border-none print:p-0">
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
            <div className="text-[11px] uppercase tracking-widest text-slate-700 font-semibold leading-tight">
              República Bolivariana de Venezuela
              <br />
              Ministerio del Poder Popular para la Educación Universitaria
              <br />
              Dirección de Admisión, Registro y Control de Estudio (CARSCE) • SisCasrce
            </div>
            <h2 className="text-xl font-bold uppercase mt-3 tracking-wider text-slate-950">
              Acta Oficial de Calificaciones Finales
            </h2>
            <div className="text-xs text-slate-600 font-sans mt-1">
              Periodo Académico: <strong className="text-slate-900">{currentPeriod.name} ({currentPeriod.code})</strong> • Tipo:{' '}
              <span className="font-bold text-blue-700 uppercase">
                {currentPeriod.type === 'PER'
                  ? 'Plan Especial de Recuperación (PER)'
                  : currentPeriod.type === 'Intensivo'
                  ? 'Periodo Intensivo'
                  : 'Pregrado Regular'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-300 rounded p-4 mb-6 font-sans text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Programa:</span>
                <strong className="text-slate-900">{currentPNF?.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Unidad Curricular:</span>
                <strong className="text-slate-900">{currentUC?.name} ({currentUC?.code})</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Sección / Sede:</span>
                <strong className="text-slate-900">{currentSection?.code} / {currentSede?.name.split('-')[0]}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Trayecto y Tramo:</span>
                <strong className="text-slate-900">Trayecto {currentSection?.trayecto} • Tramo {currentSection?.tramo} ({currentPNF?.modality})</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Docente:</span>
                <strong className="text-slate-900">{currentProfessor?.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Estado del Acta:</span>
                <strong className="text-blue-700 uppercase">{currentSection?.actaStatus.replace('_', ' ')}</strong>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto font-sans text-xs mb-8">
            <table className="w-full border-collapse border border-slate-400 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                  <th className="p-2 border border-slate-400 text-center w-8">#</th>
                  <th className="p-2 border border-slate-400 w-28">Cédula</th>
                  <th className="p-2 border border-slate-400">Apellidos y Nombres</th>
                  {evalItems.map(item => (
                    <th key={item.id} className="p-2 border border-slate-400 text-center w-16">
                      Corte {item.corteNumber}
                      <span className="block text-[9px] font-normal text-slate-500">{item.weightPercentage}%</span>
                    </th>
                  ))}
                  <th className="p-2 border border-slate-400 text-center w-16 bg-slate-200">Def. (Nº)</th>
                  <th className="p-2 border border-slate-400 text-center min-w-[130px] bg-slate-200">Definitiva en Letras</th>
                  <th className="p-2 border border-slate-400 text-center w-24">Condición</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => {
                  let weighted = 0;
                  evalItems.forEach(item => {
                    const g = grades.find(gr => gr.evaluationPlanItemId === item.id && gr.studentId === st.id);
                    if (g) weighted += g.score * (item.weightPercentage / 100);
                  });

                  const defNum = Math.round(weighted * 10) / 10;
                  const isPassing = defNum >= 12;

                  return (
                    <tr key={st.id} className="border-b border-slate-300">
                      <td className="p-2 border border-slate-300 text-center text-slate-600 font-mono">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-mono font-semibold">{st.cedula}</td>
                      <td className="p-2 border border-slate-300 font-medium">{st.name}</td>
                      {evalItems.map(item => {
                        const g = grades.find(gr => gr.evaluationPlanItemId === item.id && gr.studentId === st.id);
                        return (
                          <td key={item.id} className="p-2 border border-slate-300 text-center font-mono font-bold">
                            {g?.score !== undefined ? g.score.toString().padStart(2, '0') : '--'}
                          </td>
                        );
                      })}
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold text-sm bg-slate-100">
                        {defNum.toFixed(1)}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-bold text-[10px] bg-slate-100 uppercase">
                        {numberToLetters(defNum)}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-bold text-[10px]">
                        {isPassing ? <span className="text-emerald-700">APROBADO</span> : <span className="text-rose-700">REPROBADO</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-6 font-sans text-center">
            <div className="grid grid-cols-3 gap-6 text-[10px] uppercase">
              <div className="border-t border-slate-900 pt-2">
                <strong>{currentProfessor?.name}</strong>
                <br /><span className="text-slate-600">Docente Titular</span>
              </div>
              <div className="border-t border-slate-900 pt-2">
                <strong>Coordinación de PNF</strong>
                <br /><span className="text-slate-600">{currentPNF?.name}</span>
              </div>
              <div className="border-t border-slate-900 pt-2">
                <strong>Lic. Carmen Lucena</strong>
                <br /><span className="text-slate-600">Coordinadora Central CARSCE</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BALANCES POR PNF Y DISCIPLINAS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pnfs.map(pnf => (
            <div key={pnf.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <PnfBadge pnf={pnf} size="md" />
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pnf.description}
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Régimen:</span>
                  <strong className="text-slate-800 capitalize">{pnf.modality} ({pnf.tramosPerTrayecto} Tramos/Año)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Aprobación Promedio:</span>
                  <strong className="text-emerald-700">86.2%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
