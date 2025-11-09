import React, { useState, useEffect } from 'react';
import { updateCategory, deleteCategory } from '../../services/CategoryApi'; // Make sure to import API calls
import { toast, ToastContainer } from 'react-toastify'; // Import both toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css';

const ManageCategoryForm = ({ category, onUpdate, onDelete }) => {
  const [name, setName] = useState(category.name || '');
  const [description, setDescription] = useState(category.description || '');
  const [displayOrder, setDisplayOrder] = useState(category.displayOrder || '');
  const [isFeatured, setIsFeatured] = useState(category.isFeatured || false);
  const [isRecommended, setIsRecommended] = useState(category.isRecommended || false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpdate = async () => {
    const updatedCategory = { name, description, displayOrder, isFeatured, isRecommended, image };
    try {
      setLoading(true);
      await updateCategory(category._id, updatedCategory);
      setLoading(false);
      onUpdate();
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteCategory(category._id);
      setLoading(false);
      toast.success('Category deleted successfully!');
      onDelete();
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full mt-2 p-3 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700">Display Order</label>
          <input
            type="number"
            id="displayOrder"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={() => setIsFeatured(!isFeatured)}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">Featured</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecommended"
              checked={isRecommended}
              onChange={() => setIsRecommended(!isRecommended)}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label htmlFor="isRecommended" className="ml-2 text-sm text-gray-700">Recommended</label>
          </div>
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Upload Image</label>
          <input
            type="file"
            id="image"
            onChange={handleImageUpload}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Category'}
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Category'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageCategoryForm;
