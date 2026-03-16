// Inline SVG flag components — consistent across platforms, no emoji rendering issues
export function FlagSvg({ code, size = 24 }: { code: string; size?: number }) {
  const w = size
  const h = Math.round(size * 0.7)
  const style = { width: w, height: h, display: 'inline-block', verticalAlign: 'middle' }

  // Simple flag representations using horizontal stripes / known patterns
  const flags: Record<string, JSX.Element> = {
    at: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="7" fill="#ed2939" />
        <rect y="7" width="30" height="6" fill="#fff" />
        <rect y="13" width="30" height="7" fill="#ed2939" />
      </svg>
    ),
    gb: (
      <svg viewBox="0 0 60 30" style={style}>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" />
        <path d="M30 0V30M0 15H60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0V30M0 15H60" stroke="#C8102E" strokeWidth="6" />
      </svg>
    ),
    sa: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="20" fill="#006C35" />
        <text x="15" y="12" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="serif">&#1604;&#1575;</text>
      </svg>
    ),
    tr: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="20" fill="#E30A17" />
        <circle cx="11" cy="10" r="6" fill="#fff" />
        <circle cx="13" cy="10" r="5" fill="#E30A17" />
        <polygon points="17,10 14.5,8.5 14.5,11.5 17,10 14,7.5 14,12.5" fill="#fff" />
      </svg>
    ),
    ru: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="7" fill="#fff" />
        <rect y="7" width="30" height="6" fill="#0039A6" />
        <rect y="13" width="30" height="7" fill="#D52B1E" />
      </svg>
    ),
    jp: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="20" fill="#fff" />
        <circle cx="15" cy="10" r="6" fill="#BC002D" />
      </svg>
    ),
    cn: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="20" fill="#DE2910" />
        <polygon points="5,3 6.2,6.7 3,5 7,5 3.8,6.7" fill="#FFDE00" />
      </svg>
    ),
    fr: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="10" height="20" fill="#002395" />
        <rect x="10" width="10" height="20" fill="#fff" />
        <rect x="20" width="10" height="20" fill="#ED2939" />
      </svg>
    ),
    es: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="5" fill="#AA151B" />
        <rect y="5" width="30" height="10" fill="#F1BF00" />
        <rect y="15" width="30" height="5" fill="#AA151B" />
      </svg>
    ),
    it: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="10" height="20" fill="#009246" />
        <rect x="10" width="10" height="20" fill="#fff" />
        <rect x="20" width="10" height="20" fill="#CE2B37" />
      </svg>
    ),
    pt: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="12" height="20" fill="#006600" />
        <rect x="12" width="18" height="20" fill="#FF0000" />
        <circle cx="12" cy="10" r="4" fill="#FFCC00" stroke="#006600" strokeWidth="0.5" />
      </svg>
    ),
    nl: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="7" fill="#AE1C28" />
        <rect y="7" width="30" height="6" fill="#fff" />
        <rect y="13" width="30" height="7" fill="#21468B" />
      </svg>
    ),
    pl: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="10" fill="#fff" />
        <rect y="10" width="30" height="10" fill="#DC143C" />
      </svg>
    ),
    ua: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="10" fill="#005BBB" />
        <rect y="10" width="30" height="10" fill="#FFD500" />
      </svg>
    ),
    ir: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="7" fill="#239F40" />
        <rect y="7" width="30" height="6" fill="#fff" />
        <rect y="13" width="30" height="7" fill="#DA0000" />
      </svg>
    ),
    kr: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="20" fill="#fff" />
        <circle cx="15" cy="10" r="5" fill="#C60C30" />
        <path d="M15 5 Q20 10 15 15 Q10 10 15 5" fill="#003478" />
      </svg>
    ),
    ro: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="10" height="20" fill="#002B7F" />
        <rect x="10" width="10" height="20" fill="#FCD116" />
        <rect x="20" width="10" height="20" fill="#CE1126" />
      </svg>
    ),
    hu: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="7" fill="#CE2939" />
        <rect y="7" width="30" height="6" fill="#fff" />
        <rect y="13" width="30" height="7" fill="#477050" />
      </svg>
    ),
    rs: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="7" fill="#C6363C" />
        <rect y="7" width="30" height="6" fill="#0C4076" />
        <rect y="13" width="30" height="7" fill="#fff" />
      </svg>
    ),
    ba: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="20" fill="#002395" />
        <polygon points="8,0 22,20 8,20" fill="#FECB00" />
        <circle cx="9" cy="2" r="1.2" fill="#fff" /><circle cx="11" cy="5" r="1.2" fill="#fff" />
        <circle cx="13" cy="8" r="1.2" fill="#fff" /><circle cx="15" cy="11" r="1.2" fill="#fff" />
        <circle cx="17" cy="14" r="1.2" fill="#fff" /><circle cx="19" cy="17" r="1.2" fill="#fff" />
      </svg>
    ),
    hr_flag: (
      <svg viewBox="0 0 30 20" style={style}>
        <rect width="30" height="7" fill="#FF0000" />
        <rect y="7" width="30" height="6" fill="#fff" />
        <rect y="13" width="30" height="7" fill="#171796" />
        <rect x="11" y="4" width="8" height="8" fill="#FF0000" stroke="#fff" strokeWidth="0.5" />
      </svg>
    ),
  }

  // Map language codes to country codes
  const langToCountry: Record<string, string> = {
    de: 'at', en: 'gb', ar: 'sa', tr: 'tr', ru: 'ru', ja: 'jp',
    zh: 'cn', fr: 'fr', es: 'es', it: 'it', pt: 'pt', nl: 'nl',
    pl: 'pl', uk: 'ua', fa: 'ir', ko: 'kr', ro: 'ro', hu: 'hu',
    sr: 'rs', bs: 'ba', hr: 'hr_flag',
  }

  const countryCode = langToCountry[code]
  if (countryCode && flags[countryCode]) return flags[countryCode]

  // Fallback: monospace text label
  return (
    <span
      style={{
        ...style,
        background: 'var(--bg-secondary, rgba(0,0,0,0.05))',
        fontSize: 9,
        fontFamily: 'ui-monospace, monospace',
        fontWeight: 700,
        textAlign: 'center',
        lineHeight: `${h}px`,
      }}
    >
      {code.toUpperCase()}
    </span>
  )
}
