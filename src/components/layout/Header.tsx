import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Scale, Bot, Menu, X, Database, ChevronRight, User } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useCompareStore } from '../../stores/useCompareStore';
import { getDatasetStatus } from '../../utils/datasetStatus';
import { SearchOverlay } from './SearchOverlay';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const location = useLocation();

  const cartCount = useCartStore((s) => s.getCartItemCount());
  const wishlistCount = useWishlistStore((s) => s.getWishlistCount());
  const compareCount = useCompareStore((s) => s.getCompareCount());
  const datasetStatus = getDatasetStatus();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Categories', path: '/categories' },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { label: 'Compare', path: '/compare' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'glass-header border-b border-[#E5E5E2] shadow-sm py-3'
            : 'bg-[#F7F7F5]/90 backdrop-blur-md py-4'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-9 h-9 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-lg font-display group-hover:bg-[#2563EB] transition-colors">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-[#111111] tracking-tight font-display flex items-center gap-1">
                ShopSmart <span className="text-[#2563EB]">AI</span>
              </span>
              <span className="text-[10px] text-[#8A8A8A] uppercase tracking-widest font-semibold -mt-1">
                RAG-Ready Store
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/70 border border-[#E5E5E2] rounded-full px-4 py-1.5 shadow-xs">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'text-[#626262] hover:text-[#111111] hover:bg-[#EFEFEC]'
                  }`}
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5 text-[#2563EB]" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dataset Badge Status */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEFEC] border border-[#E5E5E2] text-[11px] font-medium text-[#626262]">
              <span
                className={`w-2 h-2 rounded-full ${
                  datasetStatus.connected ? 'bg-[#15803D] animate-pulse' : 'bg-[#B45309]'
                }`}
              />
              <span>
                {datasetStatus.connected
                  ? `${datasetStatus.productCount} Products`
                  : 'Catalog Offline'}
              </span>
            </div>

            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl text-[#111111] hover:bg-white hover:border hover:border-[#E5E5E2] transition-all cursor-pointer"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-xl text-[#111111] hover:bg-white hover:border hover:border-[#E5E5E2] transition-all"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#111111] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Compare Badge */}
            <Link
              to="/compare"
              className="relative p-2.5 rounded-xl text-[#111111] hover:bg-white hover:border hover:border-[#E5E5E2] transition-all hidden sm:flex"
              title="Compare Products"
            >
              <Scale className="w-5 h-5" />
              {compareCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Link>

            {/* Cart Drawer / Link */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white text-[#111111] text-[10px] font-extrabold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Link */}
            <Link
              to="/account"
              className="p-2.5 rounded-xl text-[#111111] hover:bg-white hover:border hover:border-[#E5E5E2] transition-all hidden sm:flex"
              title="Account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-[#111111] hover:bg-white transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-in Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[65px] bg-white border-b border-[#E5E5E2] p-6 shadow-xl z-50 animate-fadeIn">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F7F7F5] text-sm font-semibold text-[#111111]"
                >
                  <span className="flex items-center gap-2">
                    {link.icon && <link.icon className="w-4 h-4 text-[#2563EB]" />}
                    {link.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8A8A8A]" />
                </Link>
              ))}
              <div className="h-px bg-[#E5E5E2] my-2" />
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F7F5] text-xs font-semibold text-[#626262]">
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#2563EB]" /> Dataset Status
                </span>
                <span className={datasetStatus.connected ? 'text-[#15803D]' : 'text-[#B45309]'}>
                  {datasetStatus.connected ? `${datasetStatus.productCount} Products` : 'Catalog Offline'}
                </span>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
