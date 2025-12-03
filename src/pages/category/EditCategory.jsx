import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategory, updateCategory, getMainCategories } from '../../services/CategoryApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditCategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [type, setType] = useState('Main');
  const [parentCategory, setParentCategory] = useState('');
  const [desktopImage, setDesktopImage] = useState(null);
  const [mobileImage, setMobileImage] = useState(null);
  const [imagePreviews, setImagePreviews] = useState({
    desktop: null,
    mobile: null,
  });
  const [existingImages, setExistingImages] = useState({ desktop: null, mobile: null });
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // States for removing images
  const [removeDesktopImage, setRemoveDesktopImage] = useState(false);
  const [removeMobileImage, setRemoveMobileImage] = useState(false);

  const desktopFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const [cat, parents] = await Promise.all([getCategory(categoryId), getMainCategories()]);
        setName(cat.name);
        setDescription(cat.description || '');
        setDisplayOrder(cat.displayOrder || 1);
        setType(cat.type);
        setParentCategory(cat.parentCategory?._id || '');

        if (cat.image && cat.image.length > 0) {
          setExistingImages({
            desktop: cat.image[0], // Assuming first image is for desktop
            mobile: cat.image[1],  // Assuming second image is for mobile
          });
        }
        setMainCategories(parents);
      } catch (err) {
        toast.error('Failed to load category');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [categoryId]);

  // Handle new image selection for desktop
  const handleDesktopImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDesktopImage(file);
      setImagePreviews(prev => ({
        ...prev,
        desktop: URL.createObjectURL(file),
      }));
    }
  };

  // Handle new image selection for mobile
  const handleMobileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobileImage(file);
      setImagePreviews(prev => ({
        ...prev,
        mobile: URL.createObjectURL(file),
      }));
    }
  };

  // Remove desktop image and reset the file input
  const handleImageRemove = async (imageType) => {
    try {
      const imageUrl = imageType === 'desktop' ? existingImages.desktop : existingImages.mobile;

      // Send request to backend to remove image
      const res = await updateCategory(categoryId, {
        removeDesktopImage: imageType === 'desktop' && imageUrl,
        removeMobileImage: imageType === 'mobile' && imageUrl,
      });

      if (res.success) {
        // Update local state to reflect that the image has been removed
        if (imageType === 'desktop') {
          setExistingImages(prev => ({ ...prev, desktop: null }));
          setRemoveDesktopImage(true);
        } else {
          setExistingImages(prev => ({ ...prev, mobile: null }));
          setRemoveMobileImage(true);
        }
        toast.success('Image removed successfully');
      } else {
        toast.error('Failed to remove image');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Error removing image');
    }
  };

  // Submit the update
  const handleUpdate = async () => {
    if (!name) return toast.error('Name is required');
    if (!desktopImage && !existingImages.desktop && !removeDesktopImage) return toast.error('Desktop image is required');
    if (!mobileImage && !existingImages.mobile && !removeMobileImage) return toast.error('Mobile image is required');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('displayOrder', displayOrder || 1);
    formData.append('type', type);
    if (type === 'Sub' && parentCategory) formData.append('parentCategory', parentCategory);

    // Append images if selected
    if (desktopImage) formData.append('desktopImage', desktopImage);
    if (mobileImage) formData.append('mobileImage', mobileImage);

    // Flags for removing images
    if (removeDesktopImage && existingImages.desktop) formData.append('removeDesktopImage', true);
    if (removeMobileImage && existingImages.mobile) formData.append('removeMobileImage', true);

    try {
      setLoading(true);
      const res = await updateCategory(categoryId, formData);
      setLoading(false);
      if (res.success) {
        toast.success('Category updated!');
        navigate(`/admin/viewCategory/${categoryId}`);
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Error');
    }
  };

  if (fetching) return <div className="text-center py-10">Loading...</div>;

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-semibold mb-6">Edit Category</h1>

        <div className="space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Math.max(1, e.target.value))}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Type</label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="Main"
                  checked={type === 'Main'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                />
                Main
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="Sub"
                  checked={type === 'Sub'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                />
                Sub
              </label>
            </div>
          </div>

          {/* Parent Category Dropdown */}
          {type === 'Sub' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Category</label>
              <select
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Main Category --</option>
                {mainCategories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Existing Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Existing Images</label>
            <div className="flex gap-3 mt-2">
              {existingImages.desktop && (
                <div className="relative">
                  <img
                    src={existingImages.desktop}
                    alt="Desktop Preview"
                    className="w-24 h-24 object-cover rounded border shadow"
                  />
                  <span
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer"
                    onClick={() => handleImageRemove('desktop')}
                  >
                    X
                  </span>
                </div>
              )}
              {existingImages.mobile && (
                <div className="relative">
                  <img
                    src={existingImages.mobile}
                    alt="Mobile Preview"
                    className="w-24 h-24 object-cover rounded border shadow"
                  />
                  <span
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer"
                    onClick={() => handleImageRemove('mobile')}
                  >
                    X
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Desktop Image</label>
            <input
              ref={desktopFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleDesktopImageChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
            />
            {imagePreviews.desktop && (
              <div className="relative mt-3">
                <img
                  src={imagePreviews.desktop}
                  alt="Desktop Preview"
                  className="w-32 h-32 object-cover rounded-lg border shadow"
                />
                <span
                  className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer"
                  onClick={() => handleImageRemove('desktop')}
                >
                  X
                </span>
              </div>
            )}
          </div>

          {/* Mobile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Image</label>
            <input
              ref={mobileFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleMobileImageChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
            />
            {imagePreviews.mobile && (
              <div className="relative mt-3">
                <img
                  src={imagePreviews.mobile}
                  alt="Mobile Preview"
                  className="w-32 h-32 object-cover rounded-lg border shadow"
                />
                <span
                  className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer"
                  onClick={() => handleImageRemove('mobile')}
                >
                  X
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleUpdate}
              disabled={loading || (!desktopImage && !existingImages.desktop && !removeDesktopImage) || (!mobileImage && !existingImages.mobile && !removeMobileImage)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default EditCategoryPage;
