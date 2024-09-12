import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import App from './App';
import './index.css'; // Import global styles

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <Router basename="/custom_lineage_dev">  {/* Use your repository name here */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </Router>
  );
} else {
  console.error("Root element not found");
}
