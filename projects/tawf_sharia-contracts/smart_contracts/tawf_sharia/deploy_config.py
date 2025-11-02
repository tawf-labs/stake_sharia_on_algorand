import logging
import algokit_utils

logger = logging.getLogger(__name__)

def deploy() -> None:
    from smart_contracts.artifacts.tawf_sharia.tawf_sharia_client import (
        TawfShariaFactory,
    )

    # Connect to Algorand using environment variables
    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    # Prepare a typed app factory for deployment
    factory = algorand.client.get_typed_app_factory(
        TawfShariaFactory,
        default_sender=deployer_.address
    )

    # Deploy the contract
    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    # Fund the app with 1 Algo if newly created or replaced
    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=1),
                sender=deployer_.address,
                receiver=app_client.app_address,
            )
        )

    logger.info(
        f"Deployed contract {app_client.app_name} ({app_client.app_id}) successfully."
    )
