// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KSC Token V2 (KazSmartChain Native Token)
 * @dev Enhanced ERC-20 token with staking, governance, and deflationary mechanisms
 * 
 * New Features:
 * - Gas fee burning mechanism
 * - Staking functionality
 * - Governance voting power
 * - Controlled inflation
 * - Validator rewards
 */
contract KSCTokenV2 is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit, ReentrancyGuard {
    
    // ============ Constants ============
    
    uint256 public constant MIN_STAKE_AMOUNT = 1000 * 10**18; // 1,000 KSC
    uint256 public constant MIN_VALIDATOR_STAKE = 100000 * 10**18; // 100,000 KSC
    uint256 public constant GOVERNANCE_VOTING_THRESHOLD = 100 * 10**18; // 100 KSC для голосования
    
    // ============ State Variables ============
    
    // Gas fee burning
    uint256 public burnRate = 5000; // 50% (basis points: 10000 = 100%)
    address public gasFeeCollector; // Адрес для сбора gas fees
    
    // Staking
    struct Stake {
        uint256 amount;
        uint256 lockPeriod; // в секундах
        uint256 startTime;
        uint256 rewards;
        bool active;
    }
    
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    uint256 public stakingAPY = 1000; // 10% (basis points: 10000 = 100%)
    
    // Validators
    struct Validator {
        address validatorAddress;
        uint256 stakedAmount;
        uint256 totalRewards;
        bool active;
        uint256 lastRewardBlock;
    }
    
    mapping(address => Validator) public validators;
    address[] public validatorList;
    uint256 public blockReward = 2 * 10**18; // 2 KSC per block
    
    // Governance
    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        address proposer;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount;
    uint256 public votingPeriod = 7 days;
    uint256 public governanceReward = 1 * 10**17; // 0.1 KSC за голосование
    
    // Inflation control
    uint256 public maxAnnualInflation = 600; // 6% (basis points)
    uint256 public currentYearEmission;
    uint256 public currentYearStart;
    uint256 public constant YEAR_IN_SECONDS = 365 days;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event ValidatorRegistered(address indexed validator, uint256 stake);
    event ValidatorRewarded(address indexed validator, uint256 reward);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votingPower);
    event GasFeeBurned(uint256 amount);
    event BurnRateUpdated(uint256 newRate);
    
    // ============ Constructor ============
    
    constructor(uint256 initialSupply) 
        ERC20("KazSmartChain Token", "KSC") 
        Ownable(msg.sender)
        ERC20Permit("KazSmartChain Token")
    {
        _mint(msg.sender, initialSupply * 10 ** decimals());
        gasFeeCollector = msg.sender;
        currentYearStart = block.timestamp;
    }
    
    // ============ Gas Fee Burning ============
    
    /**
     * @dev Process gas fee payment with burning mechanism
     * @param payer Address paying the gas fee
     * @param gasAmount Amount of gas used
     * @param gasPrice Price per gas unit in KSC
     */
    function payGasFee(address payer, uint256 gasAmount, uint256 gasPrice) 
        external 
        onlyOwner 
        returns (uint256) 
    {
        uint256 totalFee = gasAmount * gasPrice;
        uint256 burnAmount = totalFee * burnRate / 10000;
        uint256 validatorAmount = totalFee - burnAmount;
        
        // Transfer from payer
        _transfer(payer, address(this), totalFee);
        
        // Burn portion
        _burn(address(this), burnAmount);
        emit GasFeeBurned(burnAmount);
        
        // Distribute to validators
        if (validatorAmount > 0 && validatorList.length > 0) {
            distributeToValidators(validatorAmount);
        }
        
        return totalFee;
    }
    
    /**
     * @dev Update burn rate (only owner, can be moved to governance)
     */
    function setBurnRate(uint256 newRate) external onlyOwner {
        require(newRate <= 10000, "Burn rate cannot exceed 100%");
        burnRate = newRate;
        emit BurnRateUpdated(newRate);
    }
    
    // ============ Staking ============
    
    /**
     * @dev Stake KSC tokens
     * @param amount Amount to stake
     * @param lockDays Lock period in days (0 = no lock)
     */
    function stake(uint256 amount, uint256 lockDays) external nonReentrant {
        require(amount >= MIN_STAKE_AMOUNT, "Amount below minimum");
        require(stakes[msg.sender].amount == 0, "Already staked");
        
        uint256 lockPeriod = lockDays * 1 days;
        
        _transfer(msg.sender, address(this), amount);
        
        stakes[msg.sender] = Stake({
            amount: amount,
            lockPeriod: lockPeriod,
            startTime: block.timestamp,
            rewards: 0,
            active: true
        });
        
        totalStaked += amount;
        emit Staked(msg.sender, amount, lockPeriod);
    }
    
    /**
     * @dev Unstake tokens and claim rewards
     */
    function unstake() external nonReentrant {
        Stake storage s = stakes[msg.sender];
        require(s.active, "No active stake");
        require(
            block.timestamp >= s.startTime + s.lockPeriod,
            "Lock period not expired"
        );
        
        uint256 rewards = calculateStakingRewards(msg.sender);
        uint256 totalAmount = s.amount + rewards;
        
        // Mint rewards (controlled inflation)
        if (rewards > 0 && canMint(rewards)) {
            _mint(msg.sender, rewards);
            currentYearEmission += rewards;
        }
        
        // Return staked amount
        _transfer(address(this), msg.sender, s.amount);
        
        totalStaked -= s.amount;
        delete stakes[msg.sender];
        
        emit Unstaked(msg.sender, s.amount, rewards);
    }
    
    /**
     * @dev Calculate staking rewards for a user
     */
    function calculateStakingRewards(address staker) public view returns (uint256) {
        Stake memory s = stakes[staker];
        if (!s.active || s.amount == 0) return 0;
        
        uint256 stakedTime = block.timestamp - s.startTime;
        uint256 apy = stakingAPY; // 10% = 1000 basis points
        
        // Calculate: amount * APY * time / (365 days * 10000)
        return s.amount * apy * stakedTime / (YEAR_IN_SECONDS * 10000);
    }
    
    /**
     * @dev Update staking APY (only owner, can be moved to governance)
     */
    function setStakingAPY(uint256 newAPY) external onlyOwner {
        require(newAPY <= 5000, "APY cannot exceed 50%");
        stakingAPY = newAPY;
    }
    
    // ============ Validator Functions ============
    
    /**
     * @dev Register as validator
     */
    function registerValidator() external {
        require(validators[msg.sender].stakedAmount == 0, "Already validator");
        require(balanceOf(msg.sender) >= MIN_VALIDATOR_STAKE, "Insufficient stake");
        
        _transfer(msg.sender, address(this), MIN_VALIDATOR_STAKE);
        
        validators[msg.sender] = Validator({
            validatorAddress: msg.sender,
            stakedAmount: MIN_VALIDATOR_STAKE,
            totalRewards: 0,
            active: true,
            lastRewardBlock: block.number
        });
        
        validatorList.push(msg.sender);
        totalStaked += MIN_VALIDATOR_STAKE;
        
        emit ValidatorRegistered(msg.sender, MIN_VALIDATOR_STAKE);
    }
    
    /**
     * @dev Distribute rewards to validators (called by consensus)
     */
    function distributeValidatorReward(address validator) external onlyOwner {
        require(validators[validator].active, "Invalid validator");
        
        if (canMint(blockReward)) {
            _mint(validator, blockReward);
            validators[validator].totalRewards += blockReward;
            validators[validator].lastRewardBlock = block.number;
            currentYearEmission += blockReward;
            
            emit ValidatorRewarded(validator, blockReward);
        }
    }
    
    /**
     * @dev Distribute gas fees to validators proportionally
     */
    function distributeToValidators(uint256 amount) internal {
        if (validatorList.length == 0) return;
        
        uint256 perValidator = amount / validatorList.length;
        for (uint256 i = 0; i < validatorList.length; i++) {
            address validator = validatorList[i];
            if (validators[validator].active) {
                _transfer(address(this), validator, perValidator);
            }
        }
    }
    
    // ============ Governance ============
    
    /**
     * @dev Create a governance proposal
     */
    function createProposal(string memory description) external returns (uint256) {
        require(balanceOf(msg.sender) >= GOVERNANCE_VOTING_THRESHOLD, "Insufficient balance");
        
        proposalCount++;
        proposals[proposalCount] = Proposal({
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + votingPeriod,
            executed: false,
            proposer: msg.sender
        });
        
        emit ProposalCreated(proposalCount, msg.sender);
        return proposalCount;
    }
    
    /**
     * @dev Vote on a proposal
     */
    function vote(uint256 proposalId, bool support) external {
        require(proposals[proposalId].deadline > 0, "Proposal does not exist");
        require(block.timestamp < proposals[proposalId].deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(balanceOf(msg.sender) >= GOVERNANCE_VOTING_THRESHOLD, "Insufficient balance");
        
        uint256 votingPower = balanceOf(msg.sender);
        
        if (support) {
            proposals[proposalId].votesFor += votingPower;
        } else {
            proposals[proposalId].votesAgainst += votingPower;
        }
        
        hasVoted[proposalId][msg.sender] = true;
        
        // Reward for participation
        if (canMint(governanceReward)) {
            _mint(msg.sender, governanceReward);
            currentYearEmission += governanceReward;
        }
        
        emit Voted(proposalId, msg.sender, support, votingPower);
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 proposalId) external view returns (
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 deadline,
        bool executed,
        address proposer
    ) {
        Proposal memory p = proposals[proposalId];
        return (p.description, p.votesFor, p.votesAgainst, p.deadline, p.executed, p.proposer);
    }
    
    // ============ Inflation Control ============
    
    /**
     * @dev Check if minting is allowed within inflation limits
     */
    function canMint(uint256 amount) public view returns (bool) {
        // Reset yearly counter if new year
        uint256 yearStart = currentYearStart;
        if (block.timestamp >= yearStart + YEAR_IN_SECONDS) {
            return true; // New year, can mint
        }
        
        uint256 currentSupply = totalSupply();
        uint256 maxYearlyEmission = currentSupply * maxAnnualInflation / 10000;
        
        return (currentYearEmission + amount) <= maxYearlyEmission;
    }
    
    /**
     * @dev Reset yearly emission counter (called at start of new year)
     */
    function resetYearlyEmission() external onlyOwner {
        require(block.timestamp >= currentYearStart + YEAR_IN_SECONDS, "Year not ended");
        currentYearStart = block.timestamp;
        currentYearEmission = 0;
    }
    
    /**
     * @dev Update max annual inflation (governance)
     */
    function setMaxAnnualInflation(uint256 newInflation) external onlyOwner {
        require(newInflation <= 1000, "Inflation cannot exceed 10%");
        maxAnnualInflation = newInflation;
    }
    
    // ============ Standard Functions ============
    
    /**
     * @dev Mint new tokens (only owner, controlled by inflation)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(canMint(amount), "Exceeds annual inflation limit");
        _mint(to, amount);
        currentYearEmission += amount;
    }
    
    /**
     * @dev Pause all token transfers
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
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
    
    // ============ View Functions ============
    
    /**
     * @dev Get total staked amount
     */
    function getTotalStaked() external view returns (uint256) {
        return totalStaked;
    }
    
    /**
     * @dev Get validator count
     */
    function getValidatorCount() external view returns (uint256) {
        return validatorList.length;
    }
    
    /**
     * @dev Get current inflation rate
     */
    function getCurrentInflationRate() external view returns (uint256) {
        if (totalSupply() == 0) return 0;
        uint256 yearStart = currentYearStart;
        if (block.timestamp >= yearStart + YEAR_IN_SECONDS) {
            return 0; // New year, reset
        }
        return currentYearEmission * 10000 / totalSupply();
    }
}

