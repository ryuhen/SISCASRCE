import React, { useState } from 'react';
import { AcademicProvider, useAcademic } from './context/AcademicContext';
import { Navbar } from './components/layout/Navbar';
import { NavigationTabs } from './components/layout/NavigationTabs';
import { TeacherAttendanceMatrixView } from './components/views/TeacherAttendanceMatrixView';
import { TeacherGradesView } from './components/views/TeacherGradesView';
import { PnfCoordinatorDashboard } from './components/views/PnfCoordinatorDashboard';
import { CarsceCoordinatorDashboard } from './components/views/CarsceCoordinatorDashboard';
import { PreRegistrationView } from './components/views/PreRegistrationView';
import { StudentPortalView } from './components/views/StudentPortalView';
import { SchedulesView } from './components/views/SchedulesView';
import { ReportsView } from './components/views/ReportsView';
import { AdminConfigView } from './components/views/AdminConfigView';
import { GraduationCap, Sparkles, Building2, HardDrive } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser } = useAcademic();

  const getInitialTab = () => {
    switch (currentUser.role) {
      case 'estudiante':
        return 'estudiante_portal';
      case 'coordinador_pnf':
      case 'asistente_pnf':
        return 'pnf_overview';
      case 'coordinador_carsce':
      case 'asistente_carsce':
        return 'carsce_overview';
      case 'administrador':
        return 'admin_config';
      case 'profesor':
      case 'asistente_docente':
      default:
        return 'asistencia';
    }
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar with quick role simulator and notification center */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Role-aware Navigation Bar */}
      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'asistencia' && <TeacherAttendanceMatrixView />}
        {activeTab === 'calificaciones' && <TeacherGradesView />}
        {activeTab === 'pnf_overview' && <PnfCoordinatorDashboard />}
        {activeTab === 'carsce_overview' && (
          <CarsceCoordinatorDashboard
            onNavigateToPreReg={() => setActiveTab('preinscripcion')}
            onNavigateToReports={() => setActiveTab('reportes')}
          />
        )}
        {activeTab === 'preinscripcion' && <PreRegistrationView />}
        {activeTab === 'estudiante_portal' && <StudentPortalView />}
        {activeTab === 'horarios' && <SchedulesView />}
        {activeTab === 'reportes' && <ReportsView />}
        {activeTab === 'admin_config' && <AdminConfigView />}
      </main>

      {/* Institutional Light Footer */}
      <footer className="bg-white border-t border-slate-200 text-xs text-slate-500 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-200">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800">
                SisCasrce • Sistema Integral de Registro, Control de Estudio y Gestión Académica
              </p>
              <p className="text-[11px] text-slate-500">
                4 Sedes Universitarias • Periodos Regulares, Intensivos y PER (Plan Especial de Recuperación) • Drive Ligero
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <HardDrive className="w-3.5 h-3.5" />
              Base de Datos Solo Texto
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-blue-700 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Sincronización en Tiempo Real
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AcademicProvider>
      <MainAppContent />
    </AcademicProvider>
  );
}
