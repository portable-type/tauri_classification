import React, { useRef, useEffect, useState } from 'react';
import VideoPreview from '../components/VideoPreview';
import '../App.css';
import { writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';

const Run = () => {
  const videoRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState("");
  const [labels, setLabels] = useState("");

  async function run_predict() {
    setLabels(await invoke('run_predict'));
  }

  async function updatePredictImage() {
    if (currentFrame) {
      try {
        const response = await fetch(currentFrame);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        await writeFile('tauri-classification/predict.png', uint8Array, {
          baseDir: BaseDirectory.Document,
        });

        console.log('Image updated as predict.png');
        run_predict();
      } catch (error) {
        console.error('Error updating image:', error);
      }
    }
  }

  useEffect(() => {
    const captureFrame = () => {
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const video = videoRef.current;

        const size = 720;
        canvas.width = size;
        canvas.height = size;

        const aspectRatio = video.videoWidth / video.videoHeight;
        let drawWidth = size;
        let drawHeight = size;

        if (aspectRatio > 1) {
          drawHeight = size / aspectRatio;
        } else {
          drawWidth = size * aspectRatio;
        }

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, drawWidth, drawHeight);

        const image = canvas.toDataURL('image/jpeg');
        setCurrentFrame(image);
        updatePredictImage();
      }
    };

    const intervalId = setInterval(captureFrame, 1000);

    return () => clearInterval(intervalId);
  }, [currentFrame]);

  return (
    <div className="run-container">
      <VideoPreview videoRef={videoRef} onStreamError={(err) => console.error("Stream Error: ", err)} />
      <p>{labels}</p>
      {currentFrame && <img src={currentFrame} alt="Current Frame" />}
    </div>
  );
};

export default Run;
