import { useState, useEffect } from "react";
import { Settings, Bell, Mail, Smartphone, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";

const NOTIFICATION_TYPES = [
  {
    key: "transactionCompleted",
    label: "Transação Concluída",
    description: "Quando uma transação é finalizada com sucesso",
    icon: "💳",
  },
  {
    key: "installmentPaid",
    label: "Parcela Paga",
    description: "Quando você paga uma parcela",
    icon: "✅",
  },
  {
    key: "installmentDueSoon",
    label: "Parcela Vencendo",
    description: "3 dias antes do vencimento de uma parcela",
    icon: "⏰",
  },
  {
    key: "installmentOverdue",
    label: "Parcela Vencida",
    description: "Quando uma parcela está atrasada",
    icon: "⚠️",
  },
  {
    key: "tokenCreated",
    label: "Token Criado",
    description: "Quando você solicita um novo ParcelToken",
    icon: "🎫",
  },
  {
    key: "tokenApproved",
    label: "Token Aprovado",
    description: "Quando seu ParcelToken é aprovado",
    icon: "✨",
  },
  {
    key: "creditLimitIncreased",
    label: "Limite Aumentado",
    description: "Quando seu limite de crédito é aumentado",
    icon: "📈",
  },
  {
    key: "webhookReceived",
    label: "Webhook Recebido",
    description: "Quando um webhook é processado (para merchants)",
    icon: "🔗",
  },
  {
    key: "smartqrGenerated",
    label: "SmartQR Gerado",
    description: "Quando você gera um novo SmartQR (para merchants)",
    icon: "📱",
  },
  {
    key: "newSale",
    label: "Nova Venda",
    description: "Quando você recebe uma nova venda (para merchants)",
    icon: "🛒",
  },
  {
    key: "paymentReceived",
    label: "Pagamento Recebido",
    description: "Quando você recebe um pagamento (para merchants)",
    icon: "💰",
  },
  {
    key: "systemAnnouncement",
    label: "Anúncios do Sistema",
    description: "Atualizações importantes da plataforma",
    icon: "📢",
  },
];

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Query para obter preferências
  const { data: currentPrefs, isLoading } = trpc.notifications.getPreferences.useQuery();

  // Mutation para atualizar preferências
  const updatePrefs = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferências salvas com sucesso!");
      setHasChanges(false);
    },
    onError: () => {
      toast.error("Erro ao salvar preferências");
    },
  });

  // Inicializar preferências quando carregar
  useEffect(() => {
    if (currentPrefs) {
      const prefs: Record<string, boolean> = {};
      NOTIFICATION_TYPES.forEach((type) => {
        const value = currentPrefs[type.key as keyof typeof currentPrefs];
        prefs[type.key] = typeof value === 'boolean' ? value : true;
      });
      prefs.emailEnabled = currentPrefs.emailEnabled ?? true;
      prefs.pushEnabled = currentPrefs.pushEnabled ?? true;
      setPreferences(prefs);
    }
  }, [currentPrefs]);

  const handleToggle = (key: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePrefs.mutate(preferences as any);
  };

  const handleEnableAll = () => {
    const allEnabled: Record<string, boolean> = {};
    NOTIFICATION_TYPES.forEach((type) => {
      allEnabled[type.key] = true;
    });
    allEnabled.emailEnabled = true;
    allEnabled.pushEnabled = true;
    setPreferences(allEnabled);
    setHasChanges(true);
  };

  const handleDisableAll = () => {
    const allDisabled: Record<string, boolean> = {};
    NOTIFICATION_TYPES.forEach((type) => {
      allDisabled[type.key] = false;
    });
    allDisabled.emailEnabled = false;
    allDisabled.pushEnabled = false;
    setPreferences(allDisabled);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Preferências de Notificação
            </h1>
            <p className="text-gray-600 mt-1">
              Escolha quais notificações você deseja receber
            </p>
          </div>
          <Link href="/notifications">
            <Button variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Ver Notificações
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          <CardDescription>
            Ative ou desative todas as notificações de uma vez
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleEnableAll}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Ativar Todas
            </Button>
            <Button variant="outline" onClick={handleDisableAll}>
              Desativar Todas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Tipos de Notificação</CardTitle>
          <CardDescription>
            Escolha quais eventos você deseja ser notificado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {NOTIFICATION_TYPES.map((type, index) => (
            <div key={type.key}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1">
                    <Label htmlFor={type.key} className="text-base font-medium cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  </div>
                </div>
                <Switch
                  id={type.key}
                  checked={preferences[type.key] ?? true}
                  onCheckedChange={(checked) => handleToggle(type.key, checked)}
                />
              </div>
              {index < NOTIFICATION_TYPES.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Channels (Future) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Canais de Notificação</CardTitle>
          <CardDescription>
            Escolha como você deseja receber as notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3 flex-1">
              <Bell className="w-6 h-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <Label htmlFor="pushEnabled" className="text-base font-medium cursor-pointer">
                  Notificações In-App
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Receba notificações dentro da plataforma
                </p>
              </div>
            </div>
            <Switch
              id="pushEnabled"
              checked={preferences.pushEnabled ?? true}
              onCheckedChange={(checked) => handleToggle("pushEnabled", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3 flex-1">
              <Mail className="w-6 h-6 text-green-600 mt-1" />
              <div className="flex-1">
                <Label htmlFor="emailEnabled" className="text-base font-medium cursor-pointer">
                  Notificações por E-mail
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Receba resumos diários por e-mail (em breve)
                </p>
              </div>
            </div>
            <Switch
              id="emailEnabled"
              checked={preferences.emailEnabled ?? true}
              onCheckedChange={(checked) => handleToggle("emailEnabled", checked)}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={updatePrefs.isPending}
            className="shadow-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {updatePrefs.isPending ? "Salvando..." : "Salvar Preferências"}
          </Button>
        </div>
      )}
    </div>
  );
}
