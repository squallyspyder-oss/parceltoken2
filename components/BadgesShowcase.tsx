import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, Sparkles } from "lucide-react";
import { useState } from "react";

interface BadgeData {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface BadgesShowcaseProps {
  userBadges: BadgeData[];
}

const RARITY_COLORS = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-yellow-600",
};

const RARITY_LABELS = {
  common: "Comum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};

// Badges disponíveis no sistema
const ALL_BADGES: BadgeData[] = [
  {
    id: "first_token",
    title: "Primeiro Token",
    description: "Criou seu primeiro ParcelToken",
    icon: "🎯",
    rarity: "common",
    unlocked: false,
  },
  {
    id: "first_purchase",
    title: "Primeira Compra",
    description: "Realizou sua primeira compra com ParcelToken",
    icon: "🛒",
    rarity: "common",
    unlocked: false,
  },
  {
    id: "purchases_5",
    title: "Comprador Frequente",
    description: "Realizou 5 compras com ParcelToken",
    icon: "🔥",
    rarity: "rare",
    unlocked: false,
  },
  {
    id: "purchases_25",
    title: "Cliente VIP",
    description: "Realizou 25 compras com ParcelToken",
    icon: "👑",
    rarity: "epic",
    unlocked: false,
  },
  {
    id: "savings_1000",
    title: "Economizador",
    description: "Economizou R$ 1.000 em taxas",
    icon: "💰",
    rarity: "rare",
    unlocked: false,
  },
  {
    id: "savings_10000",
    title: "Mestre das Economias",
    description: "Economizou R$ 10.000 em taxas",
    icon: "💎",
    rarity: "legendary",
    unlocked: false,
  },
  {
    id: "on_time_payer",
    title: "Pagador Pontual",
    description: "Pagou 10 parcelas sem atraso",
    icon: "⏰",
    rarity: "rare",
    unlocked: false,
  },
  {
    id: "perfect_payer",
    title: "Pagador Perfeito",
    description: "Pagou 50 parcelas sem atraso",
    icon: "⭐",
    rarity: "legendary",
    unlocked: false,
  },
  {
    id: "level_bronze",
    title: "Bronze",
    description: "Atingiu nível Bronze",
    icon: "🥉",
    rarity: "common",
    unlocked: false,
  },
  {
    id: "level_silver",
    title: "Prata",
    description: "Atingiu nível Prata",
    icon: "🥈",
    rarity: "rare",
    unlocked: false,
  },
  {
    id: "level_gold",
    title: "Ouro",
    description: "Atingiu nível Ouro",
    icon: "🥇",
    rarity: "epic",
    unlocked: false,
  },
  {
    id: "level_platinum",
    title: "Platina",
    description: "Atingiu nível Platina",
    icon: "💎",
    rarity: "legendary",
    unlocked: false,
  },
  {
    id: "referral_3",
    title: "Influenciador",
    description: "Indicou 3 amigos para o ParcelToken",
    icon: "📢",
    rarity: "rare",
    unlocked: false,
  },
  {
    id: "referral_10",
    title: "Embaixador",
    description: "Indicou 10 amigos para o ParcelToken",
    icon: "🎖️",
    rarity: "legendary",
    unlocked: false,
  },
  {
    id: "early_adopter",
    title: "Early Adopter",
    description: "Um dos primeiros 1000 usuários",
    icon: "🚀",
    rarity: "epic",
    unlocked: false,
  },
];

export default function BadgesShowcase({ userBadges }: BadgesShowcaseProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);

  // Mesclar badges do usuário com todos disponíveis
  const badgesWithStatus = ALL_BADGES.map(badge => {
    const userBadge = userBadges.find(ub => ub.id === badge.id);
    return userBadge || badge;
  });

  const unlockedCount = badgesWithStatus.filter(b => b.unlocked).length;
  const totalCount = badgesWithStatus.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Conquistas
            </h2>
            <p className="text-sm opacity-90 mt-1">
              Desbloqueie badges especiais e mostre suas conquistas
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{unlockedCount}</div>
            <div className="text-sm opacity-90">de {totalCount}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{completionPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Grid de Badges */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {badgesWithStatus.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className={`relative group transition-all duration-300 ${
              badge.unlocked 
                ? 'hover:scale-110 cursor-pointer' 
                : 'opacity-50 cursor-default'
            }`}
          >
            <Card className={`p-4 text-center ${
              badge.unlocked 
                ? `bg-gradient-to-br ${RARITY_COLORS[badge.rarity]}` 
                : 'bg-slate-100 dark:bg-slate-800'
            }`}>
              {!badge.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              )}
              
              <div className={`text-4xl mb-2 ${!badge.unlocked && 'grayscale'}`}>
                {badge.icon}
              </div>
              
              {badge.unlocked && (
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-white/20 text-white border-0"
                >
                  {RARITY_LABELS[badge.rarity]}
                </Badge>
              )}
            </Card>
            
            <div className="mt-1 text-xs font-medium text-center text-slate-900 dark:text-white truncate">
              {badge.title}
            </div>
          </button>
        ))}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedBadge?.unlocked ? "Conquista Desbloqueada!" : "Conquista Bloqueada"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBadge && (
            <div className="space-y-4">
              <div className={`relative mx-auto w-32 h-32 rounded-full flex items-center justify-center ${
                selectedBadge.unlocked 
                  ? `bg-gradient-to-br ${RARITY_COLORS[selectedBadge.rarity]}` 
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                {!selectedBadge.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Lock className="w-12 h-12 text-white" />
                  </div>
                )}
                <span className={`text-6xl ${!selectedBadge.unlocked && 'grayscale'}`}>
                  {selectedBadge.icon}
                </span>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedBadge.title}
                </h3>
                <Badge variant="outline">
                  {RARITY_LABELS[selectedBadge.rarity]}
                </Badge>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedBadge.description}
                </p>
                
                {selectedBadge.unlocked && selectedBadge.unlockedAt && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">
                    Desbloqueado em {new Date(selectedBadge.unlockedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              {selectedBadge.unlocked && (
                <div className="text-center">
                  <div className="inline-block animate-bounce">
                    🎉
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
