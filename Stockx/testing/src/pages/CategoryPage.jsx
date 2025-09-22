import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // 1. Created a reusable function to fetch categories
  const getCategories = async () => {
    try {
      const response = await ApiService.getAllCategories();
      setCategories(response);
    } catch (error) {
      showMessage(error.response?.data?.message || "Error getting categories.");
    }
  };

  // 2. useEffect now calls our reusable function
  useEffect(() => {
    getCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName) {
      showMessage("Category name cannot be empty");
      return;
    }

    try {
      if (isEditing) {
        await ApiService.updateCategory(editingCategoryId, { name: categoryName });
        showMessage("Category successfully updated");
      } else {
        await ApiService.createCategory({ name: categoryName });
        showMessage("Category successfully added");
      }
      // 3. Reset form and re-fetch the list instead of reloading the page
      setIsEditing(false);
      setEditingCategoryId(null);
      setCategoryName("");
      getCategories(); // Re-fetch the updated list
    } catch (error) {
      showMessage(error.response?.data?.message || "Error saving category.");
    }
  };

  const handleEditClick = (category) => {
    setIsEditing(true);
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCategoryId(null);
    setCategoryName("");
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await ApiService.deleteCategory(categoryId);
        showMessage("Category successfully deleted");
        getCategories(); // Re-fetch the updated list
      } catch (error) {
        showMessage(error.response?.data?.message || "Error deleting category.");
      }
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <Layout>
      {message && <div className="message">{message}</div>}
      <div className="category-page">
        <div className="category-header">
          <h1>Categories</h1>
          {/* 4. The form now uses a single handleSubmit function */}
          <form onSubmit={handleSubmit} className="add-cat">
            <input
              value={categoryName}
              type="text"
              placeholder="Category Name"
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <button type="submit">{isEditing ? "Update Category" : "Add Category"}</button>
            {isEditing && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
          </form>
        </div>

        {categories && (
          <ul className="category-list">
            {categories.map((category) => (
              <li className="category-item" key={category.id}>
                <span>{category.name}</span>
                <div className="category-actions">
                  <button onClick={() => handleEditClick(category)}>Edit</button>
                  <button onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;