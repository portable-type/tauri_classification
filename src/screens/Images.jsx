import React, { useEffect, useState } from 'react';
import { readDir, readFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import TabSelector from '../components/TabSelector';
import ImageGrid from '../components/ImageGrid';

const Images = () => {
  const [eisaImages, setEisaImages] = useState([]);
  const [notEisaImages, setNotEisaImages] = useState([]);
  const [activeTab, setActiveTab] = useState('Eisa');

  const loadImages = async () => {
    try {
      const eisaFiles = await readDir('tauri-classification/images/Eisa', { baseDir: BaseDirectory.Document });
      const eisaImagePaths = await Promise.all(
        eisaFiles
          .filter(file => file.name && file.name !== '.DS_Store')
          .map(async (file) => {
            const binary = await readFile(`tauri-classification/images/Eisa/${file.name}`, { baseDir: BaseDirectory.Document });
            return URL.createObjectURL(new Blob([binary]));
          })
      );

      const notEisaFiles = await readDir('tauri-classification/images/NotEisa', { baseDir: BaseDirectory.Document });
      const notEisaImagePaths = await Promise.all(
        notEisaFiles
          .filter(file => file.name && file.name !== '.DS_Store')
          .map(async (file) => {
            const binary = await readFile(`tauri-classification/images/NotEisa/${file.name}`, { baseDir: BaseDirectory.Document });
            return URL.createObjectURL(new Blob([binary]));
          })
      );

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
      <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'Eisa' && <ImageGrid images={eisaImages} />}
      {activeTab === 'NotEisa' && <ImageGrid images={notEisaImages} />}
    </div>
  );
};

export default Images;
