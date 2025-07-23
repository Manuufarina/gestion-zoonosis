import React from 'react';

export const LOGO_URL = 'https://www.sanisidro.gob.ar/sites/all/themes/sitiosi/img/logo_blanco.png';

const HeaderBand = () => (
  <div className="header-band">
    <img src={LOGO_URL} alt="Municipalidad de San Isidro" />
  </div>
);

export default HeaderBand;
