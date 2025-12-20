import React, { useState, useEffect } from 'react';
import { X, Upload, User } from 'lucide-react';

export const ContactModal = ({ contact = null, tags = [], onSave, onClose }) => {
  const isEditing = !!contact;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    landline: '',
    gender: '',
    address: '',
    complement: '',
    avatar: '',
    notes: '',
    tags: []
  });

  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        phone: contact.phone || '',
        email: contact.email || '',
        landline: contact.landline || '',
        gender: contact.gender || '',
        address: contact.address || '',
        complement: contact.complement || '',
        avatar: contact.avatar || '',
        notes: contact.notes || '',
        tags: contact.tags || []
      });
      setAvatarPreview(contact.avatar);
    }
  }, [contact]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        handleChange('avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleToggleTag = (tagId) => {
    const currentTags = formData.tags || [];
    const tagExists = currentTags.some(t => t === tagId || t.id === tagId);

    if (tagExists) {
      handleChange('tags', currentTags.filter(t => (t.id || t) !== tagId));
    } else {
      handleChange('tags', [...currentTags, tagId]);
    }
  };

  const isTagSelected = (tagId) => {
    const currentTags = formData.tags || [];
    return currentTags.some(t => t === tagId || t.id === tagId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Editar Contato' : 'Novo Contato'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors shadow-md">
                  <Upload size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">Clique no ícone para adicionar foto</p>
            </div>

            {/* Informações Básicas */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Informações básicas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nome completo"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Celular (WhatsApp) *
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <span className="text-xl">🇧🇷</span>
                      <span className="text-sm text-gray-600">+55</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="11999999999"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Digite apenas números (DDD + número)</p>
                </div>
              </div>
            </div>

            {/* Dados Complementares */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Dados complementares</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Telefone Fixo
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <span className="text-xl">🇧🇷</span>
                      <span className="text-sm text-gray-600">+55</span>
                    </div>
                    <input
                      type="tel"
                      value={formData.landline}
                      onChange={(e) => handleChange('landline', e.target.value)}
                      placeholder="1133334444"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contato@exemplo.com"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Gênero
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                </div>

                {isEditing && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Data de criação
                    </label>
                    <input
                      type="text"
                      value={contact?.createdAt ? new Date(contact.createdAt).toLocaleDateString('pt-BR') : '-'}
                      disabled
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-sm text-gray-500"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Rua, número, bairro, cidade - UF"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={formData.complement}
                    onChange={(e) => handleChange('complement', e.target.value)}
                    placeholder="Apartamento, bloco, sala..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Etiquetas */}
            {tags.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleTag(tag.id)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                        isTagSelected(tag.id)
                          ? 'ring-2 ring-offset-1'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: tag.color + '20',
                        color: tag.color,
                        border: `1px solid ${tag.color}40`,
                        ringColor: tag.color
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Observações */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Observações</h4>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Anotações sobre o contato..."
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
              ></textarea>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              {isEditing ? 'Salvar alterações' : 'Criar contato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
