import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';

// --- CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE ---
// Se integra directamente para evitar errores de importación.
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, Timestamp, collectionGroup, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import { auth, db } from './firebase';
import { logUserAction } from './logger';


// --- COMPONENTES AUXILIARES ---

const Modal = ({ show, onClose, onConfirm, title, children }) => {
    if (!show) return null;
    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3 className="modal-title">{title}</h3>
                <div className="modal-body">{children}</div>
                <div className="modal-actions">
                    <button className="button button-secondary" onClick={onClose}>Cancelar</button>
                    <button className="button button-danger" onClick={onConfirm}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTES PRINCIPALES DE LA UI ---


// --- COMPONENTES DE SECCIONES ---

const Dashboard = ({ goToVecinos, goToStock, stats }) => (
    <section>
        <h2 className="section-title">Dashboard</h2>
        <div className="quick-actions mb-6">
            <button type="button" className="button button-primary" onClick={goToVecinos}><i className="fas fa-users"></i> Vecinos</button>
            <button type="button" className="button button-primary" onClick={goToStock}><i className="fas fa-boxes-stacked"></i> Stock</button>
        </div>
        <div className="kpi-grid">
            <div className="card kpi-card"><h3>Vecinos</h3><p>{stats.vecinos}</p></div>
            <div className="card kpi-card"><h3>Mascotas</h3><p>{stats.mascotas}</p></div>
            <div className="card kpi-card"><h3>Atenciones</h3><p>{stats.atenciones}</p></div>
        </div>
    </section>
);

const VecinosList = ({ onSelectVecino, onShowForm }) => {
    const [vecinos, setVecinos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const q = query(collection(db, "vecinos"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const vecinosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setVecinos(vecinosData);
            setLoading(false);
        }, (error) => {
            console.error("Error al obtener vecinos: ", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);


    if (loading) return <div className="card">Cargando vecinos...</div>;

    return (
        <section>
            <div className="header-actions">
                <h2 className="section-title" style={{ marginBottom: 0 }}>Vecinos y Mascotas</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="text" placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button type="button" className="button button-primary" onClick={() => onShowForm('vecinoForm', { mode: 'new' })}>
                        <i className="fas fa-plus"></i> Nuevo Vecino
                    </button>
                </div>
            </div>
            <div className="card">
                <table className="table">
                    <thead><tr><th>Nombre y Apellido</th><th>DNI</th><th>Email</th><th style={{ textAlign: 'center' }}>Acciones</th></tr></thead>
                    <tbody>
                        {vecinos.length > 0 ? vecinos.filter(v =>
                            `${v.nombre} ${v.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
                            v.dni.includes(search)
                        ).map(vecino => (
                            <tr key={vecino.id}>
                                <td>{vecino.nombre} {vecino.apellido}</td>
                                <td>{vecino.dni}</td>
                                <td>{vecino.email}</td>
                                <td style={{ textAlign: 'center' }}><button type="button" className="button-link" onClick={() => onSelectVecino(vecino)}><i className="fas fa-eye"></i> Ver Ficha</button></td>
                            </tr>
                        )) : (<tr><td colSpan="4">No hay vecinos registrados.</td></tr>)}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

const VecinoForm = ({ onBack, currentVecino }) => {
    const isEditMode = !!currentVecino;
    const [formData, setFormData] = useState({ nombre: '', apellido: '', dni: '', telefono: '', domicilio: '', email: '' });

    useEffect(() => { if (isEditMode) setFormData(currentVecino); }, [currentVecino, isEditMode]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await updateDoc(doc(db, 'vecinos', currentVecino.id), formData);
                logUserAction(auth.currentUser?.uid, 'editar vecino', { id: currentVecino.id });
            } else {
                const docRef = await addDoc(collection(db, 'vecinos'), formData);
                logUserAction(auth.currentUser?.uid, 'crear vecino', { id: docRef.id });
            }
            onBack();
        } catch (error) { console.error("Error al guardar vecino: ", error); }
    };

    return (
        <section>
            <h2 className="section-title">{isEditMode ? 'Editar' : 'Registrar'} Vecino</h2>
            <div className="card form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-field"><label>Nombre</label><input name="nombre" value={formData.nombre} onChange={handleChange} required /></div>
                        <div className="form-field"><label>Apellido</label><input name="apellido" value={formData.apellido} onChange={handleChange} required /></div>
                        <div className="form-field"><label>DNI</label><input name="dni" value={formData.dni} onChange={handleChange} required /></div>
                        <div className="form-field"><label>Teléfono</label><input name="telefono" value={formData.telefono} onChange={handleChange} /></div>
                        <div className="form-field full-width"><label>Domicilio</label><input name="domicilio" value={formData.domicilio} onChange={handleChange} required /></div>
                        <div className="form-field full-width"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="button button-secondary" onClick={onBack}>Cancelar</button>
                        <button type="submit" className="button button-primary">Guardar Vecino</button>
                    </div>
                </form>
            </div>
        </section>
    );
};

const VecinoDetail = ({ vecino, onEditVecino, onShowForm, onDeleteVecino, onSelectMascota }) => {
    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchMascota, setSearchMascota] = useState('');

    useEffect(() => {
        if (!vecino) return;
        const q = query(collection(db, `vecinos/${vecino.id}/mascotas`));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setMascotas(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => { console.error("Error al obtener mascotas: ", error); setLoading(false); });
        return () => unsubscribe();
    }, [vecino]);

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, 'vecinos', vecino.id));
            logUserAction(auth.currentUser?.uid, 'eliminar vecino', { id: vecino.id });
            onDeleteVecino();
        } catch (error) { console.error("Error al eliminar vecino:", error); }
        setShowDeleteModal(false);
    }

    return (
        <section>
            <div className="header-actions"><h2 className="section-title" style={{ marginBottom: 0 }}>Ficha del Vecino</h2>
                <button className="button button-danger" onClick={() => setShowDeleteModal(true)}><i className="fas fa-trash-alt"></i> Eliminar Vecino</button>
            </div>
            <div className="card mb-6">
                <div className="vecino-detail-grid">
                    <div><strong>Nombre:</strong> {vecino.nombre} {vecino.apellido}</div>
                    <div><strong>DNI:</strong> {vecino.dni}</div>
                    <div><strong>Teléfono:</strong> {vecino.telefono}</div>
                    <div><strong>Email:</strong> {vecino.email}</div>
                    <div className="full-width"><strong>Domicilio:</strong> {vecino.domicilio}</div>
                </div>
                <div className="form-actions" style={{justifyContent: 'flex-start', marginTop: '1rem'}}>
                    <button className="button button-secondary" onClick={() => onEditVecino(vecino)}><i className="fas fa-edit"></i> Editar Datos</button>
                </div>
            </div>
            <div className="header-actions">
                <h3 className="section-subtitle">Mascotas Registradas</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="text" placeholder="Buscar" value={searchMascota} onChange={(e) => setSearchMascota(e.target.value)} />
                    <button type="button" className="button button-primary" onClick={() => onShowForm('mascotaForm', { mode: 'new', vecinoId: vecino.id })}><i className="fas fa-plus"></i> Nueva Mascota</button>
                </div>
            </div>
            <div className="card">
                 <table className="table">
                    <thead><tr><th>Nombre</th><th>Especie</th><th>Raza</th><th style={{ textAlign: 'center' }}>Acciones</th></tr></thead>
                    <tbody>
                        {loading ? (<tr><td colSpan="4">Cargando mascotas...</td></tr>) 
                        : mascotas.length > 0 ? mascotas.filter(m =>
                            m.nombre.toLowerCase().includes(searchMascota.toLowerCase()) ||
                            m.raza.toLowerCase().includes(searchMascota.toLowerCase())
                        ).map(mascota => (
                            <tr key={mascota.id}>
                                <td>{mascota.nombre}</td><td>{mascota.especie}</td><td>{mascota.raza}</td>
                                <td style={{ textAlign: 'center' }}><button type="button" className="button-link" onClick={() => onSelectMascota(mascota)}><i className="fas fa-file-medical"></i> Ver Historial</button></td>
                            </tr>
                        )) : (<tr><td colSpan="4">Este vecino no tiene mascotas registradas.</td></tr>)}
                    </tbody>
                </table>
            </div>
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Confirmar Eliminación">
                <p>¿Estás seguro de que deseas eliminar a <strong>{vecino.nombre} {vecino.apellido}</strong>? Esta acción no se puede deshacer.</p>
            </Modal>
        </section>
    );
};

const MascotaForm = ({ onBack, currentMascota, vecinoId }) => {
    const isEditMode = !!currentMascota;
    const [formData, setFormData] = useState({ nombre: '', especie: 'Perro', raza: '', sexo: 'Macho', fechaNac: '', color: '', señas: '' });

    useEffect(() => { if (isEditMode) setFormData(currentMascota); }, [currentMascota, isEditMode]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const collectionPath = `vecinos/${vecinoId}/mascotas`;
            if (isEditMode) {
                await updateDoc(doc(db, collectionPath, currentMascota.id), formData);
                logUserAction(auth.currentUser?.uid, 'editar mascota', { id: currentMascota.id });
            } else {
                const docRef = await addDoc(collection(db, collectionPath), formData);
                logUserAction(auth.currentUser?.uid, 'crear mascota', { id: docRef.id });
            }
            onBack();
        } catch (error) { console.error("Error al guardar mascota: ", error); }
    };

    return (
        <section>
            <h2 className="section-title">{isEditMode ? 'Editar' : 'Registrar'} Mascota</h2>
            <div className="card form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-field"><label>Nombre</label><input name="nombre" value={formData.nombre} onChange={handleChange} required /></div>
                        <div className="form-field"><label>Especie</label><select name="especie" value={formData.especie} onChange={handleChange}><option>Perro</option><option>Gato</option></select></div>
                        <div className="form-field"><label>Raza</label><input name="raza" value={formData.raza} onChange={handleChange} /></div>
                        <div className="form-field"><label>Sexo</label><select name="sexo" value={formData.sexo} onChange={handleChange}><option>Macho</option><option>Hembra</option></select></div>
                        <div className="form-field"><label>Fecha Nac. (Aprox)</label><input type="date" name="fechaNac" value={formData.fechaNac} onChange={handleChange} /></div>
                        <div className="form-field"><label>Color</label><input name="color" value={formData.color} onChange={handleChange} /></div>
                        <div className="form-field full-width"><label>Señas Particulares</label><textarea name="señas" value={formData.señas} onChange={handleChange} rows="3"></textarea></div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="button button-secondary" onClick={onBack}>Cancelar</button>
                        <button type="submit" className="button button-primary">Guardar Mascota</button>
                    </div>
                </form>
            </div>
        </section>
    );
};

const MascotaDetail = ({ mascota, vecino, onBack, onShowForm }) => {
    const [atenciones, setAtenciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!vecino || !mascota) return;
        const q = query(collection(db, `vecinos/${vecino.id}/mascotas/${mascota.id}/atenciones`));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            setAtenciones(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [vecino, mascota]);

    return (
        <section>
            <button type="button" className="button-link mb-6" onClick={onBack}><i className="fas fa-arrow-left"></i> Volver a la Ficha del Vecino</button>
            <div className="header-actions">
                <h2 className="section-title" style={{ marginBottom: 0 }}>Historial de {mascota.nombre}</h2>
                <button className="button button-primary" onClick={() => onShowForm('atencionForm', { mode: 'new', mascotaId: mascota.id, vecinoId: vecino.id })}>
                    <i className="fas fa-plus"></i> Nueva Atención
                </button>
                <button className="button button-primary" onClick={() => onShowForm('certificado', { mascotaId: mascota.id, vecinoId: vecino.id })}>
                    <i className="fas fa-file-pdf"></i> Certificado Vacunación
                </button>
            </div>
            <div className="card">
                {loading ? <p>Cargando historial...</p> : atenciones.length > 0 ? (
                    <div className="atenciones-list">
                        {atenciones.map(atencion => (
                            <div key={atencion.id} className="atencion-item card">
                                <div className="atencion-header">
                                    <h4 className="atencion-title">{atencion.tipo}</h4>
                                    <span className="atencion-date">{atencion.fecha.toDate().toLocaleDateString()} - {atencion.sede}</span>
                                </div>
                                <p><strong>Motivo:</strong> {atencion.motivo}</p>
                                <p><strong>Observaciones:</strong> {atencion.observaciones}</p>
                            </div>
                        ))}
                    </div>
                ) : <p>No hay atenciones registradas para esta mascota.</p>}
            </div>
        </section>
    );
};

const AtencionForm = ({ onBack, mascotaId, vecinoId }) => {
    const [formData, setFormData] = useState({
        fecha: Timestamp.now(), sede: 'Sede Central', tipo: 'Clínica', motivo: '', observaciones: ''
    });

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const collectionPath = `vecinos/${vecinoId}/mascotas/${mascotaId}/atenciones`;
            const docRef = await addDoc(collection(db, collectionPath), formData);
            logUserAction(auth.currentUser?.uid, 'registrar atencion', { id: docRef.id, tipo: formData.tipo });
            onBack();
        } catch (error) { console.error("Error al guardar atención: ", error); }
    };

    return (
        <section>
            <h2 className="section-title">Registrar Atención</h2>
            <div className="card form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-field"><label>Sede</label><select name="sede" value={formData.sede} onChange={handleChange}><option>Sede Central</option><option>Quirófano Móvil</option></select></div>
                        <div className="form-field"><label>Tipo de Atención</label><select name="tipo" value={formData.tipo} onChange={handleChange}><option>Clínica</option><option>Vacunación</option><option>Castración</option></select></div>
                        <div className="form-field full-width"><label>Motivo / Diagnóstico</label><input name="motivo" value={formData.motivo} onChange={handleChange} required /></div>
                        <div className="form-field full-width"><label>Observaciones y Recomendaciones</label><textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows="4"></textarea></div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="button button-secondary" onClick={onBack}>Cancelar</button>
                        <button type="submit" className="button button-primary">Guardar Atención</button>
                    </div>
                </form>
            </div>
        </section>
    );
};

const CertificadoVacunacion = ({ vecino, mascota, onBack }) => {
    const [vacunas, setVacunas] = useState([]);
    const CERT_TITLE = 'Certificado de Vacunación';

    useEffect(() => {
        if (!vecino || !mascota) return;
        const q = query(
            collection(db, `vecinos/${vecino.id}/mascotas/${mascota.id}/atenciones`),
            where('tipo', '==', 'Vacunación')
        );
        const unsub = onSnapshot(q, snap => {
            setVacunas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [vecino, mascota]);

    const enviarPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(CERT_TITLE, 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Dueño: ${vecino.nombre} ${vecino.apellido}`, 20, 40);
        doc.text(`Domicilio: ${vecino.domicilio}`, 20, 48);
        doc.text(`Mascota: ${mascota.nombre} - ${mascota.especie} ${mascota.raza}`, 20, 56);
        doc.text('Vacunas Aplicadas:', 20, 68);
        vacunas.forEach((v, i) => {
            const y = 76 + i * 8;
            const fecha = v.fecha.toDate().toLocaleDateString();
            doc.text(`${i + 1}. ${v.motivo} - ${fecha} (${v.sede})`, 26, y);
        });
        doc.save('certificado.pdf');
        alert('Certificado enviado por correo (simulado)');
    };

    return (
        <section>
            <button type="button" className="button-link mb-6" onClick={onBack}><i className="fas fa-arrow-left"></i> Volver</button>
            <h2 className="section-title">Certificado de Vacunación</h2>
            <div className="card">
                <p><strong>Dueño:</strong> {vecino.nombre} {vecino.apellido}</p>
                <p><strong>Domicilio:</strong> {vecino.domicilio}</p>
                <p><strong>Mascota:</strong> {mascota.nombre} - {mascota.especie} {mascota.raza}</p>
                <h3 className="section-subtitle">Vacunas Aplicadas</h3>
                {vacunas.length > 0 ? (
                    <ul>
                        {vacunas.map(v => (
                            <li key={v.id}>{v.motivo} - {v.fecha.toDate().toLocaleDateString()} ({v.sede})</li>
                        ))}
                    </ul>
                ) : <p>No hay registros de vacunación.</p>}
                <div className="form-actions" style={{justifyContent: 'flex-end'}}>
                    <button type="button" className="button button-secondary" onClick={onBack}>Cerrar</button>
                    <button type="button" className="button button-primary" onClick={enviarPDF}><i className="fas fa-envelope"></i> Enviar por Email</button>
                </div>
            </div>
        </section>
    );
};

const Stock = () => {
    const [insumos, setInsumos] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'insumos'), orderBy('nombre'));
        const unsubscribe = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setInsumos(data);
        });
        return () => unsubscribe();
    }, []);

    const getEstadoClass = (estado) => {
        if (estado === 'OK') return 'estado-ok';
        if (estado === 'Bajo') return 'estado-bajo';
        if (estado === 'Crítico') return 'estado-critico';
        return '';
    };
    
    return (
        <section>
            <div className="header-actions">
                <h2 className="section-title" style={{ marginBottom: 0 }}>Gestión de Stock</h2>
                <button className="button button-primary"><i className="fas fa-plus"></i> Nuevo Insumo</button>
            </div>
            <div className="card">
                <table className="table">
                    <thead><tr><th>Insumo</th><th style={{textAlign: 'center'}}>Stock Actual</th><th style={{textAlign: 'center'}}>Stock Mínimo</th><th style={{textAlign: 'center'}}>Estado</th></tr></thead>
                    <tbody>
                        {insumos.map(insumo => (
                            <tr key={insumo.id}>
                                <td>{insumo.nombre}</td>
                                <td style={{textAlign: 'center'}}>{insumo.stock}</td>
                                <td style={{textAlign: 'center'}}>{insumo.min}</td>
                                <td style={{textAlign: 'center'}}><span className={`estado-badge ${getEstadoClass(insumo.estado)}`}>{insumo.estado}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const permissionOptions = ['dashboard','vecinos','stock','reportes','usuarios','logs'];
    const [formData, setFormData] = useState({ nombre: '', email: '', rol: 'Operador', permisos: [] });

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'usuarios'), snap => {
            setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, []);

    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const togglePermiso = p => {
        setFormData(prev => {
            const permisos = prev.permisos.includes(p)
                ? prev.permisos.filter(per => per !== p)
                : [...prev.permisos, p];
            return { ...prev, permisos };
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(db, 'usuarios'), formData);
            logUserAction(auth.currentUser?.uid, 'crear usuario', { id: docRef.id });
            setFormData({ nombre: '', email: '', rol: 'Operador', permisos: [] });
        } catch (err) {
            console.error('Error creando usuario', err);
        }
    };

    return (
        <section>
            <h2 className="section-title">Gestión de Usuarios</h2>
            <div className="card form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-field"><label>Nombre</label><input name="nombre" value={formData.nombre} onChange={handleChange} required /></div>
                        <div className="form-field"><label>Email</label><input name="email" value={formData.email} onChange={handleChange} required /></div>
                        <div className="form-field"><label>Rol</label><select name="rol" value={formData.rol} onChange={handleChange}><option>Operador</option><option>Admin</option></select></div>
                        <div className="form-field full-width">
                            <label>Permisos</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {permissionOptions.map(p => (
                                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <input type="checkbox" checked={formData.permisos.includes(p)} onChange={() => togglePermiso(p)} /> {p}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="button button-primary">Crear Usuario</button>
                    </div>
                </form>
            </div>
            <div className="card" style={{ marginTop: '1rem' }}>
                <table className="table">
                    <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Permisos</th></tr></thead>
                    <tbody>
                        {usuarios.map(u => (
                            <tr key={u.id}><td>{u.nombre}</td><td>{u.email}</td><td>{u.rol}</td><td>{(u.permisos || []).join(', ')}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

const Logs = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'logs'), orderBy('fecha', 'desc'), limit(100));
        const unsub = onSnapshot(q, snap => {
            setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, []);

    return (
        <section>
            <h2 className="section-title">Logs de Movimientos</h2>
            <div className="card">
                <table className="table">
                    <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalles</th></tr></thead>
                    <tbody>
                        {logs.map(l => (
                            <tr key={l.id}>
                                <td>{l.fecha.toDate().toLocaleString()}</td>
                                <td>{l.uid}</td>
                                <td>{l.accion}</td>
                                <td>{JSON.stringify(l.detalles)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

const Reportes = () => {
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');

    const exportar = async () => {
        if (!desde || !hasta) return;
        const desdeTs = Timestamp.fromDate(new Date(desde));
        const hastaTs = Timestamp.fromDate(new Date(hasta));
        const q = query(
            collectionGroup(db, 'atenciones'),
            where('fecha', '>=', desdeTs),
            where('fecha', '<=', hastaTs)
        );
        const snap = await getDocs(q);
        const doc = new jsPDF();
        doc.text('Reporte de Trabajos', 105, 20, { align: 'center' });
        snap.docs.forEach((d, i) => {
            const a = d.data();
            doc.text(`${i + 1}. ${a.tipo} - ${a.motivo} - ${a.sede} - ${a.fecha.toDate().toLocaleDateString()}`, 20, 40 + i * 8);
        });
        doc.save('reporte.pdf');
        logUserAction(auth.currentUser?.uid, 'exportar reporte', { desde, hasta });
    };

    return (
        <section>
            <h2 className="section-title">Reportes</h2>
            <div className="card form-container">
                <div className="form-grid">
                    <div className="form-field"><label>Desde</label><input type="date" value={desde} onChange={e => setDesde(e.target.value)} /></div>
                    <div className="form-field"><label>Hasta</label><input type="date" value={hasta} onChange={e => setHasta(e.target.value)} /></div>
                </div>
                <div className="form-actions">
                    <button type="button" className="button button-primary" onClick={exportar}>Exportar PDF</button>
                </div>
            </div>
        </section>
    );
};


// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN ---
const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [selectedVecino, setSelectedVecino] = useState(null);
    const [selectedMascota, setSelectedMascota] = useState(null);
    const [formState, setFormState] = useState({ mode: 'new', data: null });
    const [kpiVecinos, setKpiVecinos] = useState(0);
    const [kpiMascotas, setKpiMascotas] = useState(0);
    const [kpiAtenciones, setKpiAtenciones] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser ? { uid: firebaseUser.uid, nombre: 'Admin', rol: 'Admin' } : null);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const unsubVecinos = onSnapshot(collection(db, 'vecinos'), snap => setKpiVecinos(snap.size));
        const unsubMascotas = onSnapshot(collectionGroup(db, 'mascotas'), snap => setKpiMascotas(snap.size));
        const unsubAtenciones = onSnapshot(collectionGroup(db, 'atenciones'), snap => setKpiAtenciones(snap.size));
        return () => {
            unsubVecinos();
            unsubMascotas();
            unsubAtenciones();
        };
    }, []);

    const handleShowForm = (section, state = { mode: 'new' }) => {
        setFormState(state);
        setActiveSection(section);
    };

    const handleSelectVecino = (vecino) => {
        setSelectedVecino(vecino);
        setActiveSection('vecinoDetail');
    };

    const handleSelectMascota = (mascota) => {
        setSelectedMascota(mascota);
        setActiveSection('mascotaDetail');
    };
    
    const handleBackToVecinosList = () => {
        setSelectedVecino(null);
        setActiveSection('vecinosList');
    }

    const handleBackToVecinoDetail = () => {
        setSelectedMascota(null);
        setActiveSection('vecinoDetail');
    }

    const goToVecinos = () => setActiveSection('vecinosList');
    const goToStock = () => setActiveSection('stock');

    const handleSidebarSelect = (section) => {
        if (section === 'logout') {
            signOut(auth);
            setUser(null); // ensure logout for cuentas locales
            return;
        }
        setActiveSection(section);
    };

    const handleLogin = (email, password) => {
        if (email === 'mfserra@sanisidro.gob.ar' && password === 'si2025') {
            setUser({ uid: 'local-admin', nombre: 'Admin', rol: 'Admin' });
            return Promise.resolve();
        }
        return signInWithEmailAndPassword(auth, email, password);
    };

    if (loading) return <div className="loading-screen">Cargando aplicación...</div>;
    if (!user) return <Login onLogin={handleLogin} />;

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <Dashboard goToVecinos={goToVecinos} goToStock={goToStock} stats={{ vecinos: kpiVecinos, mascotas: kpiMascotas, atenciones: kpiAtenciones }} />;
            case 'vecinosList': return <VecinosList onSelectVecino={handleSelectVecino} onShowForm={handleShowForm} />;
            case 'vecinoForm': return <VecinoForm onBack={handleBackToVecinosList} currentVecino={formState.mode === 'edit' ? formState.data : null} />;
            case 'vecinoDetail': return <VecinoDetail vecino={selectedVecino} onEditVecino={(v) => handleShowForm('vecinoForm', { mode: 'edit', data: v })} onShowForm={handleShowForm} onDeleteVecino={handleBackToVecinosList} onSelectMascota={handleSelectMascota} />;
            case 'mascotaForm': return <MascotaForm onBack={() => setActiveSection('vecinoDetail')} vecinoId={selectedVecino?.id} currentMascota={formState.mode === 'edit' ? formState.data : null} />;
            case 'mascotaDetail': return <MascotaDetail mascota={selectedMascota} vecino={selectedVecino} onBack={handleBackToVecinoDetail} onShowForm={handleShowForm} />;
            case 'atencionForm': return <AtencionForm onBack={() => setActiveSection('mascotaDetail')} vecinoId={formState.vecinoId} mascotaId={formState.mascotaId} />;
            case 'certificado': return <CertificadoVacunacion vecino={selectedVecino} mascota={selectedMascota} onBack={() => setActiveSection('mascotaDetail')} />;
            case 'stock': return <Stock />;
            case 'usuarios': return <Usuarios />;
            case 'logs': return <Logs />;
            case 'reportes': return <Reportes />;
            default:
                return <Dashboard goToVecinos={goToVecinos} goToStock={goToStock} stats={{ vecinos: kpiVecinos, mascotas: kpiMascotas, atenciones: kpiAtenciones }} />;
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
                .menu-toggle {
                    display: none;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #14532d;
                    margin-bottom: 1rem;
                    cursor: pointer;
                }
                /* Sidebar */
                .sidebar { width: 16rem; background-color: #14532d; color: white; display: flex; flex-direction: column; flex-shrink: 0; height: 100vh; transition: transform 0.3s ease-in-out; }
                .sidebar-header { padding: 1.5rem; text-align: center; border-bottom: 1px solid #166534; }
                .sidebar-header h1 { font-size: 1.5rem; font-weight: 700; }
                .sidebar-header p { font-size: 0.875rem; color: #a7f3d0; }
                .sidebar-nav { flex: 1; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
                .sidebar-link { display: flex; align-items: center; padding: 0.75rem; border-radius: 0.5rem; transition: all 0.2s ease-in-out; text-decoration: none; color: white; background: none; border: none; width: 100%; text-align: left; font-family: inherit; font-size: inherit; cursor: pointer; }
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
                .button-logout { font-size: 0.875rem; color: #a7f3d0; text-decoration: none; background: none; border: none; padding: 0; cursor: pointer; text-align: left; }
                .button-logout:hover { color: white; }
                @media (max-width: 768px) {
                    .sidebar {
                        position: fixed;
                        left: 0;
                        top: 0;
                        height: 100%;
                        transform: translateX(-100%);
                        transition: transform 0.3s ease-in-out;
                        z-index: 1000;
                    }
                    .sidebar.open {
                        transform: translateX(0);
                    }
                    .main-content {
                        padding: 1rem;
                    }
                    .menu-toggle {
                        display: block;
                    }
                }
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
                .quick-actions { display: flex; gap: 1rem; margin-bottom: 1rem; }
                .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; }
                .kpi-card { text-align: center; }
                /* Detalles */
                .vecino-detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
                /* Atenciones */
                .atenciones-list { display: flex; flex-direction: column; gap: 1rem; }
                .atencion-item { padding: 1rem; border: 1px solid #e5e7eb; }
                .atencion-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem; }
                .atencion-title { margin: 0; font-size: 1.125rem; color: #14532d; }
                .atencion-date { font-size: 0.875rem; color: #6b7280; }
                .atencion-item p { margin: 0.25rem 0; }
                /* Stock */
                .estado-badge { font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; }
                .estado-ok { background-color: #dcfce7; color: #166534; }
                .estado-bajo { background-color: #fef9c3; color: #854d0e; }
                .estado-critico { background-color: #fee2e2; color: #991b1b; }
                /* Modal */
                .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
                .modal-content { background-color: white; padding: 2rem; border-radius: 0.75rem; max-width: 500px; width: 90%; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
                .modal-title { margin-top: 0; font-size: 1.5rem; }
                .modal-body p { margin-top: 0; line-height: 1.6; }
                .modal-actions { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; }
                .loading-screen { display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 1.25rem; color: #14532d; }
            `}</style>
            <div className="app-container">
                <Sidebar
                    onSelect={handleSidebarSelect}
                    activeSection={activeSection}
                    user={user}
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                <main className="main-content">
                    <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <i className="fas fa-bars"></i>
                    </button>
                    {renderContent()}
                </main>
            </div>
        </>
    );
};

export default App;

