export default function WhatsAppSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Bot Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Bot Name</label>
            <input
              type="text"
              defaultValue="Support Bot"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Greeting Message</label>
            <textarea
              rows={3}
              defaultValue="Hello! How can I help you today?"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Working Hours</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                defaultValue="09:00"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
              />
              <input
                type="time"
                defaultValue="18:00"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Webhook Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Webhook URL</label>
            <input
              type="text"
              readOnly
              value="https://api.allync.com/webhook/whatsapp"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}
