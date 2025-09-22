import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../component/PaginationComponent";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Pagination Set-Up
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  // 1. Created a reusable function to fetch products
  const getProducts = async () => {
    try {
      const productData = await ApiService.getAllProducts();

      // Use the array directly for calculations and setting state
      setTotalPages(Math.ceil(productData.length / itemsPerPage));
      setProducts(
        productData.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        )
      );
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Getting Products: " + error
      );
    }
  };

  // 2. useEffect now calls our reusable function
  useEffect(() => {
    getProducts();
  }, [currentPage]);

  // 3. Delete function now re-fetches data instead of reloading the page
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await ApiService.deleteProduct(productId);
        showMessage("Product successfully deleted");
        getProducts(); // Re-fetch the updated list
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error deleting product."
        );
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
      <div className="product-page">
        <div className="product-header">
          <h1>Products</h1>
          <button
            className="add-product-btn"
            onClick={() => navigate("/add-product")}
          >
            Add Product
          </button>
        </div>

        {products && (
          <div className="product-list">
            {products.map((product) => (
              <div key={product.id} className="product-item">
                <img
                  className="product-image"
                  src={product.imageUrl}
                  alt={product.name}
                />
                <div className="product-info">
                  <h3 className="name">{product.name}</h3>
                  {/* 4. TYPO FIX: Changed product.su to product.sku */}
                  <p className="sku">Sku: {product.sku}</p>
                  <p className="price">Price: ${product.price.toFixed(2)}</p>
                  <p className="quantity">Quantity: {product.stockQuantity}</p>
                </div>
                <div className="product-actions">
                  <button className="edit-btn" onClick={() => navigate(`/edit-product/${product.id}`)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </Layout>
  );
};

export default ProductPage;