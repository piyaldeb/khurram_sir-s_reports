import { useState, useEffect } from 'react';
import { sectionsAPI } from '../api/sections';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';

export const AdminSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subsections: ['']
  });

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const response = await sectionsAPI.getSections();
      setSections(response.sections || []);
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const subsections = formData.subsections
        .filter(s => s.trim())
        .map(s => ({ name: s.trim() }));

      if (editingSection) {
        await sectionsAPI.updateSection(editingSection._id, formData.name, subsections);
      } else {
        await sectionsAPI.createSection(formData.name, subsections);
      }

      setFormData({ name: '', subsections: [''] });
      setEditingSection(null);
      setShowForm(false);
      await loadSections();
    } catch (error) {
      console.error('Error saving section:', error);
      alert(error.response?.data?.error || 'Failed to save section');
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      subsections: section.subsections.map(s => s.name)
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      await sectionsAPI.deleteSection(id);
      await loadSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section');
    }
  };

  const addSubsection = () => {
    setFormData({
      ...formData,
      subsections: [...formData.subsections, '']
    });
  };

  const updateSubsection = (index, value) => {
    const newSubsections = [...formData.subsections];
    newSubsections[index] = value;
    setFormData({ ...formData, subsections: newSubsections });
  };

  const removeSubsection = (index) => {
    setFormData({
      ...formData,
      subsections: formData.subsections.filter((_, i) => i !== index)
    });
  };

  const cancelForm = () => {
    setFormData({ name: '', subsections: [''] });
    setEditingSection(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading sections...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sections & Subsections</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Section
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold mb-4">
            {editingSection ? 'Edit Section' : 'New Section'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subsections
              </label>
              <div className="space-y-2">
                {formData.subsections.map((subsection, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={subsection}
                      onChange={(e) => updateSubsection(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Subsection name"
                    />
                    {formData.subsections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubsection(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSubsection}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Subsection
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Check size={16} />
                {editingSection ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No sections found</p>
        ) : (
          sections.map((section) => (
            <div key={section._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{section.name}</h4>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Subsections:</p>
                    <div className="flex flex-wrap gap-2">
                      {section.subsections.map((sub, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(section)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(section._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
