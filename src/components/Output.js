import React from 'react';

function Output({ output }) {
  return (
    <div className="output">
      {output.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </div>
  );
}

export default Output; 