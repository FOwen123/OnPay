// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

interface IIDRXPayment {
    function sendIDRXMeta(
        address _sender,
        address _receiver,
        uint256 _amount
    ) external;
}

interface IL2Registrar {
    function register(string calldata label, address owner) external;
}

contract MetaTxForwarder {
    error MetaTxForwarder__InvalidSignatureLength();
    error MetaTxForwarder__InvalidSignature();

    mapping(address => uint256) public nonces;

    event MetaTransactionExecuted(
        address indexed sender, 
        address indexed relayer
    );

    function getMessageHash(address _sender, address _receiver, uint256 _amount, address _targetContract, uint256 _nonce) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            _sender,
            _receiver,
            _amount,
            _targetContract,
            _nonce
        ));
    }

    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns(bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v){
        require(sig.length == 65, MetaTxForwarder__InvalidSignatureLength());
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function verify(address _sender, address _receiver, uint256 _amount, address _targetContract, uint256 _nonce, bytes memory signature) public pure returns (bool) {
        bytes32 messageHash = getMessageHash(_sender, _receiver, _amount, _targetContract, _nonce);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        address signer = recoverSigner(ethSignedMessageHash, signature);
        return signer == _sender;
    }

    function executeMetaTransaction(
        address _sender,
        address _receiver,
        uint256 _amount,
        address _targetContract,
        bytes memory signature
    ) external {
        uint256 nonce = nonces[_sender];

        require(verify(_sender, _receiver, _amount, _targetContract, nonce, signature), MetaTxForwarder__InvalidSignature());
        
        nonces[_sender]++;
        
        IIDRXPayment(_targetContract).sendIDRXMeta(_sender, _receiver, _amount);
        
        emit MetaTransactionExecuted(_sender, msg.sender);
    }

    function getENSMessageHash(address _sender, string memory _label, address _targetContract, uint256 _nonce) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            _sender,
            _label,
            _targetContract,
            _nonce
        ));
    }

    function executeENSMetaTx(
        address _sender,
        string calldata _label,
        address _targetContract,
        bytes memory signature
    ) external {
        uint256 nonce = nonces[_sender];

        bytes32 messageHash = getENSMessageHash(_sender, _label, _targetContract, nonce);

        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        require(recoverSigner(ethSignedMessageHash, signature) == _sender, MetaTxForwarder__InvalidSignature());

        nonces[_sender]++;

        // Forward the call to the ENS registrar
        IL2Registrar(_targetContract).register(_label, _sender);

        emit MetaTransactionExecuted(_sender, msg.sender);
}

}