import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VecinosList from './components/VecinosList';
import VecinoForm from './components/VecinoForm';
import VecinoDetail from './components/VecinoDetail';
import MascotaForm from './components/MascotaForm';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedVecino, setSelectedVecino] = useState(null);
  const [formState, setFormState] = useState({ mode: 'new', data: null, vecinoId: null });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, nombre: 'Admin', rol: 'Admin' });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleShowForm = (section, state = { mode: 'new', data: null }) => {
    setFormState(state);
    setActiveSection(section);
  };

  const handleSelectVecino = (vecino) => {
    setSelectedVecino(vecino);
    setActiveSection('vecinoDetail');
  };

  const handleBackToVecinos = () => {
    setSelectedVecino(null);
    setActiveSection('vecinosList');
  };

  if (loading) {
    return <div className="loading-screen">Cargando aplicación...</div>;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'vecinosList':
        return <VecinosList onSelectVecino={handleSelectVecino} onShowForm={handleShowForm} />;
      case 'vecinoForm':
        return <VecinoForm onBack={handleBackToVecinos} currentVecino={formState.mode === 'edit' ? formState.data : null} />;
      case 'vecinoDetail':
        return (
          <VecinoDetail
            vecino={selectedVecino}
            onEditVecino={(v) => handleShowForm('vecinoForm', { mode: 'edit', data: v })}
            onShowForm={handleShowForm}
            onDeleteVecino={handleBackToVecinos}
          />
        );
      case 'mascotaForm':
        return (
          <MascotaForm
            onBack={() => setActiveSection('vecinoDetail')}
            vecinoId={formState.vecinoId}
            currentMascota={formState.mode === 'edit' ? formState.data : null}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <style>{`
                /* Estilos Generales */
                body { font-family: 'Inter', sans-serif; margin: 0; background-color: #f1f5f9; color: #334155; }
                .app-container { display: flex; height: 100vh; background-color: #f1f5f9; }
                .main-content { flex: 1; padding: 2.5rem; overflow-y: auto; }
                .section-title { font-size: 1.875rem; font-weight: 700; color: #1f2937; margin-bottom: 1.5rem; }
                .section-subtitle { font-size: 1.25rem; font-weight: 600; color: #1f2937; }
                .card { background-color: white; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
                .mb-6 { margin-bottom: 1.5rem; }
                .button { font-weight: 700; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: background-color 0.3s; display: inline-flex; align-items: center; border: none; cursor: pointer; text-decoration: none; color: white; }
                .button-primary { background-color: #15803d; }
                .button-primary:hover { background-color: #166534; }
                .button-secondary { background-color: #d1d5db; color: #1f2937; }
                .button-secondary:hover { background-color: #9ca3af; }
                .button-danger { background-color: #dc2626; }
                .button-danger:hover { background-color: #b91c1c; }
                .button i { margin-right: 0.5rem; }
                .button-link { color: #15803d; background: none; border: none; cursor: pointer; font-weight: 600; padding: 0; }
                .button-link:hover { text-decoration: underline; }
                .button-link i { margin-right: 0.25rem; }
                /* Sidebar */
                .sidebar { width: 16rem; background-color: #14532d; color: white; display: flex; flex-direction: column; flex-shrink: 0; height: 100vh; }
                .sidebar-header { padding: 1.5rem; text-align: center; border-bottom: 1px solid #166534; }
                .sidebar-header h1 { font-size: 1.5rem; font-weight: 700; }
                .sidebar-header p { font-size: 0.875rem; color: #a7f3d0; }
                .sidebar-nav { flex: 1; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
                .sidebar-link { display: flex; align-items: center; padding: 0.75rem; border-radius: 0.5rem; transition: all 0.2s ease-in-out; text-decoration: none; color: white; background: none; border: none; cursor: pointer; text-align: left; width: 100%; }
                .sidebar-link:hover { background-color: #166534; }
                .sidebar-link.active { background-color: #166534; transform: translateX(4px); }
                .sidebar-link i { width: 1.5rem; text-align: center; margin-right: 0.75rem; }
                .sidebar-section-divider { border-top: 1px solid #166534; padding-top: 1rem; margin-top: 1rem; }
                .sidebar-section-title { padding: 0 0.75rem; font-size: 0.75rem; font-weight: 600; color: #a7f3d0; text-transform: uppercase; }
                .sidebar-footer { padding: 1rem; border-top: 1px solid #166534; }
                .user-profile { display: flex; align-items: center; }
                .user-profile img { border-radius: 9999px; }
                .user-info { margin-left: 0.75rem; }
                .user-info p { margin: 0; line-height: 1.2; }
                .user-info .user-name { font-weight: 600; }
                .user-info .user-role { font-size: 0.75rem; color: #a7f3d0; }
                .user-info a { font-size: 0.875rem; color: #a7f3d0; text-decoration: none; }
                .user-info a:hover { color: white; }
                /* Formularios y Tablas */
                .form-container { max-width: 48rem; margin: auto; }
                .form-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 1.5rem; }
                @media (min-width: 768px) { .form-grid { grid-template-columns: repeat(2, 1fr); } }
                .form-field { display: flex; flex-direction: column; }
                .form-field.full-width { grid-column: 1 / -1; }
                .form-field label { color: #374151; font-weight: 700; margin-bottom: 0.5rem; }
                .form-field input, .form-field select, .form-field textarea { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; box-sizing: border-box; }
                .form-actions { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; }
                .table { width: 100%; text-align: left; border-collapse: collapse; }
                .table thead { background-color: #f9fafb; }
                .table th, .table td { padding: 0.75rem; }
                .table th { font-weight: 700; }
                .table tbody tr { border-bottom: 1px solid #e5e7eb; }
                .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                /* Detalles */
                .vecino-detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
                /* Modal */
                .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
                .modal-content { background-color: white; padding: 2rem; border-radius: 0.75rem; max-width: 500px; width: 90%; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
                .modal-title { margin-top: 0; font-size: 1.5rem; }
                .modal-body p { margin-top: 0; line-height: 1.6; }
                .modal-actions { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; }
                .loading-screen { display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 1.25rem; color: #14532d; }
            `}</style>
      <div className="app-container">
        <Sidebar onSelect={setActiveSection} activeSection={activeSection} user={user} />
        <main className="main-content">{renderContent()}</main>
      </div>
    </>
  );
};

export default App;
