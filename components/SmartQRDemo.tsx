import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/const";
import { QrCode, Loader2, CheckCircle2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import CheckoutSimulator from "@/components/CheckoutSimulator";

export default function SmartQRDemo() {
  const [amount, setAmount] = useState("250000"); // R$ 2.500,00
  const [description, setDescription] = useState("Notebook Dell Inspiron");
  const [maxInstallments, setMaxInstallments] = useState("4");
  const [generatedQR, setGeneratedQR] = useState<any>(null);

  const generateQR = trpc.public.generateDemoQR.useMutation({
    onSuccess: (data) => {
      setGeneratedQR(data);
      toast.success("SmartQR gerado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar QR Code");
    },
  });

  const handleGenerate = () => {
    const amountNum = parseInt(amount);
    const installmentsNum = parseInt(maxInstallments);

    if (isNaN(amountNum) || amountNum < 1000) {
      toast.error("Valor mínimo: R$ 10,00");
      return;
    }

    if (isNaN(installmentsNum) || installmentsNum < 1 || installmentsNum > 12) {
      toast.error("Parcelas devem ser entre 1 e 12");
      return;
    }

    if (!description.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    generateQR.mutate({
      amount: amountNum,
      description: description.trim(),
      maxInstallments: installmentsNum,
    });
  };

  const downloadQR = () => {
    if (!generatedQR?.qrCodePNG) return;
    
    const link = document.createElement('a');
    link.href = generatedQR.qrCodePNG;
    link.download = `smartqr-${generatedQR.qrId}.png`;
    link.click();
    toast.success("QR Code baixado!");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card className="shadow-xl border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-blue-600" />
              Configurar SmartQR
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base font-semibold">
                Valor da Compra
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 text-lg"
                  placeholder="250000"
                />
              </div>
              <p className="text-sm text-gray-500">
                Em centavos (ex: 250000 = R$ 2.500,00)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Descrição do Produto
              </Label>
              <Input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-lg"
                placeholder="Ex: Notebook Dell Inspiron"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments" className="text-base font-semibold">
                Máximo de Parcelas
              </Label>
              <Input
                id="installments"
                type="number"
                min="1"
                max="12"
                value={maxInstallments}
                onChange={(e) => setMaxInstallments(e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-gray-500">
                Entre 1 e 12 parcelas
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateQR.isPending}
              className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {generateQR.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando QR Code...
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5 mr-2" />
                  Gerar SmartQR
                </>
              )}
            </Button>

            {generatedQR && (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  SmartQR Gerado com Sucesso!
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>ID:</strong> #{generatedQR.qrId}</p>
                  <p><strong>Valor:</strong> {formatCurrency(generatedQR.amount)}</p>
                  <p><strong>Parcelas:</strong> até {generatedQR.maxInstallments}x</p>
                  <p><strong>Valor/parcela:</strong> {formatCurrency(generatedQR.installmentAmount)}</p>
                  <p className="text-green-600 font-semibold">
                    <strong>Economia vs Cartão:</strong> {formatCurrency(generatedQR.savings)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Display Section */}
        <Card className="shadow-xl border-2 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <QrCode className="w-6 h-6 text-purple-600" />
              QR Code Gerado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!generatedQR ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">
                  Preencha os dados e clique em "Gerar SmartQR" para visualizar o QR Code
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* QR Code Image */}
                <div className="flex justify-center p-6 bg-white border-4 border-dashed border-gray-300 rounded-2xl">
                  <img
                    src={generatedQR.qrCodePNG}
                    alt="SmartQR Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <CheckoutSimulator qrData={generatedQR} />
                  
                  <Button
                    onClick={downloadQR}
                    variant="outline"
                    className="w-full text-lg py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Baixar QR Code
                  </Button>

                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Como usar:</strong>
                    </p>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Consumidor escaneia o QR Code</li>
                      <li>Sistema detecta ParcelToken ativo</li>
                      <li>Escolhe número de parcelas</li>
                      <li>Confirma pagamento via PIX</li>
                      <li>Merchant recebe instantaneamente (D+0)</li>
                    </ol>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Economia</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(generatedQR.savings)}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Parcela</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(generatedQR.installmentAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none shadow-xl">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            💡 Este é apenas uma demonstração
          </h3>
          <p className="text-lg opacity-90 mb-6">
            Para processar pagamentos reais, crie sua conta merchant e obtenha suas credenciais de API.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => window.location.href = '/merchant'}
            >
              Criar Conta Merchant
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10"
              onClick={() => window.location.href = '/api-docs'}
            >
              Ver Documentação da API
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
