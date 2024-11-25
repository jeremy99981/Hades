'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import SearchBar from './SearchBar'

const Navbar = () => {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Accueil', path: '/' },
    { name: 'Films', path: '/movies' },
    { name: 'Séries', path: '/tv' },
    { name: 'Ma Liste', path: '/watchlist' },
  ]

  return (
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
            <button className="text-sm font-light text-white/70 hover:text-white transition-colors duration-200">
              Se connecter
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
