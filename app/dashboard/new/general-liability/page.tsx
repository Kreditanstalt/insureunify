'use client'

import { Suspense } from 'react'
import GLQuestionnaireForm from '@/components/GLQuestionnaireForm'
import ClientPickerBar from '@/components/ClientPickerBar'

export default function GeneralLiabilityPage() {
  return (
    <>
      <Suspense>
        <ClientPickerBar insuranceClass="general_liability" />
      </Suspense>
      <GLQuestionnaireForm />
    </>
  )
}
