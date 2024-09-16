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
}

const Navbar: React.FC<NavbarProps> = ({
  onExpandCollapseToggle,
  onDownload,
  onSearch,
  onNext,
  onReset
}) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="../custom_lineage_dev/Bi3-Logo.svg" alt="Logo" />
      </div>
      <div className="navbar-search"> {/* Place search box before the icons */}
        <SearchBox onSearch={onSearch} onNext={onNext} />
      </div>
      <div className="navbar-dropdowns">
        <button className="navbar-logo" onClick={onReset}><img src="../custom_lineage_dev/refresh.png" alt="Refresh" /></button>
      </div>
      <div className="navbar-icons">
        <label className="toggle-switch">
          <input type="checkbox" defaultChecked={true} onChange={onExpandCollapseToggle} />
          <span className="slider"></span>
        </label>
        <button className="navbar-button"onClick={onDownload}>Download</button>
        <div className="navbar-profile">
          <img src="../custom_lineage_dev/user.png" alt="Profile" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
