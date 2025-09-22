import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const AddEditProductPage = () => {
  const { productId } = useParams();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // useEffect now only fetches the product if we are in "edit" mode
  useEffect(() => {
    if (productId) {
      setIsEditing(true);
      const fetchProductById = async () => {
        try {
          const productData = await ApiService.getProductById(productId);
          setName(productData.name);
          setSku(productData.sku);
          setPrice(productData.price);
          setStockQuantity(productData.stockQuantity);
          setDescription(productData.description);
        } catch (error) {
          showMessage("Error getting product details.");
        }
      };
      fetchProductById();
    }
  }, [productId]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create a simple product object that matches the new backend payload
    const productData = {
      name,
      sku,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity, 10),
      description,
    };

    try {
      if (isEditing) {
        // Use PATCH for updates as per the new spec
        await ApiService.updateProduct(productId, productData);
        showMessage("Product successfully updated");
      } else {
        // Renamed for clarity to match the final ApiService
        await ApiService.createProduct(productData);
        showMessage("Product successfully saved");
      }
      navigate("/product");
    } catch (error) {
      showMessage(error.response?.data?.message || "Error saving product.");
    }
  };

  return (
    <Layout>
      {message && <div className="message">{message}</div>}
      <div className="product-form-page">
        <h1>{isEditing ? "Edit Product" : "Add Product"}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category and Image Upload fields are removed to match the new API */}
          
          <button type="submit">
            {isEditing ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddEditProductPage;