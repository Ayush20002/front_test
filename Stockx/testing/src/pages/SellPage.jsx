import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";

const SellPage = () => {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productData = await ApiService.getAllProducts();
        setProducts(productData);
      } catch (error) {
        showMessage("Error getting products.");
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));

    if (!productId || !quantity || !user) {
      showMessage("Please fill in all required fields.");
      return;
    }

    // CORRECTED: Send a "flat" object with IDs, as the new backend requires
    const body = {
      productId: parseInt(productId, 10),
      userId: user.id, // Get the logged-in user's ID
      quantity: parseInt(quantity, 10),
      description: description || "Product sale",
      note: note || "",
    };
    console.log("Submitting sell data to API:", body);

    try {
      await ApiService.sellProduct(body);
      showMessage("Product sold successfully!");
      resetForm();
    } catch (error) {
      showMessage(error.response?.data?.message || "Error selling product.");
    }
  };

  const resetForm = () => {
    setProductId("");
    setDescription("");
    setNote("");
    setQuantity("");
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
      <div className="purchase-form-page">
        <h1>Sell Product</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button type="submit">Sell Product</button>
        </form>
      </div>
    </Layout>
  );
};

export default SellPage;