import React, { Component } from "react";
import { Link } from "react-router-dom";

class EB extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error("Error caught by Error Boundary: ", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#fff3e6] to-[#ffe0cc] p-6">
          <img
            src="/rest.png"
            alt="Error Illustration"
            className="max-w-[280px] mb-6"
          />
          <h2 className="text-2xl font-extrabold text-[#d84315] mb-4 font-sans">
            Oops! Something went wrong.
          </h2>
          <p className="text-base text-gray-700 max-w-md mb-6">
            Looks like our kitchen had a little fire 🔥. Don’t worry, we’re fixing it!
          </p>
          <Link
            to="/admin/dashboard"
            className="inline-block px-6 py-3 bg-[#ff7043] text-white rounded-lg font-semibold transition duration-300 ease-in-out hover:bg-[#d84315]"
          >
            Go Back Home
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EB;
