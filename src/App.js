// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AudioUploader from './components/AudioUploader';
import Appointment from './components/Appointment';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route */}
          <Route exact path="/" element={<Appointment />} />
          {/* Appointment route */}
          {/* <Route path="/appointment" element={<Appointment />} /> */}
          {/* You can add more routes here as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
