// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TollgateReceipt
/// @notice Records a receipt on-chain for each paid query. Payment itself
/// still happens as a native USDC transfer (USDC is Arc's gas token), this
/// contract just logs that a payment of at least the required fee happened
/// and ties it to a query hash, so the log itself becomes verifiable
/// on-chain history instead of living only in a server's memory.
/// Deliberately minimal for now, no escrow, no refunds. Those are next.
contract TollgateReceipt {
    address public immutable treasury;
    uint256 public queryFee;
    uint256 public totalReceipts;

    event ReceiptLogged(
        address indexed payer,
        uint256 amount,
        bytes32 indexed queryHash,
        uint256 timestamp
    );

    error InsufficientPayment(uint256 sent, uint256 required);
    error TransferFailed();

    constructor(address _treasury, uint256 _queryFee) {
        treasury = _treasury;
        queryFee = _queryFee;
    }

    /// @notice Pay for a query and log a receipt in the same transaction.
    /// @param queryHash keccak256 hash of the query text, kept off-chain,
    /// only the hash is stored so the raw question never has to be public.
    function payAndLog(bytes32 queryHash) external payable {
        if (msg.value < queryFee) {
            revert InsufficientPayment(msg.value, queryFee);
        }

        totalReceipts += 1;
        emit ReceiptLogged(msg.sender, msg.value, queryHash, block.timestamp);

        (bool sent, ) = treasury.call{value: msg.value}("");
        if (!sent) revert TransferFailed();
    }

    /// @notice Update the fee. Left owner-less on purpose for this MVP,
    /// meaning it's immutable in practice, no admin key to worry about.
    /// A real settlement contract would add access control here.
}
