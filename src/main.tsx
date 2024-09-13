import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import App from './App';
import './index.css'; // Import global styles

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <Router>
      <Routes>
        <Route path="/custom_lineage_dev/" element={<App />} />
        <Route path="/custom_lineage_dev/home" element={<Home />} />
        <Route path="/custom_lineage_dev/app" element={<App />} />
      </Routes>
    </Router>
  );
} else {
  console.error("Root element not found");
}
