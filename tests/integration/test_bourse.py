from gltest import get_contract_factory, create_account
from gltest.assertions import tx_execution_succeeded

STANCES = ("BULLISH", "BEARISH", "NEUTRAL")


def test_pitch_consensus():
    factory = get_contract_factory("Bourse")
    contract = factory.deploy(args=[])

    # List an asset (deterministic): it opens at the starting price.
    rc1 = contract.list_asset(args=["Cheap abundant energy"]).transact()
    assert tx_execution_succeeded(rc1)

    assets = contract.get_assets(args=[0]).call()
    assert len(assets) == 1
    aid = assets[0]["id"]
    assert int(assets[0]["price"]) == 1000

    # Pitch a thesis (the AI consensus write): the Analyst rules a stance and the
    # price moves deterministically by the agreed magnitude.
    trader = create_account()
    rc2 = contract.connect(trader).pitch(
        args=[aid, "Falling energy cost compounds into cheaper water, food, and compute, lifting everything at once."]
    ).transact()
    assert tx_execution_succeeded(rc2)

    asset = contract.get_asset(args=[aid]).call()
    assert int(asset["pitches"]) == 1
    assert 10 <= int(asset["price"]) <= 100000
    hist = contract.get_history(args=[aid, 0]).call()
    assert len(hist) == 1
    assert hist[0]["stance"] in STANCES

    stats = contract.get_stats(args=[]).call()
    assert int(stats["pitches"]) == 1
