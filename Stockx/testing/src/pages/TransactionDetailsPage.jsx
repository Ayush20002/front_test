import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const TransactionDetailsPage = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getTransaction = async () => {
      try {
        const transactionData = await ApiService.getTransactionById(transactionId);
        setTransaction(transactionData);
        if (transactionData) {
          setStatus(transactionData.status);
        }
      } catch (error) {
        showMessage("Error getting transaction details.");
      }
    };
    getTransaction();
  }, [transactionId]);

  // CORRECTED: This function now sends the status as an object
  // and calls the correct ApiService method.
  const handleUpdateStatus = async () => {
    try {
      await ApiService.updateTransaction(transactionId, { status: status });
      showMessage("Status updated successfully!");
      navigate("/transaction");
    } catch (error) {
      showMessage("Error updating transaction status.");
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <Layout>
      {message && <p className="message">{message}</p>}
      <div className="transaction-details-page">
        {transaction && (
          <>
            <div className="section-card">
              <h2>Transaction Information</h2>
              <p>Type: {transaction.transactionType}</p>
              <p>Status: {transaction.status}</p>
              <p>Description: {transaction.description}</p>
              <p>Note: {transaction.note}</p>
              <p>Total Products: {transaction.totalProducts}</p>
              <p>Total Price: ${transaction.totalPrice.toFixed(2)}</p>
              <p>Created At: {new Date(transaction.createdAt).toLocaleString()}</p>
              {transaction.updatedAt && (
                <p>Updated At: {new Date(transaction.updatedAt).toLocaleString()}</p>
              )}
            </div>

            {transaction.product && <div className="section-card">
              <h2>Product Information</h2>
              <p>Name: {transaction.product.name}</p>
              <p>SKU: {transaction.product.sku}</p>
              <p>Price: ${transaction.product.price.toFixed(2)}</p>
            </div>}
            
            {transaction.user && <div className="section-card">
              <h2>User Information</h2>
              <p>Name: {transaction.user.name}</p>
              <p>Email: {transaction.user.email}</p>
            </div>}

            {/* CORRECTED: Changed transaction.suppliers to transaction.supplier */}
            {transaction.supplier && (
              <div className="section-card">
                <h2>Supplier Information</h2>
                <p>Name: {transaction.supplier.name}</p>
                <p>Contact: {transaction.supplier.contactInfo}</p>
              </div>
            )}

            <div className="section-card transaction-staus-update">
              <label>Update Status: </label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <button onClick={handleUpdateStatus}>Update Status</button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default TransactionDetailsPage;