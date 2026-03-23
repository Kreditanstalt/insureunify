'use client'

import { Suspense } from 'react'
import OAQuestionnaireForm from '@/components/OAQuestionnaireForm'
import ClientPickerBar from '@/components/ClientPickerBar'

export default function OccupationalAccidentPage() {
  return (
    <>
      <Suspense>
        <ClientPickerBar insuranceClass="occupational_accident" />
      </Suspense>
      <OAQuestionnaireForm />
    </>
  )
}
