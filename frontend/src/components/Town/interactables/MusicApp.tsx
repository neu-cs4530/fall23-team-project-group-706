import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import SpotifyLoginButton from './SpotifyLoginButton';
import CallBack from './CallBack';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Route exact path="/" component={SpotifyLoginButton} />
        <Route path="/callback" component={CallBack} />
      </div>
    </Router>
  );
};

export default App;