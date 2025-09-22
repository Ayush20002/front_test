import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const [valueToSearch, setValueToSearch] = useState("");

  const navigate = useNavigate();

  //Pagination Set-Up
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const transactionData = await ApiService.getAllTransactions(valueToSearch);

        // CORRECTED: Use the array directly for both calculations and setting state
        setTotalPages(Math.ceil(transactionData.length / itemsPerPage));

        setTransactions(
          transactionData.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          )
        );
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error getting transactions."
        );
      }
    };

    getTransactions();
  }, [currentPage, valueToSearch]);



  //Method to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };


  //handle search
  const handleSearch = () =>{
    console.log("Searcxh hit")
    console.log("FILTER IS: " + filter)
    setCurrentPage(1)
    setValueToSearch(filter)
  }

  //Navigate to transactions details page
  const navigateToTransactionDetailsPage = (transactionId) =>{
    navigate(`/transaction/${transactionId}`);
  }

  return (
    <Layout>

      {message && <p className="message">{message}</p>}
      <div className="transactions-page">
        <div className="transactions-header">
            <h1>Transactions</h1>
            <div className="transaction-search">
                <input 
                placeholder="Search transaction ..."
                value={filter}
                onChange={(e)=> setFilter(e.target.value)}
                type="text" />
                <button onClick={()=> handleSearch()} > Search</button>
            </div>
        </div>

        {transactions && 
            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>TYPE</th>
                        <th>STATUS</th>
                        <th>TOTAL PRICE</th>
                        <th>TOTAL PRODUCTS</th>
                        <th>DATE</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>

                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{transaction.transactionType}</td>
                            <td>{transaction.status}</td>
                            <td>{transaction.totalPrice}</td>
                            <td>{transaction.totalProducts}</td>
                            <td>{new Date(transaction.createdAt).toLocaleString()}</td>

                            <td>
                                <button onClick={()=> navigateToTransactionDetailsPage(transaction.id)}>View Details</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        }
      </div>


      <PaginationComponent
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      />
    </Layout>
  );
};
export default TransactionsPage;