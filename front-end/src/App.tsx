// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import MainDash from './pages/MainDash';
import PrivateRoute from  './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Home />} />

      {/* Protected route */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <MainDash />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

export default App;
