import React from 'react';

const LabelButtons = ({ label, setLabel }) => (
  <div className="label-buttons">
    <button className={`label-button ${label === 'Eisa' ? 'selected' : ''}`} onClick={() => setLabel('Eisa')}>Eisa</button>
    <button className={`label-button ${label === 'NotEisa' ? 'selected' : ''}`} onClick={() => setLabel('NotEisa')}>Not Eisa</button>
  </div>
);

export default LabelButtons;
