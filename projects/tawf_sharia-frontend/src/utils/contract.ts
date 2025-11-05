import algosdk, { ABIContract, AtomicTransactionComposer, makeBasicAccountTransactionSigner } from 'algosdk'
import { getAlgodConfigFromViteEnvironment } from './network/getAlgoClientConfigs'
import toast from 'react-hot-toast'

const algodConfig = getAlgodConfigFromViteEnvironment()
const algodClient = new algosdk.Algodv2(algodConfig.token as string, algodConfig.server, algodConfig.port)

// Contract configuration
const CONTRACT_CONFIG = {
  appId: 749014050, // Your deployed contract ID
  appAddress: 'D4V44T2PXCDL3RZHAAQAWVYK3OZHERJ3JVIGRWS24CMMITGVPPYT2RAGU4',
}

// ABI Contract definition from your deployed contract
const CONTRACT_ABI: algosdk.ABIContractParams = {
  name: 'tawf_sharia',
  methods: [
    {
      name: 'lease_validation_rights',
      args: [{ type: 'pay', name: 'payment' }],
      returns: { type: 'string' },
    },
    {
      name: 'claim_ujrah',
      args: [],
      returns: { type: 'string' },
    },
    {
      name: 'terminate_lease',
      args: [{ type: 'uint64', name: 'amount' }],
      returns: { type: 'string' },
    },
    {
      name: 'get_my_ijarah_info',
      args: [],
      returns: { type: '(uint64,uint64,uint64)' },
    },
    {
      name: 'check_lessor_info',
      args: [{ type: 'address', name: 'lessor' }],
      returns: { type: '(uint64,uint64)' },
    },
    {
      name: 'total_contract_balance',
      args: [],
      returns: { type: 'uint64' },
    },
  ],
  networks: {},
}

const abiContract = new ABIContract(CONTRACT_ABI)

export interface IjarahInfo {
  principal: bigint
  duration: bigint
  ujrah: bigint
}

export interface LessorInfo {
  principal: bigint
  ujrah: bigint
}

/**
 * Helper function to create and send ABI method call
 */
async function callABIMethod(
  method: algosdk.ABIMethod,
  signer: { addr: string; signer: algosdk.TransactionSigner },
  methodArgs: any[] = [],
  payment?: algosdk.Transaction
): Promise<any> {
  const atc = new AtomicTransactionComposer()
  const suggestedParams = await algodClient.getTransactionParams().do()

  const methodCallParams: any = {
    appID: CONTRACT_CONFIG.appId,
    method: method,
    methodArgs: methodArgs,
    sender: signer.addr,
    signer: signer.signer,
    suggestedParams: suggestedParams,
  }

  atc.addMethodCall(methodCallParams)

  const result = await atc.execute(algodClient, 4)
  return result
}

/**
 * Lease validation rights - deposit ALGO to contract
 * @param signer - Account signer
 * @param amount - Amount in microALGOs (minimum 1 ALGO = 1,000,000 microALGOs)
 */
export async function leaseValidationRights(
  signer: { addr: string; signer: algosdk.TransactionSigner },
  amount: number
): Promise<string> {
  try {
    if (amount < 1_000_000) {
      throw new Error('Minimum amount is 1 ALGO (1,000,000 microALGOs)')
    }

    toast.loading('Creating lease transaction...')

    const suggestedParams = await algodClient.getTransactionParams().do()

    // Create payment transaction
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: signer.addr,
      to: CONTRACT_CONFIG.appAddress,
      amount: amount,
      suggestedParams: suggestedParams,
    })

    const method = abiContract.getMethodByName('lease_validation_rights')
    const atc = new AtomicTransactionComposer()

    atc.addMethodCall({
      appID: CONTRACT_CONFIG.appId,
      method: method,
      methodArgs: [{ txn: paymentTxn, signer: signer.signer }],
      sender: signer.addr,
      signer: signer.signer,
      suggestedParams: suggestedParams,
    })

    toast.loading('Sending transaction to network...')
    const result = await atc.execute(algodClient, 4)

    const returnValue = result.methodResults[0].returnValue as string

    toast.success(`Lease started! ${returnValue}`)
    return result.txIDs[0]
  } catch (error) {
    console.error('Lease error:', error)
    toast.error('Failed to start lease')
    throw error
  }
}

/**
 * Claim ujrah (profit) from the contract
 */
