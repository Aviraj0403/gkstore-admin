import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getAdminFood , deleteFood} from "../../services/FoodApi"; // API service

// ---- Row Component for Desktop Table ----
// ---- Row Component for Desktop Table ----
const FoodTableRow = ({ food, onDelete }) => (
  <tr key={food._id} className="hover:bg-gray-50 transition duration-300">
    <td className="px-4 py-4 text-sm font-medium text-gray-900">
      <img
        src={
          food.foodImages && food.foodImages.length > 0
            ? food.foodImages[0]
            : "https://via.placeholder.com/64"
        }
        alt={food.name}
        className="w-16 h-16 object-cover rounded-full mx-auto shadow-lg"
      />
    </td>
    <td className="px-4 py-4 text-sm text-gray-900">{food.name}</td>
    <td className="px-4 py-4 text-sm text-gray-900">
      {food.category?.name || "N/A"}
    </td>
       <td className="px-4 py-4 text-sm text-gray-900">
      {food.variants && food.variants.length > 0
        ? `₹ ${food.variants[0].price}`
        : "N/A"}
    </td>
    <td className="px-4 py-4 text-sm text-gray-900">
      {food.variants?.map((v, idx) => (
        <div key={idx} className="mb-1">
          <span className="font-semibold">{v.size}:</span>{" "}
          <span>₹ {v.price}</span>{" "}
          {v.priceAfterDiscount && (
            <span className="text-red-500 line-through">
              ₹ {v.priceAfterDiscount}
            </span>
          )}
        </div>
      ))}
    </td>

  {/* ✅ Tags Column */}
<td className="px-4 py-4 text-sm text-gray-900 space-x-1 space-y-1">
  {food.isHotProduct && (
    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full shadow-sm">
      Hot
    </span>
  )}
  {food.isFeatured && (
    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full shadow-sm">
      Featured
    </span>
  )}
  {food.isRecommended && (
    <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full shadow-sm">
      Recommended
    </span>
  )}
  {food.status === "Active" && (
    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full shadow-sm">
      Active
    </span>
  )}
  {food.isBudgetBite && (
    <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full shadow-sm">
      Budget
    </span>
  )}
  {food.isSpecialOffer && (
    <span className="px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded-full shadow-sm">
      Special
    </span>
  )}
  {food.itemType?.toLowerCase() === "veg" && (
    <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full shadow-sm">
      Veg
    </span>
  )}
  {food.itemType?.toLowerCase() === "non-veg" && (
    <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full shadow-sm">
      Non-Veg
    </span>
  )}
</td>


    <td className="px-4 py-4 text-sm font-medium flex space-x-3 justify-center">
      <NavLink
        to={`/admin/editFood/${food._id}`}
        className="text-blue-600 hover:text-blue-800 transform transition-transform duration-300 hover:scale-110"
      >
        ✏️
      </NavLink>
      <NavLink
        to={`/admin/food-details/${food._id}`}
        className="text-gray-600 hover:text-gray-800 transform transition-transform duration-300 hover:scale-110"
      >
        👁️
      </NavLink>
      <button
        onClick={() => onDelete(food._id)}
        className="text-red-600 hover:text-red-800 transform transition-transform duration-300 hover:scale-110"
      >
        🗑️
      </button>
    </td>
  </tr>
);


// ---- Card Component for Mobile View ----
// ---- Card Component for Mobile View ----
const FoodCard = ({ food, onDelete }) => (
  <div className="p-4 mb-4 border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div className="flex items-center flex-1">
        <img
          src={
            food.foodImages && food.foodImages.length > 0
              ? food.foodImages[0]
              : "https://via.placeholder.com/64"
          }
          alt={food.name}
          className="w-16 h-16 object-cover rounded-full shadow-lg"
        />
        <div className="ml-4">
          <p className="text-lg font-semibold text-gray-900">{food.name}</p>
          <p className="text-sm text-gray-500">{food.category?.name || "N/A"}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <NavLink
          to={`/admin/editFood/${food._id}`}
          className="text-blue-600 hover:text-blue-800 transform transition-transform duration-300 hover:scale-110"
        >
          ✏️ 
        </NavLink>
        <NavLink
          to={`/admin/food-details/${food._id}`}
          className="text-gray-600 hover:text-gray-800 transform transition-transform duration-300 hover:scale-110"
        >
          👁️
        </NavLink>
        <button
          onClick={() => onDelete(food._id)}
          className="text-red-600 hover:text-red-800 transform transition-transform duration-300 hover:scale-110"
        >
          🗑️
        </button>
      </div>
    </div>

    <div className="mt-2">
      {food.variants?.map((v, idx) => (
        <div key={idx} className="text-sm text-gray-700">
          <strong>{v.size}: </strong>₹ {v.price}{" "}
          {v.priceAfterDiscount && (
            <span className="text-red-500 line-through">
              ₹ {v.priceAfterDiscount}
            </span>
          )}
        </div>
      ))}
    </div>

   {/* ✅ Tags for Mobile */}
<div className="mt-3 flex flex-wrap gap-2">
  {food.isHotProduct && <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">Hot</span>}
  {food.isFeatured && <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Featured</span>}
  {food.isRecommended && <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full">Recommended</span>}
  {food.status === "Active" && <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Active</span>}
  {food.isBudgetBite && <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">Budget</span>}
  {food.isSpecialOffer && <span className="px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded-full">Special</span>}
  {food.itemType?.toLowerCase() === "veg" && <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">Veg</span>}
  {food.itemType?.toLowerCase() === "non-veg" && <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">Non-Veg</span>}
</div>

  </div>
);


const AdminFood = () => {
  const [foods, setFoods] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState(-1);

  useEffect(() => {
    fetchFoods();
  }, [page, searchTerm, sortField, sortOrder]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await getAdminFood({
        page,
        limit,
        search: searchTerm,
        sortField,
        sortOrder,
      });

      if (response && response.success) {
        setFoods(response.foods || []);
        setPagination(response.pagination || {});
      } else {
        toast.error("Failed to fetch foods");
        setFoods([]);
        setPagination({});
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
      toast.error("Error fetching foods");
      setFoods([]);
      setPagination({});
    }
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      (pagination.totalPages && newPage > pagination.totalPages)
    ) {
      return;
    }
    setPage(newPage);
  };

 const handleDeleteFood = async (id) => {
    try {
      // Call the delete API directly
      const response = await deleteFood(id);
      if (response.success) {
        toast.success(`Food item with ID ${id} deleted successfully!`);
        fetchFoods(); // Refresh the food list after deletion
      } else {
        toast.error("Failed to delete food item.");
      }
    } catch (error) {
      console.error("Error deleting food:", error);
      toast.error("An error occurred while deleting the food item.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-xl border border-gray-200">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h4 className="text-2xl font-semibold text-gray-800">Food List</h4>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <NavLink
            to="/admin/addFood"
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            ➕ Add Food
          </NavLink>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading...</div>
      ) : (
        <>
          {foods.length > 0 ? (
            <>
              <div className="hidden sm:block">
                <table className="min-w-full table-auto shadow-md border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Image</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Price</th>
                      <th className="px-4 py-3 text-left">Variants</th>
                      <th className="px-4 py-3 text-left">Tags</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((food) => (
                      <FoodTableRow key={food._id} food={food} onDelete={handleDeleteFood} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden">
                {foods.map((food) => (
                  <FoodCard key={food._id} food={food} onDelete={handleDeleteFood} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="self-center text-gray-700">Page {page}</span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-lg text-gray-600">No food items found.</div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminFood;
