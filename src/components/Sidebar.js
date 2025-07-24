import React from 'react';

const Sidebar = ({ onSelect, activeSection, user, open, onClose }) => {
  const isAdmin = user && user.rol === 'Admin';
  const handleSelect = (section) => {
    onSelect(section);
    if (onClose) onClose();
  };
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h1>Zoonosis</h1>
        <p>San Isidro</p>
      </div>
      <nav className="sidebar-nav">
        <SidebarLink icon="fa-tachometer-alt" text="Dashboard" section="dashboard" activeSection={activeSection} onSelect={handleSelect} />
        <SidebarLink icon="fa-users" text="Vecinos y Mascotas" section="vecinosList" activeSection={activeSection} onSelect={handleSelect} />
        <SidebarLink icon="fa-boxes-stacked" text="Gestión de Stock" section="stock" activeSection={activeSection} onSelect={handleSelect} />
        <SidebarLink icon="fa-chart-pie" text="Reportes" section="reportes" activeSection={activeSection} onSelect={handleSelect} />
        {isAdmin && (
          <div className="sidebar-section-divider">
            <p className="sidebar-section-title">Administración</p>
            <SidebarLink icon="fa-user-md" text="Veterinarios" section="veterinarios" activeSection={activeSection} onSelect={handleSelect} />
            {/*<SidebarLink icon="fa-user-shield" text="Gestión de Usuarios" section="usuarios" activeSection={activeSection} onSelect={handleSelect} />*/}
            {/*<SidebarLink icon="fa-file-alt" text="Logs" section="logs" activeSection={activeSection} onSelect={handleSelect} />*/}
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
              <button className="button-logout" onClick={() => onSelect('logout')}>Cerrar Sesión</button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

const SidebarLink = ({ icon, text, section, activeSection, onSelect }) => {
  const isActive = activeSection.split('-')[0] === section.split('-')[0];
  return (
    <button className={`sidebar-link ${isActive ? 'active' : ''}`} onClick={() => onSelect(section)}>
      <i className={`fas ${icon}`}></i>
      <span>{text}</span>
    </button>
  );
};

export default Sidebar;
