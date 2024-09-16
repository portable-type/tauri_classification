import React from 'react';

const FileCounts = ({ eisaCount, notEisaCount }) => (
  <div className="file-counts">
    <h3>Image Counts</h3>
    <p>エイサー: {eisaCount} files</p>
    <p>エイサーじゃない: {notEisaCount} files</p>
  </div>
);

export default FileCounts;
