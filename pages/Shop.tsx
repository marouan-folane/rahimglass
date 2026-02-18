import React, { useState, useEffect, useMemo } from 'react';
import { getProductImageUrl } from '../api';
import { Product } from '../types';
import { Heart, Search, Filter, X, SlidersHorizontal, ArrowLeft, AlertCircle } from 'lucide-react';
import { LazyImage } from '../components/LazyImage';

// Mock Data for fallback when DB is empty or connection fails
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'mock-1',
    name: 'Miroir Rond LED "Lumina"',
    description: 'Miroir rond avec éclairage LED intégré, idéal pour salle de bain moderne.',
    price_per_m2: 1200,
    stock: 15,
    thickness: 6,
    category_id: '2',
    is_customizable: true,
    image_url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-2',
    name: 'Paroi de Douche Italienne',
    description: 'Verre trempé 8mm, traitement anti-calcaire, fixations noires mates.',
    price_per_m2: 950,
    stock: 42,
    thickness: 8,
    category_id: '1',
    is_customizable: true,
    image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-3',
    name: 'Miroir Organique "Dune"',
    description: 'Forme asymétrique tendance, bords polis, sans cadre.',
    price_per_m2: 1400,
    stock: 8,
    thickness: 6,
    category_id: '2',
    is_customizable: true,
    image_url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-4',
    name: 'Verre Feuilleté Opal',
    description: 'Verre de sécurité translucide pour cloisons et portes.',
    price_per_m2: 1100,
    stock: 100,
    thickness: 10,
    category_id: '3',
    is_customizable: true,
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-5',
    name: 'Miroir Arche "Palazzo"',
    description: 'Grand miroir en arche avec cadre fin en laiton doré.',
    price_per_m2: 1800,
    stock: 5,
    thickness: 6,
    category_id: '2',
    is_customizable: true,
    image_url: 'https://images.unsplash.com/photo-1622372738946-a287d140e6c8?auto=format&fit=crop&q=80&w=800',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-6',
    name: 'Table en Verre Trempé',
    description: 'Plateau en verre trempé clair pour table à manger ou bureau.',
    price_per_m2: 850,
    stock: 25,
    thickness: 12,
    category_id: '1',
    is_customizable: true,
    image_url: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=800',
    created_at: new Date().toISOString()
  }
];

interface ShopProps {
  onNavigate: (page: string, product?: Product) => void;
  toggleFavorite: (id: string) => void;
  favorites: string[];
  initialSearch?: string;
  showFavoritesOnly?: boolean;
  products: Product[];
  loading: boolean;
}

