import { apiClient } from './client'

export type AdminEmployeeDetail = {
  employeeRef: string
  status: string
  corporateClientId: number
  batchReference: string
  correctionBatchId: number | null
  fullName: string
  fatherName: string | null
  motherName: string | null
  mobile: string | null
  email: string | null
  cnic: string | null
  dateOfBirth: string | null
  gender: string | null
  religion: string | null
  cnicIssueDate: string | null
  cnicExpiryDate: string | null
  presentAddressLine1: string | null
  presentAddressLine2: string | null
  presentCity: string | null
  presentCountry: string | null
  permanentAddressLine1: string | null
  permanentAddressLine2: string | null
  permanentCity: string | null
  permanentCountry: string | null
  nadraTransactionId: string | null
  nadraVerificationStatus: string | null
  nadraVerifiedAt: string | null
  livenessResult: string | null
  livenessScore: number | null
  livenessCompletedAt: string | null
  faceMatchResult: string | null
  faceMatchScore: number | null
  faceMatchCompletedAt: string | null
  fingerprintTemplateRef: string | null
  fingerprintMatchResult: string | null
  fingerprintQualityScore: number | null
  fingerprintCompletedAt: string | null
  quizScore: number | null
  quizMaxScore: number | null
  quizPassed: boolean | null
  quizCompletedAt: string | null
  amlScreeningStatus: string | null
  amlCaseReference: string | null
  amlLastCheckedAt: string | null
  amlScreeningSummary: string | null
  t24CustomerId: string | null
  t24AccountId: string | null
  t24SubmissionStatus: string | null
  t24LastError: string | null
  t24LastAttemptAt: string | null
  ocrStatus: string | null
  validationErrors: string | null
  formDataJson: string | null
  blockReason: string | null
  blockedAt: string | null
  unblockedBy: string | null
  unblockedAt: string | null
  expireAt: string | null
  inviteSentAt: string | null
  inviteResendCount: number
  createdAt: string
  updatedAt: string
  hasCnicFrontImage: boolean
  hasCnicBackImage: boolean
  hasSelfieImage: boolean
}

export async function fetchAdminEmployeeDetail(employeeRef: string): Promise<AdminEmployeeDetail> {
  const { data } = await apiClient.get<AdminEmployeeDetail>(
    `/employees/${encodeURIComponent(employeeRef)}`,
  )
  return data
}
