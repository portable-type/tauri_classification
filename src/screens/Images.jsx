import React, { useEffect, useState } from 'react';
import { readDir, BaseDirectory } from '@tauri-apps/plugin-fs';

const Images = () => {
  const [eisaImages, setEisaImages] = useState([]);
  const [notEisaImages, setNotEisaImages] = useState([]);

  const loadImages = async () => {
    try {
      const eisaFiles = await readDir('tauri-classification/images/Eisa', { baseDir: BaseDirectory.Document });
      const eisaImagePaths = eisaFiles
        .filter(file => file.name && file.name !== '.DS_Store')
        .map(file => `${BaseDirectory.Document}/tauri-classification/images/Eisa/${file.name}`);

      const notEisaFiles = await readDir('tauri-classification/images/NotEisa', { baseDir: BaseDirectory.Document });
      const notEisaImagePaths = notEisaFiles
        .filter(file => file.name && file.name !== '.DS_Store')
        .map(file => `${BaseDirectory.Document}/tauri-classification/images/NotEisa/${file.name}`);
      setEisaImages(eisaImagePaths);
      setNotEisaImages(notEisaImagePaths);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div>
      <h2>Eisa Images</h2>
      {eisaImages.map((imagePath, index) => (
        <div key={index}>
          <img src={imagePath} style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      ))}

      <h2>NotEisa Images</h2>
      {notEisaImages.map((imagePath, index) => (
        <div key={index}>
          <img src={imagePath} style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      ))}
    </div>
  );
};

export default Images;
