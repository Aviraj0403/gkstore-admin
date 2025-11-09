import React, { useState } from 'react';
import { createCategory } from '../../services/CategoryApi'; // Assuming this is where the API calls are made
import { toast, ToastContainer } from 'react-toastify'; // Import both toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import the Toastify styles
import { useNavigate } from "react-router-dom";
const AddCategoryForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error('Category Name is required'); // Show error toast if name is missing
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('displayOrder', displayOrder);
    formData.append('isFeatured', isFeatured);
    formData.append('isRecommended', isRecommended);
    if (image) formData.append('image', image);

    try {
      setLoading(true);
      const result = await createCategory(formData);
      setLoading(false);
      if (result.success) {
        toast.success('Category created successfully!'); // Show success toast
        navigate('/admin/categories');
        // onSubmit();  // Refresh the category list or go back to the main screen
      } else {
        toast.error(result.message || 'Something went wrong'); // Show error toast
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Something went wrong'); // Show error toast
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Category</h2>
        {error && <div className="text-red-600 mb-4 p-3 border border-red-200 bg-red-50 rounded-md">{error}</div>}
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700">Display Order</label>
            <input
              type="number"
              id="displayOrder"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={() => setIsFeatured(!isFeatured)}
                className="h-5 w-5 text-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">Featured</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecommended"
                checked={isRecommended}
                onChange={() => setIsRecommended(!isRecommended)}
                className="h-5 w-5 text-blue-500 border-gray-300 rounded"
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
              className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4V1m0 0L9 4m3-3l3 3M4 12H1m0 0l3-3m-3 3l3 3m8 4v3m0 0l3-3m-3 3l-3-3" />
                  </svg>
                  Adding Category...
                </div>
              ) : (
                'Add Category'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Correct ToastContainer usage */}
      <ToastContainer />
    </>
  );
};

export default AddCategoryForm;
