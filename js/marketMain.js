/**
 * Foundry Market Main Application
 *
 * Handles the foundry marketplace UI where players can browse foundries
 * and create manufacturing contracts.
 */

import { FOUNDRIES, getAvailableFoundries, getFoundryNodes, getFoundryCapacity, calculateContractPricing, getMarketConditions } from './foundryMarket.js';
import { getContractManager } from './contracts.js';
import { getDieLibrary } from './dieLibrary.js';
import { PROCESS_NODES } from './constants.js';

class FoundryMarketApp {
    constructor() {
        this.currentYear = 2024; // TODO: Integrate with game time system
        this.selectedDie = null;
        this.selectedFoundry = null;
        this.contractManager = getContractManager();

        this.init();
    }

    init() {
        console.log('[FoundryMarket] Initializing...');

        // Populate dropdowns
        this.populateDieSelect();
        this.populateProcessNodes();

        // Check for pending order from wafer planner
        this.checkPendingOrder();

        // Set up event listeners
        this.setupEventListeners();

        // Initial foundry list
        this.updateFoundryList();

        // Display active contracts
        this.updateActiveContracts();

        console.log('[FoundryMarket] Initialization complete');
    }

    /**
     * Check if there's a pending order from the wafer planner
     */
    checkPendingOrder() {
        const pendingOrderData = localStorage.getItem('silicon-tycoon-pending-order');
        if (!pendingOrderData) {
            return;
        }

        try {
            const orderData = JSON.parse(pendingOrderData);
            console.log('[FoundryMarket] Found pending order:', orderData);

            // Auto-select die
            if (orderData.dieId) {
                document.getElementById('die-select').value = orderData.dieId;
                const library = getDieLibrary();
                this.selectedDie = library.getDie(orderData.dieId);
            }

            // Auto-set process node filter
            if (orderData.processNode) {
                document.getElementById('process-node-filter').value = orderData.processNode;
            }

            // Clear the pending order
            localStorage.removeItem('silicon-tycoon-pending-order');

            // Show a helpful message
            setTimeout(() => {
                alert(`Batch plan loaded from Wafer Planner!\n\nDie: ${this.selectedDie?.sku || 'Unknown'}\nProcess Node: ${orderData.processNode}nm\nDies per Wafer: ${orderData.diesPerWafer}\n\nSelect a foundry to place your order.`);
            }, 500);

        } catch (e) {
            console.error('[FoundryMarket] Failed to load pending order:', e);
            localStorage.removeItem('silicon-tycoon-pending-order');
        }
    }

    setupEventListeners() {
        // Die selection
        document.getElementById('die-select').addEventListener('change', (e) => {
            const dieId = e.target.value;
            if (dieId) {
                const library = getDieLibrary();
                this.selectedDie = library.getDie(dieId);
                console.log('[FoundryMarket] Selected die:', this.selectedDie);

                // Auto-set process node if die has one
                if (this.selectedDie && this.selectedDie.processNode) {
                    document.getElementById('process-node-filter').value = this.selectedDie.processNode;
                }
            } else {
                this.selectedDie = null;
            }
            this.updateFoundryList();
        });

        // Contract type change
        document.getElementById('contract-type').addEventListener('change', (e) => {
            const type = e.target.value;
            const durationGroup = document.getElementById('contract-duration-group');
            const wafersPerWeekGroup = document.getElementById('wafers-per-week-group');

            if (type === 'spot') {
                durationGroup.style.display = 'none';
                wafersPerWeekGroup.style.display = 'none';
            } else {
                durationGroup.style.display = 'block';
                wafersPerWeekGroup.style.display = 'block';

                // Set default durations
                const durationInput = document.getElementById('contract-duration');
                if (type === 'short-term') {
                    durationInput.min = 13;
                    durationInput.max = 52;
                    durationInput.value = 26;
                } else if (type === 'long-term') {
                    durationInput.min = 52;
                    durationInput.max = 260;
                    durationInput.value = 104;
                }
            }
            this.updateFoundryList();
        });

        // Apply filters button
        document.getElementById('apply-filters-btn').addEventListener('click', () => {
            this.updateFoundryList();
        });

        // Sort change
        document.getElementById('sort-by').addEventListener('change', () => {
            this.updateFoundryList();
        });

        // Modal close
        document.getElementById('close-contract-modal').addEventListener('click', () => {
            document.getElementById('contract-modal').style.display = 'none';
        });

        document.getElementById('cancel-contract-btn').addEventListener('click', () => {
            document.getElementById('contract-modal').style.display = 'none';
        });
    }

