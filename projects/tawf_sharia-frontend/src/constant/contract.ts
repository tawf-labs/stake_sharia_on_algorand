// Contract configuration
// These values need to be updated after deploying your smart contract

export const CONTRACT_CONFIG = {
  // Replace with your actual deployed contract app ID
  appId: Number(import.meta.env.VITE_CONTRACT_APP_ID) || 749014050,

  // Replace with your actual contract app address (will be calculated after deployment)
  appAddress: import.meta.env.VITE_CONTRACT_APP_ADDRESS || 'D4V44T2PXCDL3RZHAAQAWVYK3OZHERJ3JVIGRWS24CMMITGVPPYT2RAGU4',

  // Contract ABI methods for Tawf Sharia (Islamic Leasing)
  methods: {
    leaseValidationRights: 'lease_validation_rights',
    claimUjrah: 'claim_ujrah',
    terminateLease: 'terminate_lease',
    getMyIjarahInfo: 'get_my_ijarah_info',
    checkLessorInfo: 'check_lessor_info',
    totalContractBalance: 'total_contract_balance'
  },

  // Global state keys
  stateKeys: {
    annualUjrahRateBP: 'ANNUAL_UJRAH_RATE_BP', // 3% annual (300 basis points)
    secondsPerYear: 'SECONDS_PER_YEAR' // 31,557,600 seconds (365.25 days)
  },

  // ARC standards supported
  arcs: [22, 28]
}

// Default Ijarah (Lease) metadata
export const DEFAULT_IJARAH_METADATA = {
  name: "Tawf Sharia Ijarah",
  description: "Islamic leasing contract on Algorand blockchain",
  annualRate: "3%", // Annual ujrah (rental fee) rate
  minimumDeposit: "1 ALGO",
  contractType: "Ijarah (Islamic Lease)",
  features: [
    "Sharia-compliant rental income",
    "Automatic ujrah calculation",
    "Flexible deposit and withdrawal",
    "Transparent on-chain tracking"
  ]
}

// Network configuration
export const NETWORK_CONFIG = {
  TESTNET: {
    name: 'TestNet',
    algodServer: 'https://testnet-api.algonode.cloud',
    algodPort: '',
    algodToken: '',
    indexerServer: 'https://testnet-idx.algonode.cloud',
    indexerPort: '',
    indexerToken: ''
  },
  MAINNET: {
    name: 'MainNet',
    algodServer: 'https://mainnet-api.algonode.cloud',
    algodPort: '',
    algodToken: '',
    indexerServer: 'https://mainnet-idx.algonode.cloud',
    indexerPort: '',
    indexerToken: ''
  },
  LOCALNET: {
    name: 'LocalNet',
    algodServer: 'http://localhost',
    algodPort: '4001',
    algodToken: 'a'.repeat(64),
    indexerServer: 'http://localhost',
    indexerPort: '8980',
    indexerToken: ''
  }
}

// Transaction fees and limits
export const TRANSACTION_FEES = {
  MIN_FEE: 1000, // 0.001 ALGO in microAlgos
  APP_CALL_FEE: 1000,

  // Ijarah specific fees
  MIN_LEASE_DEPOSIT: 1000000, // 1 ALGO minimum deposit
  BOX_STORAGE_FEE: 2500, // Fee per box byte
  BOX_SIZE: 24, // 8 bytes (principal) + 8 bytes (start) + 8 bytes (last_claim)

  // Minimum balance requirements
  MIN_ACCOUNT_BALANCE: 100000, // 0.1 ALGO
  MIN_APP_BALANCE: 100000, // 0.1 ALGO per app
}

// Ijarah constants
export const IJARAH_CONSTANTS = {
  ANNUAL_UJRAH_RATE_BP: 300, // 3% annual rate (basis points)
  SECONDS_PER_YEAR: 31557600, // 365.25 days in seconds
  BASIS_POINTS_DIVISOR: 10000,
  MICROALGOS_PER_ALGO: 1000000,
  BOX_PREFIX: 'ijarah_'
}

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient balance to complete this transaction',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  CONTRACT_NOT_FOUND: 'Contract not found. Please check the app ID.',
  NOT_AUTHORIZED: 'You are not authorized to perform this action',

  // Ijarah specific errors
  INVALID_RECEIVER: 'Invalid receiver address',
  MIN_DEPOSIT_NOT_MET: 'Minimum deposit of 1 ALGO required',
  NO_UJRAH_YET: 'No ujrah available to claim yet',
  INVALID_AMOUNT: 'Invalid withdrawal amount',
  EXCEEDS_BALANCE: 'Withdrawal amount exceeds your balance',
  NO_ACTIVE_LEASE: 'No active lease found for your account',
  LEASE_NOT_FOUND: 'Lease information not found'
}

// Success messages
export const SUCCESS_MESSAGES = {
  LEASE_STARTED: 'Lease started successfully!',
  UJRAH_CLAIMED: 'Ujrah claimed successfully!',
  LEASE_TERMINATED: 'Lease terminated and funds withdrawn successfully!',
  WALLET_CONNECTED: 'Wallet connected successfully!',
  TRANSACTION_SENT: 'Transaction sent successfully!'
}

// Helper functions
export const formatAlgoAmount = (microAlgos: number): string => {
  return (microAlgos / IJARAH_CONSTANTS.MICROALGOS_PER_ALGO).toFixed(6)
}

export const formatUjrahRate = (rateBP: number): string => {
  return (rateBP / 100).toFixed(2) + '%'
}

export const calculateUjrah = (
  principal: number,
  elapsedSeconds: number,
  annualRateBP: number = IJARAH_CONSTANTS.ANNUAL_UJRAH_RATE_BP
): number => {
  return Math.floor(
    (principal * elapsedSeconds * annualRateBP) /
    (IJARAH_CONSTANTS.SECONDS_PER_YEAR * IJARAH_CONSTANTS.BASIS_POINTS_DIVISOR)
  )
}

export const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

// Type definitions for Ijarah info
export interface IjarahInfo {
  principal: number // Amount deposited (microAlgos)
  startTime: number // Lease start timestamp
  duration: number // Duration in seconds
  unclaimed: number // Unclaimed ujrah (microAlgos)
}

export interface LessorInfo {
  principal: number // Total principal amount
  unclaimed: number // Unclaimed ujrah amount
}

// Contract method signatures (for ABI encoding)
export const METHOD_SIGNATURES = {
  lease_validation_rights: 'lease_validation_rights(pay)string',
  claim_ujrah: 'claim_ujrah()string',
  terminate_lease: 'terminate_lease(uint64)string',
  get_my_ijarah_info: 'get_my_ijarah_info()(uint64,uint64,uint64)',
  check_lessor_info: 'check_lessor_info(address)(uint64,uint64)',
  total_contract_balance: 'total_contract_balance()uint64'
}

// Box storage calculation
export const calculateBoxMBR = (): number => {
  // MBR = 2500 + 400 * box_size
  return 2500 + (400 * TRANSACTION_FEES.BOX_SIZE)
}

// Validation helpers
export const isValidAlgorandAddress = (address: string): boolean => {
  return /^[A-Z2-7]{58}$/.test(address)
}

export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && Number.isInteger(amount)
}

export const hasMinimumBalance = (balance: number, required: number): boolean => {
  return balance >= required + TRANSACTION_FEES.MIN_ACCOUNT_BALANCE
}
