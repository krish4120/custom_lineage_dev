import React, { useState, useCallback, KeyboardEvent } from 'react';
import './SearchBox.css'; // Import the CSS file for styling

interface SearchBoxProps {
  onSearch: (searchTerm: string) => void;
  onNext: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, onNext }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      alert('Please enter a search term.');
      return;
    }

    onSearch(searchTerm);
    onNext();
  }, [searchTerm, onSearch, onNext]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-box-container">
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search node ID"
        className="search-box-input"
      />
      <button onClick={handleSearch} className="search-box-button">
        <span className="search-icon">&#128269;</span> {/* Unicode for a magnifying glass */}
      </button>
    </div>
  );
};

export default SearchBox;