    populateDieSelect() {
        const select = document.getElementById('die-select');
        const library = getDieLibrary();
        const dies = library.getAllDies();

        dies.forEach(die => {
            const option = document.createElement('option');
            option.value = die.id;
            option.textContent = `${die.sku} (${die.dimensions.width}×${die.dimensions.height}mm, ${die.processNode}nm)`;
            select.appendChild(option);
        });
    }

    populateProcessNodes() {
        const select = document.getElementById('process-node-filter');

        PROCESS_NODES.forEach(node => {
            const option = document.createElement('option');
            option.value = node.size;
            option.textContent = `${node.size}nm`;
            select.appendChild(option);
        });
    }

    updateFoundryList() {
        const processNodeFilter = document.getElementById('process-node-filter').value;
        const tierFilter = document.getElementById('tier-filter').value;
        const sortBy = document.getElementById('sort-by').value;

        // Get available foundries
        let foundries = getAvailableFoundries(this.currentYear, processNodeFilter ? parseInt(processNodeFilter) : null);

        // Apply tier filter
        if (tierFilter) {
            foundries = foundries.filter(f => f.tier === tierFilter);
        }

        // Sort foundries
        foundries = this.sortFoundries(foundries, sortBy);

        // Render foundries
        this.renderFoundries(foundries);
    }

    sortFoundries(foundries, sortBy) {
        const sorted = [...foundries];

        switch (sortBy) {
            case 'reputation':
                sorted.sort((a, b) => b.reputation - a.reputation);
                break;
            case 'price-low':
                sorted.sort((a, b) => a.pricingMultiplier - b.pricingMultiplier);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.pricingMultiplier - a.pricingMultiplier);
                break;
            case 'quality':
                sorted.sort((a, b) => b.qualityMultiplier - a.qualityMultiplier);
                break;
            case 'capacity':
                sorted.sort((a, b) => getFoundryCapacity(b, this.currentYear) - getFoundryCapacity(a, this.currentYear));
                break;
        }

