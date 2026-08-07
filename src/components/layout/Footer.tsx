import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Database, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';
import { getDatasetStatus } from '../../utils/datasetStatus';

export const Footer: React.FC = () => {
  const datasetStatus = getDatasetStatus();

  return (
    <footer className="w-full bg-[#0A0A0A] text-[#F8F8F8] pt-16 pb-12 border-t border-[#1F1F1F]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#262626]">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white text-[#0A0A0A] flex items-center justify-center font-bold text-base font-display">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                ShopSmart <span className="text-[#2563EB]">AI</span>
              </span>
            </Link>

            <p className="text-sm text-[#8A8A8A] max-w-sm leading-relaxed">
              A premium AI-ready e-commerce platform built for technology products. Prepared for retrieval-augmented generation (RAG) assistant integration in Phase 2.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-[#8A8A8A]">
              <span className="flex items-center gap-1.5 bg-[#171717] px-3 py-1.5 rounded-lg border border-[#262626]">
                <Cpu className="w-3.5 h-3.5 text-[#2563EB]" /> React 19 + Vite
              </span>
              <span className="flex items-center gap-1.5 bg-[#171717] px-3 py-1.5 rounded-lg border border-[#262626]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" /> Zod Validated Schema
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-[#CCCCCC]">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  Categories Overview
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">
                  Product Comparison
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Bag
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">
              Tech Categories
            </h4>
            <ul className="space-y-2 text-sm text-[#CCCCCC]">
              <li>
                <Link to="/categories/laptops" className="hover:text-white transition-colors">
                  Laptops & Notebooks
                </Link>
              </li>
              <li>
                <Link to="/categories/smartphones" className="hover:text-white transition-colors">
                  Smartphones
                </Link>
              </li>
              <li>
                <Link to="/categories/monitors" className="hover:text-white transition-colors">
                  Displays & Monitors
                </Link>
              </li>
              <li>
                <Link to="/categories/keyboards" className="hover:text-white transition-colors">
                  Mechanical Keyboards
                </Link>
              </li>
              <li>
                <Link to="/categories/headphones" className="hover:text-white transition-colors">
                  Audio & Headphones
                </Link>
              </li>
            </ul>
          </div>

          {/* AI & Architecture Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">
              AI Architecture
            </h4>
            <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8A8A8A] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#2563EB]" /> Catalog Status
                </span>
                <span
                  className={`font-semibold ${
                    datasetStatus.connected ? 'text-[#15803D]' : 'text-[#B45309]'
                  }`}
                >
                  {datasetStatus.connected ? 'Connected' : 'Offline'}
                </span>
              </div>
              <p className="text-[11px] text-[#8A8A8A]">
                {datasetStatus.connected
                  ? `Loaded ${datasetStatus.productCount} verified products`
                  : 'Awaiting Phase 2 product dataset ingestion'}
              </p>
              <Link
                to="/ai-assistant"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-white transition-colors"
              >
                <Bot className="w-3.5 h-3.5" /> Launch AI Assistant <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A8A8A]">
          <div>
            &copy; 2026 ShopSmart AI Inc. All rights reserved. Built with Apple & Tesla minimal visual discipline.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Use</span>
            <span className="hover:text-white cursor-pointer transition-colors">Dataset Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
