import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CallbackPage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const code: string | null = new URLSearchParams(location.search).get('code');
    if (code) {
      fetch('http://localhost:3000/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
    }
  }, [location]);

  return <div>Processing...</div>;
};

export default CallbackPage;