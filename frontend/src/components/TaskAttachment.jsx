import React from 'react';

const TaskAttachment = ({ attachment }) => {
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📊',
      pptx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      zip: '📦',
      rar: '📦',
      txt: '📄',
    };
    
    return iconMap[extension] || '📎';
  };

  const handleDownload = () => {
    window.open(attachment.url, '_blank');
  };

  return (
    <div 
      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={handleDownload}
    >
      <span className="text-2xl mr-3">{getFileIcon(attachment.filename)}</span>
      <div className="flex-1">
        <p className="font-medium text-indigo-600">{attachment.filename}</p>
        <p className="text-sm text-gray-500">
          {Math.round(attachment.size / 1024)} KB
        </p>
      </div>
      <button className="text-indigo-600 hover:text-indigo-800">
        Descargar
      </button>
    </div>
  );
};

export default TaskAttachment;