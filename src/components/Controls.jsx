import React from 'react';

const Controls = ({ onCapture, onSave, onShowImages, isCaptureDisabled }) => (
  <div className="controls">
    <button className="capture-button" onClick={onCapture} disabled={isCaptureDisabled}>
      Capture
    </button>
    <button className="train-button" onClick={onSave}>Save</button>
    <button className="images-button" onClick={onShowImages}>Images</button>
  </div>
);

export default Controls;
