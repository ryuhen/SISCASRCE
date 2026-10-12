import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PNF, CurricularUnit, Sede, AcademicPeriod, PeriodType } from '../../types/academic';
import { PnfBadge } from '../common/PnfBadge';
import {
  Settings,
  Shield,
  Layers,
  Users,
  Check,
  Plus,
  BookOpen,
  Building2,
  HardDrive,
  Calendar,
  Save,
  MapPin,
  Clock,
  Edit2,
  Phone,
  UserCheck,
  GraduationCap,
  X,
} from 'lucide-react';

export const AdminConfigView: React.FC = () => {
  const {
    pnfs,
    addPnf,
    updatePnfSettings,
    sedes,
    addSede,
    updateSede,
    curricularUnits,
    addCurricularUnit,
    periods,
    currentPeriod,
    addNewAcademicPeriod,
    updateAcademicPeriod,
    closeRegularPeriodNotes,
    perRecoveries,
    users,
    updateUser,
    sections,
    enrollments,
    driveStorage,
    updateDriveStorage,
  } = useAcademic();

  const [activeTab, setActiveTab] = useState<'pensum' | 'periodos' | 'new_pnf' | 'sedes' | 'drive' | 'users'>('pensum');

  // New Curricular Unit Modal state
  const [showAddUcModal, setShowAddUcModal] = useState(false);
  const [ucPnfId, setUcPnfId] = useState<string>(pnfs[0]?.id || '');
  const [ucCode, setUcCode] = useState('');
  const [ucName, setUcName] = useState('');
  const [ucTrayecto, setUcTrayecto] = useState(1);
  const [ucTramo, setUcTramo] = useState(1);
  const [ucHours, setUcHours] = useState(6);
  const [ucPlannedSessions, setUcPlannedSessions] = useState(16);
  const [ucIsProject, setUcIsProject] = useState(false);
  const [ucSynopsis, setUcSynopsis] = useState('');
  const [ucSelectedSedes, setUcSelectedSedes] = useState<string[]>(['sede-central']);

  // New PNF Form state
  const [newPnfCode, setNewPnfCode] = useState('');
  const [newPnfName, setNewPnfName] = useState('');
  const [newPnfModality, setNewPnfModality] = useState<'trimestral' | 'semestral'>('semestral');
  const [newPnfTramos, setNewPnfTramos] = useState(2);
  const [newPnfTrayectos, setNewPnfTrayectos] = useState(4);
  const [newPnfDesc, setNewPnfDesc] = useState('');
  const [newPnfColor, setNewPnfColor] = useState<'emerald' | 'slate' | 'blue' | 'amber'>('emerald');
  const [newPnfSedes, setNewPnfSedes] = useState<string[]>(['sede-central']);

  // New Academic Period Form state
  const [showNewPeriodModal, setShowNewPeriodModal] = useState(false);
  const [newPeriodCode, setNewPeriodCode] = useState('2027-I');
  const [newPeriodName, setNewPeriodName] = useState('Año Lectivo 2027 - Pregrado Regular');
  const [newPeriodYear, setNewPeriodYear] = useState(2027);
  const [newPeriodType, setNewPeriodType] = useState<PeriodType>('Pregrado_Regular');
  const [newPeriodSeason, setNewPeriodSeason] = useState('Primer Período Ordinario (Febrero - Junio)');
  const [newPeriodStart, setNewPeriodStart] = useState('2027-02-01');
  const [newPeriodEnd, setNewPeriodEnd] = useState('2027-06-30');

  // Drive state
  const [driveEmail, setDriveEmail] = useState(driveStorage.institutionalDriveEmail);
  const [driveFolder, setDriveFolder] = useState(driveStorage.driveFolderId);

  // Pensum filter
  const [selectedPensumPnf, setSelectedPensumPnf] = useState<string>(pnfs[0]?.id || '');

  const filteredUnits = curricularUnits.filter(u => u.pnfId === selectedPensumPnf);

  const handleCreateCurricularUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ucCode.trim() || !ucName.trim()) return;

    addCurricularUnit({
      pnfId: ucPnfId,
      code: ucCode.toUpperCase(),
      name: ucName,
      trayecto: Number(ucTrayecto),
      tramo: Number(ucTramo),
      horasAcademicasSemanales: Number(ucHours),
      totalPlannedSessions: Number(ucPlannedSessions),
      isProject: ucIsProject,
      synopsis: ucSynopsis || 'Contenido curricular del PNF.',
      sedeIds: ucSelectedSedes,
      unitsContent: [
        { number: 1, title: 'Unidad Temática I: Fundamentos', description: 'Introducción y bases teóricas.', hours: 18 },
        { number: 2, title: 'Unidad Temática II: Aplicación Práctica', description: 'Ejercicios de laboratorio y talleres.', hours: 24 },
      ],
    });

    setShowAddUcModal(false);
    setUcCode('');
    setUcName('');
    setUcSynopsis('');
    alert(`Unidad Curricular "${ucName}" creada y ofertada en las sedes seleccionadas.`);
  };

  const handleCreatePnf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPnfCode.trim() || !newPnfName.trim()) return;

    let theme = {
      primary: 'blue',
      bgLight: 'bg-blue-50/70',
      bgPill: 'bg-blue-100 text-blue-800 border-blue-200',
      border: 'border-blue-200',
      text: 'text-blue-700',
      darkText: 'text-blue-900',
      accentBg: 'bg-blue-600',
    };

    if (newPnfColor === 'emerald') {
      theme = {
        primary: 'emerald',
        bgLight: 'bg-emerald-50/70',
        bgPill: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        darkText: 'text-emerald-900',
        accentBg: 'bg-emerald-600',
      };
    } else if (newPnfColor === 'slate') {
      theme = {
        primary: 'slate',
        bgLight: 'bg-slate-50',
        bgPill: 'bg-slate-200 text-slate-800 border-slate-300',
        border: 'border-slate-300',
        text: 'text-slate-700',
        darkText: 'text-slate-900',
        accentBg: 'bg-slate-600',
      };
    } else if (newPnfColor === 'amber') {
      theme = {
        primary: 'amber',
        bgLight: 'bg-amber-50/60',
        bgPill: 'bg-amber-100 text-amber-900 border-amber-300',
        border: 'border-amber-300',
        text: 'text-amber-800',
        darkText: 'text-amber-950',
        accentBg: 'bg-amber-700',
      };
    }

    const created = addPnf({
      code: newPnfCode.toUpperCase(),
      name: newPnfName,
      modality: newPnfModality,
      tramosPerTrayecto: newPnfModality === 'trimestral' ? 3 : 2,
      totalTrayectos: Number(newPnfTrayectos),
      description: newPnfDesc || `Programa Nacional de Formación ${newPnfName}.`,
      sedeIds: newPnfSedes,
      coordinatorId: 'usr-admin-1',
      colorTheme: theme,
    });

    // Update selected sedes to offer this new PNF
    newPnfSedes.forEach(sedeId => {
      const s = sedes.find(item => item.id === sedeId);
      if (s && !s.pnfIdsOffered.includes(created.id)) {
        updateSede(sedeId, { pnfIdsOffered: [...s.pnfIdsOffered, created.id] });
      }
    });

    alert(`PNF "${newPnfName}" configurado y ofertado exitosamente.`);
    setActiveTab('pensum');
    setSelectedPensumPnf(created.id);
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    addNewAcademicPeriod({
      code: newPeriodCode,
      name: newPeriodName,
      year: Number(newPeriodYear),
      type: newPeriodType,
      season: newPeriodSeason,
      startDate: newPeriodStart || `${newPeriodYear}-02-01`,
      endDate: newPeriodEnd || `${newPeriodYear}-06-30`,
      status: 'Planificación',
      recoveryNotesClosingRequired: newPeriodType === 'PER',
      notesClosingStatus: 'Pendiente',
      perRegistrationOpen: newPeriodType === 'PER',
    });
    setShowNewPeriodModal(false);
    alert(`Nuevo Periodo ${newPeriodCode} (${newPeriodType.replace('_', ' ')}) activado en el sistema para la época ${newPeriodSeason}.`);
  };

  // Sede Editing and Creation State
  const [editingSede, setEditingSede] = useState<Sede | null>(null);
  const [editSedeName, setEditSedeName] = useState('');
  const [editSedeCode, setEditSedeCode] = useState('');
  const [editSedeCity, setEditSedeCity] = useState('');
  const [editSedeAddress, setEditSedeAddress] = useState('');
  const [editSedePhone, setEditSedePhone] = useState('');
  const [editSedePnfs, setEditSedePnfs] = useState<string[]>([]);
  const [editSedeCarsceCoordinator, setEditSedeCarsceCoordinator] = useState('');
  const [editSedePnfCoordinators, setEditSedePnfCoordinators] = useState<Record<string, string>>({});

  const [showAddSedeModal, setShowAddSedeModal] = useState(false);
  const [newSedeName, setNewSedeName] = useState('');
  const [newSedeCode, setNewSedeCode] = useState('');
  const [newSedeCity, setNewSedeCity] = useState('');
  const [newSedeAddress, setNewSedeAddress] = useState('');
  const [newSedePhone, setNewSedePhone] = useState('');
  const [newSedePnfs, setNewSedePnfs] = useState<string[]>(['pnf-info']);
  const [newSedeCarsceCoordinator, setNewSedeCarsceCoordinator] = useState('');
  const [newSedePnfCoordinators, setNewSedePnfCoordinators] = useState<Record<string, string>>({});

  const handleOpenEditSede = (s: Sede) => {
    setEditingSede(s);
    setEditSedeName(s.name);
    setEditSedeCode(s.code);
    setEditSedeCity(s.city);
    setEditSedeAddress(s.address);
    setEditSedePhone(s.phone);
    setEditSedePnfs([...s.pnfIdsOffered]);
    setEditSedeCarsceCoordinator(s.carsceCoordinatorId || '');
    setEditSedePnfCoordinators({ ...(s.pnfCoordinatorsMap || {}) });
  };

  const handleSaveEditSede = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSede) return;

    updateSede(editingSede.id, {
      name: editSedeName,
      code: editSedeCode,
      city: editSedeCity,
      address: editSedeAddress,
      phone: editSedePhone,
      pnfIdsOffered: editSedePnfs,
      carsceCoordinatorId: editSedeCarsceCoordinator,
      pnfCoordinatorsMap: editSedePnfCoordinators,
    });

    if (editSedeCarsceCoordinator) {
      updateUser(editSedeCarsceCoordinator, {
        sedeId: editingSede.id,
        role: 'coordinador_carsce',
      });
    }

    Object.entries(editSedePnfCoordinators).forEach(([pnfId, coordUserId]) => {
      if (coordUserId) {
        updateUser(coordUserId, {
          sedeId: editingSede.id,
          pnfId: pnfId,
          role: 'coordinador_pnf',
        });
      }
    });

    setEditingSede(null);
    alert(`Sede "${editSedeName}" y su oferta académica fueron actualizadas exitosamente.`);
  };

  const handleCreateSede = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSedeCode.trim() || !newSedeName.trim()) return;

    const createdSedeId = `sede-${Date.now()}`;
    addSede({
      name: newSedeName,
      code: newSedeCode.toUpperCase(),
      city: newSedeCity,
      address: newSedeAddress,
      phone: newSedePhone,
      pnfIdsOffered: newSedePnfs,
      carsceCoordinatorId: newSedeCarsceCoordinator,
      pnfCoordinatorsMap: newSedePnfCoordinators,
    });

    if (newSedeCarsceCoordinator) {
      updateUser(newSedeCarsceCoordinator, {
        sedeId: createdSedeId,
        role: 'coordinador_carsce',
      });
    }

    Object.entries(newSedePnfCoordinators).forEach(([pnfId, coordUserId]) => {
      if (coordUserId) {
        updateUser(coordUserId, {
          sedeId: createdSedeId,
          pnfId: pnfId,
          role: 'coordinador_pnf',
        });
      }
    });

    setShowAddSedeModal(false);
    setNewSedeName('');
    setNewSedeCode('');
    setNewSedeCity('');
    setNewSedeAddress('');
    setNewSedePhone('');
    alert(`Nueva sede "${newSedeName}" agregada con éxito a la red universitaria SisCasrce.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              <span>Gestor Curricular de Pensum, Sedes y Año Lectivo</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Administración de oferta académica por sede, periodos (Pregrado, Intensivo, PER) y Google Drive.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('pensum')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'pensum' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pensum & UCs
            </button>
            <button
              onClick={() => setActiveTab('periodos')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                activeTab === 'periodos' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Años Lectivos & PER</span>
            </button>
            <button
              onClick={() => setActiveTab('new_pnf')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'new_pnf' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Nuevo PNF & Color
            </button>
            <button
              onClick={() => setActiveTab('sedes')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'sedes' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4 Sedes & Oferta
            </button>
            <button
              onClick={() => setActiveTab('drive')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                activeTab === 'drive' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Drive (BD Ligera)</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'pensum' && (
        /* PENSUM & CURRICULAR UNITS MANAGER */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <label htmlFor="admin-pensum-select" className="text-xs font-bold text-slate-700">Seleccionar Pensum:</label>
              <select
                id="admin-pensum-select"
                aria-label="Seleccionar Pensum del PNF"
                value={selectedPensumPnf}
                onChange={e => setSelectedPensumPnf(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900"
              >
                {pnfs.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.modality === 'trimestral' ? '3 Tramos' : '2 Tramos'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewPeriodModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Nuevo Año Lectivo</span>
              </button>

              <button
                onClick={() => {
                  setUcPnfId(selectedPensumPnf);
                  setShowAddUcModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Unidad Curricular</span>
              </button>
            </div>
          </div>

          {/* Grid of Curricular Units */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUnits.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                No hay unidades curriculares registradas para este PNF. Haga clic en "Crear Unidad Curricular".
              </div>
            ) : (
              filteredUnits.map(unit => {
                const offeredSedesNames = sedes
                  .filter(s => unit.sedeIds?.includes(s.id))
                  .map(s => s.name.split('-')[0].trim());

                return (
                  <div
                    key={unit.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {unit.code}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Trayecto {unit.trayecto} • Tramo {unit.tramo}
                        </span>
                      </div>
                      {unit.isProject && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Proyecto (PSI)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{unit.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {unit.synopsis}
                    </p>

                    <div className="text-xs text-slate-500 pt-1 flex items-center justify-between">
                      <span>Carga: <strong>{unit.horasAcademicasSemanales}h/sem</strong> ({unit.totalPlannedSessions} sesiones)</span>
                      <span className="text-slate-400">Año Lectivo: {currentPeriod.code}</span>
                    </div>

                    {/* Thematic Units Content Preview */}
                    {unit.unitsContent && unit.unitsContent.length > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          Estructura Temática ({unit.unitsContent.length} Unidades):
                        </span>
                        {unit.unitsContent.map(u => (
                          <div key={u.number} className="text-[11px] text-slate-700 flex justify-between">
                            <span className="truncate"><strong>U-{u.number}:</strong> {u.title}</span>
                            <span className="font-mono text-slate-500 shrink-0 ml-2">{u.hours}h</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sede Offering */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-600">Ofertada en Sedes:</span>
                      {offeredSedesNames.length > 0 ? (
                        offeredSedesNames.map((sName, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200"
                          >
                            {sName}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400">Todas las sedes del PNF</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'periodos' && (
        /* AÑOS LECTIVOS & PERIODS MANAGER (PREGRADO, INTENSIVO, PER) */
        <div className="space-y-6">
          {/* Institutional Banner about Periods and PER */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 border border-blue-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </span>
                  <h2 className="text-base font-black text-slate-900">
                    Estructura de Años Lectivos y Períodos Académicos SisCasrce
                  </h2>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  Cada <strong>Año Lectivo</strong> comprende tres modalidades de períodos que dependen de la época del calendario y del avance de calificaciones: 
                  <strong> Pregrado Regular</strong> (semestral/trimestral), <strong>Intensivo</strong> (avance vacacional) y el 
                  <strong> Plan Especial de Recuperación (PER)</strong>. El PER se activa tras el <strong>cierre oficial de notas ordinarias</strong> para dar a los estudiantes la oportunidad formal de recuperar unidades curriculares reprobadas.
                </p>
              </div>

              <button
                onClick={() => setShowNewPeriodModal(true)}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Aperturar Nuevo Período</span>
              </button>
            </div>
          </div>

          {/* Academic Years & Associated Periods */}
          {Array.from(new Set(periods.map(p => p.year)))
            .sort((a, b) => b - a)
            .map(year => {
              const yearPeriods = periods.filter(p => p.year === year);
              const regularPeriod = yearPeriods.find(p => p.type === 'Pregrado_Regular');
              const perPeriod = yearPeriods.find(p => p.type === 'PER');
              const intPeriod = yearPeriods.find(p => p.type === 'Intensivo');
              const regularClosed = regularPeriod?.notesClosingStatus === 'Culminada';

              return (
                <div
                  key={year}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-black px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                        Año Lectivo {year}
                      </span>
                      {yearPeriods.some(p => p.isCurrent) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Año Lectivo en Curso
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500">
                      Total períodos programados: <strong className="text-slate-800">{yearPeriods.length}</strong>
                    </div>
                  </div>

                  {/* 3 Canonical Periods Cards for the Year */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. Pregrado Regular */}
                    <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                            1. Pregrado Regular
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-700">
                            {regularPeriod?.code || `${year}-I`}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">
                          {regularPeriod?.name || `Año Lectivo ${year} - Régimen Ordinario`}
                        </h3>

                        <div className="text-xs space-y-1 text-slate-600">
                          <div>
                            <strong>Época del Año:</strong>{' '}
                            <span>{regularPeriod?.season || 'Febrero - Junio / Septiembre - Enero'}</span>
                          </div>
                          <div>
                            <strong>Fechas:</strong>{' '}
                            <span className="font-mono text-[11px]">
                              {regularPeriod?.startDate} al {regularPeriod?.endDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-slate-500">Carga de Notas:</span>
                            {regularClosed ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Culminada y Cerrada
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                En Carga de Notas
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {regularPeriod && !regularClosed && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Confirmar cierre de carga de notas ordinarias del período ${regularPeriod.code}? Esto habilitará formalmente el PER para los estudiantes reprobados.`)) {
                              closeRegularPeriodNotes(regularPeriod.id);
                            }
                          }}
                          className="w-full mt-2 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                        >
                          Cerrar Carga de Notas (Habilita PER)
                        </button>
                      )}
                      {regularPeriod && regularClosed && (
                        <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-center">
                          ✓ Notas cerradas. PER habilitado para recuperación.
                        </div>
                      )}
                    </div>

                    {/* 2. Intensivo Vacacional */}
                    <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
                            2. Período Intensivo
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-700">
                            {intPeriod?.code || `${year}-INT`}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">
                          {intPeriod?.name || `Intensivo de Avance Académico ${year}`}
                        </h3>

                        <div className="text-xs space-y-1 text-slate-600">
                          <div>
                            <strong>Época del Año:</strong>{' '}
                            <span>{intPeriod?.season || 'Vacacional Intersemestral (Agosto - Septiembre)'}</span>
                          </div>
                          <div>
                            <strong>Fechas:</strong>{' '}
                            <span className="font-mono text-[11px]">
                              {intPeriod?.startDate || `${year}-08-01`} al {intPeriod?.endDate || `${year}-09-15`}
                            </span>
                          </div>
                          <div>
                            <strong>Objetivo:</strong>{' '}
                            <span>Nivelación rápida y adelanto de unidades curriculares en período vacacional.</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                        Estado: <strong className="text-slate-800">{intPeriod?.status || 'Planificación'}</strong>
                      </div>
                    </div>

                    {/* 3. Plan Especial de Recuperación (PER) */}
                    <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                            3. PER (Recuperación)
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-700">
                            {perPeriod?.code || `${year}-PER`}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">
                          {perPeriod?.name || `Plan Especial de Recuperación (${year})`}
                        </h3>

                        <div className="text-xs space-y-1 text-slate-600">
                          <div>
                            <strong>Época del Año:</strong>{' '}
                            <span>{perPeriod?.season || 'Ventana Extraordinaria (Julio - Agosto / Noviembre)'}</span>
                          </div>
                          <div>
                            <strong>Fechas:</strong>{' '}
                            <span className="font-mono text-[11px]">
                              {perPeriod?.startDate || `${year}-07-06`} al {perPeriod?.endDate || `${year}-07-31`}
                            </span>
                          </div>
                          <div className="pt-1">
                            <strong>Condición de Apertura:</strong>{' '}
                            <span className="text-amber-900 font-medium">
                              Sujeto al cierre de notas de pregrado regular.
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          {regularClosed || perPeriod?.perRegistrationOpen ? (
                            <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-bold">
                              ✓ Convocatoria PER Abierta ({perRecoveries.length} postulaciones registradas)
                            </div>
                          ) : (
                            <div className="p-2 bg-amber-100/70 border border-amber-300 rounded-lg text-amber-900 text-xs font-semibold">
                              ⏳ En Espera: Se activará al culminar la carga de notas del período regular.
                            </div>
                          )}
                        </div>
                      </div>

                      {perPeriod && (
                        <button
                          onClick={() => {
                            updateAcademicPeriod(perPeriod.id, {
                              perRegistrationOpen: !perPeriod.perRegistrationOpen,
                              status: perPeriod.perRegistrationOpen ? 'Planificación' : 'En_Curso',
                            });
                          }}
                          className="w-full mt-2 py-1.5 px-3 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                        >
                          {perPeriod.perRegistrationOpen
                            ? 'Suspender Inscripciones PER'
                            : 'Habilitar Convocatoria PER Inmediata'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Centralized Census of Students in PER */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Censo de Estudiantes en el Plan Especial de Recuperación (PER)
                </h3>
                <p className="text-xs text-slate-500">
                  Seguimiento en tiempo real de postulaciones, evaluaciones y convalidaciones en el Récord Académico.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-300">
                {perRecoveries.length} Unidades en PER
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3">Estudiante</th>
                    <th className="py-2.5 px-3">Cédula</th>
                    <th className="py-2.5 px-3">Unidad Curricular</th>
                    <th className="py-2.5 px-3 text-center">Período Origen</th>
                    <th className="py-2.5 px-3 text-center">Nota Previa</th>
                    <th className="py-2.5 px-3 text-center">Nota en PER</th>
                    <th className="py-2.5 px-3 text-center">Estado PER</th>
                    <th className="py-2.5 px-3">Observación Consejo Docente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {perRecoveries.map(rec => {
                    const st = users.find(u => u.id === rec.studentId);
                    const uc = curricularUnits.find(u => u.id === rec.curricularUnitId);

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{st?.name || 'Estudiante'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{st?.cedula || 'N/A'}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-blue-700">{uc?.code}</span> • {uc?.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{rec.originalPeriodCode}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-rose-600 font-mono">
                          {rec.originalScore}/20
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono">
                          {rec.recoveryScore !== undefined ? (
                            <span className={rec.recoveryScore >= 12 ? 'text-emerald-700 font-black' : 'text-rose-600'}>
                              {rec.recoveryScore}/20
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
                              Postulado / Inscrito
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              {rec.recoveryStatus}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-600 italic max-w-xs truncate" title={rec.teacherObservation}>
                          {rec.teacherObservation || 'Sin observaciones registradas'}
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

      {activeTab === 'new_pnf' && (
        /* CONFIGURE NEW PNF WITH COLOR & SEDES */
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-4">
            <Plus className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Crear y Configurar un Nuevo Programa Nacional de Formación (PNF)
              </h2>
              <p className="text-xs text-slate-500">
                Defina código, modalidad de tramos, oferta por sede y su color característico.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreatePnf} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Código Oficial del PNF *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. PNF-CONTA, PNF-ELEC"
                  value={newPnfCode}
                  onChange={e => setNewPnfCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nombre Completo del PNF *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. PNF en Contaduría Pública"
                  value={newPnfName}
                  onChange={e => setNewPnfName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Modalidad Académica de Tramos *
                </label>
                <select
                  value={newPnfModality}
                  onChange={e => setNewPnfModality(e.target.value as 'trimestral' | 'semestral')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                >
                  <option value="trimestral">Trimestral (3 Tramos por Trayecto)</option>
                  <option value="semestral">Semestral (2 Tramos por Trayecto)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Color Característico del PNF *
                </label>
                <select
                  value={newPnfColor}
                  onChange={e => setNewPnfColor(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                >
                  <option value="emerald">Verde Claro (ej. Medicina Veterinaria)</option>
                  <option value="slate">Gris Claro (ej. Nutrición y Dietética)</option>
                  <option value="blue">Azul (ej. Informática)</option>
                  <option value="amber">Verde y Marrón Claro (ej. Agroalimentación)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Descripción y Perfil de Egreso
              </label>
              <textarea
                rows={2}
                placeholder="Perfil del profesional formado, áreas de inserción comunitaria..."
                value={newPnfDesc}
                onChange={e => setNewPnfDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
              ></textarea>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Sedes Donde se Ofertará el PNF *
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {sedes.map(s => (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer text-slate-800">
                    <input
                      type="checkbox"
                      checked={newPnfSedes.includes(s.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setNewPnfSedes([...newPnfSedes, s.id]);
                        } else {
                          setNewPnfSedes(newPnfSedes.filter(id => id !== s.id));
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-[11px] font-medium">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
              >
                Guardar y Activar Nuevo PNF
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'sedes' && (
        /* SEDES WITH COMPLETE ACADEMIC OFFERING & COORDINATOR CONFIG */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Red de Sedes & Oferta Académica Interconectada ({sedes.length} Sedes)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervisión de cada campus, control de estudio por sede y coordinadores de PNF asignados según la oferta académica.
              </p>
            </div>
            <button
              onClick={() => setShowAddSedeModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Registrar Nueva Sede</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {sedes.map(s => {
              const pnfsOffered = pnfs.filter(p => s.pnfIdsOffered.includes(p.id));
              const carsceCoordinator = users.find(
                u => u.id === s.carsceCoordinatorId || (u.role === 'coordinador_carsce' && u.sedeId === s.id)
              );
              const sedeSections = sections.filter(sec => sec.sedeId === s.id);
              const sedeEnrollmentsCount = enrollments.filter(e => {
                const sec = sections.find(sc => sc.id === e.sectionId);
                return sec?.sedeId === s.id;
              }).length;

              return (
                <div
                  key={s.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header info */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                            {s.code}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {s.city}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1.5">{s.name}</h3>
                      </div>

                      <button
                        onClick={() => handleOpenEditSede(s)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
                        title="Editar nombre, dirección u oferta de PNFs de esta sede"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Editar Sede</span>
                      </button>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                      <p className="flex items-start gap-2">
                        <strong className="text-slate-700 shrink-0">Dirección:</strong>
                        <span>{s.address}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <strong className="text-slate-700 shrink-0">Contacto:</strong>
                        <span className="font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {s.phone}
                        </span>
                      </p>
                    </div>

                    {/* Sede Control de Estudio Coordinator */}
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider">
                          Coordinador(a) de Control de Estudio (CARSCE)
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                          Sede {s.code}
                        </span>
                      </div>

                      {carsceCoordinator ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={carsceCoordinator.avatar}
                            alt={carsceCoordinator.name}
                            className="w-10 h-10 rounded-lg object-cover ring-1 ring-emerald-300 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {carsceCoordinator.name}
                            </p>
                            <p className="text-[11px] text-slate-600 truncate">
                              {carsceCoordinator.title || 'Coordinador de Control de Estudio'}
                            </p>
                            <p className="text-[10px] text-emerald-800 font-mono mt-0.5">
                              {carsceCoordinator.cedula} • {carsceCoordinator.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-amber-700 font-medium py-1">
                          ⚠️ Sin coordinador de Control de Estudio asignado para esta sede.
                        </div>
                      )}
                    </div>

                    {/* Academic Offering and Linked PNF Coordinators */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Oferta Académica & Coordinadores de PNF ({pnfsOffered.length} programas):
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Ligados a la sede
                        </span>
                      </div>

                      {pnfsOffered.length === 0 ? (
                        <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
                          Esta sede no tiene programas formativos asignados actualmente.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {pnfsOffered.map(p => {
                            const pnfCoordId =
                              s.pnfCoordinatorsMap?.[p.id] ||
                              users.find(
                                u => u.role === 'coordinador_pnf' && u.sedeId === s.id && u.pnfId === p.id
                              )?.id ||
                              p.coordinatorId;
                            const pnfCoordinator = users.find(u => u.id === pnfCoordId);

                            return (
                              <div
                                key={p.id}
                                className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg p-2.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <PnfBadge pnf={p} size="sm" />
                                  <span className="text-xs font-bold text-slate-800 truncate">
                                    {p.name}
                                  </span>
                                </div>

                                <div className="text-[11px] text-slate-600 flex items-center gap-2 pl-2 border-l border-slate-200">
                                  {pnfCoordinator ? (
                                    <>
                                      <img
                                        src={pnfCoordinator.avatar}
                                        alt={pnfCoordinator.name}
                                        className="w-5 h-5 rounded-full object-cover shrink-0"
                                      />
                                      <div className="truncate">
                                        <span className="font-semibold text-slate-900 block truncate">
                                          {pnfCoordinator.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                          {pnfCoordinator.cedula}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-amber-700 italic text-[10px]">
                                      Pendiente por asignar
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sede Footer stats */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>
                        Secciones activas: <strong className="text-slate-800">{sedeSections.length}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Matrícula en curso: <strong className="text-slate-800">{sedeEnrollmentsCount}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEditSede(s)}
                      className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                    >
                      Configurar oferta →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'drive' && (
        /* GOOGLE DRIVE CONFIG (LIGHT DATABASE FOOTPRINT) */
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <HardDrive className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Configuración del Repositorio Google Drive (Almacenamiento Ligero)
              </h2>
              <p className="text-xs text-slate-500">
                La base de datos solo almacena texto y metadatos. Las imágenes se envían a Drive para optimizar recursos en nube.
              </p>
            </div>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              updateDriveStorage({
                institutionalDriveEmail: driveEmail,
                driveFolderId: driveFolder,
              });
              alert('Parámetros de Google Drive actualizados.');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Correo Institucional Google Drive para Recaudos *
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
                ID de Carpeta Raíz de Expedientes en Google Drive *
              </label>
              <input
                type="text"
                required
                value={driveFolder}
                onChange={e => setDriveFolder(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
              />
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 space-y-1">
              <strong className="block">Ahorro y Eficiencia Confirmada:</strong>
              <p className="text-[11px] leading-relaxed">
                Cada preinscripción consume menos de 1 KB en la base de datos local gracias al guardado exclusivo de URLs de Google Drive.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
            >
              Guardar Configuración de Drive
            </button>
          </form>
        </div>
      )}

      {/* Modal: Crear Unidad Curricular con Contenidos y Sede */}
      {showAddUcModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Crear Unidad Curricular & Pensum de Estudio</span>
            </h3>

            <form onSubmit={handleCreateCurricularUnit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  PNF de Destino *
                </label>
                <select
                  value={ucPnfId}
                  onChange={e => setUcPnfId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                >
                  {pnfs.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Código de la UC *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. INF-211, VET-122"
                    value={ucCode}
                    onChange={e => setUcCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nombre de la Unidad Curricular *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Redes y Telecomunicaciones"
                    value={ucName}
                    onChange={e => setUcName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Trayecto *
                  </label>
                  <select
                    value={ucTrayecto}
                    onChange={e => setUcTrayecto(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                  >
                    <option value={0}>Trayecto Inicial</option>
                    <option value={1}>Trayecto I</option>
                    <option value={2}>Trayecto II</option>
                    <option value={3}>Trayecto III</option>
                    <option value={4}>Trayecto IV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tramo *
                  </label>
                  <select
                    value={ucTramo}
                    onChange={e => setUcTramo(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                  >
                    <option value={1}>Tramo 1</option>
                    <option value={2}>Tramo 2</option>
                    <option value={3}>Tramo 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Horas Semanales *
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="12"
                    required
                    value={ucHours}
                    onChange={e => setUcHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={ucIsProject}
                    onChange={e => setUcIsProject(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>¿Es Proyecto Sociointegrador (PSI)? (Mínimo aprobatorio 16 pts)</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Sinopsis / Contenidos Sintéticos
                </label>
                <textarea
                  rows={2}
                  placeholder="Resumen del pensum y competencias esperadas..."
                  value={ucSynopsis}
                  onChange={e => setUcSynopsis(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Ofertar en las Siguientes Sedes:
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {sedes.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer text-slate-800">
                      <input
                        type="checkbox"
                        checked={ucSelectedSedes.includes(s.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setUcSelectedSedes([...ucSelectedSedes, s.id]);
                          } else {
                            setUcSelectedSedes(ucSelectedSedes.filter(id => id !== s.id));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span className="text-[11px] font-medium">{s.name.split('-')[0]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUcModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Crear e Incorporar al Pensum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear Nuevo Periodo Académico */}
      {showNewPeriodModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Aperturar Nuevo Año Lectivo / Periodo</span>
            </h3>

            <form onSubmit={handleCreatePeriod} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Código del Periodo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="2027-I"
                  value={newPeriodCode}
                  onChange={e => setNewPeriodCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nombre Oficial del Periodo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Año Lectivo 2027 - Trayecto I / Tramo I"
                  value={newPeriodName}
                  onChange={e => setNewPeriodName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Tipo de Periodo Lectivo *
                </label>
                <select
                  value={newPeriodType}
                  onChange={e => setNewPeriodType(e.target.value as PeriodType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                >
                  <option value="Pregrado_Regular">Pregrado Regular (Periodo Lectivo Ordinario)</option>
                  <option value="PER">PER (Plan Especial de Recuperación de Unidades)</option>
                  <option value="Intensivo">Periodo Intensivo (Avance Vacacional)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  * El PER depende del cierre de notas ordinario para permitir recuperar materias reprobadas.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Época del Año / Calendario *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Primer Semestre (Feb-Jun), Vacacional (Ago-Sep), Extraordinario (Jul-Ago)"
                  value={newPeriodSeason}
                  onChange={e => setNewPeriodSeason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    required
                    value={newPeriodStart}
                    onChange={e => setNewPeriodStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Fecha de Culminación *
                  </label>
                  <input
                    type="date"
                    required
                    value={newPeriodEnd}
                    onChange={e => setNewPeriodEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Año Calendario *
                </label>
                <input
                  type="number"
                  min="2025"
                  max="2035"
                  required
                  value={newPeriodYear}
                  onChange={e => setNewPeriodYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPeriodModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Activar Año Lectivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR SEDE & OFERTA ACADÉMICA */}
      {editingSede && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Editar Sede & Oferta Académica ({editingSede.code})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modifique datos de la sede, programas ofertados y coordinadores asignados.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingSede(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSede} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nombre Oficial de la Sede *
                  </label>
                  <input
                    type="text"
                    required
                    value={editSedeName}
                    onChange={e => setEditSedeName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                    placeholder="Ej. Sede Central - Campus Universitario"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Código Institucional *
                  </label>
                  <input
                    type="text"
                    required
                    value={editSedeCode}
                    onChange={e => setEditSedeCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold"
                    placeholder="Ej. SED-01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Ciudad / Entidad Federal *
                  </label>
                  <input
                    type="text"
                    required
                    value={editSedeCity}
                    onChange={e => setEditSedeCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                    placeholder="Ej. Caracas / Distrito Capital"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={editSedePhone}
                    onChange={e => setEditSedePhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                    placeholder="Ej. +58 212 555-0101"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Dirección Física de la Sede *
                </label>
                <input
                  type="text"
                  required
                  value={editSedeAddress}
                  onChange={e => setEditSedeAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  placeholder="Av., sector, municipio y punto de referencia"
                />
              </div>

              {/* Coordinador de Control de Estudio de la Sede */}
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
                <label className="block text-emerald-950 font-bold">
                  Coordinador(a) de Control de Estudio (CARSCE) para esta Sede *
                </label>
                <p className="text-[11px] text-emerald-800">
                  Responsable en esta sede para emisión de actas, récord académico y atención estudiantil.
                </p>
                <select
                  value={editSedeCarsceCoordinator}
                  onChange={e => setEditSedeCarsceCoordinator(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg p-2 text-slate-900 font-medium"
                >
                  <option value="">-- Seleccionar Coordinador(a) de Control de Estudio --</option>
                  {users
                    .filter(
                      u =>
                        u.role === 'coordinador_carsce' ||
                        u.role === 'asistente_carsce' ||
                        u.role === 'administrador'
                    )
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.cedula}) - {u.title}
                      </option>
                    ))}
                </select>
              </div>

              {/* Oferta Académica y Coordinadores de PNF por Sede */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-slate-900 font-bold text-xs">
                    Oferta Académica & Coordinadores de PNF en esta Sede:
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Active los PNF ofertados en esta sede y asigne el Coordinador de PNF correspondiente para cada oferta.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {pnfs.map(p => {
                    const isOffered = editSedePnfs.includes(p.id);
                    const currentCoordForThisPnf =
                      editSedePnfCoordinators[p.id] ||
                      editingSede.pnfCoordinatorsMap?.[p.id] ||
                      users.find(
                        u =>
                          u.role === 'coordinador_pnf' &&
                          u.sedeId === editingSede.id &&
                          u.pnfId === p.id
                      )?.id ||
                      p.coordinatorId;

                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border transition ${
                          isOffered
                            ? 'bg-blue-50/50 border-blue-200'
                            : 'bg-slate-50 border-slate-200 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isOffered}
                              onChange={e => {
                                if (e.target.checked) {
                                  setEditSedePnfs(prev => [...prev, p.id]);
                                  if (!editSedePnfCoordinators[p.id]) {
                                    setEditSedePnfCoordinators(prev => ({
                                      ...prev,
                                      [p.id]: currentCoordForThisPnf || p.coordinatorId,
                                    }));
                                  }
                                } else {
                                  setEditSedePnfs(prev => prev.filter(id => id !== p.id));
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <PnfBadge pnf={p} size="sm" />
                            <span className="font-bold text-slate-900">{p.name}</span>
                          </label>

                          <span className="text-[10px] text-slate-500">
                            {isOffered ? '✓ Ofertado en Sede' : 'No ofertado'}
                          </span>
                        </div>

                        {isOffered && (
                          <div className="mt-2.5 pt-2 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center gap-2">
                            <label className="text-[11px] font-bold text-slate-700 shrink-0">
                              Coordinador(a) del PNF en esta Sede:
                            </label>
                            <select
                              value={editSedePnfCoordinators[p.id] || currentCoordForThisPnf || ''}
                              onChange={e => {
                                const selectedUserId = e.target.value;
                                setEditSedePnfCoordinators(prev => ({
                                  ...prev,
                                  [p.id]: selectedUserId,
                                }));
                              }}
                              className="flex-1 bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 font-medium"
                            >
                              <option value="">-- Asignar Coordinador(a) de PNF --</option>
                              {users
                                .filter(
                                  u =>
                                    u.role === 'coordinador_pnf' ||
                                    u.role === 'profesor' ||
                                    u.role === 'asistente_pnf' ||
                                    u.role === 'administrador'
                                )
                                .map(u => (
                                  <option key={u.id} value={u.id}>
                                    {u.name} ({u.cedula}) - {u.title}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSede(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Guardar Cambios de la Sede
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NUEVA SEDE */}
      {showAddSedeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Registrar Nueva Sede / Núcleo Universitario
                  </h3>
                  <p className="text-xs text-slate-500">
                    Incorpore un campus territorial a la red académica SisCasrce.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSedeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSede} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nombre de la Nueva Sede *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSedeName}
                    onChange={e => setNewSedeName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                    placeholder="Ej. Núcleo Altos Mirandinos"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Código Institucional *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSedeCode}
                    onChange={e => setNewSedeCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold"
                    placeholder="Ej. SED-05"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Ciudad / Entidad Federal *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSedeCity}
                    onChange={e => setNewSedeCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                    placeholder="Ej. Los Teques / Miranda"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Teléfono Institucional
                  </label>
                  <input
                    type="text"
                    value={newSedePhone}
                    onChange={e => setNewSedePhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                    placeholder="Ej. +58 212 555-0505"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Dirección Física Completa *
                </label>
                <input
                  type="text"
                  required
                  value={newSedeAddress}
                  onChange={e => setNewSedeAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  placeholder="Av., sector, módulo o campus"
                />
              </div>

              {/* Coordinador de Control de Estudio de la nueva sede */}
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
                <label className="block text-emerald-950 font-bold">
                  Designar Coordinador(a) de Control de Estudio (CARSCE)
                </label>
                <select
                  value={newSedeCarsceCoordinator}
                  onChange={e => setNewSedeCarsceCoordinator(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-lg p-2 text-slate-900 font-medium"
                >
                  <option value="">-- Seleccionar o dejar pendiente --</option>
                  {users
                    .filter(
                      u =>
                        u.role === 'coordinador_carsce' ||
                        u.role === 'asistente_carsce' ||
                        u.role === 'administrador'
                    )
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.cedula}) - {u.title}
                      </option>
                    ))}
                </select>
              </div>

              {/* Oferta Inicial de PNFs */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <label className="block text-slate-900 font-bold text-xs">
                  Oferta Académica Inicial de la Sede:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {pnfs.map(p => {
                    const isOffered = newSedePnfs.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between ${
                          isOffered ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isOffered}
                            onChange={e => {
                              if (e.target.checked) {
                                setNewSedePnfs(prev => [...prev, p.id]);
                              } else {
                                setNewSedePnfs(prev => prev.filter(id => id !== p.id));
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <PnfBadge pnf={p} size="sm" />
                          <span className="font-bold text-slate-900">{p.name}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddSedeModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Crear Sede
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
