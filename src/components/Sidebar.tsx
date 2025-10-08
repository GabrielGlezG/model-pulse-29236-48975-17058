import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Upload, Lightbulb, Scale, TrendingUp, Users, ChevronLeft, ChevronRight, Menu, X, LogOut, Crown, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from './custom/Badge'
import logo from '@/assets/pricing-engine-logo-new.png'

interface SidebarProps {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut, isAdmin, hasActiveSubscription } = useAuth()

  const items = [
    { title: 'Dashboard', url: '/', icon: BarChart3, requireAdmin: false },
    { title: 'Cargar Datos', url: '/upload', icon: Upload, requireAdmin: true },
    { title: 'Comparar', url: '/compare', icon: Scale, requireAdmin: false },
    { title: 'Evolución de Precios', url: '/price-evolution', icon: TrendingUp, requireAdmin: false },
    { title: 'Insights', url: '/insights', icon: Lightbulb, requireAdmin: false },
    { title: 'Admin', url: '/admin', icon: Users, requireAdmin: true },
  ]

  const filteredItems = items.filter(item => !item.requireAdmin || isAdmin)
  const isActive = (path: string) => location.pathname === path

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getSubscriptionStatus = () => {
    if (!profile) return { text: 'Configurando...', variant: 'default' as const }
    if (isAdmin) return { text: 'Admin', variant: 'copper' as const }
    if (hasActiveSubscription) return { text: 'Premium', variant: 'success' as const }
    return { text: 'Sin Acceso', variant: 'default' as const }
  }

  const subscriptionStatus = getSubscriptionStatus()
  const displayName = profile?.name || user?.email || 'Usuario'
  const displayEmail = profile?.email || user?.email || ''

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-full bg-card border-r border-border flex flex-col transition-all duration-300 relative
        ${isMobileOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden'} md:flex`}>

        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center md:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Collapse/Expand button for desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 hidden md:flex"
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <img src={logo} alt="PricingEngine" className={`${isCollapsed ? 'h-16 w-16 mx-auto' : 'h-24 sm:h-28 w-auto mx-4'} object-contain transition-all duration-300 mt-8 mb-6`} />

        <nav className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto">
          {filteredItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.url)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm sm:text-base">{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        {user && !isCollapsed && (
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm flex-shrink-0">
                {getInitials(displayName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  {profile && isAdmin && <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                <Badge variant={subscriptionStatus.variant} className="mt-1">{subscriptionStatus.text}</Badge>
              </div>
            </div>

            {profile && !isAdmin && (
              <button
                onClick={() => {
                  navigate('/subscription')
                  setIsMobileOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Suscripción</span>
              </button>
            )}

            <button
              onClick={() => {
                signOut()
                setIsMobileOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        )}

        {/* Collapsed user section */}
        {user && isCollapsed && (
          <div className="p-2 border-t border-border">
            <button
              onClick={() => {
                signOut()
                setIsMobileOpen(false)
              }}
              className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-muted transition-colors text-destructive"
              title="Cerrar Sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
