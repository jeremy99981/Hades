'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import AuthModal from './modals/AuthModal';
import { useAuth } from '../hooks/useAuth';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu utilisateur lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Accueil', path: '/' },
    { name: 'Films', path: '/movies' },
    { name: 'Séries', path: '/tv' },
    { name: 'Ma Liste', path: '/watchlist' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-[#141414]/95 backdrop-blur-md shadow-lg shadow-black/20' 
            : 'bg-gradient-to-b from-black/80 via-black/50 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-extralight tracking-widest text-white hover:text-white/90 transition-colors duration-300">
                HADES
              </span>
            </Link>

            {/* Barre de recherche centrale */}
            <div className="flex-1 px-8">
              <SearchBar />
            </div>

            {/* Navigation principale */}
            <div className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`text-sm font-light tracking-wide transition-colors duration-200 ${
                    pathname === item.path
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    className="flex items-center gap-2 text-sm font-light text-white/70 hover:text-white transition-colors duration-200 focus:outline-none"
                  >
                    <span className="flex items-center gap-1">
                      {user?.username || 'Utilisateur'}
                      <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>

                  {/* Menu déroulant */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-white text-sm font-medium truncate">
                          {user?.username}
                        </p>
                        <p className="text-white/50 text-xs truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                        >
                          Profil
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                        >
                          Paramètres
                        </Link>
                      </div>
                      <div className="border-t border-white/10 py-1">
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                        >
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm font-light text-white/70 hover:text-white transition-colors duration-200"
                >
                  Se connecter
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
