import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("LendingModule", (m) => {
  // Deploy MockERC20 for collateral
  const collateralToken = m.contract(
    "MockERC20",
    ["Collateral Token", "COLL"],
    {
      id: "CollateralToken",
    },
  );

  // Deploy MockERC20 for loan
  const loanToken = m.contract("MockERC20", ["Loan Token", "LOAN"], {
    id: "LoanToken",
  });

  // Deploy MarketFactory
  const marketFactory = m.contract("MarketFactory", [], {
    id: "MarketFactory",
  });

  // Deploy LendingMarket with factory
  const lendingMarket = m.contract(
    "LendingMarket",
    [collateralToken, loanToken, 7500, marketFactory],
    {
      id: "LendingMarket",
    },
  );

  return { collateralToken, loanToken, marketFactory, lendingMarket };
});
