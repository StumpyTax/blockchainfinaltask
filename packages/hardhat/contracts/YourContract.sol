//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
//import "@openzeppelin/contracts/access/Ownable.sol";

contract YourContract {
  struct Operation {
      uint id;
      address from;
      address to;
      uint amount;
      address coordinator;
  }

  address public immutable owner;
  uint256 public totalCounter = 100000000000000000000000000000000000;
  
  mapping(uint => Operation) private operations;
  uint[] operationsIds;
  mapping(uint => bool) private keyExist;

  mapping(address => uint) balanceOf;
  mapping(address => bool) clientExist;

  uint operationsCounter = 0;

  constructor() {
    owner = msg.sender;
    balanceOf[owner] = totalCounter;
  }

  modifier isOwner() {
    require(msg.sender == owner, "Not the owner");
    _;
  }

  function getBalance() public view returns (uint) {
    return balanceOf[msg.sender];
  }

  function getOperationsToApprove() public view returns (Operation[] memory) {
    uint count = 0;
    for (uint i = 0; i < operationsIds.length; i++) {
        if (operations[operationsIds[i]].coordinator == msg.sender) {
            count++;
        }
    }

    Operation[] memory result = new Operation[](count);
    uint index = 0;
    for (uint i = 0; i < operationsIds.length; i++) {
        if (operations[operationsIds[i]].coordinator == msg.sender) {
            result[index] = operations[operationsIds[i]];
            index++;
        }
    }

    return result;
  }

  function transfer(address to, uint amount, address coord) public returns (uint) {
    require(balanceOf[msg.sender] >= amount, "Not enough tokens");
    uint id = operationsCounter;
    Operation memory operation = Operation({
        id: id,
        from: msg.sender,
        to: to,
        amount: amount,
        coordinator: coord
    });
    operationsIds.push(operationsCounter);
    operations[operationsCounter] = operation;
    keyExist[id] = true;
    operationsCounter++;
    return id;
  }

  function approve(uint operationId) public returns (bool) {
    require(keyExist[operationId], "Operation with this id does not exist");
    require(
        (operations[operationId].coordinator == msg.sender) || (owner == msg.sender),
        "Have no right to execute operation"
    );
    return executeOperation(operationId);
  }

  function cancel(uint operationId) public returns (bool) {
    require(keyExist[operationId], "Operation with this id does not exist");
    require(
        (operations[operationId].coordinator == msg.sender) || (owner == msg.sender),
        "Have no right to execute operation"
    );
    delete operations[operationId];
    deleteFromOperationIds(operationId);
    delete keyExist[operationId];
    return true;
  }

  function executeOperation(uint operationId) private returns (bool) {
    Operation memory operation = operations[operationId];
    require(balanceOf[operation.from] >= operation.amount, "Sender have not enough tokens");
    if (clientExist[operation.to]) {
        balanceOf[operation.to] += operation.amount;
    } else {
        clientExist[operation.to] = true;
        balanceOf[operation.to] = operation.amount;
    }
    balanceOf[operation.from] -= operation.amount;
    delete operations[operationId];
    deleteFromOperationIds(operationId);
    delete keyExist[operationId];
    return true;
  }

  function deleteFromOperationIds(uint operationId) private {
    for (uint i = 0; i < operationsIds.length; i++) {
        if (operationId == operationsIds[i]) {
            operationsIds[i] = operationsIds[operationsIds.length - 1];
            operationsIds.pop();
            return;
        }
      }
    }
}
