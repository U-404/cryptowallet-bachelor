import React, { useState } from 'react';
import './ChatGPT.css';

function ChatGPT() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!API_KEY) {
      setAnswer('Error: API key is not configured properly');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "user",
              content: question
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        setAnswer(data.choices[0].message.content);
      } else {
        throw new Error('No response from ChatGPT');
      }
    } catch (error) {
      console.error('Error details:', error);
      setAnswer(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatgpt-container">
      <form onSubmit={handleSubmit} className="question-form">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          disabled={isLoading}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Ask Question'}
        </button>
      </form>
      {answer && (
        <div className="answer-container">
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default ChatGPT; 