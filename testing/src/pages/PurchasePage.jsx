import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";

const PurchasePage = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [productId, setProductId] = useState("");
  const [supplierId, setSuppplierId] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchproductsAndSuppliers = async () => {
      try {
        const productData = await ApiService.getAllProducts();
           const supplierData = await ApiService.getAllSuppliers();
           setProducts(productData);
           setSuppliers(supplierData);
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting Products: " + error
        );
      }
    };

    fetchproductsAndSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId || !supplierId || !quantity) {
      showMessage("Please fill in all required fields");
      return;
    }

    // CORRECTED: Use loose equality (==) to find items by ID
    const selectedProduct = products.find(p => p.id == productId);
    const selectedSupplier = suppliers.find(s => s.id == supplierId);

    if (!selectedProduct || !selectedSupplier) {
      showMessage("Selected product or supplier not found.");
      return;
    }

    const calculatedTotalPrice = selectedProduct.price * parseInt(quantity, 10);

    // CORRECTED: Build the full, nested transaction object
    const body = {
      product: selectedProduct,   // Embed the full product object
      supplier: selectedSupplier, // Embed the full supplier object
      user: { name: "Current User" }, // Add a mock user
      quantity: parseInt(quantity, 10),
      description: description || "Inventory purchase",
      note: note || "",
      transactionType: "PURCHASE",
      status: "COMPLETED",
      totalProducts: parseInt(quantity, 10),
      totalPrice: calculatedTotalPrice,
      createdAt: new Date().toISOString(),
    };

    try {
      await ApiService.purchaseProduct(body);
      showMessage("Purchase successful!");
      const resetForm = () => {
    setProductId("");
    setSuppplierId("");
    setDescription("");
    setNote("");
    setQuantity("");
  };
      // Optionally navigate away after success
      // navigate("/transaction"); 
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Purchasing Product: " + error
      );
    }
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
        <h1>Receive Inventory</h1>
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
            <label>Select Supplier</label>

            <select
              value={supplierId}
              onChange={(e) => setSuppplierId(e.target.value)}
              required
            >
              <option value="">Select a supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
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

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <button type="submit">Purchase Product</button>
        </form>
      </div>
    </Layout>
  );
};
export default PurchasePage;