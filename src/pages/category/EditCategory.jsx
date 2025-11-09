import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate instead of useHistory
import { getCategory, updateCategory } from '../../services/CategoryApi'; // Updated function name
import { toast, ToastContainer } from 'react-toastify'; // Import both toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css';

const EditCategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate(); // Using useNavigate hook instead of useHistory
  const [category, setCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const fetchedCategory = await getCategory(categoryId); // Using getCategory instead of getCategoryById
        setCategory(fetchedCategory);
        setName(fetchedCategory.name);
        setDescription(fetchedCategory.description || '');
        setDisplayOrder(fetchedCategory.displayOrder || '');
        setIsFeatured(fetchedCategory.isFeatured);
        setIsRecommended(fetchedCategory.isRecommended);
        setImage(fetchedCategory.image || null);
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updatedCategory = { name, description, displayOrder, isFeatured, isRecommended, image };
      await updateCategory(category._id, updatedCategory);
      setLoading(false);
      toast.success('Category updated successfully!');
      navigate(`/admin/viewCategory/${category._id}`); // Redirect to view page after update
    } catch (error) {
      console.error('Error updating category:', error);
      setLoading(false);
    }
  };

  if (!category) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-semibold mb-4">Edit Category</h1>
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
        </div>
      </div>
    </div>
  );
};

export default EditCategoryPage;
