import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Import the CSS file

const Home: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    try {
      const jsonData = JSON.parse(jsonInput);
      navigate('/app', { state: { jsonData } });
    } catch (error) {
      alert('Invalid JSON data');
    }
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(event.target.value);
  };

  return (
    <div className="container">
      <h1 className="header">Welcome to the Data Visualization App</h1>
      <form className="form" onSubmit={handleSubmit}>
        <textarea
          className="textarea"
          rows={10}
          cols={50}
          placeholder="Paste your JSON data here..."
          value={jsonInput}
          onChange={handleChange}
        />
        <br />
        <button className="button" type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Home;
