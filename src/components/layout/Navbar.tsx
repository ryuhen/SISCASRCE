import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { UserRole } from '../../types/academic';
import {
  Bell,
  CheckCircle,
  GraduationCap,
  ShieldAlert,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Building,
  HardDrive,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setActiveTab }) => {
  const {
    currentUser,
    switchUserById,
    users,
    periods,
    currentPeriod,
    setCurrentPeriodId,
    sedes,
    driveStorage,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    resetAllData,
  } = useAcademic();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter notifications for this user / role
  const userNotifications = notifications.filter(n => {
    if (n.targetUserId && n.targetUserId === currentUser.id) return true;
    if (n.targetRole && n.targetRole === currentUser.role) return true;
    if (!n.targetUserId && !n.targetRole) return true;
    return false;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'administrador':
        return { label: 'Director de CASRCE (Administrador)', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'coordinador_carsce':
        return { label: 'Coord. Control de Estudio de Sede', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'asistente_carsce':
        return { label: 'Asistente Control de Estudio', bg: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'coordinador_pnf':
        return { label: 'Coordinador de PNF', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'asistente_pnf':
        return { label: 'Asistente PNF', bg: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'profesor':
        return { label: 'Docente Titular', bg: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'asistente_docente':
        return { label: 'Asistente Docente / Preparador', bg: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'estudiante':
        return { label: 'Estudiante PNF', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      default:
        return { label: 'Usuario', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const currentRoleBadge = getRoleBadge(currentUser.role);
  const userSede = sedes.find(s => s.id === currentUser.sedeId);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & University Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20 ring-2 ring-blue-100">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 bg-clip-text text-transparent">
                  SisCasrce
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Control de Estudio
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sistema Integral de Registro y Control de Estudio • 4 Sedes
              </p>
            </div>
          </div>

          {/* Academic Period Selector: Pregrado Regular / Intensivo / PER */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold text-[11px]">Periodo:</span>
                <select
                  value={currentPeriod.id}
                  onChange={e => setCurrentPeriodId(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer py-0.5 max-w-[260px] truncate"
                  title="Cambiar periodo lectivo activo"
                >
                  {periods.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.type === 'PER' ? 'PER (Plan Especial de Recuperación)' : p.type === 'Intensivo' ? 'Intensivo' : 'Pregrado Regular'} {p.season ? `• ${p.season}` : ''}
                    </option>
                  ))}
                </select>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    currentPeriod.type === 'PER'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : currentPeriod.type === 'Intensivo'
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                  }`}
                >
                  {currentPeriod.type === 'PER'
                    ? 'PER: Recuperación'
                    : currentPeriod.type === 'Intensivo'
                    ? 'Intensivo'
                    : 'Pregrado Regular'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-600" title={`Drive: ${driveStorage.institutionalDriveEmail}`}>
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              <span>Drive: <strong className="text-slate-700">Texto Ultraligero</strong></span>
            </div>
          </div>

          {/* Right Action Tools: Role Switcher & Notifications */}
          <div className="flex items-center gap-2.5">
            {/* Reset data button */}
            <button
              onClick={() => {
                if (window.confirm('¿Desea restaurar todos los datos a la demostración inicial?')) {
                  resetAllData();
                }
              }}
              title="Restaurar datos de prueba iniciales"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Notificaciones en Tiempo Real
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold underline"
                      >
                        Marcar todas leídas
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {userNotifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No hay notificaciones pendientes.
                      </div>
                    ) : (
                      userNotifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 text-xs hover:bg-slate-50 transition cursor-pointer ${
                            !n.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {n.type === 'alert' && (
                              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            )}
                            {n.type === 'success' && (
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            {n.type === 'info' && (
                              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                            )}
                            {n.type === 'warning' && (
                              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className={`font-semibold ${!n.read ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                                {n.title}
                              </p>
                              <p className="text-slate-600 mt-0.5 line-clamp-3 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 inline-block">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role & Persona Picker */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-1.5 sm:px-3 text-left transition"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-300"
                />
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                    {currentUser.title || currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-slate-200">
                    <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>Simulador de Roles de Acceso</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Cambie instantáneamente entre actores para explorar cada perspectiva.
                    </p>
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {users.map(u => {
                      const uBadge = getRoleBadge(u.role);
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUserById(u.id);
                            setShowUserMenu(false);
                            if (u.role === 'profesor' || u.role === 'asistente_docente') {
                              setActiveTab('asistencia');
                            } else if (u.role === 'coordinador_pnf' || u.role === 'asistente_pnf') {
                              setActiveTab('pnf_overview');
                            } else if (u.role === 'coordinador_carsce' || u.role === 'asistente_carsce') {
                              setActiveTab('carsce_overview');
                            } else if (u.role === 'estudiante') {
                              setActiveTab('estudiante_portal');
                            } else if (u.role === 'administrador') {
                              setActiveTab('admin_config');
                            }
                          }}
                          className={`w-full text-left p-3 hover:bg-slate-50 transition flex items-center gap-3 ${
                            isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''
                          }`}
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {u.name}
                              </span>
                              {isSelected && <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              <span
                                className={`inline-block text-[10px] px-1.5 py-0.2 rounded border font-semibold ${uBadge.bg}`}
                              >
                                {uBadge.label}
                              </span>
                              {u.sedeId && (
                                <span className="inline-block text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                                  {sedes.find(s => s.id === u.sedeId)?.code || 'Sede'}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                              {u.title}
                            </div>
                            <div className="text-[9px] text-slate-400 font-mono">
                              {u.cedula}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Role & Sede info bar strip */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sesión activa:</span>
            <span className="font-bold text-slate-800">{currentUser.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${currentRoleBadge.bg}`}>
              {currentRoleBadge.label}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-3">
            {userSede && (
              <span className="flex items-center gap-1 text-slate-700">
                <Building className="w-3 h-3 text-slate-400" />
                Sede: <strong className="text-slate-800">{userSede.name}</strong>
              </span>
            )}
            <span>Cédula: <strong className="text-slate-700 font-mono">{currentUser.cedula}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
