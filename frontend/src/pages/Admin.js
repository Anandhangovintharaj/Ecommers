import React, { useState, useEffect } from 'react';
import { slideshow, products } from '../services/api'; // Import the products API
import { ToastManager } from '../components/Toast';
import Modal from '../components/Modal'; // Import the new Modal component
import FileUpload from '../components/FileUpload'; // Import FileUpload component
import './Admin.css';

const Admin = ({ user }) => {
  const [slideshowImages, setSlideshowImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsList, setProductsList] = useState([]); // State for products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('slideshow'); // New state for active tab
  // const [showAddImageForm, setShowAddImageForm] = useState(false); // No longer needed directly
  const [isSlideshowModalOpen, setIsSlideshowModalOpen] = useState(false);
  const [newImage, setNewImage] = useState({
    image_url: '',
    title: '',
    subtitle: '',
    display_order: 1,
    is_active: true,
  });
  // const [showAddCategoryForm, setShowAddCategoryForm] = useState(false); // No longer needed directly
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  // const [showAddProductForm, setShowAddProductForm] = useState(false); // No longer needed directly
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    category_id: '',
    image_url: '',
  }); // State for new product
  const [editingImage, setEditingImage] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null); // State for editing product
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchAdminData(); // A single function to fetch all admin data
  }, []);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [slideshowResponse, categoriesResponse, productsResponse] = await Promise.all([
        slideshow.getAll(),
        products.getCategories(),
        products.getAllAdmin(), // Fetch all products for admin
      ]);
      
      if (slideshowResponse.data.success) {
        setSlideshowImages(slideshowResponse.data.data);
      } else {
        setError(slideshowResponse.data.error || 'Failed to fetch slideshow images');
      }
      setCategories(categoriesResponse.data); // Assuming response.data is directly the array
      setProductsList(productsResponse.data); // Assuming response.data is directly the array
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to fetch admin data');
      addToast('Failed to fetch admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Slideshow Handlers (existing code...)
  const handleAddImage = async (e) => {
    e.preventDefault();
    // image_url is now handled by FileUpload component via onFileUploadSuccess
    if (!newImage.image_url) {
        addToast('Image URL is required', 'error');
        return;
    }
    try {
      const response = await slideshow.create(newImage);
      if (response.data.success) {
        addToast('Slideshow image added successfully!', 'success');
        setNewImage({
          image_url: '',
          title: '',
          subtitle: '',
          display_order: 1,
          is_active: true,
        });
        setIsSlideshowModalOpen(false); // Close modal after adding
        fetchAdminData(); // Refresh all data
      } else {
        addToast(response.data.error || 'Failed to add image', 'error');
      }
    } catch (err) {
      console.error('Error adding image:', err);
      addToast(err.response?.data?.error || 'Failed to add image', 'error');
    }
  };

  const handleUpdateImage = async (e) => {
    e.preventDefault();
    if (!editingImage) return;
    // image_url is now handled by FileUpload component via onFileUploadSuccess
    if (!editingImage.image_url) {
        addToast('Image URL is required', 'error');
        return;
    }

    try {
      const response = await slideshow.update(editingImage.id, editingImage);
      if (response.data.success) {
        addToast('Slideshow image updated successfully!', 'success');
        setEditingImage(null);
        setIsSlideshowModalOpen(false); // Close modal after updating
        fetchAdminData(); // Refresh all data
      } else {
        addToast(response.data.error || 'Failed to update image', 'error');
      }
    } catch (err) {
      console.error('Error updating image:', err);
      addToast(err.response?.data?.error || 'Failed to update image', 'error');
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slideshow image?')) return;
    try {
      const response = await slideshow.delete(id);
      if (response.data.success) {
        addToast('Slideshow image deleted successfully!', 'success');
        fetchAdminData(); // Refresh all data
      } else {
        addToast(response.data.error || 'Failed to delete image', 'error');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      addToast(err.response?.data?.error || 'Failed to delete image', 'error');
    }
  };

  // Category Handlers (existing code...)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await products.createCategory(newCategory);
      if (response.data.message) {
        addToast('Category added successfully!', 'success');
        setNewCategory({ name: '', description: '' });
        setIsCategoryModalOpen(false); // Close modal after adding
        fetchAdminData(); // Refresh all data
      } else {
        addToast(response.data.error || 'Failed to add category', 'error');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      addToast(err.response?.data?.error || 'Failed to add category', 'error');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const response = await products.updateCategory(editingCategory.id, editingCategory);
      if (response.data.message) {
        addToast('Category updated successfully!', 'success');
        setEditingCategory(null);
        setIsCategoryModalOpen(false); // Close modal after updating
        fetchAdminData(); // Refresh all data
      } else {
        addToast(response.data.error || 'Failed to update category', 'error');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      addToast(err.response?.data?.error || 'Failed to update category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await products.deleteCategory(id);
      if (response.data.message) {
        addToast('Category deleted successfully!', 'success');
        fetchAdminData();
      } else {
        addToast(response.data.error || 'Failed to delete category', 'error');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      addToast(err.response?.data?.error || 'Failed to delete category', 'error');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    // image_url is now handled by FileUpload component via onFileUploadSuccess
    if (!newProduct.image_url) {
        addToast('Image URL is required', 'error');
        return;
    }
    try {
      const response = await products.createProduct({ ...newProduct, category_id: parseInt(newProduct.category_id) });
      if (response.data.message) {
        addToast('Product added successfully!', 'success');
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          stock_quantity: 0,
          category_id: '',
          image_url: '',
        });
        setIsProductModalOpen(false); // Close modal after adding
        fetchAdminData();
      } else {
        addToast(response.data.error || 'Failed to add product', 'error');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      addToast(err.response?.data?.error || 'Failed to add product', 'error');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    // image_url is now handled by FileUpload component via onFileUploadSuccess
    if (!editingProduct.image_url) {
        addToast('Image URL is required', 'error');
        return;
    }
    try {
      const response = await products.updateProduct(editingProduct.id, { ...editingProduct, category_id: parseInt(editingProduct.category_id) });
      if (response.data.message) {
        addToast('Product updated successfully!', 'success');
        setEditingProduct(null);
        setIsProductModalOpen(false); // Close modal after updating
        fetchAdminData();
      } else {
        addToast(response.data.error || 'Failed to update product', 'error');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      addToast(err.response?.data?.error || 'Failed to update product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await products.deleteProduct(id);
      if (response.data.message) {
        addToast('Product deleted successfully!', 'success');
        fetchAdminData();
      } else {
        addToast(response.data.error || 'Failed to delete product', 'error');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      addToast(err.response?.data?.error || 'Failed to delete product', 'error');
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <p>Loading admin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <p className="error-message">Error: {error}</p>
        <button onClick={fetchAdminData} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="admin-content-grid">
        <nav className="admin-sidebar">
          <button
            className={`admin-tab-button ${activeTab === 'slideshow' ? 'active' : ''}`}
            onClick={() => setActiveTab('slideshow')}
          >
            Slideshow
          </button>
          <button
            className={`admin-tab-button ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button
            className={`admin-tab-button ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
        </nav>

        <div className="admin-main-content">
          {activeTab === 'slideshow' && (
            <section className="admin-section">
              <h2>
                Slideshow Management
                <button className="admin-button add-new-button" onClick={() => { setEditingImage(null); setNewImage({ image_url: '', title: '', subtitle: '', display_order: 1, is_active: true }); setIsSlideshowModalOpen(true); }}>
                  Add New Image
                </button>
              </h2>

              <Modal
                isOpen={isSlideshowModalOpen}
                onClose={() => { setIsSlideshowModalOpen(false); setEditingImage(null); setNewImage({ image_url: '', title: '', subtitle: '', display_order: 1, is_active: true }); }}
                title={editingImage ? 'Edit Slideshow Image' : 'Add New Slideshow Image'}
              >
                <form onSubmit={editingImage ? handleUpdateImage : handleAddImage}>
                  <div className="form-group">
                    <label>Image:</label>
                    <FileUpload 
                      onFileUploadSuccess={(url) => editingImage ? setEditingImage({ ...editingImage, image_url: url }) : setNewImage({ ...newImage, image_url: url })}
                      initialImageUrl={editingImage ? editingImage.image_url : newImage.image_url}
                      addToast={addToast} // Pass addToast function
                    />
                    {/* <input
                      type="text"
                      value={editingImage ? editingImage.image_url : newImage.image_url}
                      onChange={(e) => (editingImage ? setEditingImage({ ...editingImage, image_url: e.target.value }) : setNewImage({ ...newImage, image_url: e.target.value }))}
                      required
                    /> */}
                  </div>
                  <div className="form-group">
                    <label>Title:</label>
                    <input
                      type="text"
                      value={editingImage ? editingImage.title : newImage.title}
                      onChange={(e) => (editingImage ? setEditingImage({ ...editingImage, title: e.target.value }) : setNewImage({ ...newImage, title: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Subtitle:</label>
                    <input
                      type="text"
                      value={editingImage ? editingImage.subtitle : newImage.subtitle}
                      onChange={(e) => (editingImage ? setEditingImage({ ...editingImage, subtitle: e.target.value }) : setNewImage({ ...newImage, subtitle: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Display Order:</label>
                    <input
                      type="number"
                      value={editingImage ? editingImage.display_order : newImage.display_order}
                      onChange={(e) => (editingImage ? setEditingImage({ ...editingImage, display_order: parseInt(e.target.value) }) : setNewImage({ ...newImage, display_order: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={editingImage ? editingImage.is_active : newImage.is_active}
                        onChange={(e) => (editingImage ? setEditingImage({ ...editingImage, is_active: e.target.checked }) : setNewImage({ ...newImage, is_active: e.target.checked }))}
                      />
                      Is Active
                    </label>
                  </div>
                  <button type="submit" className="admin-button">
                    {editingImage ? 'Update Image' : 'Add Image'}
                  </button>
                  {/* <button type="button" onClick={() => { setIsSlideshowModalOpen(false); setEditingImage(null); setNewImage({ image_url: '', title: '', subtitle: '', display_order: 1, is_active: true }); }} className="admin-button cancel-button">
                    Cancel
                  </button> */}
                </form>
              </Modal>

              <div className="slideshow-list">
                <h3>Existing Slideshow Images</h3>
                {slideshowImages.length === 0 ? (
                  <p>No slideshow images found.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Subtitle</th>
                        <th>Order</th>
                        <th>Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slideshowImages.map(image => (
                        <tr key={image.id}>
                          <td>{image.id}</td>
                          <td>
                            <img src={image.image_url} alt={image.title} className="admin-product-thumbnail" />
                          </td>
                          <td>{image.title || '-'}</td>
                          <td>{image.subtitle || '-'}</td>
                          <td>{image.display_order}</td>
                          <td>{image.is_active ? 'Yes' : 'No'}</td>
                          <td className="admin-table-actions">
                            <button onClick={() => { setEditingImage(image); setNewImage(image); setIsSlideshowModalOpen(true); }} className="admin-button edit-button"><i className="fas fa-edit"></i></button>
                            <button onClick={() => handleDeleteImage(image.id)} className="admin-button delete-button"><i className="fas fa-trash-alt"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {activeTab === 'categories' && (
            <section className="admin-section">
              <h2>
                Category Management
                <button className="admin-button add-new-button" onClick={() => { setEditingCategory(null); setNewCategory({ name: '', description: '' }); setIsCategoryModalOpen(true); }}>
                  Add New Category
                </button>
              </h2>

              <Modal
                isOpen={isCategoryModalOpen}
                onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); setNewCategory({ name: '', description: '' }); }}
                title={editingCategory ? 'Edit Category' : 'Add New Category'}
              >
                <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}>
                  <div className="form-group">
                    <label>Category Name:</label>
                    <input
                      type="text"
                      value={editingCategory ? editingCategory.name : newCategory.name}
                      onChange={(e) => (editingCategory ? setEditingCategory({ ...editingCategory, name: e.target.value }) : setNewCategory({ ...newCategory, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      value={editingCategory ? editingCategory.description : newCategory.description}
                      onChange={(e) => (editingCategory ? setEditingCategory({ ...editingCategory, description: e.target.value }) : setNewCategory({ ...newCategory, description: e.target.value }))}
                    ></textarea>
                  </div>
                  <button type="submit" className="admin-button">
                    {editingCategory ? 'Update Category' : 'Add Category'}
                  </button>
                  {/* <button type="button" onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); setNewCategory({ name: '', description: '' }); }} className="admin-button cancel-button">
                    Cancel
                  </button> */}
                </form>
              </Modal>

              <div className="category-list">
                <h3>Existing Categories</h3>
                {categories.length === 0 ? (
                  <p>No categories found.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(category => (
                        <tr key={category.id}>
                          <td>{category.id}</td>
                          <td>{category.name}</td>
                          <td>{category.description || '-'}</td>
                          <td className="admin-table-actions">
                            <button onClick={() => { setEditingCategory(category); setNewCategory(category); setIsCategoryModalOpen(true); }} className="admin-button edit-button"><i className="fas fa-edit"></i></button>
                            <button onClick={() => handleDeleteCategory(category.id)} className="admin-button delete-button"><i className="fas fa-trash-alt"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {activeTab === 'products' && (
            <section className="admin-section">
              <h2>
                Product Management
                <button className="admin-button add-new-button" onClick={() => { setEditingProduct(null); setNewProduct({ name: '', description: '', price: 0, stock_quantity: 0, category_id: '', image_url: '' }); setIsProductModalOpen(true); }}>
                  Add New Product
                </button>
              </h2>

              <Modal
                isOpen={isProductModalOpen}
                onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); setNewProduct({ name: '', description: '', price: 0, stock_quantity: 0, category_id: '', image_url: '' }); }}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
              >
                <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                  <div className="form-group">
                    <label>Product Name:</label>
                    <input
                      type="text"
                      value={editingProduct ? editingProduct.name : newProduct.name}
                      onChange={(e) => (editingProduct ? setEditingProduct({ ...editingProduct, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      value={editingProduct ? editingProduct.description : newProduct.description}
                      onChange={(e) => (editingProduct ? setEditingProduct({ ...editingProduct, description: e.target.value }) : setNewProduct({ ...newProduct, description: e.target.value }))}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Price:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct ? editingProduct.price : newProduct.price}
                      onChange={(e) => (editingProduct ? setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) }) : setNewProduct({ ...newProduct, price: parseFloat(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity:</label>
                    <input
                      type="number"
                      value={editingProduct ? editingProduct.stock_quantity : newProduct.stock_quantity}
                      onChange={(e) => (editingProduct ? setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) }) : setNewProduct({ ...newProduct, stock_quantity: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category:</label>
                    <select
                      value={editingProduct ? editingProduct.category_id : newProduct.category_id}
                      onChange={(e) => (editingProduct ? setEditingProduct({ ...editingProduct, category_id: e.target.value }) : setNewProduct({ ...newProduct, category_id: e.target.value }))}
                      required
                    >
                      <option value="">Select a Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Image:</label>
                    <FileUpload
                      onFileUploadSuccess={(url) => editingProduct ? setEditingProduct({ ...editingProduct, image_url: url }) : setNewProduct({ ...newProduct, image_url: url })}
                      initialImageUrl={editingProduct ? editingProduct.image_url : newProduct.image_url}
                      addToast={addToast} // Pass addToast function
                    />
                    {/* <input
                      type="text"
                      value={editingProduct ? editingProduct.image_url : newProduct.image_url}
                      onChange={(e) => (editingProduct ? setEditingProduct({ ...editingProduct, image_url: e.target.value }) : setNewProduct({ ...newProduct, image_url: e.target.value }))}
                    /> */}
                  </div>
                  <button type="submit" className="admin-button">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {/* <button type="button" onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); setNewProduct({ name: '', description: '', price: 0, stock_quantity: 0, category_id: '', image_url: '' }); }} className="admin-button cancel-button">
                    Cancel
                  </button> */}
                </form>
              </Modal>

              <div className="product-list">
                <h3>Existing Products</h3>
                {productsList.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsList.map(product => (
                        <tr key={product.id}>
                          <td>{product.id}</td>
                          <td>
                            <img src={product.image_url || '/images/placeholder-100x100.svg'} alt={product.name} className="admin-product-thumbnail" />
                          </td>
                          <td>{product.name}</td>
                          <td>{product.description || '-'}</td>
                          <td>₹{product.price}</td>
                          <td>{product.stock_quantity}</td>
                          <td>{categories.find(cat => cat.id === product.category_id)?.name || 'N/A'}</td>
                          <td className="admin-table-actions">
                            <button onClick={() => { setEditingProduct(product); setNewProduct(product); setIsProductModalOpen(true); }} className="admin-button edit-button"><i className="fas fa-edit"></i></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="admin-button delete-button"><i className="fas fa-trash-alt"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
