import React, { useState, useEffect, useRef } from 'react';
import { BaseDirectory, writeFile, mkdir, readDir, copyFile } from '@tauri-apps/plugin-fs';
import { v4 as uuidv4 } from 'uuid';
import VideoPreview from '../components/VideoPreview';
import LabelButtons from '../components/LabelButtons';
import Controls from '../components/Controls';
import CapturedImage from '../components/CapturedImage';
import FileCounts from '../components/FileCounts';
import '../App.css';
import { invoke } from '@tauri-apps/api/core';

const Train = ({ setCurrentView }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [label, setLabel] = useState(null);
  const [fileCountEisa, setFileCountEisa] = useState(0);
  const [fileCountNotEisa, setFileCountNotEisa] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const countImages = async () => {
      try {
        const countEisa = await readDir('tauri-classification/images/Eisa', { baseDir: BaseDirectory.Document });
        const countNotEisa = await readDir('tauri-classification/images/NotEisa', { baseDir: BaseDirectory.Document });

        setFileCountEisa(countEisa.length);
        setFileCountNotEisa(countNotEisa.length);
      } catch (error) {
        console.error("Error counting images: ", error);
      }
    };

    countImages();
  }, []);

  const copyImages = async () => {
    try {
      const copyFiles = async (files, sourceDir, trainDir, testDir) => {
        if (!files || files.length === 0) {
          console.error(`No files found in ${sourceDir}`);
          return;
        }

        const validFiles = files.filter(file => file && file.name && file.name !== '.DS_Store');

        if (validFiles.length === 0) {
          console.error(`No valid files to copy in ${sourceDir}`);
          return;
        }

        const totalFiles = validFiles.length;
        const trainCount = Math.floor(totalFiles * 0.8);

        const shuffledFiles = validFiles.sort(() => 0.5 - Math.random());

        await mkdir(`tauri-classification/train/${trainDir}`, { recursive: true, baseDir: BaseDirectory.Document });
        await mkdir(`tauri-classification/test/${testDir}`, { recursive: true, baseDir: BaseDirectory.Document });

        for (let i = 0; i < totalFiles; i++) {
          const file = shuffledFiles[i];

          if (i < trainCount) {
            try {
              await copyFile(
                `tauri-classification/images/${sourceDir}/${file.name}`,
                `tauri-classification/train/${trainDir}/${file.name}`,
                {
                  fromPathBaseDir: BaseDirectory.Document,
                  toPathBaseDir: BaseDirectory.Document
                }
              );
              console.log(`Copied ${file.name} to train/${trainDir}`);
            } catch (error) {
              console.error(`Failed to copy ${file.name} to train/${trainDir}: `, error);
            }
          } else {
            try {
              await copyFile(
                `tauri-classification/images/${sourceDir}/${file.name}`,
                `tauri-classification/test/${testDir}/${file.name}`,
                {
                  fromPathBaseDir: BaseDirectory.Document,
                  toPathBaseDir: BaseDirectory.Document
                }
              );
              console.log(`Copied ${file.name} to test/${testDir}`);
            } catch (error) {
              console.error(`Failed to copy ${file.name} to test/${testDir}: `, error);
            }
          }
        }
      };

      const eisaFiles = await readDir('tauri-classification/images/Eisa', { baseDir: BaseDirectory.Document });
      await copyFiles(eisaFiles, 'Eisa', 'Eisa', 'Eisa');

      const notEisaFiles = await readDir('tauri-classification/images/NotEisa', { baseDir: BaseDirectory.Document });
      await copyFiles(notEisaFiles, 'NotEisa', 'NotEisa', 'NotEisa');

      console.log('All images copied successfully!');
    } catch (error) {
      console.error("Error copying images: ", error);
    }
  };

  const captureImage = async () => {
    if (!label) {
      alert("ラベルを選択してください！");
      return;
    }

    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
      console.log(video);

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const size = Math.min(canvas.width, canvas.height);
      const x = (canvas.width - size) / 2;
      const y = (canvas.height - size) / 2;

      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = size;
      croppedCanvas.height = size;
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCtx.drawImage(canvas, x, y, size, size, 0, 0, size, size);

      const dataUrl = croppedCanvas.toDataURL('image/png');
      setCapturedImage(dataUrl);

      try {
        const blob = await fetch(dataUrl).then(res => res.blob());

        const uuid = uuidv4();
        const fileName = `${uuid}.png`;
        const folderPath = `tauri-classification/images/${label}`;

        await mkdir(folderPath, { recursive: true, baseDir: BaseDirectory.Document });

        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        await writeFile(`${folderPath}/${fileName}`, uint8Array, { baseDir: BaseDirectory.Document });
        console.log(`Image saved to ${folderPath} as ${fileName}.`);

        const countEisa = await readDir('tauri-classification/images/Eisa', { baseDir: BaseDirectory.Document });
        const countNotEisa = await readDir('tauri-classification/images/NotEisa', { baseDir: BaseDirectory.Document });
        setFileCountEisa(countEisa.length);
        setFileCountNotEisa(countNotEisa.length);
      } catch (error) {
        console.error("Error saving image: ", error);
      }
    }
  };

  async function run_train() {
    await invoke('run_train');
  }

  const handleSave = async () => {
    await copyImages();
    await run_train();
    setCurrentView('Save');
  };

  return (
    <div className="train-container">
      <VideoPreview videoRef={videoRef} onStreamError={(err) => console.error("Stream Error: ", err)} />

      <LabelButtons label={label} setLabel={setLabel} />

      <Controls
        onCapture={captureImage}
        onSave={handleSave}
        onShowImages={() => setCurrentView('Images')}
        isCaptureDisabled={!label}
      />

      <CapturedImage imageSrc={capturedImage} />

      <FileCounts eisaCount={fileCountEisa} notEisaCount={fileCountNotEisa} />
    </div>
  );
};

export default Train;
