import Script from 'next/script'

export default function InstagramEmbed() {
  return (
    <>
      <blockquote
        className="instagram-media w-full"
        data-instgrm-permalink="https://www.instagram.com/hotdogracingus/"
        data-instgrm-version="14"
      />
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
    </>
  )
}
