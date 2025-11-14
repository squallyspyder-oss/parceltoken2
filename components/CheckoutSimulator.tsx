import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/const";
import { 
  Smartphone, 
  CheckCircle2, 
  Loader2, 
  Copy, 
  CreditCard,
  Zap,
  TrendingUp,
  QrCode,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface CheckoutSimulatorProps {
  qrData: {
    qrId: number;
    amount: number;
    description: string;
    maxInstallments: number;
    installmentAmount: number;
    savings: number;
  };
}

type CheckoutStep = 'scan' | 'select-installments' | 'pix-payment' | 'success';

export default function CheckoutSimulator({ qrData }: CheckoutSimulatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('scan');
  const [selectedInstallments, setSelectedInstallments] = useState(qrData.maxInstallments);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<number | null>(null);

  const installmentAmount = Math.ceil(qrData.amount / selectedInstallments);
  const totalAmount = installmentAmount * selectedInstallments;

  const handleOpenSimulator = () => {
    setIsOpen(true);
    setCurrentStep('scan');
    setSelectedInstallments(qrData.maxInstallments);
    setTransactionId(null);
  };

  const handleScanComplete = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep('select-installments');
      toast.success("QR Code escaneado com sucesso!");
    }, 1500);
  };

  const handleConfirmInstallments = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep('pix-payment');
      toast.success("Gerando cobrança PIX...");
    }, 1000);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const mockTransactionId = Math.floor(Math.random() * 1000000);
      setTransactionId(mockTransactionId);
      setIsProcessing(false);
      setCurrentStep('success');
      toast.success("Pagamento confirmado!");
    }, 2500);
  };

  const copyPixCode = () => {
    const mockPixCode = "00020126580014br.gov.bcb.pix0136demo@parceltoken.com.br5204000053039865802BR5913ParcelToken6009SAO PAULO62070503***6304ABCD";
    navigator.clipboard.writeText(mockPixCode);
    toast.success("Código PIX copiado!");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'scan':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center animate-pulse">
                  <Smartphone className="w-16 h-16 text-blue-600" />
                </div>
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Escaneie o QR Code</h3>
              <p className="text-gray-600">
                Simulando escaneamento com seu smartphone...
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Produto:</strong> {qrData.description}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Valor:</strong> {formatCurrency(qrData.amount)}
              </p>
            </div>

            <Button
              onClick={handleScanComplete}
              disabled={isProcessing}
              size="lg"
              className="w-full text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Escaneando...
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5 mr-2" />
                  Simular Escaneamento
                </>
              )}
            </Button>
          </div>
        );

      case 'select-installments':
        return (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">ParcelToken Detectado!</h3>
              <p className="text-gray-600">
                Você tem <strong className="text-green-600">R$ 5.000,00</strong> disponível
              </p>
            </div>

            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Saldo Disponível</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(500000)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Após esta compra</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {formatCurrency(500000 - qrData.amount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div>
              <label className="block text-sm font-semibold mb-3">
                Escolha o número de parcelas
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: qrData.maxInstallments }, (_, i) => i + 1).map((num) => {
                  const amount = Math.ceil(qrData.amount / num);
                  const isSelected = selectedInstallments === num;
                  return (
                    <button
                      key={num}
                      onClick={() => setSelectedInstallments(num)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-lg font-bold text-gray-900">
                        {num}x {formatCurrency(amount)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {num === 1 ? 'À vista' : `${num} parcelas`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Card className="bg-yellow-50 border-2 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-gray-900">Economia Total</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(qrData.savings)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  vs. Cartão de Crédito Tradicional (MDR 3,5%)
                </p>
              </CardContent>
            </Card>

            <Button
              onClick={handleConfirmInstallments}
              disabled={isProcessing}
              size="lg"
              className="w-full text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Confirmar {selectedInstallments}x de {formatCurrency(installmentAmount)}
                </>
              )}
            </Button>
          </div>
        );

      case 'pix-payment':
        return (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Pague a 1ª Parcela via PIX</h3>
              <p className="text-gray-600">
                Escaneie o QR Code ou copie o código
              </p>
            </div>

            <div className="flex justify-center p-6 bg-white border-4 border-dashed border-gray-300 rounded-2xl">
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
            </div>

            <Card className="bg-blue-50 border-2 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Valor da 1ª Parcela</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(installmentAmount)}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Vencimento: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                onClick={copyPixCode}
                variant="outline"
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Código PIX
              </Button>

              <Button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                size="lg"
                className="w-full text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Aguardando confirmação...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Simular Pagamento PIX
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500">
              Em ambiente real, você pagaria via PIX no seu banco
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-green-600 mb-2">
                Pagamento Confirmado!
              </h3>
              <p className="text-gray-600">
                Sua compra foi processada com sucesso
              </p>
            </div>

            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ID da Transação</span>
                  <span className="font-mono font-bold text-gray-900">
                    #{transactionId}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Produto</span>
                  <span className="font-semibold text-gray-900">
                    {qrData.description}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valor Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(qrData.amount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Parcelamento</span>
                  <span className="font-semibold text-blue-600">
                    {selectedInstallments}x de {formatCurrency(installmentAmount)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t-2 border-green-200">
                  <span className="text-sm font-semibold text-green-600">Economia</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(qrData.savings)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                📅 Próximas Parcelas
              </p>
              <div className="space-y-2">
                {Array.from({ length: selectedInstallments }, (_, i) => {
                  const dueDate = new Date();
                  dueDate.setMonth(dueDate.getMonth() + i + 1);
                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Parcela {i + 1}/{selectedInstallments}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(installmentAmount)} - {dueDate.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={() => setIsOpen(false)}
              size="lg"
              className="w-full text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Concluir Simulação
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenSimulator}
        size="lg"
        className="w-full text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        <Smartphone className="w-5 h-5 mr-2" />
        Simular Checkout Completo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Simulador de Checkout
            </DialogTitle>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[
              { key: 'scan', label: 'Escanear' },
              { key: 'select-installments', label: 'Parcelas' },
              { key: 'pix-payment', label: 'PIX' },
              { key: 'success', label: 'Sucesso' }
            ].map((step, index) => {
              const isActive = currentStep === step.key;
              const isCompleted = ['scan', 'select-installments', 'pix-payment', 'success'].indexOf(currentStep) > index;
              
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      isCompleted 
                        ? 'bg-green-600 text-white' 
                        : isActive 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-200' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : index + 1}
                    </div>
                    <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`h-1 flex-1 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {renderStepContent()}
        </DialogContent>
      </Dialog>
    </>
  );
}
