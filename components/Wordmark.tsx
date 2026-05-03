type WordmarkProps = {
  className?: string
}

export default function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={className}>
      <span style={{ fontFamily: 'var(--font-calistoga)' }}>HotDog</span>
      {' '}
      <span className="text-accent" style={{ fontFamily: 'var(--font-yellowtail)', fontSize: '1.4em' }}>racing</span>
    </span>
  )
}
