
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCategories } from '@/services/data-service';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between p-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-neura-600 text-white font-bold p-2 rounded-md">NR</div>
          <span className="font-bold text-xl">NeuraRig</span>
        </Link>

        {/* Search on desktop */}
        {!isMobile && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
              />
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-neura-600 transition-colors">
              Home
            </Link>
            <Link to="/categories" className="text-sm font-medium hover:text-neura-600 transition-colors">
              Categories
            </Link>
            <Link to="/pc-builder" className="text-sm font-medium hover:text-neura-600 transition-colors">
              PC Builder
            </Link>
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-neura-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        )}

        {/* Mobile Navigation Toggle */}
        {isMobile && (
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-neura-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div className="fixed top-[72px] left-0 right-0 bottom-0 bg-white z-50 p-4 flex flex-col gap-4 animate-fade-in">
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
            />
          </div>
          <Link 
            to="/" 
            className="p-3 border-b hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/categories" 
            className="p-3 border-b hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Categories
          </Link>
          <Link 
            to="/pc-builder" 
            className="p-3 border-b hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            PC Builder
          </Link>
          <div className="flex flex-col gap-2 mt-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Categories</h3>
            {categories?.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="p-2 text-sm hover:bg-muted rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
