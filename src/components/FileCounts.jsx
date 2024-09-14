import React from 'react';

const FileCounts = ({ eisaCount, notEisaCount }) => (
  <div className="file-counts">
    <h3>Image Counts</h3>
    <p>Eisa: {eisaCount} files</p>
    <p>Not Eisa: {notEisaCount} files</p>
  </div>
);

export default FileCounts;
