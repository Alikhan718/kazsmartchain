// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title KSC Token (KazSmartChain Native Token)
 * @dev Production-grade ERC-20 token for KazSmartChain
 * 
 * Security Features:
 * - Owner-controlled minting (only authorized addresses can create tokens)
 * - Pausable (emergency stop mechanism)
 * - Burnable (holders can burn their own tokens)
 * - ERC20Permit (gasless approvals via signatures)
 * - OpenZeppelin audited contracts
 * 
 * Use Cases:
 * - Native blockchain utility token
 * - Gas fee payments (future)
 * - Staking and governance
 * - Cross-chain bridge collateral
 */
contract KSCToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {
    
    /**
     * @dev Constructor mints initial supply to the deployer
     * @param initialSupply Initial token supply (in whole tokens, will be multiplied by 10^18)
     */
    constructor(uint256 initialSupply) 
        ERC20("KazSmartChain Token", "KSC") 
        Ownable(msg.sender)
        ERC20Permit("KazSmartChain Token")
    {
        // Mint initial supply to contract deployer
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /**
     * @dev Mint new tokens. Only owner can call.
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint (in wei, considering decimals)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Pause all token transfers. Only owner can call.
     * Used in emergency situations.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers. Only owner can call.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}

