import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import useStore from '../store/useStore';

const NOTIFICATION_ICONS = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  success: CheckCircle,
};

const NOTIFICATION_STYLES = {
  critical: 'border-danger-500/30 bg-danger-500/10',
  warning: 'border-warning-500/30 bg-warning-500/10',
  info: 'border-primary-500/30 bg-primary-500/10',
  success: 'border-success-500/30 bg-success-500/10',
};

const ICON_STYLES = {
  critical: 'text-danger-500',
  warning: 'text-warning-500',
  info: 'text-primary-500',
  success: 'text-success-500',
};

function NotificationCenter() {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = NOTIFICATION_ICONS[notification.type] || Info;

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`bg-dark-900 border rounded-lg shadow-xl p-4 ${
                NOTIFICATION_STYLES[notification.type] || NOTIFICATION_STYLES.info
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${ICON_STYLES[notification.type] || ICON_STYLES.info}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {notification.title}
                  </p>
                  {notification.message && (
                    <p className="text-xs text-dark-400 mt-1">
                      {notification.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="p-1 hover:bg-dark-800 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-dark-400" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default NotificationCenter;
