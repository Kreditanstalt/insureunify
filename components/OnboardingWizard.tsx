'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    icon: '👋',
    title: 'Добре дошли в InsureUnify!',
    desc: 'Единна платформа за попълване на застрахователни въпросници. Попълвате веднъж — генерирате за всички застрахователи.',
  },
  {
    icon: '📝',
    title: 'Изберете клас застраховка',
    desc: 'Имущество, ОГО, Трудова злополука, Професионална отговорност или Търговски кредит. Въведете ЕИК и данните се попълват автоматично.',
  },
  {
    icon: '📄',
    title: 'Генерирайте PDF за всеки застраховател',
    desc: 'Прегледайте данните, изтеглете PDF формуляри за Булстрад, Дженерали, ОЗК и още. Сравнете офертите на едно място.',
  },
]

export default function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('iu_onboarding_done')
    if (!dismissed) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem('iu_onboarding_done', '1')
    setVisible(false)
  }

  function handleDemo() {
    dismiss()
    router.push('/dashboard/new/property')
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-200'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="px-8 pt-6 pb-4 text-center">
          <div className="text-5xl mb-4">{STEPS[step].icon}</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">{STEPS[step].title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{STEPS[step].desc}</p>
        </div>

        {/* Actions */}
        <div className="px-8 pb-6 space-y-2">
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Продължи
            </button>
          ) : (
            <>
              <button
                onClick={handleDemo}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Създайте първото запитване &rarr;
              </button>
              <button
                onClick={dismiss}
                className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Разбрах, затвори
              </button>
            </>
          )}
          {step < STEPS.length - 1 && (
            <button onClick={dismiss} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors">
              Пропусни
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
