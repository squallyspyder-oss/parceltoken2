/**
 * Environment Badge Component
 * 
 * Exibe badge indicando se o ambiente é Sandbox ou Produção
 * Baseado na variável de ambiente PIX_PROVIDER
 */

import { Badge } from "@/components/ui/badge";

export function EnvironmentBadge() {
  // Ler provider do PIX das variáveis de ambiente
  const pixProvider = import.meta.env.VITE_PIX_PROVIDER || 'mock';
  const nodeEnv = import.meta.env.MODE;

  // Determinar se está em sandbox
  const isSandbox = pixProvider === 'mock' || nodeEnv === 'development';

  if (isSandbox) {
    return (
      <Badge 
        variant="outline" 
        className="bg-yellow-50 text-yellow-700 border-yellow-300 font-semibold animate-pulse"
      >
        🟡 SANDBOX
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className="bg-green-50 text-green-700 border-green-300 font-semibold"
    >
      🟢 PRODUÇÃO
    </Badge>
  );
}
