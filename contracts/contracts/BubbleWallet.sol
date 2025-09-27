// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./common/StorageAccessible.sol";
import "./common/Singleton.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title BubbleWallet
 * @author Anoy Roy Chowdhury - <anoy@deforge.io>
 * @notice A specialized 2-of-2 multisig wallet. It requires signatures from both
 * designated owners to execute any transaction.
 * This version is simplified and gas-optimized for a fixed 2-owner setup.
 */
contract BubbleWallet is StorageAccessible, Singleton {
    // --- Events ---
    event Deposit(address indexed sender, uint256 amount);
    event TransactionExecuted(
        bytes32 indexed txHash,
        address indexed to,
        uint256 value,
        bytes data,
        uint256 nonce
    );

    // --- Constants ---
    // EIP-712 type hash for the Transaction struct
    bytes32 public constant TRANSACTION_TYPEHASH =
        keccak256(
            "Transaction(address to,uint256 value,bytes32 data,uint256 nonce)"
        );

    // --- State Variables ---
    address public owner1;
    address public owner2;
    mapping(address => bool) public isOwner;

    uint256 public nonce;

    // --- Receive Ether ---
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    // constructor
    constructor() {
        //Initialize the wallet with two owners. Master Copy cannot be initialized.
        owner1 = address(0x1);
        owner2 = address(0x2);
    }

    // --- Public Functions ---

    /**
     * @dev Initializes the wallet with two owners.
     * @param _owner1 The address of the first owner.
     * @param _owner2 The address of the second owner.
     */
    function initialize(address _owner1, address _owner2) public {
        require(
            _owner1 != address(0) && _owner2 != address(0),
            "Invalid owner address"
        );
        require(_owner1 != _owner2, "Owners must be different");
        require(
            owner1 == address(0) && owner2 == address(0),
            "Already initialized"
        );

        owner1 = _owner1;
        owner2 = _owner2;
        isOwner[_owner1] = true;
        isOwner[_owner2] = true;
    }

    /**
     * @dev Executes a transaction if valid signatures from both owners are provided.
     * @param to The destination address.
     * @param value The amount of Ether to send (in wei).
     * @param data The calldata to execute for a contract interaction.
     * @param signature1 The 65-byte signature from one of the owners.
     * @param signature2 The 65-byte signature from the other owner.
     */
    function executeTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        bytes memory signature1,
        bytes memory signature2
    ) public {
        require(address(this).balance >= value, "Insufficient balance");

        // Note: OpenZeppelin's ECDSA.recover handles the signature length check internally.

        // 1. Get the hash of the transaction that was signed.
        bytes32 txHash = getTransactionHash(to, value, data, nonce);

        // 2. Recover the signers from the signatures.
        address signer1 = recoverSigner(txHash, signature1);
        address signer2 = recoverSigner(txHash, signature2);

        // 3. Verify that the signers are the two distinct, correct owners.
        require(signer1 != signer2, "Signatures must be from different owners");
        require(
            isOwner[signer1] && isOwner[signer2],
            "Invalid signature provided"
        );

        // 4. If all checks pass, increment the nonce and execute the transaction.
        nonce++;
        (bool success, ) = to.call{value: value}(data);
        require(success, "Transaction failed");

        emit TransactionExecuted(txHash, to, value, data, nonce - 1);
    }

    // --- View/Helper Functions ---

    /**
     * @dev Calculates the EIP-712 compliant message hash to be signed by owners.
     */
    function getTransactionHash(
        address _to,
        uint256 _value,
        bytes calldata _data,
        uint256 _nonce
    ) public view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                TRANSACTION_TYPEHASH,
                _to,
                _value,
                keccak256(_data),
                _nonce
            )
        );

        return
            keccak256(
                abi.encodePacked("\x19\x01", getDomainSeparator(), structHash)
            );
    }

    /**
     * @dev Recovers the address of a signer using OpenZeppelin's ECDSA library.
     */
    function recoverSigner(
        bytes32 _txHash,
        bytes memory _signature
    ) internal pure returns (address) {
        return ECDSA.recover(_txHash, _signature);
    }

    /**
     * @dev Generates the EIP-712 domain separator.
     */
    function getDomainSeparator() public view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    keccak256(
                        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                    ),
                    keccak256("TwoOfTwoMultiSigWallet"),
                    keccak256("1"),
                    block.chainid,
                    address(this)
                )
            );
    }
}
