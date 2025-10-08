import { CurrencySelector } from './CurrencySelector'

export function TopBar() {
  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-center px-4 sm:px-6">
      <CurrencySelector />
    </div>
  )
}
