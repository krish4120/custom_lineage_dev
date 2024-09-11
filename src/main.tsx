import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import App from './App';
import Login from './Login'; // Import the Login component
import './index.css'; // Import global styles

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Set Login as the default route */}
        <Route path="/home" element={<Home />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </Router>
  );
} else {
  console.error("Root element not found");
}
