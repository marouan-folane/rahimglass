import React, { useState, useEffect } from 'react';
import { api, getProductImageUrl } from './api';
import { Product, Order, OrderStatus, ShippingDetails, ProductInput, Profile, UserRole, Category } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { About } from './pages/About';
import { ProductDetail } from './pages/ProductDetail';
import { CustomMirror } from './pages/CustomMirror';
import { AdminDashboard } from './components/AdminDashboard';
import { Checkout } from './components/Checkout';
import { AuthModal } from './components/AuthModal';
import { ShoppingBag, Info } from 'lucide-react';

// Main Content Component that consumes Contexts
const MainContent: React.FC = () => {
  // Navigation State
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [shopSearchTerm, setShopSearchTerm] = useState('');

  // Local Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Auth & Cart from Context
  const { user, profile, signIn, signUp } = useAuth();
  const { cart, addToCart, cartTotal } = useCart();

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Global Scroll Observer Logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.1 });

    const timeout = setTimeout(() => {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    }, 100);

    return () => { clearTimeout(timeout); observer.disconnect(); };
  }, [currentPage, products]);

  // --- Data Fetching ---
  useEffect(() => {
    getProducts();
    getCategories();
  }, []);

  useEffect(() => {
    if (user) {
      if (profile?.role === 'admin') {
        fetchAllOrders();
        fetchClients();
      } else {
        fetchUserOrders();
      }
    } else {
      setOrders([]);
      setClients([]);
    }
  }, [user, profile]);

  // Security & Redirects
  useEffect(() => {
    if (currentPage === 'admin' && profile && profile.role !== 'admin') setCurrentPage('home');
    if (currentPage === 'dashboard' && profile && profile.role === 'admin') setCurrentPage('admin');
  }, [currentPage, profile]);

  // --- API Calls ---

  async function getProducts() {
    setLoadingProducts(true);
    setFetchError(null);
    try {
      const data = await api.products.list();
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      console.error('getProducts error:', err);
      setFetchError('Impossible de charger les produits. Vérifiez que le serveur est démarré.');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function getCategories() {
    try {
      const data = await api.categories.list();
      if (data) setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }

  const fetchUserOrders = async () => {
    if (!user) return;
    try {
      const data = await api.orders.list();
      if (data) setOrders(data);
    } catch (err) {
      console.error('fetchUserOrders error:', err);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const data = await api.orders.list();
      if (data) setOrders(data);
    } catch (err) {
      console.error('fetchAllOrders error:', err);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await api.clients.list();
      if (data) setClients(data);
    } catch (err) {
      console.error('fetchClients error:', err);
    }
  };

  // --- Auth Handlers ---

  const handleLogin = async (email: string, pass: string) => {
    setAuthError(null);
    const { error } = await signIn(email, pass);
    if (error) {
      setAuthError(error.message || 'Échec de la connexion');
    } else {
      setShowAuthModal(false);
    }
  };

  const handleRegister = async (email: string, pass: string, name: string, phone: string) => {
    setAuthError(null);
    const { error } = await signUp(email, pass, name, phone);
    if (error) {
      setAuthError(error.message || 'Échec de l\'inscription');
    } else {
      setShowAuthModal(false);
    }
  };

  // --- User Actions ---

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handlePlaceOrder = async (shipping: ShippingDetails, paymentMethod: string) => {
    if (!user) { setShowAuthModal(true); return; }

    try {
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.calculated_price,
        custom_width: item.custom_width,
        custom_height: item.custom_height,
      }));

      await api.orders.create({
        total_price: cartTotal,
        status: 'pending',
        shipping_address: `${shipping.address}, ${shipping.city} ${shipping.zipCode}. Phone: ${shipping.phone}`,
        payment_method: paymentMethod,
        items,
      });

      window.location.reload();
    } catch (err: any) {
      alert('Erreur lors de la création de la commande: ' + err.message);
    }
  };

  const handleNavigate = (page: string, param?: any) => {
    setCurrentPage(page);
    if (page === 'product' && param) setSelectedProduct(param);
    if (page === 'shop') setShopSearchTerm(typeof param === 'string' ? param : '');
  };

  const renderCartPage = () => (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 min-h-screen animate-fade-in-up">
      <h1 className="text-3xl font-serif mb-8">Panier d'Achat</h1>
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border border-gray-100">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Votre panier est vide.</p>
          <button onClick={() => setCurrentPage('shop')} className="mt-4 text-black underline">Commencer vos achats</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white border border-gray-100 shadow-sm">
                {item.custom_image ? (
                  <div className="w-24 h-24 bg-gray-100 flex-shrink-0 overflow-hidden relative">
                    <img src={item.custom_image} className="w-full h-full object-contain" alt="Custom Mirror" />
                    <span className="absolute bottom-0 left-0 right-0 bg-purple-600 text-white text-[8px] text-center uppercase font-bold py-0.5">Sur Mesure IA</span>
                  </div>
                ) : (
                  <img src={getProductImageUrl(item.product?.image_url || null)} className="w-24 h-24 object-cover grayscale-[10%]" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.product?.name}</h3>
                  <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                  <p className="text-sm text-gray-500">{item.custom_width ? `Sur mesure: ${item.custom_width}x${item.custom_height}cm` : 'Standard'}</p>
                  {item.custom_specs && (
                    <p className="text-xs text-purple-600 mt-1">{item.custom_specs.frameType} - {item.custom_specs.frameColor}</p>
                  )}
                </div>
                <div className="font-mono font-medium">{item.calculated_price.toFixed(2)} MAD</div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 p-6 border border-gray-200 h-fit">
            <h3 className="font-serif text-lg mb-4">Résumé</h3>
            <div className="flex justify-between mb-2"><span>Total</span><span className="font-mono">{cartTotal.toFixed(2)} MAD</span></div>
            <button onClick={() => setCurrentPage('checkout')} className="w-full bg-black text-white py-3 uppercase text-sm mt-4">Commander</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout
      onNavigate={handleNavigate}
      onAuthRequest={() => setShowAuthModal(true)}
      favoritesCount={favorites.length}
      hideFooter={currentPage === 'admin'}
    >
      {fetchError && (
        <div className="bg-red-50 border-b border-red-100 p-4 text-center">
          <p className="text-red-600 text-sm font-medium flex items-center justify-center gap-2">
            <Info size={16} /> {fetchError}.
            <button onClick={() => getProducts()} className="underline ml-2">Réessayer</button>
          </p>
        </div>
      )}

      {currentPage === 'home' && (
        <Home onNavigate={handleNavigate} toggleFavorite={toggleFavorite} favorites={favorites} products={products} loading={loadingProducts} />
      )}

      {currentPage === 'about' && <About />}

      {(currentPage === 'shop' || currentPage === 'favorites') && (
        <Shop
          onNavigate={handleNavigate}
          toggleFavorite={toggleFavorite}
          favorites={favorites}
          initialSearch={shopSearchTerm}
          showFavoritesOnly={currentPage === 'favorites'}
          products={products}
          loading={loadingProducts}
        />
      )}

      {currentPage === 'product' && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          userProfile={profile}
          onAddToCart={(q, w, h, p) => addToCart(selectedProduct, q, w, h, p)}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'custom-mirror' && <CustomMirror />}

      {currentPage === 'cart' && renderCartPage()}

      {currentPage === 'checkout' && (
        <Checkout cart={cart} total={cartTotal} onBack={() => setCurrentPage('cart')} onPlaceOrder={handlePlaceOrder} />
      )}

      {currentPage === 'dashboard' && user && (
        <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
          <h1 className="text-3xl font-serif mb-8">Mes Commandes</h1>
          {orders.length === 0 ? (
            <p className="text-gray-500">Aucune commande trouvée.</p>
          ) : (
            orders.map(o => (
              <div key={o.id} className="border border-gray-200 p-6 mb-4 bg-white">
                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                  <div>
                    <span className="font-bold text-lg">Commande #{o.id.slice(0, 8)}</span>
                    <p className="text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider ${o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>{o.status}</span>
                    <p className="font-mono mt-2 font-medium">{o.total_price.toFixed(2)} MAD</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {o.order_items?.map(item => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span>{item.quantity}x {item.product?.name} {item.custom_width ? `(${item.custom_width}x${item.custom_height})` : ''}</span>
                      <span>{item.price} MAD</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {currentPage === 'admin' && profile?.role === 'admin' && (
        <AdminDashboard
          products={products}
          categories={categories}
          orders={orders}
          clients={clients}
          onUpdateOrderStatus={async (id, st) => {
            await api.orders.updateStatus(id, st);
            setOrders(orders.map(o => o.id === id ? { ...o, status: st } : o));
          }}
          onAddProduct={async (p) => {
            const product = await api.products.create(p);
            if (product) setProducts([product, ...products]);
            return product;
          }}
          onUpdateProduct={async (id, p) => {
            const updated = await api.products.update(id, p);
            if (updated) setProducts(products.map(pr => pr.id === id ? updated : pr));
          }}
          onDeleteProduct={async (id) => {
            if (confirm('Supprimer ce produit ?')) {
              await api.products.delete(id);
              setProducts(products.filter(p => p.id !== id));
            }
          }}
          onUpdateUserRole={async (id, r) => {
            await api.clients.updateRole(id, r);
            setClients(clients.map(c => c.id === id ? { ...c, role: r } : c));
          }}
          onImportProductsFromAPI={async () => {
            try {
              const res = await fetch('https://fakestoreapi.com/products');
              const apiProducts = await res.json();
              const toInsert = apiProducts.slice(0, 10).map((p: any) => ({
                name: `[Demo] ${p.title}`,
                description: p.description,
                price_per_m2: p.price * 10,
                stock: Math.floor(Math.random() * 50) + 10,
                thickness: [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)],
                is_customizable: true,
                image_url: p.image,
              }));
              for (const p of toInsert) {
                const created = await api.products.create(p);
                if (created) setProducts(prev => [created, ...prev]);
              }
              alert(`${toInsert.length} produits importés avec succès !`);
            } catch (err: any) {
              alert('Erreur lors de l\'importation: ' + err.message);
            }
          }}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        error={authError}
      />
    </Layout>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <CartProvider>
      <MainContent />
    </CartProvider>
  </AuthProvider>
);

export default App;