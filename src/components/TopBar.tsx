import { CurrencySelector } from './CurrencySelector'
import { Menu } from 'lucide-react'

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <div className="h-16 bg-card border-b border-border flex items-center px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="md:hidden mr-3 h-10 w-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors flex-shrink-0"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1 flex items-center justify-center">
        <CurrencySelector />
      </div>
    </div>
  )
}
