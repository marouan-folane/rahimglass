import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ShoppingBag, User, Search, LogOut, Heart, Shield, Sparkles, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface NavBarProps {
  onNavigate: (page: string, param?: any) => void;
  onAuthRequest: () => void;
  favoritesCount: number;
}

export const NavBar: React.FC<NavBarProps> = ({ onNavigate, onAuthRequest, favoritesCount }) => {
  const { user, profile, signOut } = useAuth();
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('shop', searchQuery);
    setShowSearch(false);
  };

  const handleDashboardClick = () => {
    if (profile?.role === 'admin') {
      onNavigate('admin');
    } else {
      onNavigate('dashboard');
    }
    setIsProfileOpen(false);
  };

  const navItems = [
    { label: 'Accueil', id: 'home' },
    { label: 'Boutique', id: 'shop' },
    { label: 'Sur Mesure', id: 'custom-mirror', icon: Sparkles },
    { label: 'À Propos', id: 'about' }
  ];

  return (
    <nav className="sticky top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20">
        <div className="flex justify-between items-center h-full">

          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="relative">
              <span className="font-serif text-2xl font-bold tracking-tighter text-gray-900">
                Rahim<span className="text-gray-400 group-hover:text-black transition-colors">Glass</span>
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full"></div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.id)}
                className={`nav-link flex items-center gap-2 group ${item.id === 'custom-mirror' ? 'text-purple-600' : 'text-gray-900'
                  }`}
              >
                {item.icon && <item.icon size={14} className="group-hover:rotate-12 transition-transform" />}
                <span className="font-bold">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Icons & Actions */}
          <div className="flex items-center space-x-5">
            {/* Search Toggle */}
            <div className="relative flex items-center">
              {showSearch ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="absolute right-0 flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 shadow-2xl w-64 animate-slide-in-right"
                >
                  <Search size={16} className="text-black" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => { if (!searchQuery) setShowSearch(false); }}
                    placeholder="Rechercher..."
                    className="ml-2 w-full bg-transparent border-none outline-none text-sm placeholder-gray-400 font-medium text-black"
                  />
                  <button type="button" onClick={() => setShowSearch(false)} className="text-black hover:text-gray-600 transition-colors">
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <button
                  className="p-2 text-black hover:scale-110 transition-all"
                  onClick={() => setShowSearch(true)}
                >
                  <Search size={22} strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Favorites */}
            <button
              className="p-2 text-black hover:text-red-500 transition-all hover:scale-110 relative"
              onClick={() => onNavigate('favorites')}
            >
              <Heart
                size={22}
                strokeWidth={2}
                className={favoritesCount > 0 ? "fill-red-500 text-red-500 border-none" : ""}
              />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Cart */}
            <button
              className="p-2 text-black transition-all hover:scale-110 relative"
              onClick={() => onNavigate('cart')}
            >
              <ShoppingBag size={22} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[9px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth/Profile */}
            <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center gap-2 group"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="w-10 h-10 rounded-full border-2 border-black p-0.5 overflow-hidden">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-white">
                      <User size={18} strokeWidth={2} />
                    </div>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-black transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-fade-in-up z-[110]">
                    <div className="px-4 py-5 mb-2 bg-gray-50 rounded-xl">
                      <p className="text-sm font-black text-gray-900 tracking-tight">{profile?.name || 'Client'}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">{user.email}</p>
                      {profile?.role === 'admin' && (
                        <div className="mt-3 flex items-center gap-1.5 px-2 py-1 bg-black text-white rounded-lg w-fit">
                          <Shield size={10} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={handleDashboardClick}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black">
                          {profile?.role === 'admin' ? <Shield size={16} /> : <LayoutDashboard size={16} />}
                        </div>
                        {profile?.role === 'admin' ? 'Tableau de Bord Admin' : 'Mes Commandes'}
                      </button>
                      <button
                        onClick={() => { onNavigate('favorites'); setIsProfileOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black">
                          <Heart size={16} />
                        </div>
                        Mes Favoris
                      </button>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => { signOut(); onNavigate('home'); setIsProfileOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                          <LogOut size={16} />
                        </div>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onAuthRequest}
                className="bg-black text-white text-xs font-black uppercase tracking-widest px-8 py-3 rounded-full hover:bg-gray-800 transition-all shadow-lg"
              >
                Connexion
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-900 border border-gray-100 rounded-xl"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[80px] bg-white z-[90] animate-fade-in">
          <div className="p-8 space-y-6">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between py-4 border-b border-gray-50">
                  <span className="text-2xl font-serif font-bold text-gray-900 group-hover:pl-4 transition-all duration-300">{item.label}</span>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                    <ChevronDown className="-rotate-90" size={18} />
                  </div>
                </div>
              </button>
            ))}

            {user && (
              <div className="pt-8 space-y-4">
                <button
                  onClick={() => {
                    handleDashboardClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-black text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm shadow-xl"
                >
                  <LayoutDashboard size={20} />
                  Tableau de Bord
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};