export interface KYCData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  documentType: "CPF" | "RG" | "PASSPORT";
  documentNumber: string;
  motherName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
}

export interface KYBData {
  businessName: string;
  tradeName: string;
  cnpj: string;
  foundedDate: Date;
  businessType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  ownerName: string;
  ownerCPF: string;
  monthlyRevenue: number;
  businessSegment: string;
}

export interface VerificationResult {
  status: "approved" | "pending" | "rejected";
  riskScore: number; // 0-100, onde 100 é maior risco
  reason?: string;
  timestamp: Date;
}

export async function verifyKYC(data: KYCData): Promise<VerificationResult> {
  let riskScore = 0;

  // Validar idade (deve ter pelo menos 18 anos)
  const age = calculateAge(data.dateOfBirth);
  if (age < 18) {
    return {
      status: "rejected",
      riskScore: 100,
      reason: "Usuário deve ter pelo menos 18 anos",
      timestamp: new Date(),
    };
  }

  // Validar CPF (verificação básica de formato)
  if (!isValidCPF(data.documentNumber)) {
    riskScore += 30;
  }

  // Validar email
  if (!isValidEmail(data.email)) {
    riskScore += 20;
  }

  // Validar telefone
  if (!isValidPhone(data.phone)) {
    riskScore += 15;
  }

  // Verificar se há dados suspeitos
  if (containsSuspiciousPatterns(data)) {
    riskScore += 25;
  }

  // Determinar status baseado no risk score
  let status: "approved" | "pending" | "rejected";
  if (riskScore >= 70) {
    status = "rejected";
  } else if (riskScore >= 40) {
    status = "pending"; // Requer verificação manual
  } else {
    status = "approved";
  }

  return {
    status,
    riskScore,
    timestamp: new Date(),
  };
}

export async function verifyKYB(data: KYBData): Promise<VerificationResult> {
  let riskScore = 0;

  // Validar CNPJ
  if (!isValidCNPJ(data.cnpj)) {
    riskScore += 40;
  }

  // Validar email corporativo
  if (!isValidEmail(data.email)) {
    riskScore += 20;
  }

  // Validar telefone
  if (!isValidPhone(data.phone)) {
    riskScore += 15;
  }

  // Verificar receita mensal (deve ser realista)
  if (data.monthlyRevenue < 0 || data.monthlyRevenue > 1000000000) {
    riskScore += 35;
  }

  // Verificar se há dados suspeitos
  if (containsSuspiciousPatterns(data)) {
    riskScore += 25;
  }

  // Verificar se é empresa nova (menos de 6 meses)
  const monthsOld = calculateMonthsDifference(data.foundedDate, new Date());
  if (monthsOld < 6) {
    riskScore += 20;
  }

  // Determinar status baseado no risk score
  let status: "approved" | "pending" | "rejected";
  if (riskScore >= 70) {
    status = "rejected";
  } else if (riskScore >= 40) {
    status = "pending"; // Requer verificação manual
  } else {
    status = "approved";
  }

  return {
    status,
    riskScore,
    timestamp: new Date(),
  };
}

// Funções auxiliares de validação
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function calculateMonthsDifference(startDate: Date, endDate: Date): number {
  return (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
}

function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
}

function isValidCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, "");
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  let digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "");
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

function containsSuspiciousPatterns(data: any): boolean {
  const suspiciousKeywords = ["test", "fake", "dummy", "xxx", "admin"];
  const dataString = JSON.stringify(data).toLowerCase();

  for (const keyword of suspiciousKeywords) {
    if (dataString.includes(keyword)) {
      return true;
    }
  }

  return false;
}

export function getRiskLevel(riskScore: number): "low" | "medium" | "high" {
  if (riskScore < 30) return "low";
  if (riskScore < 60) return "medium";
  return "high";
}
