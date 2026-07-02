import { useState } from 'react';
import parseExpenseWithGemini from '../../utils/geminiExpressParser.js';

const useVoiceExpense = () => {
  // status tells the UI what to show: idle → listening → processing → done/error
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const startListening = (members, currentUser) => {
    // Chrome uses SpeechRecognition, older browsers use webkitSpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';        // Indian English — better accent support
    recognition.interimResults = false; // We want the final result, not live words
    recognition.maxAlternatives = 1;   // Only give us the best guess

    setStatus('listening');
    setResult(null);
    setError(null);

    // This fires once the user stops speaking
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      // e.g. transcript = "dinner at restaurant 800 rupees split with Rahul and Priya"

      setStatus('processing'); // Show a spinner — Gemini is thinking

      try {
        const parsed = await parseExpenseWithGemini(transcript, members, currentUser.name);
        setResult(parsed);
        setStatus('done');
      } catch {
        setError('Could not parse the expense. Please try again.');
        setStatus('error');
      }
    };

    recognition.onerror = (event) => {
      setError(`Mic error: ${event.error}`);
      setStatus('error');
    };

    recognition.start(); // Actually turns on the microphone
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setError(null);
  };

  return { status, result, error, startListening, reset };
};

export default useVoiceExpense;
