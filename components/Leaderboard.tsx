import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  points: number;
  level: string;
  totalSavings: number;
  avatar?: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: number;
  period?: "week" | "month" | "all";
}

const LEVEL_ICONS: Record<string, string> = {
  "Bronze": "🥉",
  "Prata": "🥈",
  "Ouro": "🥇",
  "Platina": "💎",
};

export default function Leaderboard({ entries, currentUserId, period = "month" }: LeaderboardProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Award className="w-5 h-5 text-slate-400" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-500 to-amber-700 text-white";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white";
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "week":
        return "desta semana";
      case "month":
        return "deste mês";
      case "all":
        return "de todos os tempos";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Ranking {getPeriodLabel()}
            </h2>
            <p className="text-sm opacity-90 mt-1">
              Top 10 usuários com mais pontos
            </p>
          </div>
          <TrendingUp className="w-12 h-12 opacity-20" />
        </div>
      </Card>

      {/* Top 3 Pódio */}
      <div className="grid grid-cols-3 gap-4">
        {entries.slice(0, 3).map((entry, index) => {
          const positions = [1, 0, 2]; // Ordem visual: 2º, 1º, 3º
          const actualRank = index + 1;
          const visualIndex = positions.indexOf(index);
          const heights = ["h-32", "h-40", "h-28"];
          
          return (
            <div key={entry.userId} className={`flex flex-col items-center ${visualIndex === 1 ? 'order-2' : visualIndex === 0 ? 'order-1' : 'order-3'}`}>
              <Card className={`w-full ${heights[visualIndex]} flex flex-col items-center justify-center p-4 ${
                getRankBadgeColor(actualRank)
              } ${entry.userId === currentUserId ? 'ring-4 ring-green-500' : ''}`}>
                <div className="mb-2">
                  {getRankIcon(actualRank)}
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg truncate max-w-full">
                    {entry.name}
                  </div>
                  <div className="text-sm opacity-90">
                    {entry.points} pontos
                  </div>
                  <div className="text-xs mt-1 flex items-center justify-center gap-1">
                    <span>{LEVEL_ICONS[entry.level]}</span>
                    <span>{entry.level}</span>
                  </div>
                </div>
              </Card>
              <div className="mt-2 text-xs text-center text-slate-600 dark:text-slate-400">
                Economizou {formatCurrency(entry.totalSavings)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista 4º-10º */}
      <Card className="p-4">
        <div className="space-y-2">
          {entries.slice(3, 10).map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                entry.userId === currentUserId
                  ? 'bg-green-50 dark:bg-green-950 ring-2 ring-green-500'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  getRankBadgeColor(entry.rank)
                }`}>
                  {entry.rank}
                </div>
                
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {entry.name}
                    {entry.userId === currentUserId && (
                      <Badge variant="outline" className="text-xs">
                        Você
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{LEVEL_ICONS[entry.level]} {entry.level}</span>
                    <span>•</span>
                    <span>Economizou {formatCurrency(entry.totalSavings)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-lg text-slate-900 dark:text-white">
                  {entry.points}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  pontos
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sua Posição (se não estiver no top 10) */}
      {currentUserId && !entries.slice(0, 10).find(e => e.userId === currentUserId) && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-2 border-blue-500">
          <div className="text-center">
            <div className="text-sm text-blue-900 dark:text-blue-100 mb-2">
              Sua posição atual
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              #{entries.findIndex(e => e.userId === currentUserId) + 1}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Continue acumulando pontos para entrar no Top 10!
            </div>
          </div>
        </Card>
      )}

      {/* Dica */}
      <Card className="p-4 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <div className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
              Como ganhar mais pontos?
            </div>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>• Realize compras com ParcelToken (+10 pontos por compra)</li>
              <li>• Pague parcelas em dia (+5 pontos por parcela)</li>
              <li>• Indique amigos (+50 pontos por indicação)</li>
              <li>• Desbloqueie badges (+20-100 pontos por badge)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
