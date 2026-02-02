import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Kanban, 
  ListTodo, 
  Users, 
  Settings,
  LogOut,
  ChevronDown,
  Bike
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useSmartQueue } from '@/hooks/useSmartQueue';
import { UserRole } from '@/types';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['sales', 'administration', 'workshop', 'manager'] },
  { to: '/deals', icon: Kanban, label: 'Deals', roles: ['sales', 'administration', 'manager'] },
  { to: '/queue', icon: ListTodo, label: 'Smart Queue', roles: ['sales', 'administration', 'workshop', 'manager'] },
  { to: '/customers', icon: Users, label: 'Klanten', roles: ['sales', 'administration', 'manager'] },
];

const roleLabels: Record<UserRole, string> = {
  sales: 'Verkoop',
  administration: 'Administratie',
  workshop: 'Werkplaats',
  manager: 'Manager',
};

export function Sidebar() {
  const { user, logout, switchRole } = useAuth();
  const { urgentCount } = useSmartQueue();

  if (!user) return null;

  const visibleItems = navItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Bike className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">MotoDealer</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeClassName="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.to === '/queue' && urgentCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {urgentCount}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => switchRole('sales')}>
                <span className={cn(user.role === 'sales' && 'font-bold')}>Verkoop</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole('administration')}>
                <span className={cn(user.role === 'administration' && 'font-bold')}>Administratie</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole('workshop')}>
                <span className={cn(user.role === 'workshop' && 'font-bold')}>Werkplaats</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole('manager')}>
                <span className={cn(user.role === 'manager' && 'font-bold')}>Manager</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Uitloggen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
