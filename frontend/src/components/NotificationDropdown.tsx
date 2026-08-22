import React, { useEffect, useRef } from "react";
import { useNotifications, NotificationItem } from "../context/NotificationContext";
import { ShieldCheck, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, params?: any) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { notifications, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Only close if click is not on the bell button (which handles its own toggling)
        const target = event.target as HTMLElement;
        if (!target.closest('[aria-label="Notifications"]')) {
          onClose();
        }
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on ESC key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    onClose();
    if (item.route) {
      // Default parameters for redirecting paths
      const navParams: any = {};
      if (item.route === "results") navParams.evaluationId = 101;
      if (item.route === "failures") navParams.failureId = 1;
      
      onNavigate(item.route, navParams);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "critical":
        return (
          <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-[#EF4444] shrink-0 mt-0.5 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case "warning":
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#F59E0B] shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case "success":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
            <CheckCircle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-[#DDD6FE] flex items-center justify-center text-[#4F46E5] shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="fixed right-6 top-[88px] w-[380px] max-w-[calc(100vw-32px)] max-h-[500px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl shadow-[0_20px_50px_rgba(24,21,43,0.15)] flex flex-col z-[1000] overflow-hidden transform transition-all duration-200 ease-out origin-top-right animate-dropdownEntry"
      role="menu"
      aria-label="Notification center"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 select-none bg-slate-50/50">
        <span className="text-[16px] font-black text-[#18152B]">Notifications</span>
        {notifications.some((n) => n.unread) && (
          <button
            onClick={markAllAsRead}
            className="text-[13px] font-black text-[#4F46E5] hover:underline cursor-pointer"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB]/40 min-h-0">
        {notifications.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-3.5 select-none">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-[#18152B]">You're all caught up</h4>
              <p className="text-[13px] text-[#64748B] font-semibold mt-1">
                No security evaluations or alerts yet.
              </p>
            </div>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex gap-3.5 hover:bg-slate-50 transition-all duration-150 relative group cursor-pointer ${
                item.unread ? "bg-[#F5F3FF]" : "bg-white"
              }`}
              onClick={() => handleNotificationClick(item)}
            >
              {getIcon(item.type)}
              
              <div className="flex-1 space-y-1 pr-6">
                <div className="flex items-start justify-between">
                  <h4 className={`text-[14px] leading-snug ${item.unread ? "font-bold text-[#18152B]" : "font-semibold text-[#18152B]/85"}`}>
                    {item.title}
                  </h4>
                </div>
                <p className="text-[13px] text-[#64748B] leading-relaxed font-semibold">
                  {item.description}
                </p>
                <span className="text-[11px] text-[#64748B]/70 font-semibold block pt-0.5">
                  {item.time}
                </span>
              </div>

              {/* Individual Clear Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearNotification(item.id);
                }}
                className="absolute top-4 right-4 text-[#64748B]/40 hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
