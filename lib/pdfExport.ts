import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exporta histórico de transações para PDF
 */
export function exportTransactionsToPDF(transactions: any[], filename: string = 'transacoes.pdf') {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(18);
  doc.text('ParcelToken - Relatório de Transações', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
  
  // Tabela de transações
  const tableData = transactions.map(tx => [
    tx.id,
    tx.description || 'N/A',
    new Date(tx.createdAt).toLocaleDateString('pt-BR'),
    `R$ ${(tx.amount / 100).toFixed(2)}`,
    `${tx.installments}x`,
    tx.status === 'completed' ? 'Concluída' : tx.status === 'pending' ? 'Pendente' : 'Falha',
    tx.savingsAmount ? `R$ ${(tx.savingsAmount / 100).toFixed(2)}` : 'R$ 0,00'
  ]);
  
  autoTable(doc, {
    startY: 40,
    head: [['ID', 'Descrição', 'Data', 'Valor', 'Parcelas', 'Status', 'Economia']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] }, // green-600
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 }
    }
  });
  
  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(10);
  doc.setTextColor(150);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Download
  doc.save(filename);
}

/**
 * Exporta relatório de parcelas para PDF
 */
export function exportInstallmentsToPDF(installments: any[], filename: string = 'parcelas.pdf') {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(18);
  doc.text('ParcelToken - Relatório de Parcelas', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
  
  // Tabela de parcelas
  const tableData = installments.map(inst => [
    inst.id,
    `${inst.installmentNumber}/${inst.totalInstallments}`,
    new Date(inst.dueDate).toLocaleDateString('pt-BR'),
    `R$ ${(inst.amount / 100).toFixed(2)}`,
    inst.status === 'paid' ? 'Pago' : inst.status === 'pending' ? 'Pendente' : 'Atrasado',
    inst.paidAt ? new Date(inst.paidAt).toLocaleDateString('pt-BR') : '-'
  ]);
  
  autoTable(doc, {
    startY: 40,
    head: [['ID', 'Parcela', 'Vencimento', 'Valor', 'Status', 'Data Pagamento']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] }, // blue-600
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 35 }
    }
  });
  
  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(10);
  doc.setTextColor(150);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Download
  doc.save(filename);
}

/**
 * Exporta relatório de analytics para PDF
 */
export function exportAnalyticsToPDF(data: {
  totalVolume: number;
  totalTransactions: number;
  totalSavings: number;
  averageTicket: number;
  conversionRate: number;
}, filename: string = 'analytics.pdf') {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(18);
  doc.text('ParcelToken - Relatório de Analytics', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
  
  // KPIs
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Principais Métricas', 14, 45);
  
  const kpis = [
    ['Volume Total', `R$ ${(data.totalVolume / 100).toFixed(2)}`],
    ['Total de Transações', data.totalTransactions.toString()],
    ['Economia Total', `R$ ${(data.totalSavings / 100).toFixed(2)}`],
    ['Ticket Médio', `R$ ${(data.averageTicket / 100).toFixed(2)}`],
    ['Taxa de Conversão', `${data.conversionRate.toFixed(2)}%`]
  ];
  
  autoTable(doc, {
    startY: 55,
    body: kpis,
    theme: 'plain',
    styles: { fontSize: 12, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 80, halign: 'right' }
    }
  });
  
  // Rodapé
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(
    'Página 1 de 1',
    doc.internal.pageSize.getWidth() / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );
  
  // Download
  doc.save(filename);
}

/**
 * Exporta relatório de SmartQRs para PDF
 */
export function exportSmartQRsToPDF(qrs: any[], filename: string = 'smartqrs.pdf') {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(18);
  doc.text('ParcelToken - Relatório de SmartQRs', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
  
  // Tabela de QRs
  const tableData = qrs.map(qr => [
    qr.id,
    qr.description || 'N/A',
    `R$ ${(qr.amount / 100).toFixed(2)}`,
    new Date(qr.createdAt).toLocaleDateString('pt-BR'),
    qr.status === 'paid' ? 'Pago' : qr.status === 'pending' ? 'Pendente' : 'Expirado',
    qr.scans || 0
  ]);
  
  autoTable(doc, {
    startY: 40,
    head: [['ID', 'Descrição', 'Valor', 'Data Criação', 'Status', 'Escaneamentos']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [147, 51, 234] }, // purple-600
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 }
    }
  });
  
  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(10);
  doc.setTextColor(150);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Download
  doc.save(filename);
}