export const Shop: React.FC<ShopProps> = ({
  onNavigate,
  toggleFavorite,
  favorites,
  initialSearch,
  showFavoritesOnly = false,
  products = [],
  loading
}) => {
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedThickness, setSelectedThickness] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Handle price range initialization when products arrive
  useEffect(() => {
    if (products.length > 0) {
      const max = Math.max(...products.map(p => p.price_per_m2));
      setPriceRange([0, Math.ceil(max + 100)]);
      // Check if they are API products
      if (products[0].id.toString().startsWith('api-')) {
        setIsUsingMockData(true);
      } else {
        setIsUsingMockData(false);
      }
    }
  }, [products]);

  // Update search query if initialSearch changes
  useEffect(() => {
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialSearch]);

  // Reset filters when switching to favorites mode
  useEffect(() => {
    if (showFavoritesOnly) {
      setSelectedCategory('all');
      setSelectedThickness('all');
      setPriceRange([0, 5000]);
    }
  }, [showFavoritesOnly]);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Favorites Check
      if (showFavoritesOnly && !favorites.includes(product.id)) {
        return false;
      }

      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
      const matchesThickness = selectedThickness === 'all' || product.thickness === selectedThickness;
      const matchesPrice = product.price_per_m2 >= priceRange[0] && product.price_per_m2 <= priceRange[1];

      return matchesSearch && matchesCategory && matchesThickness && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price_per_m2 - b.price_per_m2;
      if (sortBy === 'price-desc') return b.price_per_m2 - a.price_per_m2;
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
  }, [products, searchQuery, selectedCategory, selectedThickness, priceRange, sortBy, showFavoritesOnly, favorites]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category_id)))];
  const thicknesses = [4, 6, 8, 10, 12];

  // Helper for category names
  const getCategoryName = (catId: string) => {
    if (catId === '1') return 'Verre Trempé';
    if (catId === '2') return 'Miroirs';
    if (catId === '3') return 'Feuilleté';
    return catId === 'all' ? 'Tous les produits' : `Catégorie ${catId}`;
  };

  // Sidebar Component
  const FilterSidebar = () => (
    <div className="space-y-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-b border-gray-300 py-2 pl-0 pr-8 text-sm focus:border-black focus:outline-none bg-transparent placeholder-gray-400"
        />
        <Search className="absolute right-0 top-2 text-gray-400" size={16} />
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-serif font-bold text-sm uppercase tracking-widest mb-6">Catégories</h3>
        <ul className="space-y-3">
          <li
            className={`cursor-pointer text-sm transition-colors ${selectedCategory === 'all' ? 'text-black font-medium pl-2 border-l-2 border-black' : 'text-gray-500 hover:text-black'}`}
            onClick={() => setSelectedCategory('all')}
          >
            Tous les produits
          </li>
          {categories.filter(c => c !== 'all').map((cat) => (
            <li
              key={cat}
              className={`cursor-pointer text-sm transition-colors capitalize ${selectedCategory === cat ? 'text-black font-medium pl-2 border-l-2 border-black' : 'text-gray-500 hover:text-black'}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {getCategoryName(cat)}
              <span className="text-gray-300 text-xs ml-1">({products.filter(p => p.category_id === cat).length})</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="font-serif font-bold text-sm uppercase tracking-widest mb-6">Fourchette de Prix</h3>
        <input
          type="range"
          min="0"
          max="5000"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
        />
        <div className="flex justify-between mt-3 text-xs font-medium text-gray-600 font-mono">
          <span>0 MAD</span>
          <span>{priceRange[1]} MAD</span>
        </div>
      </div>

      {/* Thickness / Size Options */}
      <div>
        <h3 className="font-serif font-bold text-sm uppercase tracking-widest mb-6">Épaisseur du Verre</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedThickness('all')}
            className={`px-3 py-1 text-xs border ${selectedThickness === 'all' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
          >
            Tous
          </button>
          {thicknesses.map(t => (
            <button
              key={t}
              onClick={() => setSelectedThickness(t)}
              className={`px-3 py-1 text-xs border ${selectedThickness === t ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
            >
              {t}mm
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 pt-24 pb-16 px-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto text-center animate-fade-in-up">
          {showFavoritesOnly ? (
            <>
              <button onClick={() => onNavigate('shop')} className="text-xs uppercase tracking-widest text-gray-400 hover:text-black mb-3 flex items-center gap-1 justify-center mx-auto">
                <ArrowLeft size={12} /> Retour à la Boutique
              </button>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                Mes Favoris
              </h1>
              <p className="text-gray-500 font-light text-sm">
                Votre sélection personnelle de produits.
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-xs uppercase tracking-[0.2em] mb-3">Accueil / Collection</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                Nouveaux Arrivages <span className="font-light italic text-gray-600">2025</span>
              </h1>
              <p className="max-w-lg mx-auto text-gray-500 font-light text-sm leading-relaxed">
                Découvrez notre sélection premium de verres et miroirs pour sublimer votre intérieur.
              </p>
              {isUsingMockData && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full border border-yellow-200">
                  <AlertCircle size={12} />
                  <span>Mode Démonstration (Données simulées)</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="flex items-center gap-2 text-sm font-medium border border-gray-200 px-4 py-2"
            >
              <Filter size={16} /> Filtres
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {filteredProducts.length} Résultats
            </div>
          </div>

          {/* Sidebar (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Sidebar (Mobile Drawer) */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-white p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-serif text-xl">Filtres</h2>
                  <button onClick={() => setShowMobileFilter(false)}><X size={24} /></button>
                </div>
                <FilterSidebar />
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="hidden md:block text-sm text-gray-500">
                Affichage de 1–{filteredProducts.length} sur {showFavoritesOnly ? favorites.length : products.length} résultats
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-2 group relative cursor-pointer">
                  <span className="text-sm font-medium text-gray-600">Trier par:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm font-bold bg-transparent border-none focus:ring-0 cursor-pointer pr-6"
                  >
                    <option value="newest">Plus Récent</option>
                    <option value="price-asc">Prix: Croissant</option>
                    <option value="price-desc">Prix: Décroissant</option>
                  </select>
                </div>
                <div className="flex gap-2 text-gray-300">
                  <SlidersHorizontal size={18} className="text-black" />
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-100 aspect-[3/4] mb-4"></div>
                    <div className="h-4 bg-gray-100 w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-lg">
                {showFavoritesOnly ? (
                  <>
                    <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore de favoris.</p>
                    <button onClick={() => onNavigate('shop')} className="text-black underline">Explorer la boutique</button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500">Aucun produit ne correspond à vos filtres.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedThickness('all');
                        setPriceRange([0, 5000]);
                      }}
                      className="mt-4 text-black underline"
                    >
                      Effacer les filtres
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${0.1 + (index * 0.05)}s` }}
                    onClick={() => onNavigate('product', product)}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-5">
                      {/* Product Image */}
                      <LazyImage
                        src={getProductImageUrl(product.image_url)}
                        alt={product.name}
                        priority={index < 4}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* Badges */}
                      {product.stock < 10 && (
                        <span className="absolute top-4 left-4 bg-black text-white text-[10px] uppercase font-bold px-3 py-1 tracking-widest">
                          Stock Faible
                        </span>
                      )}

                      {/* Actions Overlay */}
                      <div className="absolute right-4 top-4 flex flex-col gap-3 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                          className="bg-white p-3 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors"
                        >
                          <Heart size={18} className={favorites.includes(product.id) ? "fill-red-500 text-red-500" : ""} />
                        </button>
                        <button className="bg-white p-3 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors delay-75">
                          <Search size={18} />
                        </button>
                      </div>

                      {/* Add to Cart - Slide Up */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button className="w-full bg-white text-black font-bold uppercase text-xs py-3 tracking-widest hover:bg-black hover:text-white transition-colors shadow-lg">
                          Voir Détails
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="text-center group-hover:-translate-y-1 transition-transform duration-300">
                      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                        {getCategoryName(product.category_id)}
                      </p>
                      <h3 className="text-base font-serif font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-2 group-hover:translate-y-0">
                        <div className="flex text-yellow-400 text-[10px]">
                          {[1, 2, 3, 4, 5].map(s => <span key={s}>★</span>)}
                        </div>
                      </div>
                      <p className="font-mono text-gray-900 font-medium">
                        {product.price_per_m2} MAD <span className="text-gray-400 text-xs font-sans">/ m²</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};