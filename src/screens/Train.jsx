import React, { useState, useEffect, useRef } from 'react';
import { BaseDirectory, writeFile, mkdir, readDir, copyFile } from '@tauri-apps/plugin-fs';
import VideoPreview from '../components/VideoPreview';
import LabelButtons from '../components/LabelButtons';
import Controls from '../components/Controls';
import CapturedImage from '../components/CapturedImage';
import FileCounts from '../components/FileCounts';
import '../App.css';
import '../screens/Save';
import '../screens/Run';
import { countData, recieveData } from '../cloud/data';
import { invoke } from '@tauri-apps/api/core';
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { app } from '../cloud/firebase';
import { splitData } from '../cloud/split';

const Train = ({ setCurrentView }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [label, setLabel] = useState(null);
  const [fileCountEisa, setFileCountEisa] = useState(0);
  const [fileCountNotEisa, setFileCountNotEisa] = useState(0);
  const videoRef = useRef(null);
  const auth = getAuth(app);
  const [user] = useAuthState(auth);
  const email = user.email;

  useEffect(() => {
    const countImages = async () => {
      try {
        const email = user.email;
        const countEisa = await countData(email, 'Eisa');
        const countNotEisa = await countData(email, 'NotEisa');

        setFileCountEisa(countEisa);
        setFileCountNotEisa(countNotEisa);
      } catch (error) {
        console.error("Error counting images: ", error);
      }
    };

    countImages();
  }, []);

  const copyImages = async () => {
    await splitData(user.email);
    console.log("success");
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

        await recieveData(blob, label, email);

        const countEisa = await countData(email, 'Eisa');
        const countNotEisa = await countData(email, 'NotEisa');
        setFileCountEisa(countEisa);
        setFileCountNotEisa(countNotEisa);
      } catch (error) {
        console.error("Error saving image: ", error);
      }
    }
  };

  async function run_train() {
    // await invoke('run_train');
  }

  const handleSave = async () => {
    await copyImages();
    await run_train();
    //setCurrentView('Save');
    //setCurrentView('Run');
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
