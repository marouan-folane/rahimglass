import React, { useState } from 'react';
import { Product, Order, OrderStatus, ProductInput, Profile, UserRole, Category } from '../types';
import { Sidebar } from './admin/Sidebar';
import { Overview } from './admin/Overview';
import { ProductManager } from './admin/ProductManager';
import { OrderManager } from './admin/OrderManager';
import { ClientManager } from './admin/ClientManager';
import { Menu } from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  clients: Profile[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onAddProduct: (product: ProductInput) => Promise<Product | null>;
  onUpdateProduct: (id: string, product: ProductInput) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateUserRole: (userId: string, role: UserRole) => Promise<void>;
  onImportProductsFromAPI: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const [currentView, setCurrentView] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // View Router
  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <Overview orders={props.orders} products={props.products} clients={props.clients} />;
      case 'products':
        return <ProductManager
          products={props.products}
          categories={props.categories}
          onAddProduct={props.onAddProduct}
          onUpdateProduct={props.onUpdateProduct}
          onDeleteProduct={props.onDeleteProduct}
          onImportFromAPI={props.onImportProductsFromAPI}
        />;
      case 'orders':
        return <OrderManager orders={props.orders} onUpdateStatus={props.onUpdateOrderStatus} />;
      case 'clients':
        return <ClientManager clients={props.clients} onUpdateRole={props.onUpdateUserRole} />;
      default:
        return <Overview orders={props.orders} products={props.products} clients={props.clients} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-black">
            <Sidebar currentView={currentView} onChangeView={(v) => { setCurrentView(v); setIsMobileMenuOpen(false); }} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-64">

        {/* Mobile Header */}
        <div className="md:hidden bg-black text-white p-4 flex items-center justify-between shadow-md z-40">
          <span className="font-serif font-bold">RahimGlass Admin</span>
          <button onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </div>
    </div>
  );
};