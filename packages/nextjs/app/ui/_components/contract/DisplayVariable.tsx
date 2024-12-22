"use client";
import {ApplyAndCancelButtons} from "./ApplyAndCancelButtons";
import { useEffect } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { displayTxResult } from "./utilsDisplay";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { useReadContract} from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useAnimationConfig } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { Contract, ContractName, GenericContract, InheritedFunctions } from "~~/utils/scaffold-eth/contract";

type DisplayVariableProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  refreshDisplayVariables: boolean;
  inheritedFrom?: string;
  abi: Abi;
  deployedContractData: Contract<ContractName>;
  onChange: () => void;
};

type Operation = {
  id: string;
  from: Address;
  to: Address;
  amount: string;
  coordinator: Address;
};

const varaiblesNames = {
  getBalance: "Количество токенов",
  getOperationsToApprove: "Операции для одобрения",
  owner: "Хозяин контракта",
  totalCounter: "Общее число токенов",
};

export const DisplayVariable = ({
  contractAddress,
  abiFunction,
  refreshDisplayVariables,
  abi,
  inheritedFrom,
  deployedContractData,
  onChange,
}: DisplayVariableProps) => {
  const { targetNetwork } = useTargetNetwork();

  const {
    data: result,
    isFetching,
    refetch,
    error,
  } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    chainId: targetNetwork.id,
    query: {
      retry: false,
    },
  });

  const { showAnimation } = useAnimationConfig(result);

  useEffect(() => {
    refetch();
  }, [refetch, refreshDisplayVariables]);

  useEffect(() => {
    if (error) {
      const parsedError = getParsedError(error);
      notification.error(parsedError);
    }
  }, [error]);

  function displayResult(result: any, functionName: string) {
    if (functionName == "getOperationsToApprove") {

    const approveAndCancel = ((deployedContractData.abi as Abi).filter(part => part.type === "function") as AbiFunction[])
    .filter(fn => {
      return fn.name == "approve" || fn.name == "cancel";
    })
    .map(fn => {
      return {
        fn,
        inheritedFrom: ((deployedContractData as GenericContract)?.inheritedFunctions as InheritedFunctions)?.[fn.name],
      };
    })
    .sort((a, b) => (b.inheritedFrom ? b.inheritedFrom.localeCompare(a.inheritedFrom) : 1));

      const operations: Operation[] = result as Operation[];
      return (
        <>
          {operations?.map(x => (
            <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
              <div>
                <div className={`flex flex-row items-baseline`}>
                  <span className="text-base-content/60 mr-2">Id операции:</span>
                  <span className="text-base-content">{displayTxResult(x.id)}</span>
                </div>
              </div>

              <div>
                <div className={`flex flex-row items-baseline`}>
                  <span className="text-base-content/60 mr-2">Отправитель:</span>
                  <span className="text-base-content">{displayTxResult(x.from)}</span>
                </div>
              </div>

              <div>
                <div className={`flex flex-row items-baseline`}>
                  <span className="text-base-content/60 mr-2">Получатель:</span>
                  <span className="text-base-content">{displayTxResult(x.to)}</span>
                </div>
              </div>

              <div>
                <div className={`flex flex-row items-baseline`}>
                  <span className="text-base-content/60 mr-2">Количество токенов:</span>
                  <span className="text-base-content">{displayTxResult(x.amount)}</span>
                </div>
              </div>

              <div>
                <div className={`flex flex-row items-baseline`}>
                  <span className="text-base-content/60 mr-2">Согласующий:</span>
                  <span className="text-base-content">{displayTxResult(x.coordinator)}</span>
                </div>
              </div>

              {approveAndCancel.map(({ fn, inheritedFrom }) => (
                      <ApplyAndCancelButtons
                        abi={deployedContractData.abi as Abi}
                        abiFunction={fn}
                        onChange={onChange}
                        contractAddress={deployedContractData.address}
                        inheritedFrom={inheritedFrom}
                        id = {x.id}
                      />
                    ))}
            </div>
          ))}
        </>
      );
    } else return displayTxResult(result);
  }

  return (
    <div className="space-y-2 pb-2">
      <div className="flex items-center">
        <h3 className="font-medium text-lg mb-0 break-all">{varaiblesNames[abiFunction.name]}</h3>
        <button className="btn btn-ghost btn-xs" onClick={async () => await refetch()}>
          {isFetching ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <ArrowPathIcon className="h-3 w-3 cursor-pointer" aria-hidden="true" />
          )}
        </button>
        <InheritanceTooltip inheritedFrom={inheritedFrom} />
      </div>

      <div className="text-base-content/80 flex flex-col items-start">
        <div>
          <div
            className={`break-all block transition bg-transparent ${
              showAnimation ? "bg-warning rounded-sm animate-pulse-fast" : ""
            }`}
          >
            {displayResult(result, abiFunction.name)}
          </div>
        </div>
      </div>
    </div>
  );
};
