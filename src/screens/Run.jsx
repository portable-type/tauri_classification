import React, { useRef, useEffect, useState } from 'react';
import VideoPreview from '../components/VideoPreview';
import '../App.css';
import { writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';

const Run = () => {
  const videoRef = useRef(null);
  const currentFrameRef = useRef(null);
  const [labels, setLabels] = useState("");

  async function run_predict() {
    setLabels(await invoke('run_predict'));
  }

  async function updatePredictImage() {
    if (currentFrameRef.current) {
      try {
        const response = await fetch(currentFrameRef.current);
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

        currentFrameRef.current = canvas.toDataURL('image/png');
        updatePredictImage();
      }
    };

    const intervalId = setInterval(captureFrame, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="run-container">
      <VideoPreview videoRef={videoRef} onStreamError={(err) => console.error("Stream Error: ", err)} />
      <p>{labels}</p>
    </div>
  );
};

export default Run;
