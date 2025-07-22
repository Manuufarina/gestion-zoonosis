import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';

const VecinosList = ({ onSelectVecino, onShowForm }) => {
  const [vecinos, setVecinos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'vecinos'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const vecinosData = [];
        querySnapshot.forEach((doc) => {
          vecinosData.push({ id: doc.id, ...doc.data() });
        });
        setVecinos(vecinosData);
        setLoading(false);
      },
      (error) => {
        console.error('Error al obtener vecinos: ', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="card">Cargando vecinos...</div>;
  }

  return (
    <section>
      <div className="header-actions">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Vecinos y Mascotas
        </h2>
        <button className="button button-primary" onClick={() => onShowForm('vecinoForm', { mode: 'new' })}>
          <i className="fas fa-plus"></i> Nuevo Vecino
        </button>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre y Apellido</th>
              <th>DNI</th>
              <th>Email</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vecinos.length > 0 ? (
              vecinos.map((vecino) => (
                <tr key={vecino.id}>
                  <td>
                    {vecino.nombre} {vecino.apellido}
                  </td>
                  <td>{vecino.dni}</td>
                  <td>{vecino.email}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="button-link" onClick={() => onSelectVecino(vecino)}>
                      <i className="fas fa-eye"></i> Ver Ficha
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No hay vecinos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default VecinosList;
