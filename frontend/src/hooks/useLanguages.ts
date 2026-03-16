import { useState, useEffect } from 'react'
import { getLanguageCoverage, type LanguageCoverage } from '../api/dolmtschr'

export interface LanguageOption {
  code: string
  name: string
  nativeName: string
  continent: string
  continentLabel: string
  countryCode: string
  ttsBadge: 'voice' | 'text-only'
  sttQuality: number
  translateTier: 'excellent' | 'good' | 'fair' | 'poor' | 'experimental'
  resourceLevel: 'high' | 'mid' | 'low' | 'very-low'
  ttsProvider: string | null
  translateProvider: string | null
}

export interface UseLanguagesReturn {
  languages: LanguageOption[]
  continents: Record<string, string>
  byContinent: Record<string, LanguageOption[]>
  loading: boolean
  error: string | null
}

export function useLanguages(
  ttsChain: string[],
  translateChain: string[],
): UseLanguagesReturn {
  const [data, setData] = useState<LanguageCoverage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const chainKey = `${ttsChain.join(',')}_${translateChain.join(',')}`

  useEffect(() => {
    setLoading(true)
    setError(null)
    getLanguageCoverage(ttsChain, translateChain)
      .then(setData)
      .catch((e) => {
        console.warn('useLanguages: fetch failed', e)
        setError('Failed to load languages')
      })
      .finally(() => setLoading(false))
  }, [chainKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) {
    return { languages: [], continents: {}, byContinent: {}, loading, error }
  }

  const continents = data.continents
  const languages: LanguageOption[] = Object.entries(data.languages)
    .map(([code, entry]) => ({
      code,
      name: entry.name,
      nativeName: entry.native_name,
      continent: entry.continent,
      continentLabel: continents[entry.continent] || entry.continent,
      countryCode: entry.country_code,
      ttsBadge: entry.tts_badge,
      sttQuality: entry.stt_quality,
      translateTier: entry.translate_tier,
      resourceLevel: entry.resource_level,
      ttsProvider: entry.tts_provider,
      translateProvider: entry.translate_provider,
    }))
    .sort((a, b) => a.nativeName.localeCompare(b.nativeName))

  const byContinent: Record<string, LanguageOption[]> = {}
  for (const lang of languages) {
    if (!byContinent[lang.continent]) byContinent[lang.continent] = []
    byContinent[lang.continent].push(lang)
  }

  return { languages, continents, byContinent, loading, error }
}
