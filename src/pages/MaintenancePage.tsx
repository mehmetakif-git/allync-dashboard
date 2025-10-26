import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Wrench, RefreshCw } from 'lucide-react';
import { getActiveMaintenanceWindow, type MaintenanceWindow } from '../lib/api/maintenanceWindows';

export default function MaintenancePage() {
  const [maintenanceWindow, setMaintenanceWindow] = useState<MaintenanceWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Load maintenance window
  useEffect(() => {
    loadMaintenanceWindow();
  }, []);

  // Calculate time remaining
  useEffect(() => {
    if (!maintenanceWindow) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(maintenanceWindow.end_time).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining('Maintenance ending soon...');
        // Reload page after maintenance ends
        setTimeout(() => window.location.reload(), 5000);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [maintenanceWindow]);

  const loadMaintenanceWindow = async () => {
    try {
      setIsLoading(true);
      const window = await getActiveMaintenanceWindow();
      setMaintenanceWindow(window);
    } catch (error) {
      console.error('Failed to load maintenance window:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        
        {/* Main Maintenance Card */}
        <div className="bg-card backdrop-blur-xl border border-secondary rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b-2 border-orange-500/50 p-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-6 shadow-lg">
              <Wrench className="w-12 h-12 text-white animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🚧 System Maintenance
            </h1>
            <p className="text-xl text-orange-200">
              Sistem Bakımı
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            
            {/* Status Message */}
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-orange-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">
                    We're currently performing maintenance
                  </h2>
                  <p className="text-lg text-orange-200 mb-2">
                    Şu anda sistem bakımı yapıyoruz
                  </p>
                  
                  {maintenanceWindow && (
                    <>
                      <div className="mt-4 pt-4 border-t border-orange-500/30">
                        <p className="text-white mb-2">
                          <span className="font-semibold">English:</span> {maintenanceWindow.message_en}
                        </p>
                        <p className="text-white">
                          <span className="font-semibold">Türkçe:</span> {maintenanceWindow.message_tr}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Time Information */}
            {maintenanceWindow && (
              <>
                {/* Countdown Timer */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-8 h-8 text-blue-400" />
                      <div>
                        <p className="text-muted text-sm">Estimated completion time / Tahmini tamamlanma süresi</p>
                        <p className="text-2xl font-bold text-white">
                          {timeRemaining}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary/50 rounded-lg p-4 border border-secondary">
                    <p className="text-muted text-sm mb-1">Start Time / Başlangıç</p>
                    <p className="text-white font-medium">
                      {formatDate(maintenanceWindow.start_time)}
                    </p>
                  </div>
                  <div className="bg-primary/50 rounded-lg p-4 border border-secondary">
                    <p className="text-muted text-sm mb-1">End Time / Bitiş</p>
                    <p className="text-white font-medium">
                      {formatDate(maintenanceWindow.end_time)}
                    </p>
                  </div>
                </div>

                {/* Affected Services */}
                {maintenanceWindow.affected_services && maintenanceWindow.affected_services.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 font-semibold mb-3">
                      Affected Services / Etkilenen Servisler:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {maintenanceWindow.affected_services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* What to Expect */}
            <div className="bg-secondary/50 rounded-lg p-6 border border-secondary">
              <h3 className="text-lg font-bold text-white mb-4">
                What to Expect / Ne Beklemeli?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <p className="text-muted text-sm">
                    <span className="text-white">EN:</span> System access is temporarily unavailable during maintenance
                    <br />
                    <span className="text-white">TR:</span> Bakım süresi boyunca sisteme erişim geçici olarak kapalıdır
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <p className="text-muted text-sm">
                    <span className="text-white">EN:</span> All your data is safe and secure
                    <br />
                    <span className="text-white">TR:</span> Tüm verileriniz güvende ve korunmaktadır
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <p className="text-muted text-sm">
                    <span className="text-white">EN:</span> You will be able to log in normally after maintenance is completed
                    <br />
                    <span className="text-white">TR:</span> Bakım tamamlandıktan sonra normal şekilde giriş yapabileceksiniz
                  </p>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Page / Sayfayı Yenile
              </button>
            </div>

            {/* Support Contact */}
            <div className="text-center pt-4 border-t border-secondary">
              <p className="text-muted text-sm mb-2">
                Need help? / Yardıma mı ihtiyacınız var?
              </p>
              <a
                href="mailto:info@allyncai.com"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                info@allyncai.com
              </a>
            </div>

          </div>

          {/* Footer */}
          <div className="bg-secondary/30 border-t border-secondary px-8 py-6 text-center">
            <p className="text-muted text-sm">
              Thank you for your patience / Anlayışınız için teşekkür ederiz
            </p>
            <p className="text-muted text-xs mt-2">
              © 2025 Allync AI. All rights reserved.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}