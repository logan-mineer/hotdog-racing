import InstallPrompt from '@/components/InstallPrompt'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPrompt />
    </>
  )
}
