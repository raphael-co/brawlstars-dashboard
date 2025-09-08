
'use client'
import { useEffect, useState } from 'react'

export default function OwnedToggle({ skinId }: { skinId: number }) {
  const key = `skin-owned-${skinId}`
  const [mounted, setMounted] = useState(false)
  const [owned, setOwned] = useState(false)

  useEffect(() => {
    setMounted(true)
    try { setOwned(localStorage.getItem(key) === '1') } catch {}
  }, [key])

  function toggle() {
    const v = !owned
    setOwned(v)
    try { localStorage.setItem(key, v ? '1' : '0') } catch {}
  }

  if (!mounted) return <span className="badge">Manquant</span>

  return (
    <button onClick={toggle} className="badge">
      {owned ? 'Possédé' : 'Manquant'}
    </button>
  )
}
