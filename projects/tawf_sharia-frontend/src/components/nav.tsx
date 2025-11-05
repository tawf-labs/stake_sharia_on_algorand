import React, { useState, useEffect, memo } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { Star } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import ConnectWallet from './ConnectWallet'
import Transact from './Transact'
import AppCalls from './AppCalls'

const Navbar: React.FC = memo(() => {
  const [scrolled, setScrolled] = useState(false)
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [openDemoModal, setOpenDemoModal] = useState(false)
  const [appCallsDemoModal, setAppCallsDemoModal] = useState(false)
  const { activeAddress } = useWallet()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)
  const toggleDemoModal = () => setOpenDemoModal(!openDemoModal)
  const toggleAppCallsModal = () => setAppCallsDemoModal(!appCallsDemoModal)

  const shortAddress = activeAddress
    ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
    : ''

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/staking', label: 'Staking' },
    { path: '/withdraw', label: 'Withdraw' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-8 py-6 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-slate-950/70 shadow-lg shadow-emerald-500/10'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* === LOGO === */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white">Tawf Sharia</span>
        </div>

        {/* === NAV LINKS === */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  active
                    ? 'text-emerald-400 font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    active ? 'bg-emerald-500' : 'bg-gray-600'
                  }`}
                ></span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* === WALLET BUTTON === */}
        <button
          onClick={toggleWalletModal}
          className={`flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all shadow-lg ${
            activeAddress
              ? 'bg-gradient-to-r from-gray-800 to-slate-700 hover:from-gray-700 hover:to-slate-600 text-emerald-300 shadow-emerald-500/20'
              : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50'
          }`}
        >
          {activeAddress ? (
            <>
              <Star className="w-4 h-4 fill-emerald-400" />
              <span>{shortAddress}</span>
            </>
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>

        {/* === MODALS === */}
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
        <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
        <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} />
      </div>
    </header>
  )
})

Navbar.displayName = 'Navbar'
export default Navbar
