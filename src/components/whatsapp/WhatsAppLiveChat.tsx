import { useState } from 'react';
import { Search, MoreVertical } from 'lucide-react';

const mockSessions = [
  { id: 1, name: 'John Doe', phone: '+90 555 0001', lastMessage: 'Teşekkürler, yardımınız için!', time: '2 dk önce', unread: 0, active: true },
  { id: 2, name: 'Sarah Smith', phone: '+90 555 0002', lastMessage: 'Randevu ne zaman alacağım?', time: '15 dk önce', unread: 2, active: true },
  { id: 3, name: 'Mike Johnson', phone: '+90 555 0003', lastMessage: 'Yarın görüşürüz', time: '1 saat önce', unread: 0, active: false },
  { id: 4, name: 'Emma Wilson', phone: '+90 555 0004', lastMessage: 'Fiyatlar nedir?', time: '2 saat önce', unread: 1, active: true },
  { id: 5, name: 'David Brown', phone: '+90 555 0005', lastMessage: 'Tamam anladım', time: '3 saat önce', unread: 0, active: false },
];

export default function WhatsAppLiveChat() {
  const [selectedSession, setSelectedSession] = useState(mockSessions[0]);

  const mockMessages = [
    { id: 1, sender: 'customer', text: 'Merhaba, randevu almak istiyorum', time: '10:30' },
    { id: 2, sender: 'bot', text: 'Merhaba! Size yardımcı olmaktan mutluluk duyarım. Hangi hizmet için randevu almak istersiniz?', time: '10:31' },
    { id: 3, sender: 'customer', text: 'Yarın için saç kesimi', time: '10:32' },
    { id: 4, sender: 'bot', text: 'Harika! Sizin için en uygun saat hangisi?', time: '10:32' },
    { id: 5, sender: 'customer', text: 'Saat 14:00 uygun mudur?', time: '10:33' },
    { id: 6, sender: 'bot', text: 'Mükemmel! Yarın saat 14:00 için randevunuz oluşturuldu. Teşekkürler! 💇‍♂️', time: '10:33' },
    { id: 7, sender: 'customer', text: 'Teşekkürler, yardımınız için!', time: '10:34' },
  ];

  return (
    <div className="flex h-[600px] gap-4">
      <div className="w-1/3 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Konuşma ara..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mockSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className={`w-full p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors text-left ${
                selectedSession.id === session.id ? 'bg-gray-800/70' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {session.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-white truncate">{session.name}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{session.time}</span>
                  </div>
                  <p className="text-sm text-gray-400">{session.phone}</p>
                  <p className="text-sm text-gray-400 truncate mt-1">{session.lastMessage}</p>
                </div>
                {session.active && (
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></span>
                )}
                {session.unread > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {session.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
              {selectedSession.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-medium text-white">{selectedSession.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400">{selectedSession.phone}</p>
                {selectedSession.active && (
                  <>
                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span className="text-xs text-green-400">Aktif</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0a]">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'bot' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender === 'bot'
                    ? 'bg-[#005c4b] text-white'
                    : 'bg-gray-800 text-white'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className="text-xs mt-1 opacity-60 text-right">{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800 bg-blue-500/10">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Bu görünüm sadece izlemek içindir. Mesajlar otomatik bot tarafından yanıtlanmaktadır.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
