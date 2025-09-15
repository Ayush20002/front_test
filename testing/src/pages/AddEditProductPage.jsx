import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";

const AddEditProductPage = () => {
  const { productId } = useParams("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStokeQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await ApiService.getAllCategory();
        // CORRECTED: Use the array directly
        setCategories(categoriesData);
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Error Getting all Categories."
        );
      }
    };

    const fetchProductById = async () => {
      if (productId) {
        setIsEditing(true);
        try {
          const productData = await ApiService.getProductById(productId);
          // CORRECTED: Use the product object directly without a .status check
          setName(productData.name);
          setSku(productData.sku);
          setPrice(productData.price);
          setStockQuantity(productData.stockQuantity);
          setCategoryId(productData.categoryId);
          setDescription(productData.description);
          setImageUrl(productData.imageUrl);
        } catch (error) {
          showMessage(
            error.response?.data?.message || "Error Getting Product by Id."
          );
        }
      }
    };

    fetchCategories();
    if (productId) fetchProductById();
  }, [productId]);

  //metjhod to show message or errors
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result); //user imagurl to preview the image to upload
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // CORRECTED: Create a plain JavaScript object instead of FormData
    const productData = {
      name,
      sku,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity, 10),
      categoryId: parseInt(categoryId, 10),
      description,
      // Use existing imageUrl on edit, or a placeholder for new products
      imageUrl: imageUrl || "https://placehold.co/600x400/EEE/31343C?text=New+Product",
    };

    try {
      if (isEditing) {
        await ApiService.updateProduct(productId, productData);
        showMessage("Product successfully updated");
      } else {
        await ApiService.addProduct(productData);
        showMessage("Product successfully Saved 🤩");
      }
      navigate("/product");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error Saving a Product."
      );
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
            <label>Sku</label>
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
              onChange={(e) => setStokeQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
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

          <div className="form-group">
            <label>Category</label>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <input type="file" onChange={handleImageChange} />

            {imageUrl && (
              <img src={imageUrl} alt="preview" className="image-preview" />
            )}
          </div>
          <button type="submit">{isEditing ? "Edit Product" : "Add Product"}</button>

        </form>
      </div>
    </Layout>
  );
};

export default AddEditProductPage;