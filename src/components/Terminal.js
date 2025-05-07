import React, { useState, useEffect, useRef } from 'react';
import CommandLine from './CommandLine';
import Output from './Output';
import { executeCommand } from '../services/cryptoService';

function Terminal() {
  const [output, setOutput] = useState(['Welcome to Crypto Terminal v1.0', 'Type "help" for available commands']);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef(null);

  const handleCommand = async (command) => {
    if (!command.trim()) return;

    const newOutput = [...output, `$ ${command}`];
    setOutput(newOutput);
    setCommandHistory([...commandHistory, command]);
    setHistoryIndex(-1);

    try {
      const result = await executeCommand(command);
      setOutput([...newOutput, result]);
    } catch (error) {
      setOutput([...newOutput, `Error: ${error.message}`]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        return commandHistory[commandHistory.length - 1 - newIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        return commandHistory[commandHistory.length - 1 - newIndex];
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        return '';
      }
    }
    return null;
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="terminal" ref={terminalRef}>
      <Output output={output} />
      <CommandLine onCommand={handleCommand} onKeyDown={handleKeyDown} />
    </div>
  );
}

export default Terminal; 