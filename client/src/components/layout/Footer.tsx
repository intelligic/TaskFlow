import React from 'react';
import { FaRegCopyright } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="mt-auto w-full border-t bg-white py-3 text-center text-gray-800 shadow-lg">
      <h1 className="font-serif text-sm font-bold tracking-wide flex justify-center items-center gap-2">
        <FaRegCopyright  size={16} /> 
        <span>2026 Task Flow - Internal Workflow System for Intelligic Solutions.</span>
      </h1>
    </footer>
  );
};

export default Footer;
