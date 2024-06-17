import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import the CSS file
import Chart from './Chart.jsx';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [soldProducts , setSoldProducts ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('3'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of transactions per page

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
       
        const response = await axios.get('http://localhost:2000/transactions');
        setTransactions(response.data);
        filterTransactions(selectedMonth, response.data); // Filter initial transactions
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedMonth]);

  // Function to filter transactions based on month and search term
  const filterTransactions = (month, data) => {
    var filteredData = data.filter(transaction => {
      const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
      return month === 'all' || transactionMonth.toString() === month;
    });
    setFilteredTransactions(filteredData);

    filteredData = filteredData.filter(transaction => {
      return transaction.sold;
    });

    setSoldProducts(filteredData);
  };

  // Function to handle month selection change
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
  };

  // Function to handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    // Example: Implement search filtering if needed
  };

  // Pagination logic
  const indexOfLastTransaction = currentPage * itemsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // Function to calculate total sales amount
  const calculateTotalSales = () => {
    return soldProducts.reduce((total, transaction) => {
      return total + transaction.price;
    }, 0);
  };

  // Function to count sold products
  const countSoldProducts = () => {
    return soldProducts.length;
  };

  // Function to handle pagination
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container">
      <h1>Transactions</h1>
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select value={selectedMonth} onChange={handleMonthChange} className='month-select'>
          <option value="all">All Months</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>
      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <>
          <table className="transactions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th>Category</th>
                <th>Sold</th>
                <th>Date of Sale</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.title}</td>
                  <td>{transaction.description}</td>
                  <td>${transaction.price}</td>
                  <td>{transaction.category}</td>
                  <td>{transaction.sold ? 'Yes' : 'No'}</td>
                  <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                  <td><img src={transaction.image} alt={transaction.title} className="transaction-image" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination section */}
          <div className="pagination">
            {filteredTransactions.length > itemsPerPage && (
              <ul className="pagination-list">
                <li>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                  >
                    Previous
                  </button>
                </li>
                <li>
                  <span className="pagination-current">
                    Page {currentPage} of {Math.ceil(filteredTransactions.length / itemsPerPage)}
                  </span>
                </li>
                <li>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={indexOfLastTransaction >= filteredTransactions.length}
                    className={`pagination-button ${indexOfLastTransaction >= filteredTransactions.length ? 'disabled' : ''}`}
                  >
                    Next
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Summary card */}
          <div className="card">
            <div className="summary">
              <h2>Summary</h2>
              <div className="summary-box">
                <p>Total Sales: ${calculateTotalSales().toFixed(2)}</p>
              </div>
              <div className="summary-box">
                <p>Sold Products: {countSoldProducts()}</p>
              </div>
              <div className="summary-box">
                <p>Unsold Products: {filteredTransactions.length-countSoldProducts()}</p>
              </div>
            </div>
          </div>

          
          <Chart month={selectedMonth} transactions={soldProducts} />
        </>
      )}
    </div>
  );
};

export default App;
