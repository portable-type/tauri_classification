import { useState, useEffect } from 'react';

export function useOpenCv() {
  const [loaded, setLoaded] = useState(false);
  const [cvInstance, setCvInstance] = useState(null);

  useEffect(() => {
    const loadOpenCv = () => {
      if (window.cv) {
        setCvInstance(window.cv);
        setLoaded(true);
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/opencv.js';
        script.async = true;
        script.onload = () => {
          if (window.cv) {
            setCvInstance(window.cv);
            setLoaded(true);
          }
        };
        document.body.appendChild(script);
      }
    };

    loadOpenCv();
  }, []);

  return { loaded, cv: cvInstance };
}
