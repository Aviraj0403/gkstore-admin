import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFood, updateFood } from "../../services/FoodApi";
import { getAllCategories } from "../../services/CategoryApi";
import { toast } from "react-hot-toast";

export default function EditFood() {
  const { foodId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // New images
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Track removed images (existing)
  const [removedImages, setRemovedImages] = useState([]);

  // Variant temp state
  const [variant, setVariant] = useState({ size: "", price: "" });

  // Fetch food + categories
  useEffect(() => {
    async function fetchData() {
      try {
        const [foodRes, catRes] = await Promise.all([
          getFood(foodId),
          getAllCategories({ page: 1, limit: 100 }),
        ]);
        if (foodRes.success) setFormData(foodRes.food);
        if (catRes.success) setCategories(catRes.categories);
      } catch (err) {
        toast.error("Failed to load data");
      }
    }
    fetchData();
  }, [foodId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Image handling
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      toast.error("You can upload a maximum of 3 new images.");
      return;
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = (url) => {
    setRemovedImages((prev) => [...prev, url]);
    setFormData((prev) => ({
      ...prev,
      foodImages: prev.foodImages.filter((img) => img !== url),
    }));
  };

  // Variant handling
  const addVariant = () => {
    const { size, price } = variant;
    if (!size || !price) {
      toast.error("Enter size and price");
      return;
    }
    if (formData.variants.some((v) => v.size === size)) {
      toast.error("Variant with this size already exists");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { size, price }],
    }));
    setVariant({ size: "", price: "" });
  };

  const removeVariant = (i) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== i),
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const fd = new FormData();

    // Only append primitive fields
    [
      "name",
      "description",
      "ingredients",
      "category",
      "cookTime",
      "itemType",
      "variety",
      "discount",
      "status",
      "isHotProduct",
      "isBudgetBite",
      "isSpecialOffer",
      "isFeatured",
      "isRecommended",
    ].forEach((field) => {
      if (formData[field] !== undefined && formData[field] !== null) {
        fd.append(field, formData[field]);
      }
    });

    // Variants (as JSON)
    if (formData.variants?.length > 0) {
      fd.append("variants", JSON.stringify(formData.variants));
    }

    // Removed images (as JSON)
    if (removedImages.length > 0) {
      fd.append("removedImages", JSON.stringify(removedImages));
    }

    // New images
    images.forEach((file) => fd.append("foodImages", file));

    const res = await updateFood(foodId, fd);

    if (res.success) {
      toast.success("Food updated successfully!");
      navigate(`/admin/food-details/${foodId}`);
    } else {
      toast.error(res.message || "Update failed");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error updating food");
  } finally {
    setLoading(false);
  }
};



  if (!formData) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Edit Food Item
        </h1>

        {/* Image Upload */}
        <div className="mb-8">
          <div className="bg-orange-100 border-2 border-dashed border-orange-400 rounded-xl p-6 text-center">
            {/* Existing Images */}
            {formData.foodImages?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {formData.foodImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={img}
                      alt="Existing"
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              id="food-image-upload"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="food-image-upload"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-orange-600 transition"
            >
              Upload Images (Max 3)
            </label>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField label="Name *" name="name" value={formData.name} onChange={handleChange} />
          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          <InputField
            label="Ingredients"
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Variants */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Variants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <select
                value={variant.size}
                onChange={(e) => setVariant({ ...variant, size: e.target.value })}
                className="border rounded-lg p-3"
              >
                <option value="">Select Size</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={variant.price}
                onChange={(e) => setVariant({ ...variant, price: e.target.value })}
                className="border rounded-lg p-3"
              />
              <button
                type="button"
                onClick={addVariant}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                + Add
              </button>
            </div>

            {formData.variants.length > 0 && (
              <div className="space-y-2">
                {formData.variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-lg"
                  >
                    <span>
                      {v.size} - ₹{v.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              ["isHotProduct", "Hot Product"],
              ["isBudgetBite", "Budget Bite"],
              ["isSpecialOffer", "Special Offer"],
              ["isFeatured", "Featured"],
              ["isRecommended", "Recommended"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={key}
                  checked={formData[key]}
                  onChange={handleChange}
                  className="h-5 w-5 text-orange-500"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          {/* Other Inputs */}
          <InputField
            label="Cook Time (minutes)"
            name="cookTime"
            type="number"
            value={formData.cookTime}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Item Type"
              name="itemType"
              value={formData.itemType}
              options={["Veg", "Non-Veg"]}
              onChange={handleChange}
            />
            <SelectField
              label="Variety"
              name="variety"
              value={formData.variety}
              options={["Breakfast", "Lunch", "Dinner"]}
              onChange={handleChange}
            />
          </div>

          <InputField
            label="Discount (%)"
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
          />

          <SelectField
            label="Status"
            name="status"
            value={formData.status}
            options={["Active", "Inactive"]}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              loading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"
            } transition`}
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Reusable fields
const InputField = ({ label, name, value, onChange, type = "text", placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
    />
  </div>
);

const SelectField = ({ label, name, value, options, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 bg-white"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);
