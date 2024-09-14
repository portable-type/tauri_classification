import React, { useEffect, useRef, useState } from 'react';
import { BaseDirectory, writeFile, mkdir, writeTextFile, readDir, copyFile } from '@tauri-apps/plugin-fs';
import { v4 as uuidv4 } from 'uuid';
import '../App.css';

const Train = ({ setCurrentView }) => {
  const videoRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [label, setLabel] = useState(null);
  const [fileCountEisa, setFileCountEisa] = useState(0);
  const [fileCountNotEisa, setFileCountNotEisa] = useState(0);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

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

        for (let i = 0; i < totalFiles; i++) {
          const file = shuffledFiles[i];

          if (i < trainCount) {
            await copyFile(
              `tauri-classification/images/${sourceDir}/${file.name}`,
              `tauri-classification/train/${trainDir}/${file.name}`,
              {
                fromPathBaseDir: BaseDirectory.Document,
                toPathBaseDir: BaseDirectory.Document
              }
            );
            console.log(`Copied ${file.name} to train/${trainDir}`);
          } else {
            await copyFile(
              `tauri-classification/images/${sourceDir}/${file.name}`,
              `tauri-classification/test/${testDir}/${file.name}`,
              {
                fromPathBaseDir: BaseDirectory.Document,
                toPathBaseDir: BaseDirectory.Document
              }
            );
            console.log(`Copied ${file.name} to test/${testDir}`);
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

        const labelTxt = {"label": ["Eisa", "NotEisa"]};
        const txtContents = JSON.stringify(labelTxt);
        await writeTextFile('tauri-classification/class.json', txtContents, { baseDir: BaseDirectory.Document });

        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        await writeFile(`${folderPath}/${fileName}`, uint8Array, { baseDir: BaseDirectory.Document });
        console.log(`Image saved to ${folderPath} as ${fileName}.`);

        const countEisa = await readDir('tauri-classification/images/Eisa', { baseDir: BaseDirectory.Document });
        const countNotEisa = await readDir('tauri-classification/images/NotEisa', {  baseDir: BaseDirectory.Document });
        setFileCountEisa(countEisa.length);
        setFileCountNotEisa(countNotEisa.length);
      } catch (error) {
        console.error("Error saving image: ", error);
      }
    }
  };

  return (
    <div className="train-container">
      <video ref={videoRef} autoPlay playsInline className="video-preview" />

      <div className="label-buttons">
        <button className={`label-button ${label === 'Eisa' ? 'selected' : ''}`} onClick={() => setLabel('Eisa')}>Eisa</button>
        <button className={`label-button ${label === 'NotEisa' ? 'selected' : ''}`} onClick={() => setLabel('NotEisa')}>Not Eisa</button>
      </div>

      <div className="controls">
        <button className="capture-button" onClick={captureImage} disabled={!label}>
          Capture
        </button>
        <button className="train-button" onClick={() => {copyImages()}}>Save</button>
        <button className="images-button" onClick={() => setCurrentView('Images')}>Images</button>
      </div>

      {capturedImage && (
        <div className="captured-image-container">
          <h3>撮影された画像</h3>
          <img src={capturedImage} alt="Captured" className="captured-image" />
        </div>
      )}

      <div className="file-counts">
        <h3>Image Counts</h3>
        <p>Eisa: {fileCountEisa} files</p>
        <p>Not Eisa: {fileCountNotEisa} files</p>
      </div>
    </div>
  );
};

export default Train;
