/**
 * Exporta dados para CSV
 */
export function exportToCSV(data: any[], headers: string[], filename: string = 'export.csv') {
  // Criar cabeçalho CSV
  const csvHeaders = headers.join(',');
  
  // Criar linhas CSV
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header.toLowerCase().replace(/ /g, '')];
      // Escapar vírgulas e aspas
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });
  
  // Combinar cabeçalho e linhas
  const csvContent = [csvHeaders, ...csvRows].join('\n');
  
  // Criar blob e download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta transações para CSV
 */
export function exportTransactionsToCSV(transactions: any[], filename: string = 'transacoes.csv') {
  const headers = ['ID', 'Descrição', 'Data', 'Valor', 'Parcelas', 'Status', 'Economia'];
  
  const data = transactions.map(tx => ({
    id: tx.id,
    descrição: tx.description || 'N/A',
    data: new Date(tx.createdAt).toLocaleDateString('pt-BR'),
    valor: `R$ ${(tx.amount / 100).toFixed(2)}`,
    parcelas: `${tx.installments}x`,
    status: tx.status === 'completed' ? 'Concluída' : tx.status === 'pending' ? 'Pendente' : 'Falha',
    economia: tx.savingsAmount ? `R$ ${(tx.savingsAmount / 100).toFixed(2)}` : 'R$ 0,00'
  }));
  
  exportToCSV(data, headers, filename);
}

/**
 * Exporta parcelas para CSV
 */
export function exportInstallmentsToCSV(installments: any[], filename: string = 'parcelas.csv') {
  const headers = ['ID', 'Parcela', 'Vencimento', 'Valor', 'Status', 'Data Pagamento'];
  
  const data = installments.map(inst => ({
    id: inst.id,
    parcela: `${inst.installmentNumber}/${inst.totalInstallments}`,
    vencimento: new Date(inst.dueDate).toLocaleDateString('pt-BR'),
    valor: `R$ ${(inst.amount / 100).toFixed(2)}`,
    status: inst.status === 'paid' ? 'Pago' : inst.status === 'pending' ? 'Pendente' : 'Atrasado',
    datapagamento: inst.paidAt ? new Date(inst.paidAt).toLocaleDateString('pt-BR') : '-'
  }));
  
  exportToCSV(data, headers, filename);
}

/**
 * Exporta SmartQRs para CSV
 */
export function exportSmartQRsToCSV(qrs: any[], filename: string = 'smartqrs.csv') {
  const headers = ['ID', 'Descrição', 'Valor', 'Data Criação', 'Status', 'Escaneamentos'];
  
  const data = qrs.map(qr => ({
    id: qr.id,
    descrição: qr.description || 'N/A',
    valor: `R$ ${(qr.amount / 100).toFixed(2)}`,
    datacriação: new Date(qr.createdAt).toLocaleDateString('pt-BR'),
    status: qr.status === 'paid' ? 'Pago' : qr.status === 'pending' ? 'Pendente' : 'Expirado',
    escaneamentos: qr.scans || 0
  }));
  
  exportToCSV(data, headers, filename);
}

/**
 * Exporta analytics para CSV
 */
export function exportAnalyticsToCSV(data: {
  totalVolume: number;
  totalTransactions: number;
  totalSavings: number;
  averageTicket: number;
  conversionRate: number;
}, filename: string = 'analytics.csv') {
  const headers = ['Métrica', 'Valor'];
  
  const csvData = [
    { métrica: 'Volume Total', valor: `R$ ${(data.totalVolume / 100).toFixed(2)}` },
    { métrica: 'Total de Transações', valor: data.totalTransactions.toString() },
    { métrica: 'Economia Total', valor: `R$ ${(data.totalSavings / 100).toFixed(2)}` },
    { métrica: 'Ticket Médio', valor: `R$ ${(data.averageTicket / 100).toFixed(2)}` },
    { métrica: 'Taxa de Conversão', valor: `${data.conversionRate.toFixed(2)}%` }
  ];
  
  exportToCSV(csvData, headers, filename);
}
