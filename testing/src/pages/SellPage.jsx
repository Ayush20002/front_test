import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";

const SellPage = () => {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productData = await ApiService.getAllProducts();
        
        // CORRECTED: Use the array directly
        setProducts(productData);

      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error getting products."
        );
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId || !quantity) {
      showMessage("Please fill in all required fields");
      return;
    }

    const selectedProduct = products.find(p => p.id == productId);

    if (!selectedProduct) {
      showMessage("Selected product not found.");
      return;
    }

    const calculatedTotalPrice = selectedProduct.price * parseInt(quantity, 10);

    const body = {
      // --- Start of Changes ---
      product: selectedProduct, // Instead of productId, save the whole object
      user: { name: "Current User" }, // Add a mock user object for consistency
      // --- End of Changes ---
      
      quantity: parseInt(quantity, 10),
      description: description || "Product sale",
      note: note || "",
      transactionType: "SELL",
      status: "COMPLETED",
      totalProducts: parseInt(quantity, 10),
      totalPrice: calculatedTotalPrice,
      createdAt: new Date().toISOString(),
    };

    try {
      // The ApiService call remains the same
      await ApiService.sellProduct(body);
      showMessage("Product sold successfully!");
      resetForm();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Selling Product: " + error
      );
    }
  };

  const resetForm = () => {
    setProductId("");
    setDescription("");
    setNote("");
    setQuantity("");
  };

  //metjhod to show message or errors
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
              required
            />
          </div>

          <div className="form-group">
            <label>Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </div>


          <button type="submit">Sell Product</button>
        </form>
      </div>
    </Layout>
  );
};
export default SellPage;