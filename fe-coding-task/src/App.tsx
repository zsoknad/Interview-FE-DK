import React from 'react';
import { Routes, Route, BrowserRouter } from "react-router-dom";

import Layout from './routes/Layout';
import Home from './routes/Home';
import NoPage from './routes/NoPage';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="*" element={<NoPage />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
