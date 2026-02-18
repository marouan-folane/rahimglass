import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'clients', label: 'Clients', icon: Users },
  ];

  return (
    <div className="w-64 bg-black text-white h-screen flex-shrink-0 flex flex-col fixed left-0 top-0 bottom-0 z-50">
      {/* Brand */}
      <div className="h-20 flex items-center px-8 border-b border-gray-800">
        <span className="font-serif text-2xl font-bold tracking-tighter text-white">
          Rahim<span className="text-gray-500">Glass</span>
        </span>
        <span className="ml-2 text-[10px] bg-white text-black px-1 rounded font-bold uppercase">Admin</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-8 px-4 space-y-2">
        <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Menu Principal</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-all duration-200 ${
              currentView === item.id 
                ? 'bg-white text-black shadow-lg translate-x-1' 
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}

        <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mt-8 mb-4">Système</p>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 rounded-sm">
           <Settings size={18} /> Paramètres
        </button>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Shield size={14} />
            </div>
            <div>
                <p className="text-xs font-bold text-white">Administrateur</p>
                <p className="text-[10px] text-gray-400">Gérer la Boutique</p>
            </div>
        </div>
        <button 
            onClick={() => { signOut(); window.location.reload(); }}
            className="w-full flex items-center justify-center gap-2 bg-red-600/10 text-red-500 py-2 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors rounded-sm"
        >
          <LogOut size={14} /> Déconnexion
        </button>
      </div>
    </div>
  );
};