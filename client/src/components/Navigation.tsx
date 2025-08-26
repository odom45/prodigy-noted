import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, Settings, LogOut, User } from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function Navigation() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-electric-orange text-black';
      case 'participant':
        return 'bg-neon-cyan text-black';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b border-white/10" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta flex items-center justify-center font-orbitron font-bold text-black">
              PN
            </div>
            <span className="font-orbitron font-bold text-xl">Prodigy Noted</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#battles" 
              className="hover:text-neon-cyan transition-colors duration-300"
              data-testid="nav-link-battles"
            >
              Battles
            </a>
            <a 
              href="#leaderboard" 
              className="hover:text-neon-cyan transition-colors duration-300"
              data-testid="nav-link-leaderboard"
            >
              Leaderboard
            </a>
            {user?.subscriptionStatus !== 'active' && (
              <a 
                href="#subscription" 
                className="hover:text-neon-cyan transition-colors duration-300"
                data-testid="nav-link-pricing"
              >
                Pricing
              </a>
            )}
            {user?.role === 'admin' && (
              <a 
                href="/admin" 
                className="hover:text-electric-orange transition-colors duration-300"
                data-testid="nav-link-admin"
              >
                Admin
              </a>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            {user && (
              <Badge 
                className={getRoleColor(user.role)}
                data-testid="badge-user-role"
              >
                {user.role}
              </Badge>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.username || 'User'} />
                    <AvatarFallback className="bg-neon-magenta text-black">
                      {user?.username?.[0]?.toUpperCase() || user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-morphism border-gray-600">
                <DropdownMenuItem className="text-white hover:bg-white/10" data-testid="menu-item-profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <DropdownMenuItem className="text-white hover:bg-white/10" data-testid="menu-item-admin">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-gray-600" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-400/10"
                  data-testid="menu-item-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4" data-testid="mobile-menu">
            <div className="flex flex-col space-y-4">
              <a 
                href="#battles" 
                className="hover:text-neon-cyan transition-colors duration-300 py-2"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-link-battles"
              >
                Battles
              </a>
              <a 
                href="#leaderboard" 
                className="hover:text-neon-cyan transition-colors duration-300 py-2"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-nav-link-leaderboard"
              >
                Leaderboard
              </a>
              {user?.subscriptionStatus !== 'active' && (
                <a 
                  href="#subscription" 
                  className="hover:text-neon-cyan transition-colors duration-300 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-link-pricing"
                >
                  Pricing
                </a>
              )}
              {user?.role === 'admin' && (
                <a 
                  href="/admin" 
                  className="hover:text-electric-orange transition-colors duration-300 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-nav-link-admin"
                >
                  Admin Dashboard
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
