import React, { useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import { NotificationDropdown } from "./NotificationDropdown";
import { Bell } from "lucide-react";

interface NotificationBellProps {
  onNavigate: (page: string, params?: any) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={toggleDropdown}
        className="w-10 h-10 flex items-center justify-center text-[#64748B] hover:text-[#4F46E5] hover:bg-[#F3F1FF] active:bg-[#E0E7FF] rounded-lg relative cursor-pointer focus:outline-none transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#E11D8D] text-white text-[9px] font-black border border-white leading-none">
            {unreadCount}
          </span>
        )}
      </button>
      
      <NotificationDropdown 
        isOpen={isOpen} 
        onClose={handleClose} 
        onNavigate={onNavigate} 
      />
    </div>
  );
};
