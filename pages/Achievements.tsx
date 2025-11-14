import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import CreditLimitVisualization from "@/components/CreditLimitVisualization";
import BadgesShowcase from "@/components/BadgesShowcase";
import Leaderboard from "@/components/Leaderboard";

export default function Achievements() {
  const { user, isAuthenticated, loading } = useAuth();

  const { data: profile } = trpc.user.profile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: activeToken } = trpc.user.getActiveToken.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl('/achievements');
    return null;
  }

  // Mock data - em produção, buscar do backend
  const userBadges = [
    {
      id: "first_token",
      title: "Primeiro Token",
      description: "Criou seu primeiro ParcelToken",
      icon: "🎯",
      rarity: "common" as const,
      unlocked: true,
      unlockedAt: new Date('2024-01-15'),
    },
    {
      id: "first_purchase",
      title: "Primeira Compra",
      description: "Realizou sua primeira compra com ParcelToken",
      icon: "🛒",
      rarity: "common" as const,
      unlocked: true,
      unlockedAt: new Date('2024-01-16'),
    },
    {
      id: "purchases_5",
      title: "Comprador Frequente",
      description: "Realizou 5 compras com ParcelToken",
      icon: "🔥",
      rarity: "rare" as const,
      unlocked: true,
      unlockedAt: new Date('2024-02-01'),
    },
    {
      id: "savings_1000",
      title: "Economizador",
      description: "Economizou R$ 1.000 em taxas",
      icon: "💰",
      rarity: "rare" as const,
      unlocked: true,
      unlockedAt: new Date('2024-02-15'),
    },
    {
      id: "level_bronze",
      title: "Bronze",
      description: "Atingiu nível Bronze",
      icon: "🥉",
      rarity: "common" as const,
      unlocked: true,
      unlockedAt: new Date('2024-01-15'),
    },
  ];

  const leaderboardData = [
    { rank: 1, userId: 101, name: "João Silva", points: 2850, level: "Platina", totalSavings: 1250000 },
    { rank: 2, userId: 102, name: "Maria Santos", points: 2420, level: "Ouro", totalSavings: 980000 },
    { rank: 3, userId: 103, name: "Pedro Costa", points: 2180, level: "Ouro", totalSavings: 850000 },
    { rank: 4, userId: 104, name: "Ana Oliveira", points: 1950, level: "Prata", totalSavings: 720000 },
    { rank: 5, userId: 105, name: "Carlos Souza", points: 1820, level: "Prata", totalSavings: 680000 },
    { rank: 6, userId: 106, name: "Juliana Lima", points: 1650, level: "Prata", totalSavings: 590000 },
    { rank: 7, userId: 107, name: "Roberto Alves", points: 1480, level: "Bronze", totalSavings: 520000 },
    { rank: 8, userId: 108, name: "Fernanda Dias", points: 1320, level: "Bronze", totalSavings: 480000 },
    { rank: 9, userId: 109, name: "Lucas Martins", points: 1180, level: "Bronze", totalSavings: 420000 },
    { rank: 10, userId: 110, name: "Patricia Rocha", points: 1050, level: "Bronze", totalSavings: 380000 },
  ];

  const creditLimit = activeToken?.creditLimit || profile?.creditLimit || 0;
  const availableCredit = activeToken 
    ? activeToken.creditLimit - (activeToken.usedAmount || 0)
    : profile?.availableCredit || 0;
  const level = profile?.level || 1;
  const points = profile?.points || 0;
  const totalSavings = profile?.totalSavings || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Conquistas & Ranking
                </h1>
                <p className="text-sm text-slate-600">
                  Acompanhe seu progresso e compare com outros usuários
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-slate-600">Seus Pontos</div>
                <div className="text-2xl font-bold text-purple-600">{points}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.[0] || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <CreditLimitVisualization
              creditLimit={creditLimit}
              availableCredit={availableCredit}
              level={level}
              points={points}
              totalSavings={totalSavings}
            />

            {/* Próximas Conquistas */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                🎯 Próximas Conquistas
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🏆</div>
                    <div>
                      <div className="font-semibold text-slate-900">Cliente VIP</div>
                      <div className="text-sm text-slate-600">Realize 25 compras</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">Progresso</div>
                    <div className="font-bold text-purple-600">5/25</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">💎</div>
                    <div>
                      <div className="font-semibold text-slate-900">Mestre das Economias</div>
                      <div className="text-sm text-slate-600">Economize R$ 10.000</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">Progresso</div>
                    <div className="font-bold text-purple-600">
                      {((totalSavings / 1000000) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🥈</div>
                    <div>
                      <div className="font-semibold text-slate-900">Nível Prata</div>
                      <div className="text-sm text-slate-600">Atinja R$ 1.000 de crédito</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">Progresso</div>
                    <div className="font-bold text-purple-600">
                      {((creditLimit / 100000) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="badges">
            <BadgesShowcase userBadges={userBadges} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard 
              entries={leaderboardData} 
              currentUserId={user?.id}
              period="month"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
