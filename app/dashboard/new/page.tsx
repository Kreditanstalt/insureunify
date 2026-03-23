'use client'

import { Suspense } from 'react'
import QuestionnaireForm from '@/components/QuestionnaireForm'
import ClientPickerBar from '@/components/ClientPickerBar'

export default function NewQuestionnairePage() {
  return (
    <>
      <Suspense>
        <ClientPickerBar insuranceClass="property" />
      </Suspense>
      <QuestionnaireForm />
    </>
  )
}
