import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { DayOfWeek } from '../../types/academic';
import { PnfBadge } from '../common/PnfBadge';
import { Calendar, MapPin } from 'lucide-react';

export const SchedulesView: React.FC = () => {
  const { sections, curricularUnits, users, currentUser, pnfs, sedes } = useAcademic();

  const [filterMode, setFilterMode] = useState<'section' | 'sede' | 'all'>('section');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || '');
  const [selectedSedeId, setSelectedSedeId] = useState<string>(sedes[0]?.id || '');

  const days: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const timeSlots = [
    '07:30 - 09:45',
    '10:00 - 12:15',
    '13:00 - 15:15',
    '15:30 - 17:45',
  ];

  interface ScheduleBlock {
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    timeSlotIndex: number;
    classroom: string;
    sectionCode: string;
    ucName: string;
    professorName: string;
    pnfName: string;
    sedeName: string;
  }

  const allBlocks: ScheduleBlock[] = [];

  sections.forEach(sec => {
    if (filterMode === 'section' && sec.id !== selectedSectionId) return;
    if (filterMode === 'sede' && sec.sedeId !== selectedSedeId) return;

    const uc = curricularUnits.find(u => u.id === sec.curricularUnitId);
    const prof = users.find(u => u.id === sec.professorId);
    const pnf = pnfs.find(p => p.id === sec.pnfId);
    const sede = sedes.find(s => s.id === sec.sedeId);

    sec.schedules.forEach(sch => {
      let slotIdx = 0;
      if (sch.startTime.startsWith('07') || sch.startTime.startsWith('08')) slotIdx = 0;
      else if (sch.startTime.startsWith('10')) slotIdx = 1;
      else if (sch.startTime.startsWith('13')) slotIdx = 2;
      else slotIdx = 3;

      allBlocks.push({
        day: sch.day,
        startTime: sch.startTime,
        endTime: sch.endTime,
        timeSlotIndex: slotIdx,
        classroom: sch.classroom,
        sectionCode: sec.code,
        ucName: uc?.name || 'UC',
        professorName: prof?.name || 'Docente',
        pnfName: pnf?.name || 'PNF',
        sedeName: sede?.name.split('-')[0].trim() || 'Sede',
      });
    });
  });

  return (
    <div className="space-y-6">
      {/* Header (Light theme) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span>Horarios Académicos por Sede y Aulas</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Programación semanal por bloques de horas en las 4 Sedes Universitarias.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setFilterMode('section')}
                className={`px-3 py-1.5 rounded-md transition ${
                  filterMode === 'section' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Sección
              </button>
              <button
                onClick={() => setFilterMode('sede')}
                className={`px-3 py-1.5 rounded-md transition ${
                  filterMode === 'sede' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Sede
              </button>
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-md transition ${
                  filterMode === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ver Todas
              </button>
            </div>

            {filterMode === 'section' && (
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

            {filterMode === 'sede' && (
              <select
                value={selectedSedeId}
                onChange={e => setSelectedSedeId(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-bold"
              >
                {sedes.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                <th className="py-3 px-3 w-28 text-center bg-slate-50 sticky left-0 z-10">
                  Bloque Horario
                </th>
                {days.map(day => (
                  <th key={day} className="py-3 px-3 text-center border-l border-slate-200">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {timeSlots.map((slot, slotIdx) => (
                <tr key={slot} className="hover:bg-slate-50/50">
                  <td className="py-4 px-3 text-center font-mono font-bold text-xs text-blue-700 bg-slate-50 sticky left-0 z-10 border-r border-slate-200">
                    {slot}
                  </td>

                  {days.map(day => {
                    const blocksInCell = allBlocks.filter(
                      b => b.day === day && b.timeSlotIndex === slotIdx
                    );

                    return (
                      <td key={day} className="py-2.5 px-2 border-l border-slate-100 align-top min-w-[130px]">
                        {blocksInCell.length === 0 ? (
                          <div className="h-16 flex items-center justify-center text-slate-300 text-[10px]">
                            -
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {blocksInCell.map((b, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 shadow-xs text-left"
                              >
                                <div className="flex justify-between items-center text-[10px] text-blue-800 font-bold">
                                  <span>{b.sectionCode}</span>
                                  <span className="font-mono">{b.startTime} - {b.endTime}</span>
                                </div>
                                <div className="font-bold text-slate-900 text-xs mt-0.5 line-clamp-1">
                                  {b.ucName}
                                </div>
                                <div className="text-[10px] text-emerald-800 flex items-center gap-1 mt-1 font-medium">
                                  <MapPin className="w-3 h-3 text-emerald-600" />
                                  <span>{b.classroom} ({b.sedeName})</span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                  {b.professorName}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
