import React, { useState } from 'react';
import './App.css';
import Train from './screens/Train';
import Save from './screens/Save';
import Run from './screens/Run';
import Images from './screens/Images';
import MailAuth from './screens/MailAuth';

function App() {
  const [currentView, setCurrentView] = useState('MailAuth');

  const renderView = () => {
    switch (currentView) {
      case 'MailAuth':
        return <MailAuth setCurrentView={setCurrentView} />;
      case 'Images':
        return <Images />;
      case 'Train':
        return <Train setCurrentView={setCurrentView} />;
      case 'Save':
        return <Save />;
      case 'Run':
        return <Run />;
      default:
        return <MailAuth setCurrentView={setCurrentView} />;
    }
  };

  const env = import.meta.env.VITE_API_KEY;
  console.log(env);

  return (
    <div className="app">
      <div className="main-view">
        {renderView()}
      </div>
    </div>
  );
}

export default App;
