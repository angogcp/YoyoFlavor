import { useEffect } from 'react'

type Props = {
  title?: string
  description?: string
  locale?: 'en' | 'zh'
  canonicalPath?: string
  ogImage?: string
  address?: string
}

export default function SEO({ title, description, locale = 'en', canonicalPath, ogImage, address }: Props) {
  useEffect(() => {
    if (title) document.title = title
    const metaDesc = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'description')
      document.head.appendChild(m)
      return m
    })()
    if (description) metaDesc.setAttribute('content', description)

    const origin = window.location.origin
    const path = canonicalPath || window.location.pathname
    const canonicalHref = origin + path
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalHref

    function ensureOg(name: string): HTMLMetaElement {
      let el = document.querySelector(`meta[property="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta') as HTMLMetaElement
        el.setAttribute('property', name)
        document.head.appendChild(el)
      }
      return el
    }
    function ensureTw(name: string): HTMLMetaElement {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta') as HTMLMetaElement
        el.setAttribute('name', name)
        document.head.appendChild(el)
      }
      return el
    }
    if (title) ensureOg('og:title').setAttribute('content', title)
    if (description) ensureOg('og:description').setAttribute('content', description)
    ensureOg('og:url').setAttribute('content', canonicalHref)
    if (ogImage) ensureOg('og:image').setAttribute('content', ogImage)

    if (title) ensureTw('twitter:title').setAttribute('content', title)
    if (description) ensureTw('twitter:description').setAttribute('content', description)
    if (ogImage) ensureTw('twitter:image').setAttribute('content', ogImage)

    const altEn = document.querySelector('link[rel="alternate"][hreflang="en"]') as HTMLLinkElement | null
    const altZh = document.querySelector('link[rel="alternate"][hreflang="zh"]') as HTMLLinkElement | null
    const parts = path.split('/').filter(Boolean)
    parts[0] = 'en'
    const enHref = origin + '/' + parts.join('/')
    parts[0] = 'zh'
    const zhHref = origin + '/' + parts.join('/')
    const setAlt = (el: HTMLLinkElement | null, lang: string, href: string) => {
      if (!el) {
        const l = document.createElement('link')
        l.rel = 'alternate'
        l.hreflang = lang
        l.href = href
        document.head.appendChild(l)
        return
      }
      el.href = href
    }
    setAlt(altEn, 'en', enHref)
    setAlt(altZh, 'zh', zhHref)

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: 'YoYo Flavor',
      image: ogImage || canonicalHref,
      servesCuisine: ['Chinese','Japanese','Western'],
      url: window.location.origin,
      address: { '@type': 'PostalAddress', streetAddress: address || '324 Jalan Bercham, Taman Medan Bercham, 31400 Ipoh, Perak, Malaysia' },
      openingHours: ['Mo-Fr 11:00-22:00','Sa-Su 10:00-23:00']
    }
    let script = document.getElementById('ld-json') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'ld-json'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.text = JSON.stringify(ld)
    document.documentElement.lang = locale
  }, [title, description, locale])
  return null
}
