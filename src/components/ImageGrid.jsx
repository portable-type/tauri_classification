import React from 'react';

const ImageGrid = ({ images }) => {
  return (
    <div className="image-grid">
      {images.map((imagePath, index) => (
        <div className="image-container" key={index}>
          <img src={imagePath} alt={`Image ${index}`} />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
