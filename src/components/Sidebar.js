import React from 'react';

const SidebarLink = ({ icon, text, section, activeSection, onSelect }) => {
  const isActive = activeSection.split('-')[0] === section.split('-')[0];
  return (
    <button
      type="button"
      className={`sidebar-link ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(section)}
    >
      <i className={`fas ${icon}`}></i>
      <span>{text}</span>
    </button>
  );
};

const Sidebar = ({ onSelect, activeSection, user }) => {
  const isAdmin = user && user.rol === 'Admin';
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Zoonosis</h1>
        <p>San Isidro</p>
      </div>
      <nav className="sidebar-nav">
        <SidebarLink icon="fa-tachometer-alt" text="Dashboard" section="dashboard" activeSection={activeSection} onSelect={onSelect} />
        <SidebarLink icon="fa-users" text="Vecinos y Mascotas" section="vecinosList" activeSection={activeSection} onSelect={onSelect} />
        <SidebarLink icon="fa-boxes-stacked" text="Gestión de Stock" section="stock" activeSection={activeSection} onSelect={onSelect} />
        <SidebarLink icon="fa-chart-pie" text="Reportes" section="reportes" activeSection={activeSection} onSelect={onSelect} />
        {isAdmin && (
          <div className="sidebar-section-divider">
            <p className="sidebar-section-title">Administración</p>
            <SidebarLink icon="fa-user-shield" text="Gestión de Usuarios" section="usuarios" activeSection={activeSection} onSelect={onSelect} />
          </div>
        )}
      </nav>
      <div className="sidebar-footer">
        {user && (
          <div className="user-profile">
            <img src={`https://placehold.co/40x40/a7f3d0/14532d?text=${user.nombre ? user.nombre.charAt(0) : 'U'}`} alt="Avatar" />
            <div className="user-info">
              <p className="user-name">{user.nombre || 'Usuario'}</p>
              <p className="user-role">{user.rol || 'Rol'}</p>
              <button type="button" className="button-link" onClick={() => onSelect('logout')}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
