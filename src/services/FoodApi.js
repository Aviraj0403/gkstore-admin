import Axios from '../utils/Axios';

// ========== FOOD API CALLS ==========

// Create Food (with images, form-data)
export const createFood = async (formData) => {
  const res = await Axios.post('/foods/createFood', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Update Food (PATCH)
export const updateFood = async (foodId, formData) => {
  try {
    const res = await Axios.patch(
      `/foods/updateFood/${foodId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Update Food Error:", error);
    return { success: false, message: error.response?.data?.message || "Error updating food" };
  }
};

// Delete Food
export const deleteFood = async (foodId) => {
  const res = await Axios.delete(`/foods/deleteFood/${foodId}`);
  return res.data;
};

export const getFood = async (foodId) => {
  const res = await Axios.get(`/foods/getFood/${foodId}`);
  return res.data;  // Assuming res.data contains { success: true, food: {...} }
};

// Get all food items
export const getAllFood = async (params = {}) => {
  try {
    const res = await Axios.get('/foods/getAllFood', { params });
    return res.data; // this includes: { success, foods, pagination }
  } catch (error) {
    console.error('Error fetching food data:', error);
    throw error; // Rethrow the error to handle it in the component
  }
};

export const getAdminFood = async (params = {}) => {
  try {
    const res = await Axios.get('/foods/getAdminFood', { params });
    return res.data; // this includes: { success, foods, pagination }
  } catch (error) {
    console.error('Error fetching food data:', error);
    throw error; // Rethrow the error to handle it in the component
  }
};


// Get food by category
export const getFoodByCategory = async (categoryId) => {
  const res = await Axios.get(`/foods/getFoodByCategory/category`, {
    params: { category: categoryId },
  });
  return res.data.foods;
};

// Get total food count
export const getTotalFood = async () => {
  const res = await Axios.get('/foods/getTotalFood/total');
  return res.data.total; // { total: 10 }
};

// Update food images (form-data)
export const updateFoodImages = async (foodId, formData) => {
  const res = await Axios.patch(`/foods/updateFoodImages/${foodId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
