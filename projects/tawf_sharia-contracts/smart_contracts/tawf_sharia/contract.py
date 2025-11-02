from algopy import ARC4Contract, String, UInt64, Global, Txn, gtxn, itxn, Bytes, op, subroutine, arc4
from algopy.arc4 import abimethod, Address


class tawf_sharia(ARC4Contract):
    def __init__(self) -> None:
        self.ANNUAL_UJRAH_RATE_BP = UInt64(300)      # 3% annual
        self.SECONDS_PER_YEAR = UInt64(31_557_600)   # 365.25 days

    # === Lease / Deposit ===
    @abimethod()
    def lease_validation_rights(self, payment: gtxn.PaymentTransaction) -> String:
        assert payment.receiver == Global.current_application_address, "Invalid receiver"
        assert payment.amount >= 1_000_000, "Min 1 ALGO"

        lessor = Txn.sender
        now = Global.latest_timestamp
        box_name = Bytes(b"ijarah_") + lessor.bytes

        principal, dummy_data = self._get_principal(box_name)
        unclaimed = self._calculate_ujrah(box_name)

        if unclaimed > UInt64(0):
            itxn.Payment(receiver=lessor, amount=unclaimed, fee=UInt64(0)).submit()

        new_principal = principal + payment.amount
        op.Box.put(box_name, op.itob(new_principal) + op.itob(now) + op.itob(now))

        return String("Lease started! Amount: ") + String.from_bytes(op.itob(new_principal))

    # === Claim profit (ujrah) ===
    @abimethod()
    def claim_ujrah(self) -> String:
        claimer = Txn.sender
        box_name = Bytes(b"ijarah_") + claimer.bytes

        ujrah = self._calculate_ujrah(box_name)
        assert ujrah > UInt64(0), "No ujrah yet"

        self._update_box_time(box_name)
        itxn.Payment(receiver=claimer, amount=ujrah, fee=UInt64(0)).submit()

        return String("Ujrah claimed: ") + String.from_bytes(op.itob(ujrah))

    # === Withdraw principal (partial/full) ===
    @abimethod()
    def terminate_lease(self, amount: UInt64) -> String:
        user = Txn.sender
        box_name = Bytes(b"ijarah_") + user.bytes
        assert amount > UInt64(0), "Invalid amount"

        principal, box_data = self._get_principal(box_name)
        assert amount <= principal, "Exceeds balance"

        ujrah = self._calculate_ujrah(box_name)
        total = amount + ujrah

        new_principal = principal - amount
        now = Global.latest_timestamp

        if new_principal == UInt64(0):
            op.Box.delete(box_name)
        else:
            rental_start = op.btoi(op.extract(box_data, 8, 8))
            op.Box.put(box_name, op.itob(new_principal) + op.itob(rental_start) + op.itob(now))

        itxn.Payment(receiver=user, amount=total, fee=UInt64(0)).submit()

        return String("Withdrawn ") + String.from_bytes(op.itob(total)) + String(" microALGO")

    # === View own info ===
    @abimethod()
    def get_my_ijarah_info(self) -> tuple[UInt64, UInt64, UInt64]:
        caller = Txn.sender
        box_name = Bytes(b"ijarah_") + caller.bytes
        principal, box_data = self._get_principal(box_name)

        if principal == UInt64(0):
            return (UInt64(0), UInt64(0), UInt64(0))

        ujrah = self._calculate_ujrah(box_name)
        start = op.btoi(op.extract(box_data, 8, 8))
        duration = Global.latest_timestamp - start

        return (principal, ujrah, duration)

    # === View others ===
    @abimethod()
    def check_lessor_info(self, lessor: Address) -> tuple[UInt64, UInt64]:
        box_name = Bytes(b"ijarah_") + lessor.bytes
        principal, dummy_data = self._get_principal(box_name)
        return (principal, self._calculate_ujrah(box_name))

    # === View total balance ===
    @abimethod()
    def total_contract_balance(self) -> UInt64:
        return op.balance(Global.current_application_address)

    # === Internal helpers ===
    @subroutine
    def _calculate_ujrah(self, box_name: Bytes) -> UInt64:
        principal, box_data = self._get_principal(box_name)
        if principal == UInt64(0):
            return UInt64(0)

        last_claim = op.btoi(op.extract(box_data, 16, 8))
        elapsed = Global.latest_timestamp - last_claim

        return (principal * elapsed * self.ANNUAL_UJRAH_RATE_BP) // (self.SECONDS_PER_YEAR * UInt64(10_000))

    @subroutine
    def _get_principal(self, box_name: Bytes) -> tuple[UInt64, Bytes]:
        length, exists = op.Box.length(box_name)
        if not exists or length == UInt64(0):
            return (UInt64(0), Bytes(b""))
        data, got = op.Box.get(box_name)
        principal = op.btoi(op.extract(data, 0, 8))
        return (principal, data)

    @subroutine
    def _update_box_time(self, box_name: Bytes) -> None:
        principal, data = self._get_principal(box_name)
        if principal == UInt64(0):
            return
        start = op.btoi(op.extract(data, 8, 8))
        op.Box.put(box_name, op.itob(principal) + op.itob(start) + op.itob(Global.latest_timestamp))
