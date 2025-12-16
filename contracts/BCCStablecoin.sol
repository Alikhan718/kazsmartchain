// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NU Stablecoin (NU-T)
 * @dev University-issued stablecoin pegged 1:1 to Kazakhstani Tenge (KZT)
 * 
 * Features:
 * - Mint/Burn only by authorized university addresses
 * - 1:1 backing with KZT reserves
 * - Pausable for emergency situations
 * - Role-based access control
 * - Compliance features (freeze, blacklist)
 * - Audit trail for all mint/burn operations
 * 
 * Use Cases:
 * - Student payments
 * - University transfers
 * - Cross-border remittances
 * - DeFi operations
 * - Integration with KazSmartChain ecosystem
 */
contract NUStablecoin is 
    ERC20, 
    ERC20Burnable, 
    ERC20Pausable, 
    AccessControl, 
    ERC20Permit,
    ReentrancyGuard 
{
    // ============ Roles ============
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    // ============ State Variables ============
    
    // Reserve tracking
    uint256 public totalReserves; // Total KZT reserves backing the stablecoin
    address public reserveAccount; // Bank's reserve account address
    
    // Compliance
    mapping(address => bool) public frozenAccounts;
    mapping(address => bool) public blacklistedAccounts;
    
    // Mint/Burn limits
    uint256 public dailyMintLimit;
    uint256 public dailyBurnLimit;
    uint256 public dailyMinted;
    uint256 public dailyBurned;
    uint256 public lastResetDay;
    
    // Audit trail
    struct MintRecord {
        address to;
        uint256 amount;
        uint256 timestamp;
        string reason;
    }
    
    struct BurnRecord {
        address from;
        uint256 amount;
        uint256 timestamp;
        string reason;
    }
    
    MintRecord[] public mintHistory;
    BurnRecord[] public burnHistory;
    
    // Events
    event Minted(address indexed to, uint256 amount, string reason);
    event Burned(address indexed from, uint256 amount, string reason);
    event ReserveUpdated(uint256 oldReserve, uint256 newReserve);
    event AccountFrozen(address indexed account);
    event AccountUnfrozen(address indexed account);
    event AccountBlacklisted(address indexed account);
    event AccountUnblacklisted(address indexed account);
    
    // ============ Constructor ============
    
    constructor(
        address _admin,
        address _reserveAccount,
        uint256 _dailyMintLimit,
        uint256 _dailyBurnLimit
    ) 
        ERC20("NU Stablecoin", "NU-T") 
        ERC20Permit("NU Stablecoin")
    {
        require(_admin != address(0), "Invalid admin");
        require(_reserveAccount != address(0), "Invalid reserve account");
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
        _grantRole(BURNER_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        _grantRole(COMPLIANCE_ROLE, _admin);
        
        reserveAccount = _reserveAccount;
        dailyMintLimit = _dailyMintLimit;
        dailyBurnLimit = _dailyBurnLimit;
        lastResetDay = block.timestamp / 1 days;
    }
    
    // ============ Mint Functions ============
    
    /**
     * @dev Mint stablecoins when customer deposits KZT
     * @param to Address to receive tokens
     * @param amount Amount to mint (in wei, 18 decimals)
     * @param reason Reason for minting (for audit)
     */
    function mint(
        address to, 
        uint256 amount, 
        string memory reason
    ) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(!frozenAccounts[to], "Account is frozen");
        require(!blacklistedAccounts[to], "Account is blacklisted");
        require(amount > 0, "Amount must be greater than 0");
        
        // Check daily limit
        _resetDailyLimitsIfNeeded();
        require(dailyMinted + amount <= dailyMintLimit, "Daily mint limit exceeded");
        
        // Update reserves (1:1 backing)
        totalReserves += amount;
        dailyMinted += amount;
        
        // Record mint
        mintHistory.push(MintRecord({
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            reason: reason
        }));
        
        // Mint tokens
        _mint(to, amount);
        
        emit Minted(to, amount, reason);
        emit ReserveUpdated(totalReserves - amount, totalReserves);
    }
    
    /**
     * @dev Batch mint for multiple customers
     */
    function batchMint(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string memory reason
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            totalAmount += amounts[i];
        }
        
        _resetDailyLimitsIfNeeded();
        require(dailyMinted + totalAmount <= dailyMintLimit, "Daily mint limit exceeded");
        
        totalReserves += totalAmount;
        dailyMinted += totalAmount;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(!frozenAccounts[recipients[i]], "Account is frozen");
            require(!blacklistedAccounts[recipients[i]], "Account is blacklisted");
            
            mintHistory.push(MintRecord({
                to: recipients[i],
                amount: amounts[i],
                timestamp: block.timestamp,
                reason: reason
            }));
            
            _mint(recipients[i], amounts[i]);
            emit Minted(recipients[i], amounts[i], reason);
        }
        
        emit ReserveUpdated(totalReserves - totalAmount, totalReserves);
    }
    
    // ============ Burn Functions ============
    
    /**
     * @dev Burn stablecoins when customer withdraws KZT
     * @param from Address to burn from
     * @param amount Amount to burn
     * @param reason Reason for burning (for audit)
     */
    function burn(
        address from,
        uint256 amount,
        string memory reason
    ) 
        external 
        onlyRole(BURNER_ROLE) 
        whenNotPaused 
        nonReentrant 
    {
        require(from != address(0), "Cannot burn from zero address");
        require(balanceOf(from) >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be greater than 0");
        
        // Check daily limit
        _resetDailyLimitsIfNeeded();
        require(dailyBurned + amount <= dailyBurnLimit, "Daily burn limit exceeded");
        
        // Update reserves (1:1 backing)
        require(totalReserves >= amount, "Insufficient reserves");
        totalReserves -= amount;
        dailyBurned += amount;
        
        // Record burn
        burnHistory.push(BurnRecord({
            from: from,
            amount: amount,
            timestamp: block.timestamp,
            reason: reason
        }));
        
        // Burn tokens
        _burn(from, amount);
        
        emit Burned(from, amount, reason);
        emit ReserveUpdated(totalReserves + amount, totalReserves);
    }
    
    // ============ Compliance Functions ============
    
    /**
     * @dev Freeze an account (prevent transfers)
     */
    function freezeAccount(address account) external onlyRole(COMPLIANCE_ROLE) {
        require(account != address(0), "Invalid account");
        frozenAccounts[account] = true;
        emit AccountFrozen(account);
    }
    
    /**
     * @dev Unfreeze an account
     */
    function unfreezeAccount(address account) external onlyRole(COMPLIANCE_ROLE) {
        require(account != address(0), "Invalid account");
        frozenAccounts[account] = false;
        emit AccountUnfrozen(account);
    }
    
    /**
     * @dev Blacklist an account (prevent all operations)
     */
    function blacklistAccount(address account) external onlyRole(COMPLIANCE_ROLE) {
        require(account != address(0), "Invalid account");
        blacklistedAccounts[account] = true;
        emit AccountBlacklisted(account);
    }
    
    /**
     * @dev Remove account from blacklist
     */
    function unblacklistAccount(address account) external onlyRole(COMPLIANCE_ROLE) {
        require(account != address(0), "Invalid account");
        blacklistedAccounts[account] = false;
        emit AccountUnblacklisted(account);
    }
    
    // ============ Reserve Management ============
    
    /**
     * @dev Update reserve account address
     */
    function setReserveAccount(address _reserveAccount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_reserveAccount != address(0), "Invalid reserve account");
        reserveAccount = _reserveAccount;
    }
    
    /**
     * @dev Set daily mint/burn limits
     */
    function setDailyLimits(
        uint256 _dailyMintLimit,
        uint256 _dailyBurnLimit
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        dailyMintLimit = _dailyMintLimit;
        dailyBurnLimit = _dailyBurnLimit;
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get reserve ratio (should always be >= 1.0)
     */
    function getReserveRatio() external view returns (uint256) {
        uint256 totalSupply = totalSupply();
        if (totalSupply == 0) return 1e18; // 1.0 with 18 decimals
        
        return (totalReserves * 1e18) / totalSupply;
    }
    
    /**
     * @dev Get mint history count
     */
    function getMintHistoryLength() external view returns (uint256) {
        return mintHistory.length;
    }
    
    /**
     * @dev Get burn history count
     */
    function getBurnHistoryLength() external view returns (uint256) {
        return burnHistory.length;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Reset daily limits if new day
     */
    function _resetDailyLimitsIfNeeded() internal {
        uint256 currentDay = block.timestamp / 1 days;
        if (currentDay > lastResetDay) {
            dailyMinted = 0;
            dailyBurned = 0;
            lastResetDay = currentDay;
        }
    }
    
    /**
     * @dev Override transfer to check frozen/blacklisted accounts
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        require(!frozenAccounts[from], "Sender account is frozen");
        require(!frozenAccounts[to], "Recipient account is frozen");
        require(!blacklistedAccounts[from], "Sender account is blacklisted");
        require(!blacklistedAccounts[to], "Recipient account is blacklisted");
        
        super._update(from, to, value);
    }
}

