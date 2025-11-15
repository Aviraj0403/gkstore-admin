import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../../services/ProductApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ProductView = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    variants: false,
    additionalInfo: false,
  });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await getProduct(productId);
      if (res.success && res.product) {
        setProduct(res.product);
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNextImage = () => {
    if (product?.pimages?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.pimages.length);
    }
  };

  const handlePrevImage = () => {
    if (product?.pimages?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.pimages.length) % product.pimages.length);
    }
  };

  const handleEditProduct = () => {
    navigate(`/admin/edit-product/${productId}`);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-500">
        <div className="text-sm sm:text-base">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-600">
        <p className="text-sm sm:text-base font-medium">Product not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{product.name}</h2>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-3 sm:px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors transform hover:scale-105"
          >
            <ChevronLeft size={18} className="mr-1" />
            Back
          </button>
          <button
            onClick={handleEditProduct}
            className="flex items-center px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors transform hover:scale-105"
          >
            <FaEdit size={16} className="mr-1" />
            Edit
          </button>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="relative mb-6">
        {product.pimages && product.pimages.length > 0 ? (
          <div className="relative group">
            <img
              src={product.pimages[currentImageIndex]}
              alt={product.name}
              className="w-full h-64 sm:h-96 object-cover rounded-lg shadow-md transform transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black opacity-10 group-hover:opacity-0 transition-opacity duration-300 rounded-lg"></div>
            {product.pimages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors opacity-75 hover:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors opacity-75 hover:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-64 sm:h-96 bg-gray-100 flex items-center justify-center rounded-lg shadow-md">
            <span className="text-gray-500 text-sm">No image available</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="space-y-4">

        {/* Description */}
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Description</h3>
          <p className="text-sm text-gray-600">{product.description || 'No description provided.'}</p>
        </div>

        {/* Basic Info */}
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Category:</span> {product.category?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Subcategory:</span> {product.subCategory?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Brand:</span> {product.brand || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Status:</span>{' '}
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                  product.status === 'Active'
                    ? 'bg-green-100 text-green-600 border border-green-200'
                    : 'bg-red-100 text-red-600 border border-red-200'
                }`}
              >
                {product.status}
              </span>
            </div>
            <div>
              <span className="font-medium">Discount:</span> {product.discount ? `${product.discount}%` : 'No discount'}
            </div>
            <div>
              <span className="font-medium">Created By:</span> {product.createdBy || 'Unknown'}
            </div>
            <div>
              <span className="font-medium">Created At:</span>{' '}
              {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Updated At:</span>{' '}
              {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <button
            className="w-full flex justify-between items-center text-base sm:text-lg font-semibold text-gray-800"
            onClick={() => toggleSection('variants')}
          >
            Variants
            <span>{expandedSections.variants ? 'Up' : 'Down'}</span>
          </button>
          {expandedSections.variants && (
            <div className="mt-2 space-y-2">
              {product.variants?.length > 0 ? (
                product.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <span className="text-sm text-gray-700">
                      {variant.size} / {variant.color} ({variant.packaging})
                    </span>
                    <div className="text-sm text-gray-800">
                      ₹{variant.price.toFixed(2)}{' '}
                      {variant.stockQty > 0 ? (
                        <span className="text-green-600 text-xs">({variant.stockQty} in stock)</span>
                      ) : (
                        <span className="text-red-600 text-xs">(Out of stock)</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No variants available.</p>
              )}
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <button
            className="w-full flex justify-between items-center text-base sm:text-lg font-semibold text-gray-800"
            onClick={() => toggleSection('additionalInfo')}
          >
            Additional Info
            <span>{expandedSections.additionalInfo ? 'Up' : 'Down'}</span>
          </button>
          {expandedSections.additionalInfo && product.additionalInfo && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
              {product.additionalInfo.skinType && (
                <div>
                  <span className="font-medium">Skin Type:</span> {product.additionalInfo.skinType}
                </div>
              )}
              {product.additionalInfo.shelfLife && (
                <div>
                  <span className="font-medium">Shelf Life:</span> {product.additionalInfo.shelfLife} months
                </div>
              )}
              {product.additionalInfo.usageInstructions && (
                <div className="sm:col-span-2">
                  <span className="font-medium">How to Use:</span>{' '}
                  <p className="mt-1">{product.additionalInfo.usageInstructions}</p>
                </div>
              )}
            </div>
          )}
          {expandedSections.additionalInfo && !product.additionalInfo && (
            <p className="mt-2 text-sm text-gray-600">No additional info provided.</p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {product.isHotProduct && (
            <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full hover:shadow-md transition-shadow">
              Hot Product
            </span>
          )}
          {product.isFeatured && (
            <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full hover:shadow-md transition-shadow">
              Featured
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-600 text-xs font-semibold rounded-full hover:shadow-md transition-shadow">
              Best Seller
            </span>
          )}
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <>
              {product.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:shadow-md transition-shadow"
                >
                  {tag}
                </span>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductView;