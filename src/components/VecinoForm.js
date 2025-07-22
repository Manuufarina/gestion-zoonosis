import React, { useEffect, useState } from 'react';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const VecinoForm = ({ onBack, currentVecino }) => {
  const isEditMode = !!currentVecino;
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    domicilio: '',
    email: '',
  });

  useEffect(() => {
    if (isEditMode) {
      setFormData(currentVecino);
    }
  }, [currentVecino, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const docRef = doc(db, 'vecinos', currentVecino.id);
        await updateDoc(docRef, formData);
      } else {
        await addDoc(collection(db, 'vecinos'), formData);
      }
      onBack();
    } catch (error) {
      console.error('Error al guardar vecino: ', error);
    }
  };

  return (
    <section>
      <h2 className="section-title">{isEditMode ? 'Editar' : 'Registrar'} Vecino</h2>
      <div className="card form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Apellido</label>
              <input name="apellido" value={formData.apellido} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>DNI</label>
              <input name="dni" value={formData.dni} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Teléfono</label>
              <input name="telefono" value={formData.telefono} onChange={handleChange} />
            </div>
            <div className="form-field full-width">
              <label>Domicilio</label>
              <input name="domicilio" value={formData.domicilio} onChange={handleChange} required />
            </div>
            <div className="form-field full-width">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
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

export default VecinoForm;
