// src/pages/admin/EditProduct.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, updateProduct } from "../../services/ProductApi";
import { getAllCategories } from "../../services/CategoryApi";
import { toast } from "react-hot-toast";

export default function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Image handling
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  // Variant temp state
  const [variant, setVariant] = useState({
    size: "",
    color: "",
    price: "",
    stockQty: "",
    packaging: "Bottle",
  });

  /* --------------------------------------------------------------
     FETCH PRODUCT + CATEGORIES (runs **once** per productId)
   -------------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProduct(productId),
          getAllCategories({ page: 1, limit: 200 }),
        ]);

        if (!mounted) return;

        if (!prodRes?.success || !prodRes.product) {
          toast.error("Product not found");
          navigate("/admin/products");
          return;
        }

        const p = prodRes.product;

        /* ----- NORMALISE EVERY FIELD TO MATCH FORM ----- */
        const normalized = {
          ...p,
          // category → ID (for <select>)
          category: typeof p.category === "object" ? p.category?._id || "" : p.category || "",
          // subCategory → name (for <input>)
          subCategory: typeof p.subCategory === "object" ? p.subCategory?.name || "" : p.subCategory || "",
          // tags → comma-separated string
          tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
          // variants → always array
          variants: Array.isArray(p.variants) ? p.variants : [],
          // additionalInfo → always object + match your fields
          additionalInfo: {
            skinType: p.additionalInfo?.skinType || "",
            shelfLife: p.additionalInfo?.shelfLife || "",
            usageInstructions: p.additionalInfo?.usageInstructions || "",
          },
          // boolean flags
          isHotProduct: !!p.isHotProduct,
          isFeatured: !!p.isFeatured,
          isBestSeller: !!p.isBestSeller,
        };

        setFormData(normalized);
      } catch (err) {
        if (mounted) {
          console.error("Fetch error:", err);
          toast.error("Failed to load product");
        }
      }

      if (catRes?.success) {
        setCategories(catRes.categories);
      }
    };

    if (productId) fetchData();

    return () => {
      mounted = false;
    };
  }, [productId, navigate]);

  /* --------------------------------------------------------------
     INPUT HANDLER
   -------------------------------------------------------------- */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("additionalInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        additionalInfo: {
          ...prev.additionalInfo,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  /* --------------------------------------------------------------
     IMAGE HANDLING
   -------------------------------------------------------------- */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const total =
      (formData?.pimages?.length || 0) - removedImages.length + newImages.length + files.length;

    if (total > 5) {
      toast.error("Maximum 5 images allowed in total.");
      return;
    }

    const previews = files.map((f) => URL.createObjectURL(f));
    setNewImages((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (i) => {
    setNewImages((prev) => prev.filter((_, idx) => idx !== i));
    setNewPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = (url) => {
    setRemovedImages((prev) => [...prev, url]);
    setFormData((prev) => ({
      ...prev,
      pimages: prev.pimages.filter((img) => img !== url),
    }));
  };

  /* --------------------------------------------------------------
     VARIANT HANDLING
   -------------------------------------------------------------- */
  const addVariant = () => {
    const { size, color, price } = variant;
    if (!size || !color || !price) {
      toast.error("Size, Color and Price are required");
      return;
    }
    if (formData.variants.some((v) => v.size === size && v.color === color)) {
      toast.error("Variant with this size & color already exists");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          size,
          color,
          price: Number(price),
          stockQty: Number(variant.stockQty) || 0,
          packaging: variant.packaging,
        },
      ],
    }));
    setVariant({ size: "", color: "", price: "", stockQty: "", packaging: "Bottle" });
  };

  const removeVariant = (i) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== i),
    }));
  };

  /* --------------------------------------------------------------
     SUBMIT
   -------------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();

      // Primitive fields
      const primitive = [
        "name",
        "brand",
        "description",
        "category",
        "subCategory",
        "tags",
        "price",
        "discount",
        "status",
        "isHotProduct",
        "isFeatured",
        "isBestSeller",
      ];
      primitive.forEach((f) => {
        if (formData[f] !== undefined && formData[f] !== null) {
          fd.append(f, formData[f]);
        }
      });

      // JSON fields
      fd.append("additionalInfo", JSON.stringify(formData.additionalInfo));
      fd.append("variants", JSON.stringify(formData.variants));
      if (removedImages.length) {
        fd.append("removedImages", JSON.stringify(removedImages));
      }

      // New images
      newImages.forEach((file) => fd.append("pimages", file));

      const res = await updateProduct(productId, fd);

      if (res?.success) {
        toast.success("Product updated successfully!");
        navigate(`/admin/product-details/${productId}`);
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating product");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------------
     RENDER
   -------------------------------------------------------------- */
  if (!formData) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Edit Product
        </h1>

        {/* ---------- IMAGE UPLOAD ---------- */}
        <div className="mb-8">
          <div className="bg-orange-100 border-2 border-dashed border-orange-400 rounded-xl p-6 text-center">
            {/* Existing */}
            {formData.pimages?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                {formData.pimages.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={img}
                      alt="Existing"
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New previews */}
            {newPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative">
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
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
            )}

            <input
              type="file"
              id="product-image-upload"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="product-image-upload"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-orange-600 transition font-medium"
            >
              Upload Images (Max 5 Total)
            </label>
          </div>
        </div>

        {/* ---------- FORM ---------- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField label="Name *" name="name" value={formData.name} onChange={handleChange} />
          <InputField label="Brand" name="brand" value={formData.brand} onChange={handleChange} />

          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              label="Subcategory"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
            />
          </div>

          <InputField
            label="Tags (comma separated)"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
          />

          {/* ---------- VARIANTS ---------- */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Variants</h2>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
              <select
                value={variant.size}
                onChange={(e) => setVariant({ ...variant, size: e.target.value })}
                className="border rounded-lg p-3"
              >
                <option value="">Size</option>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
                <option>XL</option>
              </select>

              <input
                type="text"
                placeholder="Color"
                value={variant.color}
                onChange={(e) => setVariant({ ...variant, color: e.target.value })}
                className="border rounded-lg p-3"
              />

              <input
                type="number"
                placeholder="Price"
                value={variant.price}
                onChange={(e) => setVariant({ ...variant, price: e.target.value })}
                className="border rounded-lg p-3"
              />

              <input
                type="number"
                placeholder="Stock"
                value={variant.stockQty}
                onChange={(e) => setVariant({ ...variant, stockQty: e.target.value })}
                className="border rounded-lg p-3"
              />

              <select
                value={variant.packaging}
                onChange={(e) => setVariant({ ...variant, packaging: e.target.value })}
                className="border rounded-lg p-3"
              >
                <option>Bottle</option>
                <option>Box</option>
                <option>Tube</option>
              </select>
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition text-sm"
            >
              + Add Variant
            </button>

            {formData.variants.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.variants.map((v, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-lg text-sm"
                  >
                    <span>
                      {v.size} / {v.color} – ₹{v.price} ({v.stockQty} in stock, {v.packaging})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---------- FLAGS ---------- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              ["isHotProduct", "Hot Product"],
              ["isFeatured", "Featured"],
              ["isBestSeller", "Best Seller"],
            ].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={k}
                  checked={formData[k] || false}
                  onChange={handleChange}
                  className="h-5 w-5 text-orange-500"
                />
                <span>{l}</span>
              </label>
            ))}
          </div>

          {/* ---------- ADDITIONAL INFO (matches your API) ---------- */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Skin Type"
                name="additionalInfo.skinType"
                value={formData.additionalInfo?.skinType || ""}
                onChange={handleChange}
              />
              <InputField
                label="Shelf Life (months)"
                name="additionalInfo.shelfLife"
                type="number"
                value={formData.additionalInfo?.shelfLife || ""}
                onChange={handleChange}
              />
              <TextAreaField
                label="Usage Instructions"
                name="additionalInfo.usageInstructions"
                value={formData.additionalInfo?.usageInstructions || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* ---------- PRICE / DISCOUNT / STATUS ---------- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
            />
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
          </div>

          {/* ---------- SUBMIT ---------- */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------
   REUSABLE FIELD COMPONENTS
   -------------------------------------------------------------- */
const InputField = ({ label, name, value, onChange, type = "text", placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      name={name}
      value={value ?? ""}
      onChange={onChange}
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
      value={value ?? ""}
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