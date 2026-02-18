import React, { useState } from 'react';
import { Profile, UserRole } from '../../types';
import { Search, Mail, Phone, Shield } from 'lucide-react';

interface ClientManagerProps {
  clients: Profile[];
  onUpdateRole: (id: string, role: UserRole) => Promise<void>;
}

export const ClientManager: React.FC<ClientManagerProps> = ({ clients, onUpdateRole }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-serif text-gray-900">Clients</h1>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par Nom ou Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:border-black focus:outline-none text-sm bg-white"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Profil Utilisateur</th>
              <th className="px-6 py-4">Info Contact</th>
              <th className="px-6 py-4">Date Inscription</th>
              <th className="px-6 py-4">Rôle / Permissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClients.map(client => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                      {client.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{client.name || 'Utilisateur Inconnu'}</p>
                      <p className="text-xs text-gray-500 font-mono">ID: {client.id.slice(0,6)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1 text-xs text-gray-600">
                    {client.email && <p className="flex items-center gap-2"><Mail size={12}/> {client.email}</p>}
                    {client.phone && <p className="flex items-center gap-2"><Phone size={12}/> {client.phone}</p>}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{new Date(client.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <select 
                        value={client.role}
                        onChange={(e) => onUpdateRole(client.id, e.target.value as UserRole)}
                        className={`text-xs font-bold uppercase py-1 px-2 rounded border-none focus:ring-0 cursor-pointer ${
                           client.role === 'admin' ? 'bg-black text-white' :
                           client.role === 'wholesale' ? 'bg-blue-100 text-blue-800' :
                           'bg-gray-100 text-gray-800'
                        }`}
                      >
                         <option value="customer">Client</option>
                         <option value="wholesale">Grossiste</option>
                         <option value="admin">Admin</option>
                      </select>
                      {client.role === 'admin' && <Shield size={14} className="text-black" />}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};