        return sorted;
    }

    renderFoundries(foundries) {
        const container = document.getElementById('foundry-list');
        container.innerHTML = '';

        if (foundries.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;">No foundries match your criteria</p>';
            return;
        }

        foundries.forEach(foundry => {
            const card = this.createFoundryCard(foundry);
            container.appendChild(card);
        });
    }

    createFoundryCard(foundry) {
        const card = document.createElement('div');
        card.className = 'foundry-card themed-panel-bg beefy-border-panel chevron-corners-medium';

        const nodes = getFoundryNodes(foundry, this.currentYear);
        const capacity = getFoundryCapacity(foundry, this.currentYear);
        const market = getMarketConditions(foundry, this.currentYear, this.contractManager.currentWeek);

        // Calculate pricing for display
        const processNode = this.selectedDie?.processNode || parseInt(document.getElementById('process-node-filter').value) || nodes[0];
        const contractType = document.getElementById('contract-type').value;
        const waferCount = parseInt(document.getElementById('wafer-count').value) || 100;

        let wafersPerWeek = 1;
        let durationWeeks = 1;

        if (contractType === 'spot') {
            wafersPerWeek = waferCount;
            durationWeeks = 1;
        } else {
            wafersPerWeek = parseInt(document.getElementById('wafers-per-week').value) || 10;
            durationWeeks = parseInt(document.getElementById('contract-duration').value) || 52;
        }

        const pricing = calculateContractPricing(foundry, contractType, processNode, wafersPerWeek, durationWeeks);

        // Tier badge color
        const tierColors = {
            'premium': '#FFD700',
            'mid-range': '#C0C0C0',
            'budget': '#CD7F32',
            'specialty': '#9370DB'
        };

        card.innerHTML = `
            <div class="foundry-card-header">
                <h3>${foundry.name}</h3>
                <span class="tier-badge" style="background: ${tierColors[foundry.tier] || '#888'}; color: #000; padding: 2px 8px; border-radius: 3px; font-size: 0.8em;">
                    ${foundry.tier.toUpperCase()}
                </span>
            </div>

            <div class="foundry-card-body">
                <p style="font-size: 0.9em; color: #aaa; margin-bottom: 10px;">${foundry.description}</p>

                <div class="foundry-stats">
                    <div class="stat-row">
                        <span class="stat-label">Reputation:</span>
                        <span class="stat-value">${foundry.reputation}/100</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Quality Multiplier:</span>
                        <span class="stat-value">${(foundry.qualityMultiplier * 100).toFixed(0)}%</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Capacity:</span>
                        <span class="stat-value">${capacity.toLocaleString()} wafers/week</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Utilization:</span>
                        <span class="stat-value">${(market.utilization * 100).toFixed(1)}%</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Available Nodes:</span>
                        <span class="stat-value">${nodes.join('nm, ')}nm</span>
                    </div>
                </div>

                <div class="pricing-section" style="margin-top: 15px; padding: 10px; background: rgba(0, 255, 255, 0.05); border-radius: 4px;">
                    <div class="stat-row">
                        <span class="stat-label">Price per Wafer:</span>
                        <span class="stat-value" style="color: #00FFFF; font-weight: bold;">$${pricing.pricePerWafer.toLocaleString()}</span>
                    </div>
                    ${pricing.discount > 0 ? `
                        <div class="stat-row">
                            <span class="stat-label">Discount:</span>
                            <span class="stat-value" style="color: #00FF00;">${(pricing.discount * 100).toFixed(0)}%</span>
                        </div>
                    ` : ''}
                    <div class="stat-row">
                        <span class="stat-label">Total Value:</span>
                        <span class="stat-value" style="color: #FFD700; font-weight: bold;">$${(pricing.totalValue / 1000000).toFixed(2)}M</span>
                    </div>
                </div>

                <button class="art-deco-button beefy-border-button chevron-corners-button select-foundry-btn" data-foundry-id="${foundry.id}" style="width: 100%; margin-top: 15px;">
                    <span class="button-text">SELECT FOUNDRY</span>
                </button>
            </div>
        `;

        // Add click handler for select button
        const selectBtn = card.querySelector('.select-foundry-btn');
        selectBtn.addEventListener('click', () => {
            this.openContractModal(foundry, pricing);
        });

        return card;
    }

    openContractModal(foundry, pricing) {
        if (!this.selectedDie) {
            alert('Please select a die design first');
            return;
        }

        this.selectedFoundry = foundry;

        const modal = document.getElementById('contract-modal');
        const details = document.getElementById('contract-details');

        const contractType = document.getElementById('contract-type').value;
        const waferCount = parseInt(document.getElementById('wafer-count').value);

        let wafersPerWeek = 1;
        let durationWeeks = 1;

        if (contractType === 'spot') {
            wafersPerWeek = waferCount;
            durationWeeks = 1;
        } else {
            wafersPerWeek = parseInt(document.getElementById('wafers-per-week').value);
            durationWeeks = parseInt(document.getElementById('contract-duration').value);
        }

        const depositPercent = contractType === 'spot' ? 0 : (contractType === 'short-term' ? 0.10 : 0.20);
        const deposit = pricing.totalValue * depositPercent;

        details.innerHTML = `
            <h3>Contract Summary</h3>
            <div class="contract-summary">
                <div class="summary-row"><strong>Foundry:</strong> ${foundry.fullName}</div>
                <div class="summary-row"><strong>Die Design:</strong> ${this.selectedDie.sku}</div>
                <div class="summary-row"><strong>Process Node:</strong> ${this.selectedDie.processNode}nm</div>
                <div class="summary-row"><strong>Contract Type:</strong> ${contractType.replace('-', ' ').toUpperCase()}</div>
                <div class="summary-row"><strong>Duration:</strong> ${durationWeeks} weeks</div>
                <div class="summary-row"><strong>Wafers per Week:</strong> ${wafersPerWeek}</div>
                <div class="summary-row"><strong>Total Wafers:</strong> ${pricing.totalWafers.toLocaleString()}</div>
                <hr style="margin: 15px 0; border-color: #00FFFF;">
                <div class="summary-row"><strong>Price per Wafer:</strong> $${pricing.pricePerWafer.toLocaleString()}</div>
                ${pricing.discount > 0 ? `<div class="summary-row"><strong>Discount:</strong> ${(pricing.discount * 100).toFixed(0)}%</div>` : ''}
                <div class="summary-row"><strong>Total Contract Value:</strong> <span style="color: #FFD700; font-size: 1.2em;">$${(pricing.totalValue / 1000000).toFixed(2)}M</span></div>
                ${depositPercent > 0 ? `<div class="summary-row"><strong>Deposit Required:</strong> $${(deposit / 1000000).toFixed(2)}M (${(depositPercent * 100)}%)</div>` : ''}
            </div>
        `;

        modal.style.display = 'flex';

        // Set up confirm button
        const confirmBtn = document.getElementById('confirm-contract-btn');
        confirmBtn.onclick = () => {
            this.confirmContract(foundry, wafersPerWeek, durationWeeks);
        };
    }

    confirmContract(foundry, wafersPerWeek, durationWeeks) {
        try {
            const contract = this.contractManager.createContract(
                foundry.id,
                document.getElementById('contract-type').value,
                this.selectedDie.id,
                this.selectedDie.sku,
                this.selectedDie.processNode,
                300, // waferSize - TODO: make selectable
                wafersPerWeek,
                durationWeeks
            );

            console.log('[FoundryMarket] Contract created:', contract);

            // Close modal
            document.getElementById('contract-modal').style.display = 'none';

            // Update active contracts display
            this.updateActiveContracts();

            alert(`Contract signed with ${foundry.name}!\n\nContract ID: ${contract.id}\nTotal Value: $${(contract.totalValue / 1000000).toFixed(2)}M`);
        } catch (error) {
            console.error('[FoundryMarket] Failed to create contract:', error);
            alert('Failed to create contract: ' + error.message);
        }
    }

    updateActiveContracts() {
        const container = document.getElementById('active-contracts-list');
        const contracts = this.contractManager.getAllContracts();

        if (contracts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">No contracts yet</p>';
            return;
        }

        container.innerHTML = '';

        contracts.forEach(contract => {
            const summary = contract.getSummary();
            const card = document.createElement('div');
            card.className = 'contract-card';
            card.style.cssText = 'padding: 10px; margin-bottom: 10px; background: rgba(0, 255, 255, 0.05); border-radius: 4px; border: 1px solid #00FFFF;';

            const statusColors = {
                'pending': '#FFD700',
                'active': '#00FF00',
                'completed': '#00FFFF',
                'cancelled': '#FF0000'
            };

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <strong style="font-size: 0.9em;">${summary.foundry}</strong>
                    <span style="background: ${statusColors[summary.status]}; color: #000; padding: 2px 6px; border-radius: 3px; font-size: 0.7em;">
                        ${summary.status.toUpperCase()}
                    </span>
                </div>
                <div style="font-size: 0.8em; color: #aaa;">
                    <div>${summary.die} @ ${summary.node}</div>
                    <div>Progress: ${summary.progress} (${summary.progressPercent}%)</div>
                    <div>Paid: ${summary.amountPaid} / ${summary.totalValue}</div>
                </div>
            `;

            container.appendChild(card);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FoundryMarketApp();
});
