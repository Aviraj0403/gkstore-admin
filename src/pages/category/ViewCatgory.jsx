import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { getCategory } from '../../services/CategoryApi'; // Updated API call name

const ViewCategory = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const fetchedCategory = await getCategory(categoryId); // Updated API call name
        setCategory(fetchedCategory);
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };

    fetchCategory();
  }, [categoryId]);

  if (!category) {
    return (
      <div className="text-center py-10 text-xl text-gray-600">Loading...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Category Details</h1>
        <div className="flex space-x-4">
          <NavLink
            to={`/admin/editCategory/${category._id}`} // Navigating to edit page
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
          >
            Edit Category
          </NavLink>
          <NavLink
            to="/admin/categories"
            className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition"
          >
            Back to Categories
          </NavLink>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image and Name Section */}
        <div className="flex flex-col items-center lg:items-start space-y-4">
          <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden shadow-md">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-600">No Image</span>
            )}
          </div>

          <div className="text-center lg:text-left">
            <h3 className="text-2xl font-semibold text-gray-800">{category.name}</h3>
          </div>
        </div>

        {/* Category Details Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700">Description</h3>
            <p className="text-gray-600">{category.description || 'No Description'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Display Order</h3>
              <p className="text-gray-600">{category.displayOrder || 'N/A'}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700">Featured</h3>
              <p className="text-gray-600">{category.isFeatured ? 'Yes' : 'No'}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700">Recommended</h3>
              <p className="text-gray-600">{category.isRecommended ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Action Button */}
      <div className="mt-8 flex justify-between">
        {/* <NavLink
          to={`/admin/editCategory/${category._id}`} // Navigating to edit page
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
        >
          Edit Category
        </NavLink> */}
      </div>
    </div>
  );
};

export default ViewCategory;
