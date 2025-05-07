import React, { useState, useRef, useEffect } from 'react';

function CommandLine({ onCommand, onKeyDown }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onCommand(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    const historyCommand = onKeyDown(e);
    if (historyCommand !== null) {
      setInput(historyCommand);
    }
  };

  return (
    <form className="command-line" onSubmit={handleSubmit}>
      <span className="prompt">$</span>
      <input
        ref={inputRef}
        type="text"
        className="input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <span className="cursor"></span>
    </form>
  );
}

export default CommandLine; 