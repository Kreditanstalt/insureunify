'use client'

import { Suspense } from 'react'
import TCQuestionnaireForm from '@/components/TCQuestionnaireForm'
import ClientPickerBar from '@/components/ClientPickerBar'

export default function TradeCreditPage() {
  return (
    <>
      <Suspense>
        <ClientPickerBar insuranceClass="trade_credit" />
      </Suspense>
      <TCQuestionnaireForm />
    </>
  )
}
