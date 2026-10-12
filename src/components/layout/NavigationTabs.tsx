import React from 'react';
import { useAcademic } from '../../context/AcademicContext';
import {
  CheckSquare,
  FileSpreadsheet,
  Calendar,
  Building2,
  GraduationCap,
  ClipboardList,
  FileText,
  Settings,
  Users,
  Cpu,
  BookOpen,
} from 'lucide-react';

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAcademic();
  const role = currentUser.role;

  const isDocente = role === 'profesor' || role === 'asistente_docente';
  const isPnfCoord = role === 'coordinador_pnf' || role === 'asistente_pnf';
  const isCarsce = role === 'coordinador_carsce' || role === 'asistente_carsce';
  const isStudent = role === 'estudiante';
  const isAdmin = role === 'administrador';

  const navItems = [
    {
      id: 'asistencia',
      label: 'Matriz de Asistencia',
      icon: CheckSquare,
      badge: 'Docente',
      show: isDocente || isPnfCoord || isAdmin,
    },
    {
      id: 'calificaciones',
      label: 'Notas & Consejo Docente',
      icon: FileSpreadsheet,
      badge: 'Max 25%',
      show: isDocente || isPnfCoord || isAdmin,
    },
    {
      id: 'pnf_overview',
      label: 'Supervisión PNF',
      icon: Building2,
      badge: 'Tiempo Real',
      show: isPnfCoord || isAdmin || isCarsce,
    },
    {
      id: 'carsce_overview',
      label: 'CARSCE & Motor de Evaluación',
      icon: Cpu,
      badge: 'Prelaciones',
      show: isCarsce || isAdmin,
    },
    {
      id: 'preinscripcion',
      label: 'Preinscripción & Drive',
      icon: ClipboardList,
      badge: 'Ligero',
      show: true,
    },
    {
      id: 'estudiante_portal',
      label: 'Portal & Récord Académico',
      icon: GraduationCap,
      badge: 'Historial',
      show: isStudent || isAdmin || isCarsce,
    },
    {
      id: 'horarios',
      label: 'Horarios por Sede',
      icon: Calendar,
      show: true,
    },
    {
      id: 'reportes',
      label: 'Actas & Reportes',
      icon: FileText,
      badge: 'Oficial',
      show: isDocente || isPnfCoord || isCarsce || isAdmin,
    },
    {
      id: 'admin_config',
      label: 'Gestor Pensum, Sedes & PNF',
      icon: Settings,
      show: isAdmin || isCarsce,
    },
  ];

  const visibleItems = navItems.filter(item => item.show);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-24 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-1.5 overflow-x-auto py-2.5 scrollbar-thin scrollbar-thumb-slate-300">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
