/**
 * Contract Management System
 *
 * Handles manufacturing contracts with AI foundries.
 * Supports spot orders, short-term, and long-term contracts.
 */

import { getFoundryById, calculateContractPricing } from './foundryMarket.js';

/**
 * Contract data structure matches FEATURES.md specification
 */
export class Contract {
    constructor(data) {
        this.id = data.id || `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = data.type; // 'spot', 'short-term', 'long-term'

        // Parties
        this.foundryId = data.foundryId;
        this.foundryName = data.foundryName;
        this.customerId = 'player';

        // Production specifications
        this.dieId = data.dieId;
        this.dieName = data.dieName || 'Unknown Die';
        this.processNode = data.processNode;
        this.waferSize = data.waferSize;
        this.wafersPerWeek = data.wafersPerWeek;
        this.services = data.services || ['fabrication'];

        // Timeline (in weeks from game start)
        this.signedWeek = data.signedWeek;
        this.startWeek = data.startWeek; // After lead time
        this.endWeek = data.endWeek;
        this.durationWeeks = data.durationWeeks;

        // Pricing
        this.basePricePerWafer = data.basePricePerWafer;
        this.discountPercent = data.discountPercent || 0;
        this.pricePerWafer = data.pricePerWafer;

        // Financials
        this.totalWafers = data.totalWafers;
        this.totalValue = data.totalValue;
        this.depositPercent = data.depositPercent || 0;
        this.depositPaid = data.depositPaid || 0;
        this.amountPaid = data.amountPaid || 0;
        this.remainingBalance = data.remainingBalance || data.totalValue;

        // Progress
        this.status = data.status || 'pending'; // pending | active | completed | cancelled
        this.weeksElapsed = data.weeksElapsed || 0;
        this.wafersCompleted = data.wafersCompleted || 0;
        this.wafersRemaining = data.wafersRemaining || data.totalWafers;
        this.diesDelivered = data.diesDelivered || 0;

        // Quality metrics
        this.averageYield = data.averageYield || 0;
        this.defectRate = data.defectRate || 0;

        // Deliverables
        this.binningComplete = data.binningComplete || false;
        this.packagingComplete = data.packagingComplete || false;
        this.skusProduced = data.skusProduced || {};

        // Terms
        this.cancellationFee = data.cancellationFee || 0.25; // 25% default
        this.yieldGuarantee = data.yieldGuarantee || null;
        this.penaltyPerWaferBelowGuarantee = data.penaltyPerWaferBelowGuarantee || 0;

        // Events log
        this.events = data.events || [];
        if (this.events.length === 0) {
            this.addEvent(this.signedWeek, 'signed', 'Contract signed');
        }
    }

    addEvent(week, type, note) {
        this.events.push({ week, type, note });
    }

    /**
     * Advance contract by one week
     */
    progressWeek(currentWeek) {
        if (this.status !== 'active') {
            return;
        }

        if (currentWeek < this.startWeek) {
            // Contract hasn't started yet
            return;
        }

        if (currentWeek > this.endWeek) {
            // Contract completed
            this.status = 'completed';
            this.addEvent(currentWeek, 'completed', 'Contract completed');
            return;
        }

        this.weeksElapsed++;

        // Process wafers for this week
        const wafersThisWeek = Math.min(this.wafersPerWeek, this.wafersRemaining);
        this.wafersCompleted += wafersThisWeek;
        this.wafersRemaining -= wafersThisWeek;

        // Calculate payment for this week
        const payment = wafersThisWeek * this.pricePerWafer;
        this.amountPaid += payment;
        this.remainingBalance -= payment;

        // TODO: Simulate yield, defects, binning, packaging
        // For now, use placeholder values
        this.averageYield = 0.75; // Placeholder
    }

    /**
     * Cancel contract
     */
    cancel(currentWeek) {
        if (this.status === 'completed' || this.status === 'cancelled') {
            return false;
        }

        const cancellationCost = this.remainingBalance * this.cancellationFee;
        this.status = 'cancelled';
        this.addEvent(currentWeek, 'cancelled', `Contract cancelled, penalty: $${Math.round(cancellationCost).toLocaleString()}`);

        return cancellationCost;
    }

    /**
     * Get contract summary for display
     */
    getSummary() {
        const foundry = getFoundryById(this.foundryId);

        return {
            id: this.id,
            type: this.type,
            foundry: this.foundryName,
            foundryTier: foundry?.tier || 'unknown',
            die: this.dieName,
            node: `${this.processNode}nm`,
            status: this.status,
            progress: `${this.wafersCompleted}/${this.totalWafers} wafers`,
            progressPercent: (this.wafersCompleted / this.totalWafers * 100).toFixed(1),
            weekProgress: `${this.weeksElapsed}/${this.durationWeeks} weeks`,
            pricePerWafer: `$${this.pricePerWafer.toLocaleString()}`,
            totalValue: `$${Math.round(this.totalValue).toLocaleString()}`,
            amountPaid: `$${Math.round(this.amountPaid).toLocaleString()}`,
            remainingBalance: `$${Math.round(this.remainingBalance).toLocaleString()}`
        };
    }

    /**
     * Serialize for storage
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            foundryId: this.foundryId,
            foundryName: this.foundryName,
            customerId: this.customerId,
            dieId: this.dieId,
            dieName: this.dieName,
            processNode: this.processNode,
            waferSize: this.waferSize,
            wafersPerWeek: this.wafersPerWeek,
            services: this.services,
            signedWeek: this.signedWeek,
            startWeek: this.startWeek,
            endWeek: this.endWeek,
            durationWeeks: this.durationWeeks,
            basePricePerWafer: this.basePricePerWafer,
            discountPercent: this.discountPercent,
            pricePerWafer: this.pricePerWafer,
            totalWafers: this.totalWafers,
            totalValue: this.totalValue,
            depositPercent: this.depositPercent,
            depositPaid: this.depositPaid,
            amountPaid: this.amountPaid,
            remainingBalance: this.remainingBalance,
            status: this.status,
            weeksElapsed: this.weeksElapsed,
            wafersCompleted: this.wafersCompleted,
            wafersRemaining: this.wafersRemaining,
            diesDelivered: this.diesDelivered,
            averageYield: this.averageYield,
            defectRate: this.defectRate,
            binningComplete: this.binningComplete,
            packagingComplete: this.packagingComplete,
            skusProduced: this.skusProduced,
            cancellationFee: this.cancellationFee,
            yieldGuarantee: this.yieldGuarantee,
            penaltyPerWaferBelowGuarantee: this.penaltyPerWaferBelowGuarantee,
            events: this.events
        };
    }
}

/**
 * Contract Manager - handles all player contracts
 */
export class ContractManager {
    constructor() {
        this.contracts = [];
        this.currentWeek = 0; // Game time in weeks
        this.load();
    }

    /**
     * Create a new contract
     */
    createContract(foundryId, contractType, dieId, dieName, processNode, waferSize, wafersPerWeek, durationWeeks) {
        const foundry = getFoundryById(foundryId);
        if (!foundry) {
            throw new Error(`Foundry not found: ${foundryId}`);
        }

        // Calculate pricing
        const pricing = calculateContractPricing(foundry, contractType, processNode, wafersPerWeek, durationWeeks);

        // Determine lead time
        const leadTime = foundry.leadTime[contractType.replace('-', '')] || 4;

        // Calculate deposits based on contract type
        let depositPercent = 0;
        if (contractType === 'short-term') {
            depositPercent = 0.10; // 10% deposit
        } else if (contractType === 'long-term') {
            depositPercent = 0.20; // 20% deposit
        }

        const depositPaid = pricing.totalValue * depositPercent;

        const contract = new Contract({
            foundryId,
            foundryName: foundry.name,
            type: contractType,
            dieId,
            dieName,
            processNode,
            waferSize,
            wafersPerWeek,
            durationWeeks,
            signedWeek: this.currentWeek,
            startWeek: this.currentWeek + leadTime,
            endWeek: this.currentWeek + leadTime + durationWeeks,
            basePricePerWafer: pricing.basePrice,
            discountPercent: pricing.discount,
            pricePerWafer: pricing.pricePerWafer,
            totalWafers: pricing.totalWafers,
            totalValue: pricing.totalValue,
            depositPercent,
            depositPaid,
            amountPaid: depositPaid,
            remainingBalance: pricing.totalValue - depositPaid,
            services: ['fabrication'], // TODO: Allow service selection
            status: 'pending'
        });

        this.contracts.push(contract);
        this.save();

        return contract;
    }

    /**
     * Get all contracts
     */
    getAllContracts() {
        return this.contracts;
    }

    /**
     * Get active contracts
     */
    getActiveContracts() {
        return this.contracts.filter(c => c.status === 'active');
    }

    /**
     * Get pending contracts
     */
    getPendingContracts() {
        return this.contracts.filter(c => c.status === 'pending');
    }

    /**
     * Get contract by ID
     */
    getContract(id) {
        return this.contracts.find(c => c.id === id);
    }

    /**
     * Activate pending contracts that have reached their start week
     */
    activatePendingContracts() {
        this.contracts.forEach(contract => {
            if (contract.status === 'pending' && this.currentWeek >= contract.startWeek) {
                contract.status = 'active';
                contract.addEvent(this.currentWeek, 'started', 'Production started');
            }
        });
    }

    /**
     * Advance all contracts by one week
     */
    progressWeek() {
        this.currentWeek++;

        // Activate pending contracts
        this.activatePendingContracts();

        // Progress active contracts
        this.contracts.forEach(contract => {
            contract.progressWeek(this.currentWeek);
        });

        this.save();
    }

    /**
     * Cancel a contract
     */
    cancelContract(contractId) {
        const contract = this.getContract(contractId);
        if (!contract) {
            return null;
        }

        const cancellationCost = contract.cancel(this.currentWeek);
        this.save();

        return cancellationCost;
    }

    /**
     * Save contracts to localStorage
     */
    save() {
        const data = {
            contracts: this.contracts.map(c => c.toJSON()),
            currentWeek: this.currentWeek
        };
        localStorage.setItem('silicon-tycoon-contracts', JSON.stringify(data));
    }

    /**
     * Load contracts from localStorage
     */
    load() {
        const data = localStorage.getItem('silicon-tycoon-contracts');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.contracts = parsed.contracts.map(c => new Contract(c));
                this.currentWeek = parsed.currentWeek || 0;
            } catch (e) {
                console.error('Failed to load contracts:', e);
                this.contracts = [];
                this.currentWeek = 0;
            }
        }
    }

    /**
     * Clear all contracts (for testing)
     */
    clear() {
        this.contracts = [];
        this.currentWeek = 0;
        localStorage.removeItem('silicon-tycoon-contracts');
    }
}

// Global contract manager instance
let contractManagerInstance = null;

export function getContractManager() {
    if (!contractManagerInstance) {
        contractManagerInstance = new ContractManager();
    }
    return contractManagerInstance;
}
