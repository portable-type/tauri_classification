import React from 'react';

const TabSelector = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tabs">
      <button
        className={`tab-button ${activeTab === 'Eisa' ? 'active' : ''}`}
        onClick={() => setActiveTab('Eisa')}
      >
        エイサー
      </button>
      <button
        className={`tab-button ${activeTab === 'NotEisa' ? 'active' : ''}`}
        onClick={() => setActiveTab('NotEisa')}
      >
        エイサーじゃない
      </button>
    </div>
  );
};

export default TabSelector;
