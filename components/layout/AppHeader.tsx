import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { 
  User, 
  MessageSquare, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  MessageCircle
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { useToast } from '../ui/UIProvider'
import { ConfirmDialog } from '../ui/dialog'
import Avatar from '../ui/Avatar'
import { signOut, supabase } from '../../lib/supabase'
import { ROUTES } from '../../utils/constants'
import Dropdown, { DropdownItem } from '../ui/Dropdown'
import ProfileModal from '../profile/ProfileModal'

interface AppHeaderProps {
  showAuthButtons?: boolean
}

export default function AppHeader({ showAuthButtons = true }: AppHeaderProps) {
  const { user } = useAuth()
  const { profile } = useProfile()
  const toast = useToast()
  const router = useRouter()
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Handle scroll effects for translucent header
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsScrolled(scrolled)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
      setMobileMenuOpen(false)
      setShowLogoutConfirm(false)
      toast.success('Signed out successfully', {
        description: 'You have been signed out of your account.',
        duration: 3000
      })
      router.push(ROUTES.HOME)
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Sign out failed', {
        description: 'An error occurred while signing out. Please try again.',
        duration: 5000
      })
    } finally {
      setLoggingOut(false)
    }
  }

  const handleBecomeLocal = () => {
    setMobileMenuOpen(false)
    router.push(ROUTES.BECOME_A_LOCAL)
  }

  const handleMyLocalProfile = () => {
    setMobileMenuOpen(false)
    router.push(ROUTES.REQUESTS)
  }

  // Load avatar URL when profile changes
  useEffect(() => {
    if (profile?.avatar_url) {
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(profile.avatar_url)
      setAvatarUrl(data.publicUrl)
    } else {
      setAvatarUrl(null)
    }
  }, [profile?.avatar_url])

  // Navigation items for mobile menu
  const navigationItems = [
    { href: ROUTES.FEEDBACK, label: 'Feedback', icon: MessageCircle },
    ...(showAuthButtons && !user ? [
      { href: ROUTES.JOIN, label: 'Join', variant: 'secondary' as const },
      { href: ROUTES.LOGIN, label: 'Login', variant: 'primary' as const }
    ] : []),
  ]

  const profileItems = user && profile ? [
    {
      label: 'Profile Settings',
      icon: User,
      onClick: () => {
        setProfileModalOpen(true)
        setMobileMenuOpen(false)
      }
    },
    ...(profile.is_local ? [{
      label: 'My Local Profile',
      icon: MessageSquare,
      onClick: handleMyLocalProfile
    }] : []),
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout
    }
  ] : []

  return (
    <>
      <motion.header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-[color:var(--border)] shadow-sm'
            : 'bg-transparent'
        }`}
        initial={false}
        animate={{
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0)',
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto section-gutter">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              href={ROUTES.HOME} 
              className="text-2xl font-bold text-[color:var(--brand)] hover:text-[color:var(--brand-600)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 rounded-lg px-1"
              tabIndex={0}
            >
              LocalGuide
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href={ROUTES.FEEDBACK} 
                className="text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 rounded-lg px-2 py-1"
              >
                Feedback
              </Link>

              {showAuthButtons && !user && (
                <div className="flex items-center space-x-3">
                  <Link 
                    href={ROUTES.JOIN} 
                    className="text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 rounded-lg px-2 py-1"
                  >
                    Join
                  </Link>
                  <Link 
                    href={ROUTES.LOGIN} 
                    className="btn-brand focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                  >
                    Login
                  </Link>
                </div>
              )}
              
              {user && profile && (
                <div className="flex items-center space-x-4">
                  {/* Local/Traveler toggle button */}
                  {profile.is_local ? (
                    <button
                      onClick={() => router.push(ROUTES.EXPLORE)}
                      className="btn-secondary text-sm focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                    >
                      My Traveler Profile
                    </button>
                  ) : (
                    <button
                      onClick={handleBecomeLocal}
                      className="btn-secondary text-sm focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                    >
                      Become a Local
                    </button>
                  )}

                  {/* Profile dropdown */}
                  <Dropdown
                    trigger={
                      <button 
                        className="flex items-center space-x-2 text-[color:var(--ink)] hover:text-[color:var(--brand)] transition-colors p-2 rounded-xl hover:bg-[color:var(--bg-soft)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                        aria-label={`Profile menu for ${profile.full_name}`}
                      >
                        <Avatar
                          src={avatarUrl}
                          alt={`${profile.full_name} avatar`}
                          size={32}
                          fallbackText={profile.full_name}
                          priority={true}
                          className="ring-2 ring-[color:var(--border)]"
                        />
                        <span className="text-sm font-medium hidden lg:block">{profile.full_name}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    }
                  >
                    <DropdownItem onClick={() => setProfileModalOpen(true)}>
                      <User className="w-4 h-4" />
                      Profile Settings
                    </DropdownItem>
                    {profile.is_local && (
                      <DropdownItem onClick={handleMyLocalProfile}>
                        <MessageSquare className="w-4 h-4" />
                        My Local Profile
                      </DropdownItem>
                    )}
                    <DropdownItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                      Logout
                    </DropdownItem>
                  </Dropdown>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[color:var(--ink)] hover:text-[color:var(--brand)] hover:bg-[color:var(--bg-soft)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Dialog */}
      <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            />
          </Dialog.Overlay>
          <Dialog.Content asChild>
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white border-l border-[color:var(--border)] z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[color:var(--border)]">
                  <span className="text-lg font-semibold text-[color:var(--ink)]">Menu</span>
                  <Dialog.Close asChild>
                    <button 
                      className="p-2 text-[color:var(--muted-ink)] hover:text-[color:var(--ink)] hover:bg-[color:var(--bg-soft)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-6 space-y-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 ${
                        item.variant === 'primary'
                          ? 'btn-brand text-white justify-center'
                          : item.variant === 'secondary'
                          ? 'btn-secondary justify-center'
                          : 'text-[color:var(--ink)] hover:bg-[color:var(--bg-soft)]'
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}

                  {user && profile && (
                    <>
                      <div className="border-t border-[color:var(--border)] pt-4 mt-6">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 px-4 py-3 mb-4">
                          <Avatar
                            src={avatarUrl}
                            alt={`${profile.full_name} avatar`}
                            size={40}
                            fallbackText={profile.full_name}
                            priority={true}
                            className="ring-2 ring-[color:var(--border)]"
                          />
                          <div>
                            <div className="text-sm font-medium text-[color:var(--ink)]">{profile.full_name}</div>
                            <div className="text-xs text-[color:var(--muted-ink)]">
                              {profile.is_local ? 'Local Expert' : 'Traveler'}
                            </div>
                          </div>
                        </div>

                        {/* Local/Traveler toggle */}
                        {profile.is_local ? (
                          <button
                            onClick={() => {
                              router.push(ROUTES.EXPLORE)
                              setMobileMenuOpen(false)
                            }}
                            className="w-full btn-secondary justify-center mb-4 focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                          >
                            My Traveler Profile
                          </button>
                        ) : (
                          <button
                            onClick={handleBecomeLocal}
                            className="w-full btn-secondary justify-center mb-4 focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                          >
                            Become a Local
                          </button>
                        )}
                      </div>

                      {/* Profile Actions */}
                      <div className="space-y-2">
                        {profileItems.map((item, index) => (
                          <button
                            key={index}
                            onClick={item.onClick}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-[color:var(--ink)] hover:bg-[color:var(--bg-soft)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2 text-left"
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </nav>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        variant="default"
        loading={loggingOut}
      />
    </>
  )
}