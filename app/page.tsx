'use client'

import { useEffect } from "react"

export default function Home() {
  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme')

    const hasThemeInCookie = document.cookie.includes('theme=')
    if (hasThemeInCookie) {
      return
    }

    if (!theme) {
      return
    }

    document.cookie = `theme=${theme};path=/;max-age=31536000`

  }, [])
  return <div>works</div>
}
