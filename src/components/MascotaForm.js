import React, { useEffect, useState } from 'react';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const MascotaForm = ({ onBack, currentMascota, vecinoId }) => {
  const isEditMode = !!currentMascota;
  const [formData, setFormData] = useState({
    nombre: '',
    especie: 'Perro',
    raza: '',
    sexo: 'Macho',
    fechaNac: '',
    color: '',
    señas: '',
  });

  useEffect(() => {
    if (isEditMode) {
      setFormData(currentMascota);
    }
  }, [currentMascota, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const collectionPath = `vecinos/${vecinoId}/mascotas`;
      if (isEditMode) {
        const docRef = doc(db, collectionPath, currentMascota.id);
        await updateDoc(docRef, formData);
      } else {
        await addDoc(collection(db, collectionPath), formData);
      }
      onBack();
    } catch (error) {
      console.error('Error al guardar mascota: ', error);
    }
  };

  return (
    <section>
      <h2 className="section-title">{isEditMode ? 'Editar' : 'Registrar'} Mascota</h2>
      <div className="card form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Especie</label>
              <select name="especie" value={formData.especie} onChange={handleChange}>
                <option>Perro</option>
                <option>Gato</option>
              </select>
            </div>
            <div className="form-field">
              <label>Raza</label>
              <input name="raza" value={formData.raza} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Sexo</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange}>
                <option>Macho</option>
                <option>Hembra</option>
              </select>
            </div>
            <div className="form-field">
              <label>Fecha Nac. (Aprox)</label>
              <input type="date" name="fechaNac" value={formData.fechaNac} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Color</label>
              <input name="color" value={formData.color} onChange={handleChange} />
            </div>
            <div className="form-field full-width">
              <label>Señas Particulares</label>
              <textarea name="señas" value={formData.señas} onChange={handleChange} rows="3"></textarea>
            </div>
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

export default MascotaForm;
