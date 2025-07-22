import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';

const VecinoDetail = ({ vecino, onEditVecino, onShowForm, onDeleteVecino }) => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!vecino) return;
    const q = query(collection(db, `vecinos/${vecino.id}/mascotas`));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const mascotasData = [];
        querySnapshot.forEach((doc) => {
          mascotasData.push({ id: doc.id, ...doc.data() });
        });
        setMascotas(mascotasData);
        setLoading(false);
      },
      (error) => {
        console.error('Error al obtener mascotas: ', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [vecino]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'vecinos', vecino.id));
      onDeleteVecino();
    } catch (error) {
      console.error('Error al eliminar vecino:', error);
    }
    setShowDeleteModal(false);
  };

  return (
    <section>
      <div className="header-actions">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Ficha del Vecino
        </h2>
        <div>
          <button className="button button-danger" onClick={() => setShowDeleteModal(true)}>
            <i className="fas fa-trash-alt"></i> Eliminar Vecino
          </button>
        </div>
      </div>
      <div className="card mb-6">
        <div className="vecino-detail-grid">
          <div>
            <strong>Nombre:</strong> {vecino.nombre} {vecino.apellido}
          </div>
          <div>
            <strong>DNI:</strong> {vecino.dni}
          </div>
          <div>
            <strong>Teléfono:</strong> {vecino.telefono}
          </div>
          <div>
            <strong>Email:</strong> {vecino.email}
          </div>
          <div className="full-width">
            <strong>Domicilio:</strong> {vecino.domicilio}
          </div>
        </div>
        <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
          <button className="button button-secondary" onClick={() => onEditVecino(vecino)}>
            <i className="fas fa-edit"></i> Editar Datos
          </button>
        </div>
      </div>

      <div className="header-actions">
        <h3 className="section-subtitle">Mascotas Registradas</h3>
        <button className="button button-primary" onClick={() => onShowForm('mascotaForm', { mode: 'new', vecinoId: vecino.id })}>
          <i className="fas fa-plus"></i> Nueva Mascota
        </button>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especie</th>
              <th>Raza</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4">Cargando mascotas...</td>
              </tr>
            ) : mascotas.length > 0 ? (
              mascotas.map((mascota) => (
                <tr key={mascota.id}>
                  <td>{mascota.nombre}</td>
                  <td>{mascota.especie}</td>
                  <td>{mascota.raza}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="button-link">
                      <i className="fas fa-file-medical"></i> Ver Historial
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">Este vecino no tiene mascotas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
      >
        <p>
          ¿Estás seguro de que deseas eliminar a <strong>{vecino.nombre} {vecino.apellido}</strong>? Esta acción no se puede deshacer y eliminará también a todas sus mascotas.
        </p>
      </Modal>
    </section>
  );
};

export default VecinoDetail;
