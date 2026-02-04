export interface VerificationResult {
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  message?: string;
  data?: any;
}
