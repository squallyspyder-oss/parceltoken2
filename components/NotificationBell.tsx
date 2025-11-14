import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

const NOTIFICATION_ICONS: Record<string, string> = {
  transaction_completed: "💳",
  installment_paid: "✅",
  installment_due_soon: "⏰",
  installment_overdue: "⚠️",
  token_created: "🎫",
  token_approved: "✨",
  credit_limit_increased: "📈",
  webhook_received: "🔗",
  smartqr_generated: "📱",
  new_sale: "🛒",
  payment_received: "💰",
  system_announcement: "📢",
};

const NOTIFICATION_COLORS: Record<string, string> = {
  transaction_completed: "text-green-600",
  installment_paid: "text-green-600",
  installment_due_soon: "text-yellow-600",
  installment_overdue: "text-red-600",
  token_created: "text-blue-600",
  token_approved: "text-green-600",
  credit_limit_increased: "text-purple-600",
  webhook_received: "text-blue-600",
  smartqr_generated: "text-blue-600",
  new_sale: "text-green-600",
  payment_received: "text-green-600",
  system_announcement: "text-gray-600",
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();

  // Query para contar notificações não lidas
  const { data: unreadData } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  // Query para listar notificações
  const { data: notifications = [], refetch } = trpc.notifications.list.useQuery(
    { limit: 10, unreadOnly: false },
    { enabled: isOpen }
  );

  // Mutation para marcar como lida
  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  // Mutation para marcar todas como lidas
  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
      toast.success("Todas as notificações foram marcadas como lidas");
    },
  });

  // Mutation para deletar
  const deleteNotification = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
      toast.success("Notificação removida");
    },
  });

  const unreadCount = unreadData?.count || 0;

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead.mutate({ notificationId: notification.id });
    }
    
    // Se tem URL de ação, navegar para ela
    if (notification.actionUrl) {
      setIsOpen(false);
      // Link component will handle navigation
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate({ notificationId });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 max-h-[600px] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
          <h3 className="font-semibold text-lg">Notificações</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
                className="text-xs"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas
              </Button>
            )}
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="text-xs">
                Ver todas
              </Button>
            </Link>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const icon = NOTIFICATION_ICONS[notification.type] || "📬";
              const colorClass = NOTIFICATION_COLORS[notification.type] || "text-gray-600";
              
              const content = (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0">{icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-semibold text-sm ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>

                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead.mutate({ notificationId: notification.id });
                              }}
                              className="h-7 px-2 text-xs"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(notification.id, e)}
                            className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );

              // Se tem actionUrl, envolver em Link
              if (notification.actionUrl) {
                return (
                  <Link key={notification.id} href={notification.actionUrl}>
                    {content}
                  </Link>
                );
              }

              return content;
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="sticky bottom-0 bg-gray-50 border-t px-4 py-3 text-center">
            <Link href="/notifications">
              <Button variant="link" className="text-sm">
                Ver todas as notificações →
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
