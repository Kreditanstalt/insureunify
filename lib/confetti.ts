/**
 * confetti.ts — Fire confetti animation on successful form submit.
 * Uses canvas-confetti library (lazy-loaded).
 */

export async function fireConfetti() {
  try {
    const confetti = (await import('canvas-confetti')).default
    // First burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'],
    })
    // Second burst (slight delay)
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.7, x: 0.3 },
      })
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.7, x: 0.7 },
      })
    }, 200)
  } catch {
    // Silently fail — confetti is non-critical
  }
}
