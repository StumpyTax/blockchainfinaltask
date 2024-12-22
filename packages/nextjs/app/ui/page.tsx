"use client";

import { useEffect, useMemo } from "react";
import type { NextPage } from "next";
import { useSessionStorage } from "usehooks-ts";
import { ContractUI } from "~~/app/ui/_components/contract";
import { ContractName, GenericContract } from "~~/utils/scaffold-eth/contract";
import { useAllContracts } from "~~/utils/scaffold-eth/contractsData";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const metadata = getMetadata({
  title: "UI",
  description: "Custom UI",
});

const selectedContractStorageKey = "scaffoldEth2.selectedContract";

const Debug: NextPage = () => {
  const contractsData = useAllContracts();
  const contractNames = useMemo(() => Object.keys(contractsData) as ContractName[], [contractsData]);

  const [selectedContract, setSelectedContract] = useSessionStorage<ContractName>(
    selectedContractStorageKey,
    contractNames[0],
    { initializeWithValue: false },
  );

  useEffect(() => {
    if (!contractNames.includes(selectedContract)) {
      setSelectedContract(contractNames[0]);
    }
  }, [contractNames, selectedContract, setSelectedContract]);

  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
      {contractNames.map(contractName => (
        <ContractUI
          key={contractName}
          contractName={contractName}
          className={contractName === selectedContract ? "" : "hidden"}
        />
      ))}
    </div>
  );
};

export default Debug;
