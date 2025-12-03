// src/pages/admin/EditProductForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getProduct,
  updateProduct,
} from "../../services/ProductApi";
import {
  getAllCategories,
  getSubCategories,
} from "../../services/CategoryApi";

export default function EditProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();

  /* ------------------ STATE ------------------ */
  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Images
  const [existingImages, setExistingImages] = useState([]); // URLs from server
  const [newImages, setNewImages] = useState([]);           // File objects
  const [newPreviews, setNewPreviews] = useState([]);      // preview URLs
  const [removedImages, setRemovedImages] = useState([]);  // URLs to delete

  // Variant temp state
  const [variant, setVariant] = useState({
    size: "",
    color: "",
    price: "",
    stockQty: "",
    packaging: "Bottle",
  });

  /* ------------------ FETCH DATA ------------------ */
  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProduct(productId),
          getAllCategories({ page: 1, limit: 200, search: "", sortField: "name", sortOrder: 1 }),
        ]);

        if (!prodRes.success || !prodRes.product) {
          toast.error("Product not found");
          navigate("/admin/adminProducts");
          return;
        }

        const p = prodRes.product;

        // Normalise data exactly like AddProductForm expects
        const normalized = {
          name: p.name || "",
          brand: p.brand || "",
          description: p.description || "",
          category: p.category?._id || p.category || "",
          subCategory: p.subCategory?._id || p.subCategory || "",
          discount: p.discount || 0,
          tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
          isFeatured: !!p.isFeatured,
          isHotProduct: !!p.isHotProduct,
          isBestSeller: !!p.isBestSeller,
          status: p.status || "Active",
          additionalInfo: {
            skinType: p.additionalInfo?.skinType || "",
            shelfLife: p.additionalInfo?.shelfLife || 12,
            usageInstructions: p.additionalInfo?.usageInstructions || "",
          },
          variants: Array.isArray(p.variants) ? p.variants.map(v => ({
            ...v,
            price: v.price?.toString() || "",
            stockQty: v.stockQty?.toString() || "0",
          })) : [],
        };

        setFormData(normalized);
        setExistingImages(p.pimages || []);

        if (catRes.success && Array.isArray(catRes.categories)) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        toast.error("Failed to load product");
        console.error(err);
      }
    }

    if (productId) fetchData();
  }, [productId, navigate]);

  // Load sub-categories when main category changes
  useEffect(() => {
    async function fetchSubCategories() {
      if (formData?.category) {
        try {
          const subs = await getSubCategories(formData.category);
          setSubCategories(subs);
        } catch {
          toast.error("Failed to load sub-categories");
        }
      } else {
        setSubCategories([]);
      }
    }
    fetchSubCategories();
  }, [formData?.category]);

  /* ------------------ HANDLERS ------------------ */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "category") {
      setFormData(prev => ({
        ...prev,
        category: value,
        subCategory: "",
      }));
    } else if (name.startsWith("additionalInfo.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        additionalInfo: { ...prev.additionalInfo, [field]: value },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleVariantChange = (field, val) => {
    setVariant(prev => ({ ...prev, [field]: val }));
  };

  const addVariant = () => {
    const { size, color, price, stockQty, packaging } = variant;

    if (!size || !color || !price || isNaN(parseFloat(price))) {
      toast.error("Size, Color, and Price are required.");
      return;
    }

    const exists = formData.variants.some(v => v.size === size && v.color === color);
    if (exists) {
      toast.error("Variant with this size & color already exists.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          size,
          color,
          price: parseFloat(price),
          stockQty: parseInt(stockQty) || 0,
          packaging: packaging || "Bottle",
        },
      ],
    }));

    setVariant({ size: "", color: "", price: "", stockQty: "", packaging: "Bottle" });
    toast.success("Variant added!");
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
    toast.success("Variant removed!");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const total = existingImages.length - removedImages.length + newImages.length + files.length;

    if (total > 5) {
      toast.error("Maximum 5 images allowed in total.");
      return;
    }

    const previews = files.map(f => URL.createObjectURL(f));
    setNewImages(prev => [...prev, ...files]);
    setNewPreviews(prev => [...prev, ...previews]);
    toast.success(`${files.length} image(s) added!`);
  };

  const removeExistingImage = (url) => {
    setRemovedImages(prev => [...prev, url]);
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllImages = () => {
    setExistingImages([]);
    setNewImages([]);
    setNewPreviews([]);
    setRemovedImages(prev => [...prev, ...existingImages]);
    toast.success("All images cleared!");
  };

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((existingImages.length + newImages.length) === 0) {
      toast.error("At least one image is required.");
      return;
    }

    if (formData.variants.length === 0) {
      toast.error("At least one variant is required.");
      return;
    }

    setLoading(true);
    const fd = new FormData();

    // Basic fields
    Object.entries(formData).forEach(([key, val]) => {
      if (key !== "variants" && key !== "additionalInfo") {
        fd.append(key, val);
      }
    });

    fd.append("tags", formData.tags);
    fd.append("additionalInfo", JSON.stringify(formData.additionalInfo));

    // Variants (indexed like in Add form)
    formData.variants.forEach((v, i) => {
      fd.append(`variants[${i}][size]`, v.size);
      fd.append(`variants[${i}][color]`, v.color);
      fd.append(`variants[${i}][price]`, v.price);
      fd.append(`variants[${i}][stockQty]`, v.stockQty);
      fd.append(`variants[${i}][packaging]`, v.packaging || "Bottle");
    });

    // Images
    newImages.forEach(file => fd.append("pimages", file));
    if (removedImages.length) {
      fd.append("removedImages", JSON.stringify(removedImages));
    }

    try {
      const res = await updateProduct(productId, fd);
      if (res.success) {
        toast.success("Product updated successfully!");
        navigate("/admin/adminProducts");
      } else {
        toast.error(res.message || "Failed to update product");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return <div className="text-center py-20">Loading...</div>;

  /* ------------------ RENDER ------------------ */
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Edit Product
        </h1>

        {/* Image Upload Section */}
        <div className="mb-8">
          <div className="bg-orange-100 border-2 border-dashed border-orange-400 rounded-xl p-6 text-center">
            {(existingImages.length > 0 || newPreviews.length > 0) ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                {existingImages
                  .filter(img => !removedImages.includes(img))
                  .map((src, i) => (
                    <div key={`exist-${i}`} className="relative">
                      <img
                        src={src}
                        alt="Existing"
                        className="w-full h-32 object-cover rounded-lg shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(src)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                {newPreviews.map((src, i) => (
                  <div key={`new-${i}`} className="relative">
                    <img
                      src={src}
                      alt="New"
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No images</p>
            )}

            {(existingImages.length - removedImages.length + newImages.length) > 0 && (
              <button
                type="button"
                onClick={removeAllImages}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Remove All Images
              </button>
            )}

            {(existingImages.length - removedImages.length + newImages.length) < 5 && (
              <div className="mt-4">
                <input
                  type="file"
                  id="edit-image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="edit-image-upload"
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-orange-600 transition"
                >
                  Upload More Images (max 5 total)
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField label="Name *" name="name" value={formData.name} onChange={handleChange} placeholder="Enter product name" />
          <InputField label="Brand *" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. L'Oréal, Himalaya" />
          <TextAreaField label="Description *" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the product" />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Category</option>
              {categories
                .filter(cat => cat.type === "Main")
                .map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Sub-Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              disabled={!formData.category}
              className={`w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 ${!formData.category ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">{formData.category ? "None (Optional)" : "Select Main Category First"}</option>
              {subCategories.map(sub => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <InputField label="Tags (comma separated)" name="tags" value={formData.tags} onChange={handleChange} placeholder="organic, vegan, premium" />
          <InputField label="Discount (%)" name="discount" type="number" value={formData.discount || "0"} onChange={handleChange} />

          {/* Additional Info */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>
            <InputField label="Skin Type" name="additionalInfo.skinType" value={formData.additionalInfo.skinType} onChange={handleChange} />
            <InputField label="Shelf Life (months)" name="additionalInfo.shelfLife" type="number" value={formData.additionalInfo.shelfLife} onChange={handleChange} />
            <TextAreaField label="Usage Instructions" name="additionalInfo.usageInstructions" value={formData.additionalInfo.usageInstructions} onChange={handleChange} />
          </div>

          {/* Variants */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Variant</h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
              <input type="text" placeholder="Size/Measurement" value={variant.size} onChange={e => handleVariantChange("size", e.target.value)} className="border border-gray-300 rounded-lg p-3" />
              <input type="text" placeholder="Color" value={variant.color} onChange={e => handleVariantChange("color", e.target.value)} className="border border-gray-300 rounded-lg p-3" />
              <input type="number" placeholder="Price" value={variant.price} onChange={e => handleVariantChange("price", e.target.value)} className="border border-gray-300 rounded-lg p-3" />
              <input type="number" placeholder="Stock Qty" value={variant.stockQty} onChange={e => handleVariantChange("stockQty", e.target.value)} className="border border-gray-300 rounded-lg p-3" />
              <button type="button" onClick={addVariant} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
                + Add
              </button>
            </div>

            {formData.variants.length > 0 && (
              <div className="space-y-2 mt-4">
                {formData.variants.map((v, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-lg">
                    <span>{v.size} | {v.color} - ₹{v.price} (Stock: {v.stockQty})</span>
                    <button type="button" onClick={() => removeVariant(idx)} className="text-red-600 hover:underline">
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
              ["isFeatured", "Featured"],
              ["isHotProduct", "Hot Product"],
              ["isBestSeller", "Best Seller"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" name={key} checked={formData[key]} onChange={handleChange} className="h-5 w-5 text-orange-500 focus:ring-orange-500" />
                <span className="text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"}`}
          >
            {loading ? "Saving..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Helper Components (same as AddProductForm) */
const InputField = ({ label, name, value, onChange, type = "text", placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      name={name}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    />
  </div>
);