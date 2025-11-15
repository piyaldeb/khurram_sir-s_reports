import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Users, Folder, FileImage } from 'lucide-react';
import { AdminSections } from '../components/AdminSections';
import { AdminUsers } from '../components/AdminUsers';
import { AdminUploads } from '../components/AdminUploads';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('sections');

  const tabs = [
    { id: 'sections', label: 'Sections', icon: Folder },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'uploads', label: 'Uploads', icon: FileImage }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600 mt-2">Manage sections, users, and uploads</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'sections' && <AdminSections />}
            {activeTab === 'users' && <AdminUsers />}
            {activeTab === 'uploads' && <AdminUploads />}
          </div>
        </div>
      </div>
    </Layout>
  );
};
