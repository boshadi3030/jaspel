/**
 * Error Handler Utility
 * Standardized error handling untuk API responses
 */

export interface ApiError {
  message: string        // User-friendly message dalam Bahasa Indonesia
  code: string          // Error code untuk debugging
  details?: any         // Additional error details
  status?: number       // HTTP status code
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
}

/**
 * Translate error messages ke Bahasa Indonesia
 */
function translateError(error: any): string {
  const errorMessage = error?.message || String(error)
  
  // Database errors
  if (errorMessage.includes('duplicate key')) {
    return 'Data sudah ada dalam sistem'
  }
  if (errorMessage.includes('foreign key')) {
    return 'Data terkait dengan data lain dan tidak dapat dihapus'
  }
  if (errorMessage.includes('violates check constraint')) {
    return 'Data tidak valid sesuai aturan sistem'
  }
  
  // Auth errors
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Email atau kata sandi salah'
  }
  if (errorMessage.includes('Email not confirmed')) {
    return 'Email belum dikonfirmasi'
  }
  if (errorMessage.includes('User not found')) {
    return 'Pengguna tidak ditemukan'
  }
  if (errorMessage.includes('JWT')) {
    return 'Sesi Anda telah berakhir, silakan masuk kembali'
  }
  
  // Network errors
  if (errorMessage.includes('fetch failed') || errorMessage.includes('network')) {
    return 'Koneksi terputus, periksa internet Anda'
  }
  
  // Permission errors
  if (errorMessage.includes('permission') || errorMessage.includes('RLS')) {
    return 'Anda tidak memiliki akses ke data ini'
  }
  
  // Default
  return 'Terjadi kesalahan, silakan coba lagi'
}

/**
 * Handle API errors dan return standardized response
 */
export function handleApiError(error: unknown): ApiError {
  console.error('API Error:', error)
  
  if (error instanceof Error) {
    return {
      message: translateError(error),
      code: error.name || 'UNKNOWN_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      status: 500
    }
  }
  
  if (typeof error === 'object' && error !== null) {
    const err = error as any
    return {
      message: translateError(err),
      code: err.code || 'UNKNOWN_ERROR',
      details: process.env.NODE_ENV === 'development' ? err : undefined,
      status: err.status || 500
    }
  }
  
  return {
    message: 'Terjadi kesalahan yang tidak diketahui',
    code: 'UNKNOWN_ERROR',
    status: 500
  }
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  }
}

/**
 * Create error response
 */
export function createErrorResponse(error: unknown): ApiResponse {
  return {
    success: false,
    error: handleApiError(error)
  }
}

/**
 * Wrap async handler dengan error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<ApiResponse<T>> {
  return handler()
    .then(data => createSuccessResponse(data))
    .catch(error => createErrorResponse(error))
}
