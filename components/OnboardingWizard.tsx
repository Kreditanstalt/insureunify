'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS = [
  {
    title: 'Добре дошли в InsureUnify!',
    desc: 'Попълвате ЕДИН въпросник — генерирате PDF за ВСИЧКИ застрахователи.',
  },
  {
    title: 'Въведете ЕИК — данните се попълват',
    desc: 'CompanyBook.bg API автоматично зарежда фирма, адрес, дейност. Вие само допълвате.',
  },
  {
    title: 'Генерирайте и сравнете',
    desc: 'PDF за Булстрад, Дженерали, ОЗК и още. Сравнете офертите на едно място.',
  },
]

// ─── Animated mockup screens ─────────────────────────────────────────────────

function MockStep1() {
  return (
    <div className="relative bg-gray-50 rounded-xl border border-gray-200 p-3 h-48 overflow-hidden">
      {/* Mini sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-white border-r border-gray-100 flex flex-col items-center py-2 gap-2">
        <div className="h-5 w-5 rounded bg-blue-600" />
        <div className="h-1 w-4 rounded bg-gray-200" />
        <div className="h-1 w-4 rounded bg-gray-200" />
        <div className="h-1 w-4 rounded bg-blue-200" />
        <div className="h-1 w-4 rounded bg-gray-200" />
      </div>
      {/* Main area */}
      <div className="ml-12 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded bg-gray-300" />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="h-5 w-20 rounded-md bg-blue-600 flex items-center justify-center">
            <span className="text-[6px] text-white font-bold">+ Ново</span>
          </motion.div>
        </div>
        {/* Class cards */}
        <div className="flex gap-1.5">
          {['🏢', '⚖️', '🛡️', '⚡', '💳'].map((icon, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`flex-1 rounded-lg border p-2 text-center ${i === 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <span className="text-sm">{icon}</span>
              <div className="h-1 w-full rounded bg-gray-200 mt-1" />
            </motion.div>
          ))}
        </div>
        {/* Recent items */}
        {[0, 1, 2].map((i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.15 }}
            className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 p-1.5">
            <div className="h-5 w-5 rounded-full bg-green-100" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-20 rounded bg-gray-300" />
              <div className="h-1 w-12 rounded bg-gray-200" />
            </div>
            <div className="h-1 w-8 rounded bg-gray-200" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function MockStep2() {
  const [filled, setFilled] = useState(false)
  useEffect(() => { const t = setTimeout(() => setFilled(true), 800); return () => clearTimeout(t) }, [])

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 h-48 overflow-hidden">
      <div className="space-y-2">
        {/* EIK field */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="h-1.5 w-6 rounded bg-gray-300 mb-1" />
            <div className="h-7 rounded-lg border border-gray-200 bg-white px-2 flex items-center">
              <motion.span initial={{ width: 0 }} animate={{ width: 'auto' }} transition={{ delay: 0.3, duration: 0.5 }}
                className="text-[9px] font-mono text-gray-700 overflow-hidden whitespace-nowrap">
                131393307
              </motion.span>
            </div>
          </div>
          <motion.div initial={{ scale: 0 }} animate={{ scale: filled ? 1 : 0 }} transition={{ type: 'spring', delay: 0.1 }}
            className="mt-3 h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </motion.div>
        </div>
        {/* Auto-filled fields */}
        {[
          { label: 'Фирма', value: 'КУРИЕР ТУДЕЙ ООД' },
          { label: 'Адрес', value: 'гр. София, бул. Ботевградско шосе 247' },
          { label: 'Дейност', value: 'КУРИЕРСКИ УСЛУГИ, ТЪРГОВИЯ' },
        ].map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: filled ? 1 : 0 }} transition={{ delay: i * 0.2 }}>
            <div className="h-1.5 w-10 rounded bg-gray-300 mb-0.5" />
            <div className="h-6 rounded-lg border border-emerald-200 bg-emerald-50 px-2 flex items-center">
              <span className="text-[8px] text-emerald-800 truncate">{f.value}</span>
            </div>
          </motion.div>
        ))}
        {filled && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-[8px] text-emerald-600 flex items-center gap-1">
            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            6 полета попълнени от Търговски регистър
          </motion.p>
        )}
      </div>
    </div>
  )
}

function MockStep3() {
  const [showPdf, setShowPdf] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShowPdf(true), 600); return () => clearTimeout(t) }, [])

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 h-48 overflow-hidden">
      <div className="space-y-2">
        {/* Insurer tabs */}
        <div className="flex gap-1">
          {[
            { name: 'Булстрад', color: '#0B3D91' },
            { name: 'Дженерали', color: '#C8102E' },
            { name: 'ОЗК', color: '#1B3F8B' },
          ].map((ins, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }}
              className="flex items-center gap-1 rounded-lg px-2 py-1 bg-white border border-gray-200">
              <div className="h-3 w-3 rounded" style={{ backgroundColor: ins.color }} />
              <span className="text-[7px] font-semibold text-gray-700">{ins.name}</span>
            </motion.div>
          ))}
        </div>
        {/* PDF preview */}
        <AnimatePresence>
          {showPdf && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-200 p-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-[#0B3D91] flex items-center justify-center">
                    <span className="text-[5px] text-white font-bold">B</span>
                  </div>
                  <span className="text-[8px] font-bold text-gray-800">Булстрад — КУРИЕР ТУДЕЙ</span>
                </div>
                <span className="text-[7px] text-gray-400">23 полета</span>
              </div>
              <div className="h-px bg-[#0B3D91]" />
              {[0, 1, 2].map((i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex gap-2">
                  <div className="h-1.5 w-16 rounded bg-gray-200" />
                  <div className="h-1.5 w-24 rounded bg-gray-300" />
                </motion.div>
              ))}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }}
                className="flex items-center gap-1 mt-1">
                <div className="rounded bg-blue-600 px-2 py-0.5">
                  <span className="text-[6px] text-white font-bold">Преглед PDF</span>
                </div>
                <div className="rounded bg-emerald-600 px-2 py-0.5">
                  <span className="text-[6px] text-white font-bold">Сравни оферти</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const MOCK_SCREENS = [MockStep1, MockStep2, MockStep3]

// ─── Main component ──────────────────────────────────────────────────────────

export default function OnboardingWizard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  const storageKey = user ? `iu_onboarding_done_${user.id}` : null

  useEffect(() => {
    if (loading || !storageKey) return
    const dismissed = localStorage.getItem(storageKey)
    if (!dismissed) setVisible(true)
  }, [loading, storageKey])

  function dismiss() {
    if (storageKey) localStorage.setItem(storageKey, '1')
    setVisible(false)
  }

  function handleStart() {
    dismiss()
    router.push('/dashboard/new/property')
  }

  if (!visible) return null

  const MockScreen = MOCK_SCREENS[step]

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${i === step ? 'w-8 bg-blue-600' : i < step ? 'w-4 bg-blue-300' : 'w-1.5 bg-gray-200'}`}
            />
          ))}
        </div>

        {/* Animated mockup screen */}
        <div className="px-6 pt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <MockScreen />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text */}
        <div className="px-8 pt-4 pb-2 text-center">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <h2 className="text-base font-bold text-gray-900 mb-1">{STEPS[step].title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{STEPS[step].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step counter */}
        <div className="text-center">
          <span className="text-[10px] text-gray-400">{step + 1} / {STEPS.length}</span>
        </div>

        {/* Actions */}
        <div className="px-8 pb-6 pt-3 space-y-2">
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Продължи
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </button>
          ) : (
            <>
              <button
                onClick={handleStart}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Създайте първото запитване &rarr;
              </button>
              <button
                onClick={dismiss}
                className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Към Dashboard-а
              </button>
            </>
          )}
          {step < STEPS.length - 1 && (
            <button onClick={dismiss} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors">
              Пропусни
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
