type WordmarkProps = {
  className?: string
  stacked?: boolean
}

export default function Wordmark({ className, stacked }: WordmarkProps) {
  if (stacked) {
    return (
      <span className={className}>
        <span className="block leading-none" style={{ fontFamily: 'var(--font-calistoga)' }}>HotDog</span>
        <span className="block text-accent leading-none" style={{ fontFamily: 'var(--font-yellowtail)', fontSize: '1.4em', marginTop: '-0.4em' }}>racing</span>
      </span>
    )
  }
  return (
    <span className={className}>
      <span style={{ fontFamily: 'var(--font-calistoga)' }}>HotDog</span>
      {' '}
      <span className="text-accent" style={{ fontFamily: 'var(--font-yellowtail)', fontSize: '1.4em' }}>racing</span>
    </span>
  )
}
