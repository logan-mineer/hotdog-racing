type LogoProps = {
  className?: string
}

export default function Logo({ className }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/logo.svg" alt="" aria-hidden="true" className={className} />
  )
}
