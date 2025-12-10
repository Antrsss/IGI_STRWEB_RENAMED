/**
 * Утилиты для форматирования дат и работы с временными зонами
 */

// Получить часовой пояс пользователя
export const getUserTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Получить смещение от UTC в часах
export const getUTCOffset = () => {
  return new Date().getTimezoneOffset() / -60;
};

// Форматировать дату в локальном времени пользователя
export const formatLocalDateTime = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const timeZone = getUserTimeZone();
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone,
    ...options
  });
};

// Форматировать дату в UTC
export const formatUTCDateTime = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
    timeZoneName: 'short',
    ...options
  });
};

// Получить относительное время (например, "2 hours ago")
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  
  return formatLocalDateTime(dateString);
};

// Компонент для отображения даты с тултипом
export const DateTimeDisplay = ({ date, showRelative = true, showLocal = true, showUTC = true }) => {
  if (!date) return <span className="text-muted">N/A</span>;
  
  return (
    <div className="date-time-display">
      {showRelative && (
        <div className="date-relative" title={`Local: ${formatLocalDateTime(date)}\nUTC: ${formatUTCDateTime(date)}`}>
          {formatRelativeTime(date)}
        </div>
      )}
      
      {showLocal && (
        <div className="date-local small text-muted">
          <strong>Local:</strong> {formatLocalDateTime(date)}
        </div>
      )}
      
      {showUTC && (
        <div className="date-utc small text-muted">
          <strong>UTC:</strong> {formatUTCDateTime(date)}
        </div>
      )}
    </div>
  );
};