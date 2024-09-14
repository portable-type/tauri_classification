import React, { useEffect, useRef, useState } from 'react';
import '../App.css';

const Save = () => {
    return (
        <div className="save-view">
            <h1>Save View</h1>
            <progress value="0" max="100"></progress>
        </div>
    );
};

export default Save;
