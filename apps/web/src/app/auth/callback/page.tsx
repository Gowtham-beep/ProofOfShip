'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function CallbackLogic() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      localStorage.setItem('pos_token', token)
      
      // Fire and forget repo ingestion
      fetch('http://localhost:3001/repos/ingest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(console.error)

      router.replace('/dashboard')
    } else {
      router.replace('/?error=auth_failed')
    }
  }, [params, router])

  return (
    <div className="min-h-screen bg-bg flex items-center
      justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green
          border-t-transparent rounded-full animate-spin
          mx-auto mb-4"></div>
        <p className="text-muted text-sm">
          Connecting your GitHub account...
        </p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    }>
      <CallbackLogic />
    </Suspense>
  )
}
