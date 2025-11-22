import { Search, Bell, User, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header = ({ onSearch }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
      <div className="container flex h-20 items-center gap-4 px-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-xl p-3 shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground hidden sm:block">
            AlzheimerCare
          </h1>
        </div>

        {/* Search Bar - Desktop */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar em todo o app..."
              className="pl-12 w-full h-12 text-lg rounded-xl"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        {/* Search Icon - Mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden w-14 h-14"
          onClick={() => {/* Toggle mobile search */}}
        >
          <Search className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-3 ml-auto">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative w-14 h-14">
            <Bell className="h-6 w-6" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-sm font-bold shadow-lg"
            >
              3
            </Badge>
          </Button>

          {/* User Profile */}
          <Button variant="ghost" size="icon" className="w-14 h-14">
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden border-t px-4 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar em todo o app..."
            className="pl-12 w-full h-14 text-lg rounded-xl"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
};
