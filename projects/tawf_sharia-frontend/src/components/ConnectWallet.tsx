import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import { X, LogOut, CheckCircle, Wallet2 } from 'lucide-react'
import Account from './Account'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  if (!openModal) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl shadow-emerald-500/20 border border-emerald-500/20 max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-emerald-500/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Wallet2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {activeAddress ? 'Wallet Connected' : 'Connect Wallet'}
              </h3>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              data-test-id="close-wallet-modal"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeAddress ? (
            <>
              {/* Connected Account */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">Connected</span>
                </div>
                <Account />
              </div>

              {/* Logout Button */}
              <button
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
                data-test-id="logout"
                onClick={async () => {
                  if (wallets) {
                    const activeWallet = wallets.find((w) => w.isActive)
                    if (activeWallet) {
                      await activeWallet.disconnect()
                      closeModal()
                    } else {
                      localStorage.removeItem('@txnlab/use-wallet:v3')
                      window.location.reload()
                    }
                  }
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect Wallet</span>
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-6">
                Choose your preferred wallet provider to connect to Tawf Sharia
              </p>

              {/* Wallet List */}
              <div className="space-y-3">
                {wallets?.map((wallet) => (
                  <button
                    key={`provider-${wallet.id}`}
                    data-test-id={`${wallet.id}-connect`}
                    onClick={() => wallet.connect()}
                    className="w-full flex items-center gap-4 bg-slate-800/50 hover:bg-slate-700/50 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl p-4 transition-all group"
                  >
                    {!isKmd(wallet) && (
                      <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <img
                          alt={`wallet_icon_${wallet.id}`}
                          src={wallet.metadata.icon}
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                    )}
                    {isKmd(wallet) && (
                      <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <Wallet2 className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                    <span className="text-white font-medium group-hover:text-emerald-300 transition-colors">
                      {isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}
                    </span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-emerald-500/10 p-4 bg-slate-900/50">
          <p className="text-xs text-center text-gray-500">
            By connecting, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  )
}

export default ConnectWallet
