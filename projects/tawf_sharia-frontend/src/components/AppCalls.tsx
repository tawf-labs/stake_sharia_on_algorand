import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { TawfShariaFactory } from '../contracts/tawf_sharia'
import { OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })
  algorand.setDefaultSigner(transactionSigner)

  const sendAppCall = async () => {
    setLoading(true)
    try {
      // NOTE: In production, deployment is typically done on the backend.
      const factory = new TawfShariaFactory({
        defaultSender: activeAddress ?? undefined,
        algorand,
      })

      const deployResult = await factory.deploy({
        onSchemaBreak: OnSchemaBreak.AppendApp,
        onUpdate: OnUpdate.AppendApp,
      })

      if (!deployResult) {
        enqueueSnackbar('Deployment failed', { variant: 'error' })
        setLoading(false)
        return
      }

      const { appClient } = deployResult

      // Example: placeholder for any function call you add later
      // await appClient.send.someFunctionName({ args: { ... } })

      enqueueSnackbar('Contract deployed successfully!', { variant: 'success' })
    } catch (e: any) {
      enqueueSnackbar(`Error: ${e.message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box">
        <h3 className="font-bold text-lg">Deploy your Algorand Smart Contract</h3>
        <p className="py-2 text-sm text-gray-600">
          This will deploy your Tawf Sharia contract. You can add function calls later.
        </p>
        <div className="modal-action">
          <button
            type="button"
            className="btn"
            onClick={() => setModalState(!openModal)}
            disabled={loading}
          >
            Close
          </button>
          <button type="button" className="btn" onClick={sendAppCall} disabled={loading}>
            {loading ? <span className="loading loading-spinner" /> : 'Deploy Contract'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AppCalls
