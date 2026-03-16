interface FlagProps {
  countryCode: string
  size?: number
}

export function Flag({ countryCode, size = 24 }: FlagProps) {
  const h = Math.round(size * 0.7)
  return (
    <svg
      width={size}
      height={h}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <use href={`/flags.svg#flag-${countryCode}`} width={size} height={h} />
    </svg>
  )
}
