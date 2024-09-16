import React from 'react';

const CapturedImage = ({ imageSrc }) => (
  imageSrc && (
    <div className="captured-image-container">
      <h3>撮影された画像</h3>
      <img src={imageSrc} alt="Captured" className="captured-image" />
    </div>
  )
);

export default CapturedImage;
