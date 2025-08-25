import React from 'react';

const NotificationList = ({ notifications, onMarkAsRead, onClose, loading }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    const icons = {
      task_assigned: '📋',
      task_completed: '✅',
      comment: '💬',
      mention: '👤',
      general: '🔔'
    };
    return icons[type] || '🔔';
  };

  if (loading) {
    return (
      <div className="notification-dropdown">
        <div className="notification-header">
          <h3 className="notification-title">Notificaciones</h3>
          <button onClick={onClose} className="notification-close">
            ✕
          </button>
        </div>
        <div className="notification-loading">
          <div className="loading-spinner"></div>
          <p>Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3 className="notification-title">Notificaciones</h3>
        <button onClick={onClose} className="notification-close">
          ✕
        </button>
      </div>

      <div className="notification-content">
        {notifications.length === 0 ? (
          <div className="notification-empty">
            <div className="notification-empty-icon">🔔</div>
            <p className="notification-empty-text">No hay notificaciones</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => !notification.read && onMarkAsRead(notification.id)}
            >
              <span className="notification-item-icon">
                {getNotificationIcon(notification.type)}
              </span>
              <div className="notification-item-content">
                <p className="notification-message">{notification.message}</p>
                <p className="notification-time">{formatDate(notification.createdAt)}</p>
              </div>
              {!notification.read && (
                <span className="notification-status"></span>
              )}
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && notifications.some(n => !n.read) && (
        <div className="notification-footer">
          <button 
            className="notification-mark-all"
            onClick={() => notifications.filter(n => !n.read).forEach(n => onMarkAsRead(n.id))}
          >
            Marcar todas como leídas
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;