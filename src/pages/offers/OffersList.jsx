import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/Axios";
import toast from "react-hot-toast";
import OfferForm from "./OfferForm";

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editOfferId, setEditOfferId] = useState(null);

  const fetchOffers = async () => {
    try {
      const { data } = await axiosInstance.get("/offers");
      setOffers(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      await axiosInstance.delete(`/offers/${id}`);
      toast.success("Offer deleted successfully.");
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete offer");
    }
  };

  const handleAddClick = () => {
    setEditOfferId(null);
    setShowForm(true);
  };

  const handleEditClick = (id) => {
    setEditOfferId(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditOfferId(null);
    fetchOffers();
  };

  if (loading)
    return (
      <div className="p-6 text-center text-lg font-medium text-gray-500">
        ⏳ Loading offers...
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          🎁 Manage Offers
        </h2>
        <button
          onClick={handleAddClick}
          className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 transform transition-all duration-200"
        >
          ➕ Create Offer
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-lg backdrop-blur-sm bg-white/70">
          <thead>
            <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
              {["Name", "Code", "Discount %", "Status", "Valid From", "Valid To", "Actions"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left font-semibold text-gray-700"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr
                key={offer._id}
                className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-pink-50 transition-all duration-200"
              >
                <td className="px-4 py-3 font-medium">{offer.name || "—"}</td>
                <td className="px-4 py-3 uppercase text-sm text-gray-700">
                  {offer.code || "—"}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-indigo-600">
                  {offer.discountPercentage ?? "—"}%
                </td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      offer.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {offer.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(offer.startDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(offer.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center space-x-3">
                  <button
                    onClick={() => handleEditClick(offer._id)}
                    className="text-blue-600 hover:text-blue-800 hover:scale-110 transform transition"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(offer._id)}
                    className="text-red-600 hover:text-red-800 hover:scale-110 transform transition"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
     <div className="md:hidden space-y-5">
  {offers.map((offer) => (
    <div
      key={offer._id}
      className="border border-gray-200 bg-white shadow-sm rounded-xl p-4 hover:shadow-md transition-all"
    >
      {/* Header Row */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">
            {offer.name || "Unnamed Offer"}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Code:{" "}
            <span className="font-mono font-medium text-gray-800">
              {offer.code?.toUpperCase() || "—"}
            </span>
          </p>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2 py-0.5 text-xs rounded-full font-medium ${
            offer.status === "active"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {offer.status}
        </span>
      </div>

      {/* Discount Info */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">Discount</span>
        <span className="font-semibold text-indigo-600 text-sm">
          {offer.discountPercentage ?? "—"}%
        </span>
      </div>

      {/* Validity Period */}
      <div className="mt-2 text-xs text-gray-600">
        <p>
          Valid:{" "}
          <span className="font-medium">
            {new Date(offer.startDate).toLocaleDateString()}
          </span>{" "}
          →{" "}
          <span className="font-medium">
            {new Date(offer.endDate).toLocaleDateString()}
          </span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => handleEditClick(offer._id)}
          className="px-3 py-1 text-xs font-medium rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(offer._id)}
          className="px-3 py-1 text-xs font-medium rounded-md border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-800 transition"
        >
          Delete
        </button>
      </div>
    </div>
  ))}
</div>


      {/* Inline Form */}
     {showForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn relative">
      {/* Close Button */}
      <button
        onClick={handleFormClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
      >
        ✕
      </button>

      <OfferForm offerId={editOfferId} onClose={handleFormClose} />
    </div>
  </div>
)}

    </div>
  );
};

export default OffersList;
