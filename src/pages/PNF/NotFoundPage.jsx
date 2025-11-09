import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  // Auto redirect after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/admin/dashboard");
    }, 5000);
    return () => clearTimeout(timer); // cleanup
  }, [navigate]);

  return (
    <div style={styles.container}>
      {/* Dark overlay for readability */}
      <div style={styles.overlay}></div>
      <div style={styles.content}>
        <h1 style={styles.title}>404 - Page Not Found</h1>
        <p style={styles.message}>
          Oops! Looks like this dish is not on the menu 🍽️
          <br />
          Don’t worry, we’ll guide you back home in a few seconds…
        </p>
        <Link to="/admin/dashboard" style={styles.button}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundImage: "url('/rest.png')", // Image used as background
    backgroundSize: "cover", // Make sure the image covers the whole screen
    backgroundPosition: "center", // Center the image
    backgroundRepeat: "no-repeat", // Don't repeat the image
    position: "relative", // Position to allow the overlay to cover it
    padding: "20px", // Some padding for better layout
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Dark overlay to improve readability
    zIndex: 1, // Makes sure overlay is on top of the background image
  },
  content: {
    position: "relative",
    zIndex: 2, // Ensures content is above the overlay
    color: "#fff", // White text for contrast on dark overlay
    padding: "20px", // Padding to space out content
    borderRadius: "8px", // Optional: rounded corners for the content block
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Adds shadow for a bit of depth
    maxWidth: "600px", // Max width for better layout on large screens
    width: "100%", // Full width up to max width
  },
  title: {
    fontSize: "2.2rem", // Larger title for emphasis
    fontWeight: "700", // Bold text
    marginBottom: "10px", // Spacing between title and message
    fontFamily: "Segoe UI, sans-serif", // Stylish font
  },
  message: {
    fontSize: "1.1rem", // Slightly larger text for message
    maxWidth: "400px", // Limit the width for better readability
    margin: "0 auto 20px auto", // Centering the message and adding spacing
  },
  button: {
    display: "inline-block",
    padding: "10px 20px",
    background: "#ff7043", // Button color
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "600", // Bold text for the button
    transition: "background 0.3s ease", // Smooth transition on hover
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Optional: shadow for button
  },
};

// Export the component as default
export default NotFoundPage;
