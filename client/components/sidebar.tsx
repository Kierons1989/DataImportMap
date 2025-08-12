import React from 'react';

interface SidebarProps {
  activeItem?: string;
}

export function Sidebar({ activeItem = 'Modules' }: SidebarProps) {
  const navigationItems = [
    { 
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ), 
      label: 'Home', 
      key: 'Home'
    },
    { 
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/>
        </svg>
      ), 
      label: 'Modules', 
      key: 'Modules'
    },
    { 
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      ), 
      label: 'Tasks', 
      key: 'Tasks'
    },
    { 
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.55c-.19.28-.29.61-.29.96V20c0 .55.45 1 1 1h4c.55 0 1-.45 1-1z"/>
        </svg>
      ), 
      label: 'Portal\nQueue', 
      key: 'Portal Queue'
    },
    { 
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8V4h6v4h4v10z"/>
        </svg>
      ), 
      label: 'Files', 
      key: 'Files'
    },
    { 
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
      ), 
      label: 'Insights', 
      key: 'Insights'
    },
    { 
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      ), 
      label: 'Reports', 
      key: 'Reports'
    },
  ];

  return (
    <div className="flex w-[100px] flex-col items-center bg-[#00336E] py-6 h-full">
      {/* EVOTIX Logo at Top */}
      <div className="mb-8 text-center">
        <div className="text-white font-bold text-lg">EVOTIX</div>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-4">
        {navigationItems.map((item) => (
          <div
            key={item.key}
            className={`flex flex-col items-center justify-center w-full py-3 ${
              item.key === activeItem ? 'bg-[#136DD2]' : ''
            }`}
          >
            <div className="mb-1">{item.icon}</div>
            <div className="text-white text-xs text-center leading-tight">{item.label}</div>
          </div>
        ))}
      </div>

      {/* EVOTIX Core Logo at Bottom */}
      <div className="mt-auto text-center">
        <div className="text-white text-xs">
          <div className="font-bold">EVOTIX</div>
          <div className="text-[10px] opacity-70">Core</div>
        </div>
      </div>
    </div>
  );
}
