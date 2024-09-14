import React, { useState } from 'react';
import './App.css';
import Train from './screens/Train';
import Save from './screens/Save';
import Run from './screens/Run';
import Images from './screens/Images';

function App() {
  const [currentView, setCurrentView] = useState('Train');

  const renderView = () => {
    switch (currentView) {
      case 'Images':
        return <Images />;
      case 'Train':
        return <Train setCurrentView={setCurrentView} />;
      case 'Save':
        return <Save />;
      case 'Run':
        return <Run />;
      default:
        return <Train setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="app">
      <div className="main-view">
        {renderView()}
      </div>
    </div>
  );
}

export default App;
