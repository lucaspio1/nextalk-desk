import React from 'react';
import { Database, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useTicketsModel } from '../../models/hooks/useTicketsModel';
import { useSettingsModel } from '../../models/hooks/useSettingsModel';

/**
 * Página de teste para validar que o Firebase está consumindo dados corretamente
 *
 * Esta página mostra todos os dados que estão sendo carregados do Firebase em tempo real
 * e permite verificar se a integração está funcionando corretamente.
 */
export const FirebaseTestView = ({ user }) => {
  const ticketModel = useTicketsModel(user);
  const settingsModel = useSettingsModel();

  return (
    <div className="h-full w-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database size={32} className="text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Firebase Data Consumer - Teste
            </h1>
          </div>
          <p className="text-gray-600">
            Esta página mostra todos os dados sendo consumidos do Firebase em tempo real.
            Os dados são sincronizados automaticamente quando houver alterações no banco.
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatusCard
            title="Tickets"
            count={ticketModel.tickets.length}
            status="active"
          />
          <StatusCard
            title="Quick Responses"
            count={settingsModel.quickResponses.length}
            status="active"
          />
          <StatusCard
            title="Departments"
            count={settingsModel.departments.length}
            status="active"
          />
          <StatusCard
            title="Users"
            count={settingsModel.users.length}
            status="active"
          />
        </div>

        {/* Tickets Section */}
        <DataSection
          title="Tickets"
          icon={CheckCircle}
          data={ticketModel.tickets}
          renderItem={(ticket) => (
            <div key={ticket.id} className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="font-semibold text-gray-900">{ticket.customerName}</div>
              <div className="text-sm text-gray-500">{ticket.customerPhone}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  ticket.status === 'active' ? 'bg-green-100 text-green-700' :
                  ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {ticket.status}
                </span>
                <span className="text-xs text-gray-500">
                  {ticket.messages?.length || 0} mensagens
                </span>
              </div>
            </div>
          )}
        />

        {/* Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <DataSection
            title="Quick Responses"
            data={settingsModel.quickResponses}
            renderItem={(item) => (
              <div key={item.id} className="p-3 bg-white border border-gray-200 rounded">
                <div className="font-medium text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-500 truncate">{item.description}</div>
              </div>
            )}
          />

          <DataSection
            title="Departments"
            data={settingsModel.departments}
            renderItem={(item) => (
              <div key={item.id} className="p-3 bg-white border border-gray-200 rounded">
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-500">{item.description || '-'}</div>
              </div>
            )}
          />

          <DataSection
            title="Users"
            data={settingsModel.users}
            renderItem={(item) => (
              <div key={item.id} className="p-3 bg-white border border-gray-200 rounded">
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-500">{item.email}</div>
                <span className="text-xs text-emerald-600">{item.role}</span>
              </div>
            )}
          />

          <DataSection
            title="Contacts"
            data={settingsModel.contacts}
            renderItem={(item) => (
              <div key={item.id} className="p-3 bg-white border border-gray-200 rounded">
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-500">{item.phone}</div>
              </div>
            )}
          />

          <DataSection
            title="Tags"
            data={settingsModel.tags}
            renderItem={(item) => (
              <div key={item.id} className="p-3 bg-white border border-gray-200 rounded flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                <div className="font-medium text-gray-900">{item.name}</div>
              </div>
            )}
          />

          <DataSection
            title="Closing Reasons"
            data={settingsModel.reasons}
            renderItem={(item) => (
              <div key={item.id} className="p-3 bg-white border border-gray-200 rounded">
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-500">{item.description || '-'}</div>
              </div>
            )}
          />
        </div>

        {/* General Settings */}
        <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingItem
              label="Identify User"
              value={settingsModel.generalSettings.identifyUser}
            />
            <SettingItem
              label="Hide Phone Numbers"
              value={settingsModel.generalSettings.hidePhoneNumbers}
            />
            <SettingItem
              label="Hide Dispatched Conversations"
              value={settingsModel.generalSettings.hideDispatchedConversations}
            />
            <SettingItem
              label="Inactivity Timeout"
              value={`${settingsModel.generalSettings.inactivityTimeout} min`}
            />
          </div>
        </div>

        {/* Loading State */}
        {settingsModel.loading && (
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <Loader className="animate-spin text-blue-600" size={24} />
            <span className="text-blue-900 font-medium">Carregando dados do Firebase...</span>
          </div>
        )}

        {/* Error State */}
        {settingsModel.error && (
          <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <XCircle className="text-red-600" size={24} />
            <span className="text-red-900 font-medium">Erro: {settingsModel.error}</span>
          </div>
        )}

        {/* Success Message */}
        {!settingsModel.loading && !settingsModel.error && (
          <div className="mt-6 p-6 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-emerald-600" size={24} />
            <div>
              <div className="text-emerald-900 font-medium">
                ✅ Firebase está consumindo dados corretamente!
              </div>
              <div className="text-emerald-700 text-sm mt-1">
                Todos os listeners em tempo real estão ativos. Os dados serão sincronizados automaticamente.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente auxiliar para cards de status
const StatusCard = ({ title, count, status }) => (
  <div className="p-4 bg-white border border-gray-200 rounded-lg">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-gray-900 mt-1">{count}</div>
      </div>
      {status === 'active' ? (
        <CheckCircle className="text-emerald-500" size={24} />
      ) : (
        <Loader className="text-gray-400 animate-spin" size={24} />
      )}
    </div>
  </div>
);

// Componente auxiliar para seções de dados
const DataSection = ({ title, icon: Icon = Database, data, renderItem }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon size={20} className="text-gray-600" />}
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <span className="text-sm text-gray-500">({data.length})</span>
    </div>
    {data.length === 0 ? (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
        Nenhum dado encontrado. Adicione dados no Firebase para vê-los aparecer aqui em tempo real.
      </div>
    ) : (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {data.map(renderItem)}
      </div>
    )}
  </div>
);

// Componente auxiliar para itens de configuração
const SettingItem = ({ label, value }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
    <span className="text-gray-700 font-medium">{label}</span>
    <span className="text-gray-900">
      {typeof value === 'boolean' ? (
        value ? (
          <CheckCircle className="text-emerald-500" size={20} />
        ) : (
          <XCircle className="text-gray-400" size={20} />
        )
      ) : (
        value
      )}
    </span>
  </div>
);
