import React from 'react';
import { Order, Product, Profile } from '../../types';
import { DollarSign, Package, Users, TrendingUp, ShoppingBag, ArrowUpRight } from 'lucide-react';

interface OverviewProps {
  orders: Order[];
  products: Product[];
  clients: Profile[];
}

export const Overview: React.FC<OverviewProps> = ({ orders, products, clients }) => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  // Mock data for "Recent Activity" visualization
  const recentOrders = orders.slice(0, 5);

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
           <h3 className="text-2xl font-serif font-medium mt-1 text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
           <Icon size={20} />
        </div>
      </div>
      <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
         <TrendingUp size={12} className="text-green-500" />
         {sub}
      </p>
    </div>
  );

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex justify-between items-end">
         <div>
            <h1 className="text-3xl font-serif text-gray-900">Tableau de Bord</h1>
            <p className="text-gray-500 mt-1">Bon retour, voici ce qui se passe aujourd'hui.</p>
         </div>
         <div className="text-right">
             <p className="text-sm font-medium">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Revenu Total" 
          value={`${totalRevenue.toFixed(2)} MAD`} 
          sub="+12.5% depuis le mois dernier" 
          icon={DollarSign} 
          color="bg-green-50 text-green-600" 
        />
        <StatCard 
          title="Commandes en Attente" 
          value={pendingOrders} 
          sub="Nécessite attention" 
          icon={ShoppingBag} 
          color="bg-yellow-50 text-yellow-600" 
        />
        <StatCard 
          title="Total Clients" 
          value={clients.length} 
          sub="+3 nouveaux cette semaine" 
          icon={Users} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          title="Produits Stock Faible" 
          value={lowStockProducts} 
          sub="Réapprovisionnement nécessaire" 
          icon={Package} 
          color="bg-red-50 text-red-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Recent Orders Table */}
         <div className="lg:col-span-2 bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-serif text-lg">Commandes Récentes</h3>
               <button className="text-xs font-bold uppercase hover:text-blue-600">Voir Tout</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-md">
                     <tr>
                        <th className="px-4 py-3 rounded-l-md">ID Commande</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Montant</th>
                        <th className="px-4 py-3 rounded-r-md">Statut</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {recentOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                           <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0,8)}</td>
                           <td className="px-4 py-3 font-medium">{order.profiles?.name || 'Invité'}</td>
                           <td className="px-4 py-3">{order.total_price.toFixed(2)} MAD</td>
                           <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                                 order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                 order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                 'bg-gray-100 text-gray-700'
                              }`}>
                                 {order.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Quick Actions / Stock Alert */}
         <div className="bg-black text-white rounded-lg p-6 flex flex-col justify-between">
            <div>
               <h3 className="font-serif text-xl mb-2">Actions Admin</h3>
               <p className="text-gray-400 text-sm mb-6">Raccourcis rapides pour gérer votre boutique efficacement.</p>
               
               <ul className="space-y-4">
                  <li className="flex items-center justify-between cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors">
                     <span className="text-sm font-medium">Ajouter Nouveau Produit</span>
                     <ArrowUpRight size={16} />
                  </li>
                  <li className="flex items-center justify-between cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors">
                     <span className="text-sm font-medium">Traiter les Remboursements</span>
                     <ArrowUpRight size={16} />
                  </li>
                  <li className="flex items-center justify-between cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors">
                     <span className="text-sm font-medium">Exporter les Rapports</span>
                     <ArrowUpRight size={16} />
                  </li>
               </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-800">
               <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">État du Système</p>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium">Base de Données Opérationnelle</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};