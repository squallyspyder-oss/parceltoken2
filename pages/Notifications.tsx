import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Settings, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const NOTIFICATION_LABELS: Record<string, string> = {
  transaction_completed: "Transação Concluída",
  installment_paid: "Parcela Paga",
  installment_due_soon: "Parcela Vencendo",
  installment_overdue: "Parcela Vencida",
  token_created: "Token Criado",
  token_approved: "Token Aprovado",
  credit_limit_increased: "Limite Aumentado",
  webhook_received: "Webhook Recebido",
  smartqr_generated: "SmartQR Gerado",
  new_sale: "Nova Venda",
  payment_received: "Pagamento Recebido",
  system_announcement: "Anúncio do Sistema",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function Notifications() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const utils = trpc.useUtils();

  // Query para listar notificações
  const { data: notifications = [], isLoading } = trpc.notifications.list.useQuery({
    limit: 100,
    unreadOnly: filter === "unread",
  });

  // Query para contar não lidas
  const { data: unreadData } = trpc.notifications.unreadCount.useQuery();

  // Mutations
  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.unreadCount.invalidate();
      utils.notifications.list.invalidate();
      toast.success("Todas as notificações foram marcadas como lidas");
    },
  });

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
  };

  const handleDelete = (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deleteNotification.mutate({ notificationId });
  };

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="w-8 h-8" />
              Notificações
            </h1>
            <p className="text-gray-600 mt-1">
              Acompanhe todas as atualizações da sua conta
            </p>
          </div>
          <Link href="/settings/notifications">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Preferências
            </Button>
          </Link>
        </div>

        {/* Stats & Filters */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">
              {notifications.length} total
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}

            <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não lidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === "unread"
                ? "Você está em dia! Todas as notificações foram lidas."
                : "Você ainda não recebeu nenhuma notificação."}
            </p>
            {filter === "unread" && (
              <Button variant="outline" onClick={() => setFilter("all")}>
                Ver todas as notificações
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const icon = NOTIFICATION_ICONS[notification.type] || "📬";
            const label = NOTIFICATION_LABELS[notification.type] || notification.type;
            const priorityColor = PRIORITY_COLORS[notification.priority] || PRIORITY_COLORS.normal;

            const content = (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-l-blue-600 bg-blue-50/30" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-3xl flex-shrink-0">{icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <Badge variant="secondary" className={`text-xs ${priorityColor}`}>
                            {label}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead.mutate({ notificationId: notification.id });
                              }}
                              className="h-8 w-8 p-0"
                              title="Marcar como lida"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(notification.id, e)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>

                        {notification.actionUrl && (
                          <span className="text-xs text-blue-600 font-medium">
                            Clique para ver detalhes →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
          })}
        </div>
      )}
    </div>
  );
}
