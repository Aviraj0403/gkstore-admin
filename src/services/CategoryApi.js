import Axios from '../utils/Axios';

// ========== CATEGORY API CALLS ==========

// Create Category (with image upload)
export const createCategory = async (formData) => {
  const res = await Axios.post('/categories/createCategory', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};


export const getAllCategories = async ({ page, limit, search, sortField, sortOrder }) => {
  try {
    // Build the URL with query parameters
    const res = await Axios.get('/categories/getAllCategories', {
      params: {
        page,
        limit,
        search,
        sortField,
        sortOrder
      }
    });

    // Return both the categories and pagination data (if available)
    return {
      success: res.data.success,
      categories: res.data.categories,
      pagination: res.data.pagination || {}
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Error fetching categories');
  }
};


// Get Main Categories
export const getMainCategories = async () => {
  const res = await Axios.get('/categories/getMainCategories');
  return res.data.categories;
};

// Get Single Category by ID
export const getCategory = async (id) => {
  const res = await Axios.get(`/categories/getCategory/${id}`);
  return res.data.category;
};

// Get Category Details (with subcategories, foods, etc.)
export const getCategoryDetails = async (id) => {
  const res = await Axios.get(`/categories/getCategoryDetails/${id}`);
  return res.data;
};

// Update Category (with optional image)
export const updateCategory = async (id, formData) => {
  const res = await Axios.put(`/categories/updateCategory/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Delete Category
export const deleteCategory = async (id) => {
  const res = await Axios.delete(`/categories/deleteCategory/${id}`);
  return res.data;
};
