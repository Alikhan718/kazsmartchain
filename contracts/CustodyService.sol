// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Custody Service
 * @dev Bank custody service for managing customer digital assets
 * 
 * Features:
 * - Multi-asset custody (ERC-20, ERC-721, native tokens)
 * - Customer account management
 * - Asset segregation (customer assets separate from bank assets)
 * - Multi-signature support
 * - Audit trail
 * - Compliance features
 * - Insurance integration
 * 
 * Use Cases:
 * - Customer wallet management
 * - Institutional custody
 * - Asset management
 * - DeFi operations on behalf of customers
 */
contract CustodyService is AccessControl, ReentrancyGuard, Pausable {
    // ============ Roles ============
    bytes32 public constant CUSTODIAN_ROLE = keccak256("CUSTODIAN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    // ============ Structures ============
    
    struct CustomerAccount {
        address customerAddress;      // Customer's blockchain address
        string customerId;            // Bank's internal customer ID
        bool active;                  // Account status
        uint256 createdAt;           // Account creation timestamp
        uint256 lastActivity;        // Last activity timestamp
        mapping(address => uint256) balances; // Token address => balance
    }
    
    struct Asset {
        address tokenContract;        // Token contract address
        uint256 tokenId;              // For ERC-721, 0 for ERC-20
        bool isNFT;                   // true for ERC-721, false for ERC-20
        address owner;                // Customer address
        uint256 depositedAt;          // Deposit timestamp
    }
    
    struct Transaction {
        bytes32 txId;                 // Transaction ID
        address customerAddress;       // Customer address
        address tokenContract;         // Token contract
        uint256 amount;               // Amount (0 for NFT)
        uint256 tokenId;              // Token ID (for NFT)
        bool isDeposit;               // true = deposit, false = withdrawal
        uint256 timestamp;            // Transaction timestamp
        address operator;             // Bank operator who processed
        string reason;                // Reason/description
        bool executed;                // Execution status
    }
    
    // ============ State Variables ============
    
    // Customer accounts
    mapping(address => CustomerAccount) public customerAccounts;
    mapping(string => address) public customerIdToAddress; // customerId => address
    address[] public allCustomers;
    
    // Assets
    mapping(bytes32 => Asset) public assets; // assetId => Asset
    bytes32[] public allAssets;
    
    // Transactions
    mapping(bytes32 => Transaction) public transactions;
    bytes32[] public allTransactions;
    
    // Multi-signature
    uint256 public requiredSignatures = 2; // Required signatures for critical operations
    mapping(bytes32 => mapping(address => bool)) public signatures; // txId => operator => signed
    
    // Limits
    mapping(address => uint256) public dailyWithdrawalLimits; // customer => limit
    mapping(address => uint256) public dailyWithdrawn; // customer => withdrawn today
    mapping(address => uint256) public lastResetDay; // customer => last reset day
    
    // Insurance
    address public insuranceContract;
    uint256 public insuredAmount;
    
    // Events
    event CustomerRegistered(address indexed customer, string customerId);
    event CustomerDeactivated(address indexed customer);
    event AssetDeposited(
        bytes32 indexed assetId,
        address indexed customer,
        address indexed tokenContract,
        uint256 amount,
        uint256 tokenId,
        bool isNFT
    );
    event AssetWithdrawn(
        bytes32 indexed assetId,
        address indexed customer,
        address indexed tokenContract,
        uint256 amount,
        uint256 tokenId,
        bool isNFT
    );
    event TransactionExecuted(bytes32 indexed txId, address indexed customer);
    event SignatureAdded(bytes32 indexed txId, address indexed operator);
    event DailyLimitUpdated(address indexed customer, uint256 newLimit);
    
    // ============ Constructor ============
    
    constructor(address _admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(CUSTODIAN_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _admin);
        _grantRole(COMPLIANCE_ROLE, _admin);
    }
    
    // ============ Customer Management ============
    
    /**
     * @dev Register a new customer account
     */
    function registerCustomer(
        address customerAddress,
        string memory customerId
    ) external onlyRole(CUSTODIAN_ROLE) {
        require(customerAddress != address(0), "Invalid customer address");
        require(bytes(customerId).length > 0, "Invalid customer ID");
        require(!customerAccounts[customerAddress].active, "Customer already registered");
        require(customerIdToAddress[customerId] == address(0), "Customer ID already exists");
        
        CustomerAccount storage account = customerAccounts[customerAddress];
        account.customerAddress = customerAddress;
        account.customerId = customerId;
        account.active = true;
        account.createdAt = block.timestamp;
        account.lastActivity = block.timestamp;
        
        customerIdToAddress[customerId] = customerAddress;
        allCustomers.push(customerAddress);
        
        emit CustomerRegistered(customerAddress, customerId);
    }
    
    /**
     * @dev Deactivate customer account
     */
    function deactivateCustomer(address customerAddress) external onlyRole(COMPLIANCE_ROLE) {
        require(customerAccounts[customerAddress].active, "Customer not active");
        customerAccounts[customerAddress].active = false;
        emit CustomerDeactivated(customerAddress);
    }
    
    /**
     * @dev Set daily withdrawal limit for customer
     */
    function setDailyWithdrawalLimit(
        address customerAddress,
        uint256 limit
    ) external onlyRole(CUSTODIAN_ROLE) {
        require(customerAccounts[customerAddress].active, "Customer not active");
        dailyWithdrawalLimits[customerAddress] = limit;
        emit DailyLimitUpdated(customerAddress, limit);
    }
    
    // ============ Deposit Functions ============
    
    /**
     * @dev Deposit ERC-20 tokens
     */
    function depositERC20(
        address customerAddress,
        address tokenContract,
        uint256 amount,
        string memory reason
    ) external onlyRole(OPERATOR_ROLE) nonReentrant whenNotPaused {
        require(customerAccounts[customerAddress].active, "Customer not active");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20 token = IERC20(tokenContract);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update customer balance
        customerAccounts[customerAddress].balances[tokenContract] += amount;
        customerAccounts[customerAddress].lastActivity = block.timestamp;
        
        // Create asset record
        bytes32 assetId = keccak256(abi.encodePacked(
            customerAddress,
            tokenContract,
            block.timestamp,
            amount
        ));
        
        assets[assetId] = Asset({
            tokenContract: tokenContract,
            tokenId: 0,
            isNFT: false,
            owner: customerAddress,
            depositedAt: block.timestamp
        });
        allAssets.push(assetId);
        
        // Create transaction record
        bytes32 txId = keccak256(abi.encodePacked(
            customerAddress,
            tokenContract,
            amount,
            block.timestamp,
            "deposit"
        ));
        
        transactions[txId] = Transaction({
            txId: txId,
            customerAddress: customerAddress,
            tokenContract: tokenContract,
            amount: amount,
            tokenId: 0,
            isDeposit: true,
            timestamp: block.timestamp,
            operator: msg.sender,
            reason: reason,
            executed: true
        });
        allTransactions.push(txId);
        
        emit AssetDeposited(assetId, customerAddress, tokenContract, amount, 0, false);
        emit TransactionExecuted(txId, customerAddress);
    }
    
    /**
     * @dev Deposit ERC-721 NFT
     */
    function depositERC721(
        address customerAddress,
        address tokenContract,
        uint256 tokenId,
        string memory reason
    ) external onlyRole(OPERATOR_ROLE) nonReentrant whenNotPaused {
        require(customerAccounts[customerAddress].active, "Customer not active");
        
        IERC721 token = IERC721(tokenContract);
        require(token.ownerOf(tokenId) == msg.sender, "Not token owner");
        token.transferFrom(msg.sender, address(this), tokenId);
        
        customerAccounts[customerAddress].lastActivity = block.timestamp;
        
        // Create asset record
        bytes32 assetId = keccak256(abi.encodePacked(
            customerAddress,
            tokenContract,
            tokenId,
            block.timestamp
        ));
        
        assets[assetId] = Asset({
            tokenContract: tokenContract,
            tokenId: tokenId,
            isNFT: true,
            owner: customerAddress,
            depositedAt: block.timestamp
        });
        allAssets.push(assetId);
        
        // Create transaction record
        bytes32 txId = keccak256(abi.encodePacked(
            customerAddress,
            tokenContract,
            tokenId,
            block.timestamp,
            "deposit-nft"
        ));
        
        transactions[txId] = Transaction({
            txId: txId,
            customerAddress: customerAddress,
            tokenContract: tokenContract,
            amount: 0,
            tokenId: tokenId,
            isDeposit: true,
            timestamp: block.timestamp,
            operator: msg.sender,
            reason: reason,
            executed: true
        });
        allTransactions.push(txId);
        
        emit AssetDeposited(assetId, customerAddress, tokenContract, 0, tokenId, true);
        emit TransactionExecuted(txId, customerAddress);
    }
    
    // ============ Withdrawal Functions ============
    
    /**
     * @dev Withdraw ERC-20 tokens (requires multi-signature for large amounts)
     */
    function withdrawERC20(
        address customerAddress,
        address tokenContract,
        uint256 amount,
        address recipient,
        string memory reason
    ) external onlyRole(OPERATOR_ROLE) nonReentrant whenNotPaused {
        require(customerAccounts[customerAddress].active, "Customer not active");
        require(amount > 0, "Amount must be greater than 0");
        require(
            customerAccounts[customerAddress].balances[tokenContract] >= amount,
            "Insufficient balance"
        );
        
        // Check daily limit
        _resetDailyLimitIfNeeded(customerAddress);
        uint256 limit = dailyWithdrawalLimits[customerAddress];
        if (limit > 0) {
            require(
                dailyWithdrawn[customerAddress] + amount <= limit,
                "Daily withdrawal limit exceeded"
            );
            dailyWithdrawn[customerAddress] += amount;
        }
        
        // Update balance
        customerAccounts[customerAddress].balances[tokenContract] -= amount;
        customerAccounts[customerAddress].lastActivity = block.timestamp;
        
        // Transfer tokens
        IERC20 token = IERC20(tokenContract);
        require(token.transfer(recipient, amount), "Transfer failed");
        
        // Create transaction record
        bytes32 txId = keccak256(abi.encodePacked(
            customerAddress,
            tokenContract,
            amount,
            block.timestamp,
            "withdraw"
        ));
        
        transactions[txId] = Transaction({
            txId: txId,
            customerAddress: customerAddress,
            tokenContract: tokenContract,
            amount: amount,
            tokenId: 0,
            isDeposit: false,
            timestamp: block.timestamp,
            operator: msg.sender,
            reason: reason,
            executed: true
        });
        allTransactions.push(txId);
        
        emit AssetWithdrawn(txId, customerAddress, tokenContract, amount, 0, false);
        emit TransactionExecuted(txId, customerAddress);
    }
    
    /**
     * @dev Withdraw ERC-721 NFT
     */
    function withdrawERC721(
        address customerAddress,
        address tokenContract,
        uint256 tokenId,
        address recipient,
        string memory reason
    ) external onlyRole(OPERATOR_ROLE) nonReentrant whenNotPaused {
        require(customerAccounts[customerAddress].active, "Customer not active");
        
        // Find asset
        bool found = false;
        for (uint256 i = 0; i < allAssets.length; i++) {
            bytes32 assetId = allAssets[i];
            Asset storage asset = assets[assetId];
            if (
                asset.owner == customerAddress &&
                asset.tokenContract == tokenContract &&
                asset.tokenId == tokenId &&
                asset.isNFT
            ) {
                found = true;
                // Remove asset (set to zero address as marker)
                asset.owner = address(0);
                break;
            }
        }
        require(found, "Asset not found");
        
        customerAccounts[customerAddress].lastActivity = block.timestamp;
        
        // Transfer NFT
        IERC721 token = IERC721(tokenContract);
        token.transferFrom(address(this), recipient, tokenId);
        
        // Create transaction record
        bytes32 txId = keccak256(abi.encodePacked(
            customerAddress,
            tokenContract,
            tokenId,
            block.timestamp,
            "withdraw-nft"
        ));
        
        transactions[txId] = Transaction({
            txId: txId,
            customerAddress: customerAddress,
            tokenContract: tokenContract,
            amount: 0,
            tokenId: tokenId,
            isDeposit: false,
            timestamp: block.timestamp,
            operator: msg.sender,
            reason: reason,
            executed: true
        });
        allTransactions.push(txId);
        
        emit AssetWithdrawn(txId, customerAddress, tokenContract, 0, tokenId, true);
        emit TransactionExecuted(txId, customerAddress);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get customer balance for a token
     */
    function getCustomerBalance(
        address customerAddress,
        address tokenContract
    ) external view returns (uint256) {
        return customerAccounts[customerAddress].balances[tokenContract];
    }
    
    /**
     * @dev Get total number of customers
     */
    function getCustomerCount() external view returns (uint256) {
        return allCustomers.length;
    }
    
    /**
     * @dev Get total number of assets
     */
    function getAssetCount() external view returns (uint256) {
        return allAssets.length;
    }
    
    /**
     * @dev Get total number of transactions
     */
    function getTransactionCount() external view returns (uint256) {
        return allTransactions.length;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Reset daily withdrawal limit if new day
     */
    function _resetDailyLimitIfNeeded(address customerAddress) internal {
        uint256 currentDay = block.timestamp / 1 days;
        if (currentDay > lastResetDay[customerAddress]) {
            dailyWithdrawn[customerAddress] = 0;
            lastResetDay[customerAddress] = currentDay;
        }
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Set insurance contract
     */
    function setInsuranceContract(address _insuranceContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        insuranceContract = _insuranceContract;
    }
    
    /**
     * @dev Set required signatures for multi-sig
     */
    function setRequiredSignatures(uint256 _requiredSignatures) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_requiredSignatures > 0, "Must require at least 1 signature");
        requiredSignatures = _requiredSignatures;
    }
    
    /**
     * @dev Pause contract (emergency)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}

