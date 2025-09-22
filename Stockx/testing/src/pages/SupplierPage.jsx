import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 1. Created a reusable function to fetch suppliers
  const getSuppliers = async () => {
    try {
      const responseData = await ApiService.getAllSuppliers();
      setSuppliers(responseData);
    } catch (error) {
      showMessage(error.response?.data?.message || "Error getting suppliers.");
    }
  };

  // 2. useEffect now calls our reusable function
  useEffect(() => {
    getSuppliers();
  }, []);

  // 3. Delete function now re-fetches data instead of reloading the page
  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await ApiService.deleteSupplier(supplierId);
        showMessage("Supplier successfully deleted");
        getSuppliers(); // Re-fetch the updated list
      } catch (error) {
        showMessage(error.response?.data?.message || "Error deleting supplier.");
      }
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
      {message && <div className="message">{message}</div>}
      <div className="supplier-page">
        <div className="supplier-header">
          <h1>Suppliers</h1>
          <div className="add-sup">
            <button onClick={() => navigate("/add-supplier")}>
              Add Supplier
            </button>
          </div>
        </div>

        {suppliers && (
          <ul className="supplier-list">
            {suppliers.map((supplier) => (
              <li className="supplier-item" key={supplier.id}>
                <span>{supplier.name}</span>
                <div className="supplier-actions">
                  <button onClick={() => navigate(`/edit-supplier/${supplier.id}`)}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteSupplier(supplier.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default SupplierPage;