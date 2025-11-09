import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/Axios";
import { createFood } from "../../services/FoodApi"
import { getAllCategories } from "../../services/CategoryApi";
import { toast, ToastContainer } from 'react-toastify'; // Import both toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css';

export default function AddFoodForm() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        ingredients: "",
        category: "",
        isHotProduct: false,
        isBudgetBite: false,
        isSpecialOffer: false,
        variants: [],
        isFeatured: false,
        isRecommended: false,
        status: "Active",
        cookTime: "",
        itemType: "",
        variety: "",
        discount: 0,
    });

    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [variant, setVariant] = useState({ size: '', price: '' });
    const navigate = useNavigate();



    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await getAllCategories({
                    page: 1,
                    limit: 100, // Fetch a reasonable amount of categories
                    search: "",
                    sortField: "name",
                    sortOrder: 1,
                });

                if (res.success && Array.isArray(res.categories)) {
                    setCategories(res.categories); // Set categories in the state
                } else {
                    throw new Error("Failed to fetch categories.");
                }
            } catch (err) {
                toast.error("Failed to load categories.");
            }
        }

        fetchCategories();
    }, []);

    // Handle field updates
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleVariantChange = (i, field, val) => {
        const updated = [...formData.variants];
        updated[i][field] = val;
        setFormData((prev) => ({ ...prev, variants: updated }));
    };

    const addVariant = () => {
        const { size, price } = variant;

        if (!size || !price || isNaN(parseFloat(price))) {
            toast.error("Please provide a valid size and price.", {
                style: { background: "#f97316", color: "#fff" },
            });
            return;
        }

        const alreadyExists = formData.variants.some((v) => v.size === size);
        if (alreadyExists) {
            toast.error("Variant with this size already exists.", {
                style: { background: "#f97316", color: "#fff" },
            });
            return;
        }

        setFormData((prev) => ({
            ...prev,
            variants: [...prev.variants, { size, price }],
        }));

        setVariant({ size: '', price: '' }); // Reset form

        toast.success("Variant added!", {
            style: { background: "#f97316", color: "#fff" },
        });
    };
    const removeVariant = (i) => {
        const updated = formData.variants.filter((_, idx) => idx !== i);
        setFormData((prev) => ({
            ...prev,
            variants: updated,
        }));

        toast.success("Variant removed!", {
            style: { background: "#f97316", color: "#fff" },
        });
    };
    // Image handling
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 3) {
            toast.error("You can upload a maximum of 3 images.");
            return;
        }
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setImages((prev) => [...prev, ...files]);
        setPreviews((prev) => [...prev, ...newPreviews]);
        toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded!`, {
            style: {
                background: "#f97316",
                color: "#fff",
            },
        });
    };

    const removeImages = () => {
        setImages([]);
        setPreviews([]);
        toast.success("All images removed!", {
            style: {
                background: "#f97316",
                color: "#fff",
            },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation here (unchanged)...

        try {
            const fd = new FormData();

            // Append all other fields except variants
            Object.entries(formData).forEach(([key, val]) => {
                if (key !== "variants") {
                    fd.append(key, val);
                }
            });

            // Append variants with indexed keys:
            formData.variants.forEach((variant, index) => {
                fd.append(`variants[${index}][name]`, `${formData.name} - ${variant.size}`);
                fd.append(`variants[${index}][size]`, variant.size);
                fd.append(`variants[${index}][price]`, parseFloat(variant.price));
            });

            // Append images normally
            images.forEach((file) => fd.append("foodImages", file));

            // Send request
            // const res = await axios.post("/foods/createFood", fd, {
            //     headers: { "Content-Type": "multipart/form-data" },
            // });

            // if (res.data.success) {
            //     toast.success("Food item created successfully!", {
            //         style: { background: "#f97316", color: "#fff" },
            //     });
            //     resetForm();
            // } else {
            //     toast.error(res.data.message || "Failed to create food item.", {
            //         style: { background: "#f97316", color: "#fff" },
            //     });
            // }

            const data = await createFood(fd);

            if (data.success) {
                toast.success("Food item created successfully!", {
                    style: { background: "#f97316", color: "#a9b8deff" },
                });
                resetForm();
                navigate("/admin/adminFood");
            } else {
                toast.error(data.message || "Failed to create food item.", {
                    style: { background: "#f97316", color: "#fff" },
                });
            }

        } catch (err) {
            console.error("Error:", err);
            toast.error(err.response?.data?.message || "Server error occurred.", {
                style: { background: "#f97316", color: "#fff" },
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            ingredients: "",
            category: "",
            isHotProduct: false,
            isBudgetBite: false,
            isSpecialOffer: false,
            variants: [],
            isFeatured: false,
            isRecommended: false,
            status: "Active",
            cookTime: "",
            itemType: "",
            variety: "",
            discount: 0,
        });
        removeImages();
    };

    return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Add New Food Item
                </h1>

                {/* Image Upload Section */}
                <div className="mb-8">
                    <div className="bg-orange-100 border-2 border-dashed border-orange-400 rounded-xl p-6 text-center">
                        {previews.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                {previews.map((src, idx) => (
                                    <img
                                        key={idx}
                                        src={src}
                                        alt={`Preview ${idx + 1}`}
                                        className="w-full h-32 object-cover rounded-lg shadow-sm"
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No images uploaded</p>
                        )}
                        {previews.length > 0 && (
                            <button
                                type="button"
                                onClick={removeImages}
                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                                Remove All Images
                            </button>
                        )}
                        {previews.length < 3 && (
                            <div className="mt-4">
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
                                    Upload Image
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name, Description, Ingredients */}
                    <InputField
                        label="Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter food name"
                    />
                    <TextAreaField
                        label="Description *"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the food item (min 10 characters)"
                    />
                    <InputField
                        label="Ingredients"
                        name="ingredients"
                        value={formData.ingredients}
                        onChange={handleChange}
                        placeholder="e.g., Tomato, Cheese, Basil"
                    />

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}

                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                            console.log(formData.category); // This will show the current category value.

                            <option value="">Select Category</option>
                            {categories.map((cat) => (

                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Variants Section */}
                    <div className="border border-gray-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Variant</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <select
                                value={variant.size}
                                onChange={(e) => setVariant({ ...variant, size: e.target.value })}
                                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
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
                                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
                            />

                            <button
                                type="button"
                                onClick={addVariant}
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                            >
                                + Add Variant
                            </button>
                        </div>

                        {/* Show Added Variants */}
                        {formData.variants.length > 0 && (
                            <div className="space-y-2 mt-4">
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
                                    className="h-5 w-5 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-gray-700">{label}</span>
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
                        placeholder="e.g., 15"
                    />
     {/* Item Type Dropdown */}
<div>
  <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 mb-1">
    Item Type *
  </label>
  <select
    name="itemType"
    id="itemType"
    value={formData.itemType}
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
    required
  >
    <option value="" disabled>
      -- Select Item Type --
    </option>
    <option value="Veg">Veg</option>
    <option value="Non-Veg">Non-Veg</option>
  </select>
</div>

{/* Variety Dropdown */}
<div>
  <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-1">
    Variety *
  </label>
  <select
    name="variety"
    id="variety"
    value={formData.variety}
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
    required
  >
    <option value="" disabled>
      -- Select Variety --
    </option>
    <option value="Breakfast">Breakfast</option>
    <option value="Lunch">Lunch</option>
    <option value="Dinner">Dinner</option>
  </select>
</div>



                    <InputField
                        label="Discount (%)"
                        name="discount"
                        type="number"
                        value={formData.discount}
                        onChange={handleChange}
                        placeholder="e.g., 10"
                    />

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg text-white font-semibold ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-600 hover:bg-orange-700"
                            } transition`}
                    >
                        {loading ? "Saving..." : "Create Food Item"}
                    </button>
                </form>
            </div>
        </div>
    );
}

// Helper Components
const InputField = ({ label, name, value, onChange, type = "text", placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
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
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
    </div>
);