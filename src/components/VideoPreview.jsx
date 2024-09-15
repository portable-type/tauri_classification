import React, { useEffect, useRef } from 'react';
import { useOpenCv } from '../hooks/useOpenCv';

const VideoPreview = ({ videoRef, onStreamError }) => {
  const { loaded, cv } = useOpenCv();
  const canvasRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 720 },
            height: { ideal: 720 }
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        if (onStreamError) onStreamError(err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [videoRef, onStreamError]);

  useEffect(() => {
    if (loaded && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const processFrame = () => {
        if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const src = cv.imread(canvas);
          const dst = new cv.Mat();

          const alpha = 1.2;
          const beta = 50;
          src.convertTo(dst, -1, alpha, beta);

          cv.imshow(canvas, dst);
          src.delete();
          dst.delete();
        }
        requestAnimationFrame(processFrame);
      };

      processFrame();
    }
  }, [loaded, videoRef, cv]);

  return (
    <div className="video-preview-container">
      <video ref={videoRef} autoPlay playsInline className="video-preview" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default VideoPreview;
