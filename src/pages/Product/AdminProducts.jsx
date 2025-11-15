import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Pencil, Eye, Trash2, Plus } from "lucide-react";
import { getAdminProduct, deleteProduct } from "../../services/ProductApi";

// ---- Desktop Table Row ----
const ProductTableRow = ({ product, onDelete }) => (
  <tr key={product._id} className="hover:bg-gray-50 transition duration-300">
    <td className="px-4 py-4 text-sm font-medium text-gray-900">
      <img
        src={
          product.pimages && product.pimages.length > 0
            ? product.pimages[0]
            : "https://via.placeholder.com/64"
        }
        alt={product.name}
        className="w-16 h-16 object-cover rounded-full mx-auto shadow-lg"
      />
    </td>
    <td className="px-4 py-4 text-sm text-gray-900">{product.name}</td>
    <td className="px-4 py-4 text-sm text-gray-900">
      {product.category?.name || "N/A"}
    </td>
    <td className="px-4 py-4 text-sm text-gray-900">
      {product.variants && product.variants.length > 0
        ? `₹ ${product.variants[0].price}`
        : "N/A"}
    </td>
    <td className="px-4 py-4 text-sm text-gray-900">
      {product.variants?.map((v, idx) => (
        <div key={idx} className="mb-1">
          <span className="font-semibold">{v.size}/{v.color}:</span>{" "}
          <span>₹ {v.price}</span>
        </div>
      ))}
    </td>

    {/* Tags */}
    <td className="px-4 py-4 text-sm text-gray-900 space-x-1 space-y-1">
      {product.isHotProduct && (
        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full shadow-sm">
          Hot
        </span>
      )}
      {product.isFeatured && (
        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full shadow-sm">
          Featured
        </span>
      )}
      {product.isBestSeller && (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full shadow-sm">
          Best Seller
        </span>
      )}
      {product.status === "Active" && (
        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full shadow-sm">
          Active
        </span>
      )}
    </td>

    {/* Actions with Icons */}
    <td className="px-4 py-4 text-sm font-medium">
      <div className="flex items-center justify-center space-x-3">
        <NavLink
          to={`/admin/editProduct/${product._id}`}
          className="text-blue-600 hover:text-blue-800 transition-transform duration-200 hover:scale-110"
          title="Edit"
        >
          <Pencil className="w-5 h-5" />
        </NavLink>
        <NavLink
          to={`/admin/product-view/${product._id}`}
          className="text-gray-600 hover:text-gray-800 transition-transform duration-200 hover:scale-110"
          title="View"
        >
          <Eye className="w-5 h-5" />
        </NavLink>
        <button
          onClick={() => onDelete(product._id)}
          className="text-red-600 hover:text-red-800 transition-transform duration-200 hover:scale-110"
          title="Delete"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </td>
  </tr>
);

// ---- Mobile Card ----
const ProductCard = ({ product, onDelete }) => (
  <div className="p-4 mb-4 border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div className="flex items-center flex-1">
        <img
          src={
            product.pimages && product.pimages.length > 0
              ? product.pimages[0]
              : "https://via.placeholder.com/64"
          }
          alt={product.name}
          className="w-16 h-16 object-cover rounded-full shadow-lg"
        />
        <div className="ml-4 flex-1">
          <p className="text-lg font-semibold text-gray-900">{product.name}</p>
          <p className="text-sm text-gray-500">{product.category?.name || "N/A"}</p>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center space-x-3">
        <NavLink
          to={`/admin/editProduct/${product._id}`}
          className="text-blue-600 hover:text-blue-800 transition-transform duration-200 hover:scale-110"
          title="Edit"
        >
          <Pencil className="w-5 h-5" />
        </NavLink>
        <NavLink
          to={`/admin/product-view/${product._id}`}
          className="text-gray-600 hover:text-gray-800 transition-transform duration-200 hover:scale-110"
          title="View"
        >
          <Eye className="w-5 h-5" />
        </NavLink>
        <button
          onClick={() => onDelete(product._id)}
          className="text-red-600 hover:text-red-800 transition-transform duration-200 hover:scale-110"
          title="Delete"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Variants */}
    <div className="mt-2 text-sm text-gray-700">
      {product.variants?.map((v, idx) => (
        <div key={idx}>
          <strong>{v.size}/{v.color}:</strong> ₹ {v.price}
        </div>
      ))}
    </div>

    {/* Tags */}
    <div className="mt-3 flex flex-wrap gap-2">
      {product.isHotProduct && <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">Hot</span>}
      {product.isFeatured && <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Featured</span>}
      {product.isBestSeller && <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full">Best Seller</span>}
      {product.status === "Active" && <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Active</span>}
    </div>
  </div>
);

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getAdminProduct({
        page,
        limit,
        search: searchTerm,
      });

      if (response?.success) {
        setProducts(response.products || []);
        setPagination(response.pagination || {});
      } else {
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (pagination.totalPages && newPage > pagination.totalPages)) return;
    setPage(newPage);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await deleteProduct(id);
      if (res.success) {
        toast.success("Product deleted successfully!");
        fetchProducts();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <h4 className="text-2xl font-semibold text-gray-800">Product List</h4>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          />
          <NavLink
            to="/admin/addProduct"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </NavLink>
        </div>
      </div>

      {/* Loading & Content */}
      {loading ? (
        <div className="text-center py-10 text-lg text-gray-600">Loading products...</div>
      ) : products.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full table-auto shadow-md border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Image</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Variants</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tags</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductTableRow key={product._id} product={product} onDelete={handleDeleteProduct} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} onDelete={handleDeleteProduct} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Page {page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= (pagination.totalPages || 1)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-10 text-lg text-gray-600">No products found.</div>
      )}
    </div>
  );
};

export default AdminProducts;