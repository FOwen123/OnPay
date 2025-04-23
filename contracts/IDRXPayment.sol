// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IDRXPaymentContract
 * @dev Contract to facilitate payments in IDRX tokens */
contract IDRXPayment is Ownable{
    // Error messages
    error IDRXPayment__InvalidTokenAddress();
    error IDRXPayment__AmountMustBeGreaterThanZero();
    error IDRXPayment__InvalidReceiverAddress();
    error IDRXPayment__CantSentToYourself();
    error IDRXPayment__TransferFailed();

    IERC20 public idrxToken;

    // Event emitted on successfull payment
    event PaymentCompleted(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _idrxToken) Ownable(msg.sender){
        require(_idrxToken != address(0), IDRXPayment__InvalidTokenAddress());
        idrxToken = IERC20(_idrxToken);
    }

    function updateTokenAddress(address _newIdrxToken) external onlyOwner {
        require(_newIdrxToken != address(0), IDRXPayment__InvalidTokenAddress());
        idrxToken = IERC20(_newIdrxToken);
    }
    
    function sendIDRX(address _receiver, uint256 _amount) external returns (bool success){
        require(_amount > 0, IDRXPayment__AmountMustBeGreaterThanZero());
        require(_receiver != address(0), IDRXPayment__InvalidReceiverAddress());
        require(_receiver != msg.sender, IDRXPayment__CantSentToYourself());

        bool transferSuccess = idrxToken.transferFrom(msg.sender, _receiver, _amount);
        require(transferSuccess, IDRXPayment__TransferFailed());

        emit PaymentCompleted(msg.sender, _receiver, _amount, block.timestamp);
        return true;
    }
}