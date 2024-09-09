// Navbar.tsx
import React from 'react';
import './Navbar.css'; // For custom styles
import SearchBox from './SearchBox'; // Import SearchBox component

interface NavbarProps {
  onExpandCollapseToggle: () => void;
  onDownload: () => void;
  onSearch: (searchTerm: string) => void;
  onNext: () => void;
  onReset: () => void;
  databases: string[];
  schemas: string[];
  tables: string[];
}

const Navbar: React.FC<NavbarProps> = ({
  onExpandCollapseToggle,
  onDownload,
  onSearch,
  onNext,
  onReset,
  databases = [],
  schemas = [],
  tables = []
}) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="../Bi3-Logo.svg" alt="Logo" />
      </div>
      <div className="navbar-dropdowns">
        <select>
          <option value="">Select Database</option>
          {databases.map((db) => (
            <option key={db} value={db}>{db}</option>
          ))}
        </select>
        <select>
          <option value="">Select Schema</option>
          {schemas.map((schema) => (
            <option key={schema} value={schema}>{schema}</option>
          ))}
        </select>
        <select>
          <option value="">Select Table</option>
          {tables.map((table) => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>
        <select>
          <option value="">Select Type</option>
          <option value="parent">Parent</option>
          <option value="child">Child</option>
        </select>
        <button onClick={onReset}>Reset</button>
      </div>
      <div className="navbar-search"> {/* Place search box before the icons */}
        <SearchBox onSearch={onSearch} onNext={onNext} />
      </div>
      <div className="navbar-icons">
        <label className="toggle-switch">
          <input type="checkbox" defaultChecked={true} onChange={onExpandCollapseToggle} />
          <span className="slider"></span>
        </label>
        <button onClick={onDownload}>Download</button>
        <div className="navbar-profile">
          <img src="../user.png" alt="Profile" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
