"use client";
import React from "react";
import "./CustomButton.css"; // Ensure this path points to the CSS file
import { useRouter } from "next/navigation";

const CustomButton: React.FC = () => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/signup"); 
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", textAlign: 'center', marginTop: "20px" }}>
      <button className="cssbuttons-io-button" onClick={handleRedirect}>
      Get started
      <div className="icon">
        <svg
        height="24"
        width="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        >
        <path d="M0 0h24v24H0z" fill="none"></path>
        <path
          d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
          fill="currentColor"
        ></path>
        </svg>
      </div>
      </button>
    </div>
  );
};

export default CustomButton;
