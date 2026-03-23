'use client'

import { Suspense } from 'react'
import PLQuestionnaireForm from '@/components/PLQuestionnaireForm'
import ClientPickerBar from '@/components/ClientPickerBar'

export default function PLNewPage() {
  return (
    <>
      <Suspense>
        <ClientPickerBar insuranceClass="professional_liability" />
      </Suspense>
      <PLQuestionnaireForm />
    </>
  )
}
