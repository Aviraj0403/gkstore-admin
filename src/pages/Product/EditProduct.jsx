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
  const [existingImages, setExistingImages] = useState([]); // from server (URLs)
  const [newImages, setNewImages] = useState([]);           // new File objects
  const [newPreviews, setNewPreviews] = useState([]);       // preview URLs
  const [removedImages, setRemovedImages] = useState([]);  // URLs to delete

  // Temp variant state (for adding new)
  const [variant, setVariant] = useState({
    size: "",
    color: [],
    price: "",
    stockQty: "",
    packaging: "Bottle",
  });
  const [currentColor, setCurrentColor] = useState("");

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
          variants: Array.isArray(p.variants)
            ? p.variants.map(v => ({
                size: v.size || "",
                color: Array.isArray(v.color) ? v.color : [v.color].filter(Boolean),
                price: v.price?.toString() || "",
                stockQty: v.stockQty?.toString() || "0",
                packaging: v.packaging || "Bottle",
              }))
            : [],
        };

        setFormData(normalized);
        setExistingImages(p.pimages || []);
        if (catRes.success) setCategories(catRes.categories || []);
      } catch (err) {
        toast.error("Failed to load product");
        console.error(err);
      }
    }

    if (productId) fetchData();
  }, [productId, navigate]);

  useEffect(() => {
    async function fetchSubCategories() {
      if (formData?.category) {
        try {
          const subs = await getSubCategories(formData.category);
          setSubCategories(subs || []);
        } catch {
          toast.error("Failed to load sub-categories");
        }
      } else {
        setSubCategories([]);
      }
    }
    if (formData) fetchSubCategories();
  }, [formData?.category]);

  /* ------------------ HANDLERS ------------------ */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "discount" && value < 0) {
      setFormData(prev => ({ ...prev, discount: 0 }));
      return;
    }

    if (name === "category") {
      setFormData(prev => ({ ...prev, category: value, subCategory: "" }));
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

  const addColorToVariant = () => {
    if (!currentColor.trim()) return;
    const normalized = currentColor.trim().toLowerCase();
    if (variant.color.some(c => c.toLowerCase() === normalized)) {
      toast.error("Color already added!");
      return;
    }
    setVariant(prev => ({ ...prev, color: [...prev.color, currentColor.trim()] }));
    setCurrentColor("");
  };

  const removeColorFromVariant = (colorToRemove) => {
    setVariant(prev => ({
      ...prev,
      color: prev.color.filter(c => c !== colorToRemove),
    }));
  };

  const addVariant = () => {
    const { size, color, price, stockQty, packaging } = variant;

    if (!size.trim()) return toast.error("Size is required.");
    if (color.length === 0) return toast.error("At least one color is required.");
    if (!price || isNaN(parseFloat(price))) return toast.error("Valid price is required.");

    const alreadyExists = formData.variants.some(v =>
      v.size === size.trim() &&
      v.color.length === color.length &&
      v.color.every(c => color.includes(c)) &&
      color.every(c => v.color.includes(c))
    );

    if (alreadyExists) return toast.error("This variant (size + colors) already exists.");

    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          size: size.trim(),
          color: [...color],
          price: parseFloat(price),
          stockQty: parseInt(stockQty) || 0,
          packaging: packaging || "Bottle",
        },
      ],
    }));

    setVariant({ size: "", color: [], price: "", stockQty: "", packaging: "Bottle" });
    setCurrentColor("");
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
    const totalImages = existingImages.length - removedImages.length + newImages.length + files.length;
    if (totalImages > 5) {
      toast.error("Maximum 5 images allowed.");
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
    setRemovedImages(prev => [...prev, ...existingImages]);
    setExistingImages([]);
    setNewImages([]);
    setNewPreviews([]);
    toast.success("All images cleared!");
  };

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) return toast.error("At least one image is required.");
    if (formData.variants.length === 0) return toast.error("At least one variant is required.");

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

    // Variants
    formData.variants.forEach((v, i) => {
      fd.append(`variants[${i}][size]`, v.size);
      v.color.forEach(col => fd.append(`variants[${i}][color][]`, col));
      fd.append(`variants[${i}][price]`, v.price);
      fd.append(`variants[${i}][stockQty]`, v.stockQty);
      fd.append(`variants[${i}][packaging]`, v.packaging);
    });

    // Images
    newImages.forEach(file => fd.append("pimages", file));
    if (removedImages.length > 0) {
      fd.append("removedImages", JSON.stringify(removedImages));
    }

    try {
      const res = await updateProduct(productId, fd);
      if (res.success) {
        toast.success("Product updated successfully!");
        navigate("/admin/adminProducts");
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return <div className="text-center py-20 text-xl">Loading product...</div>;

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Edit Product</h1>

        {/* Image Upload Section */}
                {/* Image Upload Section */}
        <div className="mb-8">
          <div className="bg-orange-100 border-2 border-dashed border-orange-400 rounded-xl p-6 text-center">
            
            {/* Calculate total current images */}
            {(() => {
              const totalImages = existingImages.filter(img => !removedImages.includes(img)).length + newPreviews.length;
              return (
                <>
                  {totalImages > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                      {existingImages
                        .filter(img => !removedImages.includes(img))
                        .map((src, i) => (
                          <div key={`exist-${i}`} className="relative group">
                            <img src={src} alt="" className="w-full h-32 object-cover rounded-lg shadow-sm" />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(src)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      {newPreviews.map((src, i) => (
                        <div key={`new-${i}`} className="relative group">
                          <img src={src} alt="" className="w-full h-32 object-cover rounded-lg shadow-sm" />
                          <button
                            type="button"
                            onClick={() => removeNewImage(i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No images</p>
                  )}

                  {totalImages > 0 && (
                    <button
                      type="button"
                      onClick={removeAllImages}
                      className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      Remove All Images
                    </button>
                  )}

                  {totalImages < 5 && (
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
                        className="bg-orange-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-orange-600 transition font-semibold"
                      >
                        Upload More Images ({5 - totalImages} left)
                      </label>
                    </div>
                  )}

                  {totalImages >= 5 && (
                    <p className="mt-4 text-sm text-orange-600 font-medium">
                      Maximum 5 images reached
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Fields */}
          <InputField label="Name *" name="name" value={formData.name} onChange={handleChange} />
          <InputField label="Brand *" name="brand" value={formData.brand} onChange={handleChange} />
          <TextAreaField label="Description *" name="description" value={formData.description} onChange={handleChange} />

          {/* Category & Subcategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500">
              <option value="">Select Category</option>
              {categories.filter(c => c.type === "Main").map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              disabled={!formData.category}
              className={`w-full border border-gray-300 rounded-lg p-3 ${!formData.category ? "bg-gray-100" : ""}`}
            >
              <option value="">{formData.category ? "None (Optional)" : "Select Main Category First"}</option>
              {subCategories.map(sub => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <InputField label="Tags (comma separated)" name="tags" value={formData.tags} onChange={handleChange} />
          <InputField label="Discount (%)" name="discount" type="number" min="0" max="100"  value={formData.discount} onChange={handleChange} />
          {/* {console.log("dcnt input ",formData.discount)} */}
          {/* Additional Info */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>
            <InputField label="Skin Type" name="additionalInfo.skinType" value={formData.additionalInfo.skinType} onChange={handleChange} />
            <InputField label="Shelf Life (months)" name="additionalInfo.shelfLife" type="number" value={formData.additionalInfo.shelfLife} onChange={handleChange} />
            <TextAreaField label="Usage Instructions" name="additionalInfo.usageInstructions" value={formData.additionalInfo.usageInstructions} onChange={handleChange} />
          </div>

          {/* Variants Section - Same as Add Form */}
          <div className="border border-gray-200 rounded-2xl p-6 lg:p-8 bg-white shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">V</span>
              Product Variants
            </h2>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Size / Volume *</label>
                  <input
                    type="text"
                    placeholder="e.g. 100ml, Large"
                    value={variant.size}
                    onChange={e => setVariant(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="299"
                    value={variant.price}
                    onChange={e => setVariant(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={variant.stockQty}
                    onChange={e => setVariant(prev => ({ ...prev, stockQty: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addVariant}
                    disabled={!variant.size || variant.color.length === 0 || !variant.price}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-all ${!variant.size || variant.color.length === 0 || !variant.price
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg"
                    }`}
                  >
                    Add Variant
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Colors for this Variant *</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type color (e.g. Rose Gold)"
                    value={currentColor}
                    onChange={e => setCurrentColor(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColorToVariant())}
                    className="flex-1 min-w-[200px] px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={addColorToVariant}
                    className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition shadow-md"
                  >
                    + Add Color
                  </button>
                </div>

                {variant.color.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {variant.color.map((col, i) => (
                      <div key={i} className="group flex items-center gap-2 bg-white border-2 border-orange-300 rounded-2xl px-4 py-2 shadow-sm">
                        <div className="w-6 h-6 rounded-full border-2 border-white shadow ring-1 ring-gray-300" style={{ backgroundColor: col.toLowerCase() }} />
                        <span className="font-medium text-gray-800">{col}</span>
                        <button onClick={() => removeColorFromVariant(col)} className="ml-2 text-red-500 hover:text-red-700 font-bold text-lg">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Existing Variants */}
            {formData.variants.length > 0 && (
              <div className="mt-10">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Added Variants ({formData.variants.length})</h3>
                <div className="grid gap-4">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:shadow-xl transition-shadow">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 text-lg font-bold text-gray-800">
                          <span className="bg-white px-4 py-2 rounded-lg shadow">{v.size}</span>
                          <span>₹{v.price}</span>
                          <span className="text-gray-600 font-normal">• Stock: {v.stockQty || 0}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {v.color.map((c, i) => (
                            <span key={i} className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border">
                              <span className="w-4 h-4 rounded-full ring-2 ring-white shadow" style={{ backgroundColor: c.toLowerCase() }} />
                              <span className="text-sm font-medium">{c}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => removeVariant(idx)}
                        className="self-start lg:self-center px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-md"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkboxes & Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ["isBestSeller", "Best Seller"],
              ["isCombo", "Combo"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" name={key} checked={formData[key]} onChange={handleChange} className="h-5 w-5 text-orange-500" />
                <span className="text-gray-700">{label}</span>
              </label>
            ))}
          </div>

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
            className={`w-full py-4 rounded-lg text-white font-bold text-lg transition ${loading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"}`}
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Reusable Input Components */
const InputField = ({ label, name, value, onChange, type = "text", placeholder, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      {...props}
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