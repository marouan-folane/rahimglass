import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { getProductImageUrl } from '../../api';
import { Search, Eye, X, Phone, Mail, MapPin, Printer } from 'lucide-react';

interface OrderManagerProps {
   orders: Order[];
   onUpdateStatus: (id: string, status: OrderStatus) => void;
}

export const OrderManager: React.FC<OrderManagerProps> = ({ orders, onUpdateStatus }) => {
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

   const filteredOrders = orders.filter(o =>
      o.id.includes(searchTerm) ||
      o.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="animate-fade-in-up">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-serif text-gray-900">Commandes</h1>
            <div className="flex gap-2">
               <button className="px-4 py-2 border border-gray-200 bg-white rounded text-sm font-medium hover:bg-gray-50">Exporter CSV</button>
            </div>
         </div>

         <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                     type="text"
                     placeholder="Rechercher par ID ou Client..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:border-black focus:outline-none text-sm bg-white"
                  />
               </div>
            </div>

            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                  <tr>
                     <th className="px-6 py-4">Détails Commande</th>
                     <th className="px-6 py-4">Date</th>
                     <th className="px-6 py-4">Client</th>
                     <th className="px-6 py-4">Statut</th>
                     <th className="px-6 py-4">Total</th>
                     <th className="px-6 py-4 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => (
                     <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium">#{order.id.slice(0, 8)}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                           <p className="font-medium text-gray-900">{order.profiles?.name || 'Invité'}</p>
                           <p className="text-xs text-gray-500">{order.profiles?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                           <select
                              value={order.status}
                              onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                              className={`text-xs font-bold uppercase px-2 py-1 rounded border-none focus:ring-0 cursor-pointer ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                       'bg-gray-100 text-gray-700'
                                 }`}
                           >
                              <option value="pending">En Attente</option>
                              <option value="confirmed">Confirmé</option>
                              <option value="processing">En Cours</option>
                              <option value="shipped">Expédié</option>
                              <option value="delivered">Livré</option>
                           </select>
                        </td>
                        <td className="px-6 py-4 font-medium">{order.total_price.toFixed(2)} MAD</td>
                        <td className="px-6 py-4 text-right">
                           <button onClick={() => setSelectedOrder(order)} className="text-black hover:text-blue-600 font-medium text-xs uppercase tracking-wide">
                              Voir
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Detail Modal */}
         {selectedOrder && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                     <div>
                        <h2 className="text-xl font-serif font-bold">Commande #{selectedOrder.id.slice(0, 8)}</h2>
                        <p className="text-sm text-gray-500">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                     </div>
                     <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-black"><Printer size={20} /></button>
                        <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-black"><X size={20} /></button>
                     </div>
                  </div>

                  <div className="p-8 overflow-y-auto">
                     <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-50 p-4 rounded border border-gray-100">
                           <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Client</h3>
                           <p className="font-bold text-gray-900">{selectedOrder.profiles?.name}</p>
                           <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p className="flex items-center gap-2"><Phone size={14} /> {selectedOrder.profiles?.phone}</p>
                              <p className="flex items-center gap-2"><Mail size={14} /> {selectedOrder.profiles?.email}</p>
                           </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded border border-gray-100">
                           <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Livraison</h3>
                           <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin size={16} className="mt-0.5" />
                              <p>{selectedOrder.shipping_address}</p>
                           </div>
                           <p className="mt-2 text-sm"><span className="font-bold">Paiement :</span> {selectedOrder.payment_method}</p>
                        </div>
                     </div>

                     <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-100 pb-2">Articles Commandés</h3>
                     <div className="space-y-4">
                        {selectedOrder.order_items?.map((item, i) => (
                           <div key={i} className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                    <img src={getProductImageUrl(item.product?.image_url || null)} className="w-full h-full object-cover" />
                                 </div>
                                 <div>
                                    <p className="font-medium text-sm text-gray-900">{item.product?.name}</p>
                                    <p className="text-xs text-gray-500">
                                       {item.quantity} x {item.product?.price_per_m2}/m²
                                       {item.custom_width ? ` (${item.custom_width}x${item.custom_height}cm)` : ''}
                                    </p>
                                 </div>
                              </div>
                              <p className="font-mono font-medium text-gray-900">{item.price.toFixed(2)} MAD</p>
                           </div>
                        ))}
                     </div>

                     <div className="mt-8 border-t border-gray-100 pt-6 flex justify-end">
                        <div className="text-right">
                           <p className="text-sm text-gray-500 mb-1">Montant Total</p>
                           <p className="text-3xl font-serif font-bold text-gray-900">{selectedOrder.total_price.toFixed(2)} MAD</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};