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
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
          setImageUrl(productData.imageUrl || "");
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

  // --- THIS IS THE NEW FUNCTION TO HANDLE FILE UPLOADS ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Converts the file to a Base64 string
      reader.onloadend = () => {
        // When the reader is done, set the string in our state
        setImageUrl(reader.result);
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      name,
      sku,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity, 10),
      description,
      imageUrl,
    };

    try {
      if (isEditing) {
        await ApiService.updateProduct(productId, productData);
        showMessage("Product successfully updated");
      } else {
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

          {/* --- THIS IS THE UPDATED JSX FOR THE IMAGE UPLOAD --- */}
          <div className="form-group">
            <label>Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          
          {imageUrl && (
            <div className="form-group">
              <label>Image Preview</label>
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px',
                display: 'inline-block',
                backgroundColor: '#f9f9f9'
              }}>
                <img 
                  src={imageUrl} 
                  alt="Product Preview" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: '4px'
                  }} 
                />
              </div>
            </div>
          )}
          
          <button type="submit">
            {isEditing ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddEditProductPage;
