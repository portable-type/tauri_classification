import React, { useEffect, useRef, useState } from 'react';
import '../App.css';

const Images = () => {
    return (
        <div className="images-grid">
            {[...Array(12)].map((_, index) => (
                <div key={index} className="image-item">Image {index + 1}</div>
            ))}
        </div>
    );
};

export default Images;
