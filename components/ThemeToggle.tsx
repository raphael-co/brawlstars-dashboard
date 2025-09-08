
'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return (
      <button className="button" aria-hidden>
        <Sun className="size-4" />
        <span className="text-sm">Theme</span>
      </button>
    )
  }
  const isDark = resolvedTheme === 'dark'
  return (
    <button
      className="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Basculer le thème"
      title="Basculer le thème"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="text-sm">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
