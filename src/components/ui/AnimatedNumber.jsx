import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

/**
 * Animates a numeric display from its previous value to `value` whenever it
 * changes. Falls back to plain text for non-numeric values (e.g. "—") so
 * callers don't need to branch themselves.
 */
export default function AnimatedNumber({ value, decimals = 0, suffix = '', prefix = '' }) {
  const nodeRef = useRef(null)
  const prevRef = useRef(0)

  const numeric = typeof value === 'number' ? value : Number(value)
  const isNumeric = !Number.isNaN(numeric) && value !== null && value !== undefined && value !== ''

  useEffect(() => {
    if (!isNumeric || !nodeRef.current) return
    const from = prevRef.current
    const controls = animate(from, numeric, {
      duration: 0.7,
      ease: 'easeOut',
      onUpdate(v) {
        if (nodeRef.current) nodeRef.current.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`
      },
    })
    prevRef.current = numeric
    return () => controls.stop()
  }, [numeric, isNumeric, decimals, prefix, suffix])

  if (!isNumeric) return <span>{value}</span>
  return <span ref={nodeRef}>{prefix}{numeric.toFixed(decimals)}{suffix}</span>
}
