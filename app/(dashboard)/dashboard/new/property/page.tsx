'use client'

import { Suspense } from 'react'
import QuestionnaireForm from '@/components/QuestionnaireForm'
import ClientPickerBar from '@/components/ClientPickerBar'

export default function PropertyNewPage() {
  return (
    <>
      <Suspense>
        <ClientPickerBar insuranceClass="property" />
      </Suspense>
      <QuestionnaireForm />
    </>
  )
}