export async function claimUjrah(
  signer: { addr: string; signer: algosdk.TransactionSigner }
): Promise<string> {
  try {
    toast.loading('Creating claim transaction...')

    const method = abiContract.getMethodByName('claim_ujrah')
    const result = await callABIMethod(method, signer)

    const returnValue = result.methodResults[0].returnValue as string

    toast.success(`${returnValue}`)
    return result.txIDs[0]
  } catch (error) {
    console.error('Claim error:', error)
    toast.error('Failed to claim ujrah')
    throw error
  }
}

/**
 * Terminate lease and withdraw principal (partial or full)
 * @param amount - Amount to withdraw in microALGOs
 */
export async function terminateLease(
  signer: { addr: string; signer: algosdk.TransactionSigner },
  amount: number
): Promise<string> {
  try {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    toast.loading('Creating termination transaction...')

    const method = abiContract.getMethodByName('terminate_lease')
    const result = await callABIMethod(method, signer, [amount])

    const returnValue = result.methodResults[0].returnValue as string

    toast.success(`${returnValue}`)
    return result.txIDs[0]
  } catch (error) {
    console.error('Terminate error:', error)
    toast.error('Failed to terminate lease')
    throw error
  }
}

/**
 * Get user's own ijarah information
 * Returns: (principal, duration, ujrah)
 */
export async function getMyIjarahInfo(
  signer: { addr: string; signer: algosdk.TransactionSigner }
): Promise<IjarahInfo> {
  try {
    const method = abiContract.getMethodByName('get_my_ijarah_info')
    const result = await callABIMethod(method, signer)

    const returnValue = result.methodResults[0].returnValue as bigint[]

    return {
      principal: returnValue[0],
      duration: returnValue[1],
      ujrah: returnValue[2],
    }
  } catch (error) {
    console.error('Error getting ijarah info:', error)
    throw error
  }
}

/**
 * Check another user's lessor information
 * @param lessorAddress - Address of the lessor to check
 * Returns: (principal, ujrah)
 */
export async function checkLessorInfo(
  signer: { addr: string; signer: algosdk.TransactionSigner },
  lessorAddress: string
): Promise<LessorInfo> {
  try {
    const method = abiContract.getMethodByName('check_lessor_info')
    const result = await callABIMethod(method, signer, [lessorAddress])

    const returnValue = result.methodResults[0].returnValue as bigint[]

    return {
      principal: returnValue[0],
      ujrah: returnValue[1],
    }
  } catch (error) {
    console.error('Error checking lessor info:', error)
    throw error
  }
}

/**
 * Get total contract balance
 */
export async function getTotalContractBalance(
  signer: { addr: string; signer: algosdk.TransactionSigner }
): Promise<bigint> {
  try {
    const method = abiContract.getMethodByName('total_contract_balance')
    const result = await callABIMethod(method, signer)

    return result.methodResults[0].returnValue as bigint
  } catch (error) {
    console.error('Error getting contract balance:', error)
    throw error
  }
}

/**
 * Read global state from the contract
 */
export async function readContractGlobalState(): Promise<{
  annualUjrahRateBP?: number
  secondsPerYear?: number
}> {
  try {
    const appInfo = await algodClient.getApplicationByID(CONTRACT_CONFIG.appId).do()
    const globalState = appInfo.params['global-state'] || []

    const state: any = {}

    globalState.forEach((item: any) => {
      const key = Buffer.from(item.key, 'base64').toString('utf-8')
      const value = item.value

      switch (key) {
        case 'ANNUAL_UJRAH_RATE_BP':
          state.annualUjrahRateBP = value.uint
          break
        case 'SECONDS_PER_YEAR':
          state.secondsPerYear = value.uint
          break
      }
    })

    return state
  } catch (error) {
    console.error('Error reading contract global state:', error)
    throw error
  }
}

/**
 * Helper to convert microALGOs to ALGO
 */
export function microAlgosToAlgos(microAlgos: number | bigint): number {
  return Number(microAlgos) / 1_000_000
}

/**
 * Helper to convert ALGO to microALGOs
 */
export function algosToMicroAlgos(algos: number): number {
  return Math.floor(algos * 1_000_000)
}

export default {
  leaseValidationRights,
  claimUjrah,
  terminateLease,
  getMyIjarahInfo,
  checkLessorInfo,
  getTotalContractBalance,
  readContractGlobalState,
  microAlgosToAlgos,
  algosToMicroAlgos,
  CONTRACT_CONFIG,
}
