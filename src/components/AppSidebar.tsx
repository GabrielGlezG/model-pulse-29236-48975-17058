import { BarChart3, Upload, Lightbulb, Car, Scale } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Cargar Datos", url: "/upload", icon: Upload },
  { title: "Comparar", url: "/compare", icon: Scale },
  { title: "Insights", url: "/insights", icon: Lightbulb },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const collapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="border-r shadow-lg">
      <SidebarContent className="animate-slide-in-right">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 px-4 py-3 bg-primary/5 rounded-lg mx-2 mt-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Car className="h-4 w-4 text-primary" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm">ModelPulse</span>
                <span className="text-xs text-muted-foreground">Analytics</span>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item, index) => (
                <SidebarMenuItem key={item.title} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center gap-3 rounded-lg transition-all duration-200 hover-scale ${
                        isActive(item.url) 
                          ? 'bg-primary/10 text-primary shadow-sm' 
                          : 'hover:bg-primary/5'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}