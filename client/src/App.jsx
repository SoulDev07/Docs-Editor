// import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import { TextEditor } from "./components/index.js";
import "./App.css";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/document/:id' element={<TextEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
