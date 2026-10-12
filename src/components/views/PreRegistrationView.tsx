import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { PreRegistration } from '../../types/academic';
import { PnfBadge } from '../common/PnfBadge';
import {
  ClipboardList,
  CheckCircle,
  FileText,
  UserPlus,
  Search,
  Check,
  Building2,
  HardDrive,
  ExternalLink,
  MapPin,
  Clock,
} from 'lucide-react';

export const PreRegistrationView: React.FC = () => {
  const {
    preRegistrations,
    pnfs,
    sedes,
    sections,
    curricularUnits,
    driveStorage,
    submitPreRegistration,
    reviewPreRegistration,
    formalizeEnrollment,
  } = useAcademic();

  const [activeSubTab, setActiveSubTab] = useState<'form' | 'admin'>('form');

  // Form State
  const [formData, setFormData] = useState({
    cedula: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    pnfId: pnfs[0]?.id || 'pnf-info',
    sedeId: sedes[0]?.id || 'sede-central',
    birthDate: '',
    highSchool: '',
    graduationYear: 2024,
    address: '',
    shiftPreference: 'Diurno' as 'Diurno' | 'Vespertino' | 'Nocturno',
    cedulaCopy: true,
    titleCopy: true,
    gradesCertificate: true,
    photo: true,
  });

  const [successSubmission, setSuccessSubmission] = useState<PreRegistration | null>(null);

  // Admin review state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreRegForReview, setSelectedPreRegForReview] = useState<PreRegistration | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignSectionId, setAssignSectionId] = useState<string>('');

  const selectedPnfObj = pnfs.find(p => p.id === formData.pnfId);
  const sedesForSelectedPnf = sedes.filter(s => selectedPnfObj?.sedeIds.includes(s.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const created = submitPreRegistration({
      cedula: formData.cedula,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      pnfId: formData.pnfId,
      sedeId: formData.sedeId,
      birthDate: formData.birthDate,
      highSchool: formData.highSchool,
      graduationYear: Number(formData.graduationYear),
      address: formData.address,
      shiftPreference: formData.shiftPreference,
      documents: {
        cedulaCopy: formData.cedulaCopy,
        cedulaDriveLink: `https://drive.google.com/open?id=DRIVE_${formData.cedula.replace(/[^0-9]/g, '')}_CED`,
        titleCopy: formData.titleCopy,
        titleDriveLink: `https://drive.google.com/open?id=DRIVE_${formData.cedula.replace(/[^0-9]/g, '')}_TIT`,
        gradesCertificate: formData.gradesCertificate,
        gradesDriveLink: `https://drive.google.com/open?id=DRIVE_${formData.cedula.replace(/[^0-9]/g, '')}_NOT`,
        photo: formData.photo,
        photoDriveLink: `https://drive.google.com/open?id=DRIVE_${formData.cedula.replace(/[^0-9]/g, '')}_FOT`,
      },
    });

    setSuccessSubmission(created);
  };

  const filteredPreRegistrations = preRegistrations.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.firstName.toLowerCase().includes(q) ||
        item.lastName.toLowerCase().includes(q) ||
        item.cedula.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleFormalize = () => {
    if (!selectedPreRegForReview) return;
    if (!assignSectionId) {
      alert('Por favor seleccione una sección académica para formalizar.');
      return;
    }

    formalizeEnrollment(selectedPreRegForReview.id, assignSectionId);
    setSelectedPreRegForReview(null);
    alert('Aspirante formalizado como Estudiante Activo en el sistema.');
  };

  return (
    <div className="space-y-6">
      {/* View Switcher Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Admisión y Preinscripción Digital
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-emerald-600" />
                Drive Enlazado ({driveStorage.institutionalDriveEmail})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Preinscripción Online & Gestión de Expedientes Ligeros
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              La base de datos almacena metadatos y enlaces seguros a Google Drive para evitar sobrecostos en almacenamiento en la nube.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('form')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeSubTab === 'form' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Formulario de Aspirante
            </button>
            <button
              onClick={() => setActiveSubTab('admin')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeSubTab === 'admin' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bandeja CARSCE ({preRegistrations.length})
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'form' ? (
        /* APPLICANT ONLINE FORM */
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          {successSubmission ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                ¡Solicitud de Preinscripción Consignada Exitosamente!
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Su expediente virtual ha sido indexado en Google Drive ({driveStorage.institutionalDriveEmail}) con el folio:{' '}
                <strong className="text-blue-700 font-mono">{successSubmission.id}</strong>.
              </p>

              <div className="p-4 bg-slate-50 rounded-lg text-xs text-left max-w-md mx-auto space-y-1.5 border border-slate-200">
                <div><strong>Aspirante:</strong> {successSubmission.firstName} {successSubmission.lastName}</div>
                <div><strong>Cédula:</strong> {successSubmission.cedula}</div>
                <div>
                  <strong>PNF:</strong>{' '}
                  <PnfBadge pnf={pnfs.find(p => p.id === successSubmission.pnfId)} size="sm" />
                </div>
                <div><strong>Sede Asignada:</strong> {sedes.find(s => s.id === successSubmission.sedeId)?.name}</div>
                <div>
                  <strong>Estatus:</strong> <span className="text-amber-700 font-bold">Pendiente de Verificación Taquilla</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSuccessSubmission(null);
                  setActiveSubTab('admin');
                }}
                className="mt-4 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Ver en Bandeja de Control de Estudio (CARSCE)
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900">
                  1. Datos de Identificación del Aspirante
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Cédula de Identidad *</label>
                  <input
                    type="text"
                    required
                    placeholder="V-31.554.900"
                    value={formData.cedula}
                    onChange={e => setFormData({ ...formData, cedula: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    placeholder="Carlos Eduardo"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rivas Méndez"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="aspirante@gmail.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Teléfono Móvil *</label>
                  <input
                    type="text"
                    required
                    placeholder="+58 412 1234567"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="border-b border-slate-100 pb-2.5 pt-2">
                <h3 className="text-sm font-bold text-slate-900">
                  2. Elección de PNF y Sede Universitaria
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Programa Nacional de Formación (PNF) *
                  </label>
                  <select
                    value={formData.pnfId}
                    onChange={e => {
                      const newPnfId = e.target.value;
                      const p = pnfs.find(item => item.id === newPnfId);
                      setFormData({
                        ...formData,
                        pnfId: newPnfId,
                        sedeId: p?.sedeIds[0] || formData.sedeId,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                  >
                    {pnfs.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.modality === 'trimestral' ? '3 Tramos' : '2 Tramos'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Sede Universitaria Ofertada *
                  </label>
                  <select
                    value={formData.sedeId}
                    onChange={e => setFormData({ ...formData, sedeId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                  >
                    {sedesForSelectedPnf.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-b border-slate-100 pb-2.5 pt-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span>3. Documentos a Consignar (Google Drive Ligero)</span>
                  <span className="text-[11px] font-normal text-emerald-700">
                    Sincronización a: {driveStorage.institutionalDriveEmail}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cedulaCopy}
                    onChange={e => setFormData({ ...formData, cedulaCopy: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span className="font-semibold text-slate-800">Copia Cédula</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.titleCopy}
                    onChange={e => setFormData({ ...formData, titleCopy: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span className="font-semibold text-slate-800">Título Bachiller</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.gradesCertificate}
                    onChange={e => setFormData({ ...formData, gradesCertificate: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span className="font-semibold text-slate-800">Notas Certificadas</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.photo}
                    onChange={e => setFormData({ ...formData, photo: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span className="font-semibold text-slate-800">Foto Carnet</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Enviar Preinscripción Online
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* CARSCE REVIEW TABLE */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filtrar Estado:</span>
              <div className="flex gap-1">
                {['all', 'Pendiente', 'Aprobada', 'Observada', 'Formalizada'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                      filterStatus === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'all' ? 'Todos' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por cédula o nombre..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="py-3 px-4">Aspirante / Cédula</th>
                  <th className="py-3 px-3">PNF Ofertado</th>
                  <th className="py-3 px-3">Sede</th>
                  <th className="py-3 px-3 text-center">Google Drive Recaudos</th>
                  <th className="py-3 px-3 text-center">Estatus</th>
                  <th className="py-3 px-4 text-center">Acciones CARSCE</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPreRegistrations.map(pr => {
                  const pnf = pnfs.find(p => p.id === pr.pnfId);
                  const sede = sedes.find(s => s.id === pr.sedeId);

                  return (
                    <tr key={pr.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{pr.firstName} {pr.lastName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{pr.cedula}</div>
                      </td>

                      <td className="py-3 px-3">
                        <PnfBadge pnf={pnf} size="sm" showModality={false} />
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800">{sede?.name.split('-')[0]}</span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <HardDrive className="w-3 h-3" />
                          <span>4 Metadatos TXT</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            pr.status === 'Formalizada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pr.status === 'Aprobada'
                              ? 'bg-blue-100 text-blue-800'
                              : pr.status === 'Observada'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {pr.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedPreRegForReview(pr);
                            setReviewNotes(pr.reviewNotes || '');
                            const sec = sections.find(s => s.pnfId === pr.pnfId);
                            setAssignSectionId(sec?.id || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300"
                        >
                          Formalizar / Revisar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedPreRegForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Revisión de Recaudos y Formalización</span>
              </h3>
              <button
                onClick={() => setSelectedPreRegForReview(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div><strong>Aspirante:</strong> {selectedPreRegForReview.firstName} {selectedPreRegForReview.lastName}</div>
              <div><strong>Cédula:</strong> {selectedPreRegForReview.cedula}</div>
              <div>
                <strong>PNF Solicitado:</strong>{' '}
                <PnfBadge pnf={pnfs.find(p => p.id === selectedPreRegForReview.pnfId)} size="sm" />
              </div>
              <div className="text-[11px] text-emerald-800 font-mono pt-1">
                Drive ID: {selectedPreRegForReview.documents.cedulaDriveLink}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Asignar Sección Académica para Formalizar:
              </label>
              <select
                value={assignSectionId}
                onChange={e => setAssignSectionId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
              >
                <option value="">-- Seleccionar Sección --</option>
                {sections
                  .filter(s => s.pnfId === selectedPreRegForReview.pnfId)
                  .map(s => {
                    const uc = curricularUnits.find(u => u.id === s.curricularUnitId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.code} - {uc?.name}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  reviewPreRegistration(selectedPreRegForReview.id, 'Aprobada', reviewNotes);
                  setSelectedPreRegForReview(null);
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
              >
                Aprobar Recaudos
              </button>
              <button
                onClick={handleFormalize}
                disabled={!assignSectionId}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-lg"
              >
                Formalizar Inscripción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
