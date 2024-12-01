'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import AuthModal from './modals/AuthModal';
import { useAuth } from '../hooks/useAuth.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  FilmIcon,
  TvIcon,
  HeartIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Accueil', path: '/', icon: HomeIcon },
    { name: 'Films', path: '/movies', icon: FilmIcon },
    { name: 'Séries', path: '/tv', icon: TvIcon },
    { name: 'Ma Liste', path: '/watchlist', icon: HeartIcon },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500
  ${isScrolled
          ? 'bg-[#1a1a1a]/80 shadow-sm shadow-black/5'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent border-b-0'}`}

    >
      <div className="max-w-7xl mx-auto">
        <div className="h-16 px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-light tracking-widest text-white/90 hover:text-white transition-colors"
          >
            HADES
          </Link>

          {/* Navigation principale - Desktop */}
          <div className="hidden md:flex items-center justify-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all
                  ${pathname === item.path
                    ? 'text-white bg-white/10 shadow-sm shadow-black/5 backdrop-blur-xl'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <SearchBar />

            {isAuthenticated ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 rounded-full hover:bg-white/[0.05] active:bg-white/[0.1] transition-colors relative group"
              >
                <UserCircleIcon className="w-5 h-5 text-white/80 group-hover:text-white" />

                {/* Menu déroulant du compte */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-[#1a1a1a]/90 backdrop-blur-2xl
                        shadow-xl shadow-black/10 ring-1 ring-white/10 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-sm font-medium text-white/90">{user?.username}</p>
                        <p className="text-xs text-white/50 truncate mt-0.5">{user?.email}</p>
                      </div>

                      <div className="p-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/70
                            hover:text-white hover:bg-white/[0.06] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Cog6ToothIcon className="w-4 h-4" />
                          Paramètres
                        </Link>

                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/70
                            hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-white
                  bg-white/10 hover:bg-white/[0.15] active:bg-white/[0.1] backdrop-blur-xl
                  transition-all shadow-sm shadow-black/5"
              >
                Connexion
              </button>
            )}

            {/* Bouton menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -mr-2 rounded-full hover:bg-white/[0.05] md:hidden transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5 text-white/80" />
              ) : (
                <Bars3Icon className="w-5 h-5 text-white/80" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-[#1a1a1a]/95 backdrop-blur-2xl border-t border-white/[0.06]"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${pathname === item.path
                      ? 'text-white bg-white/10 shadow-sm shadow-black/5'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}

export default Navbar;
