import React, { useState } from 'react';
import { Product, ProductInput, ProductImage, Category } from '../../types';
import { getProductImageUrl } from '../../api';
import { Search, Plus, Edit2, Trash2, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';

interface ProductManagerProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (product: ProductInput) => Promise<Product | null>;
  onUpdateProduct: (id: string, product: ProductInput) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onImportFromAPI?: () => Promise<void>;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ products, categories, onAddProduct, onUpdateProduct, onDeleteProduct, onImportFromAPI }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const initialFormState: ProductInput = {
    name: '', description: '', price_per_m2: 0, stock: 0,
    thickness: 0, category_id: categories[0]?.id || '1', is_customizable: true, image_url: ''
  };
  const [formData, setFormData] = useState<ProductInput>(initialFormState);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        description: product.description || '',
        price_per_m2: product.price_per_m2,
        stock: product.stock,
        thickness: product.thickness,
        category_id: product.category_id,
        is_customizable: product.is_customizable,
        image_url: product.image_url || ''
      });
    } else {
      setEditingId(null);
      setFormData({ ...initialFormState, category_id: categories[0]?.id || '1' });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      setUploading(true);
      const file = e.target.files[0];
      const fileName = file.name;

      // TODO: Implement backend upload route.
      // For now, we'll just use the file name as the URL if we were actually uploading.
      // Since supabase is removed, we'll show an alert or use a placeholder.
      alert('L\'upload d\'image sera bientôt disponible avec le nouveau backend.');

      setFormData(prev => ({ ...prev, image_url: fileName }));
    } catch (err: any) {
      console.error('Upload Error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await onUpdateProduct(editingId, formData);
      } else {
        await onAddProduct(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product.');
    }
  };

  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Inconnu';
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif text-gray-900">Inventaire</h1>
        <div className="flex gap-3">
          {onImportFromAPI && (
            <button onClick={onImportFromAPI} className="bg-white text-black border border-gray-200 px-6 py-3 rounded-sm flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors">
              <Loader2 size={18} className="animate-spin-slow" /> Importer API
            </button>
          )}
          <button onClick={() => handleOpenModal()} className="bg-black text-white px-6 py-3 rounded-sm flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
            <Plus size={18} /> Ajouter Produit
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher produits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:border-black focus:outline-none text-sm bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Détails Produit</th>
              <th className="px-6 py-4">Catégorie</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Prix</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden relative">
                      <img
                        src={getProductImageUrl(product.image_url)}
                        className="w-full h-full object-cover"
                        alt={product.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Img'; }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.thickness}mm | {product.is_customizable ? 'Sur Mesure' : 'Standard'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                    {getCategoryName(product.category_id)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`${product.stock < 10 ? 'text-red-600 font-bold' : 'text-gray-900'}`}>{product.stock} unités</span>
                </td>
                <td className="px-6 py-4 font-mono">{product.price_per_m2} MAD</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(product)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-serif font-bold">{editingId ? 'Modifier Produit' : 'Ajouter Nouveau Produit'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-black" /></button>
            </div>

            <div className="p-8 overflow-y-auto">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Nom du Produit</label>
                    <input required className="w-full p-3 border border-gray-200 rounded focus:border-black focus:outline-none bg-gray-50 focus:bg-white transition-colors" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Prix (MAD/m²)</label>
                    <input type="number" step="0.01" required className="w-full p-3 border border-gray-200 rounded focus:border-black focus:outline-none bg-gray-50 focus:bg-white" value={formData.price_per_m2} onChange={e => setFormData({ ...formData, price_per_m2: parseFloat(e.target.value) })} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Quantité Stock</label>
                    <input type="number" required className="w-full p-3 border border-gray-200 rounded focus:border-black focus:outline-none bg-gray-50 focus:bg-white" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })} />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Épaisseur (mm)</label>
                    <input type="number" required className="w-full p-3 border border-gray-200 rounded focus:border-black focus:outline-none bg-gray-50 focus:bg-white" value={formData.thickness} onChange={e => setFormData({ ...formData, thickness: parseInt(e.target.value) })} />
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Catégorie</label>
                    <select
                      className="w-full p-3 border border-gray-200 rounded focus:border-black focus:outline-none bg-gray-50 focus:bg-white"
                      value={formData.category_id}
                      onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Description</label>
                    <textarea className="w-full p-3 border border-gray-200 rounded focus:border-black focus:outline-none bg-gray-50 focus:bg-white h-24" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>

                  {/* Image Upload Section */}
                  <div className="col-span-2 border-t border-gray-100 pt-6">
                    <div className="flex items-start gap-6">
                      <div className="w-32 h-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        {uploading ? (
                          <Loader2 className="animate-spin text-gray-400" />
                        ) : formData.image_url ? (
                          <img src={getProductImageUrl(formData.image_url)} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <ImageIcon className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-2">Image Produit</label>
                        <div className="flex items-center gap-3">
                          <label className={`bg-black text-white px-4 py-2 rounded text-xs font-bold uppercase cursor-pointer hover:bg-gray-800 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {uploading ? 'Chargement...' : 'Choisir Fichier'}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              onChange={handleImageUpload}
                              disabled={uploading}
                            />
                          </label>
                          {formData.image_url && !uploading && (
                            <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                              <CheckCircle size={12} /> Téléchargé
                            </span>
                          )}
                          <p className="text-xs text-gray-500">JPG, PNG, WebP max 5Mo</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="custom" checked={formData.is_customizable} onChange={e => setFormData({ ...formData, is_customizable: e.target.checked })} className="accent-black w-4 h-4" />
                    <label htmlFor="custom" className="text-sm font-medium">Dimensions Personnalisables</label>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-black">Annuler</button>
              <button
                form="productForm"
                type="submit"
                disabled={uploading}
                className="px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider rounded shadow hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? 'Sauvegarder' : 'Créer Produit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};