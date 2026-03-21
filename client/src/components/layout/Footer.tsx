import React from 'react';
import { FaRegCopyright } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 py-3 text-center text-slate-600">
      <h1 className="font-heading text-sm font-semibold tracking-wide flex justify-center items-center gap-2">
        <FaRegCopyright  size={16} /> 
        <span>2026 Task Flow - Internal Workflow System for Intelligic Solutions.</span>
      </h1>
    </footer>
  );
};

export default Footer;
