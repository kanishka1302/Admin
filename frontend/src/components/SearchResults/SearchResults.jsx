import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import FoodItem from '../FoodItem/FoodItem';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation(); // Get query from URL
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const query = new URLSearchParams(location.search).get('query') || ''; // Extract search query
        console.log('Search Query:', query); // Log the query

        const response = await axios.get('https://admin-92vt.onrender.com/api/food/list', {
          params: { query },
        });

        console.log('API Response:', response.data.data); // Log API response
        setFilteredItems(response.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to fetch search results.');
        setLoading(false);
      }
    };

    fetchItems();
  }, [location.search]);

  if (loading) {
    return <div className="search-results-loader">Loading...</div>;
  }

  if (error) {
    return <div className="search-results-error">{error}</div>;
  }

  return (
    <div className="search-results-wrapper">
      <h2>Search Results</h2>
      <div className="search-results-list">
        {filteredItems.length === 0 ? (
          <p>No items found for your search. Try a different query!</p>
        ) : (
          filteredItems.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SearchResults;
