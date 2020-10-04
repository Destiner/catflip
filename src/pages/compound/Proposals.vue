<template>
	<div>
		<h1>Proposals</h1>
		<div id="proposals">
			<div
				v-for="proposal in proposals"
				:key="proposal.id"
				class="proposal"
			>
				<div class="header">
					<div>
						Proposal #{{ proposal.id }}
					</div>
					<div>
						{{ formatState(proposal.state) }}
						(for: {{ formatVotes(proposal.votes.for) }} / against: {{ formatVotes(proposal.votes.against) }})
					</div>
				</div>
				<div class="changes">
					<div
						v-for="change in proposal.changes"
						:key="change.id"
						class="change"
					>
						<div>
							{{ change.title }}
						</div>
						<div>
							<span v-if="change.oldValue">
								{{ change.oldValue }} → {{ change.newValue }}
							</span>
							<span v-else>
								{{ change.newValue }}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ethcall from 'ethcall';
import { ethers } from 'ethers';

import governorAbi from '../../abi/compound/governor.json';
import Formatter from '../../utils/formatter.js';
import Converter from '../../utils/converter.js';

const infuraKey = '2c010c2fdb8b4ef1a7617571553fc982';
const provider = new ethers.providers.InfuraProvider('mainnet', infuraKey);
const tokens = {
	cBAT: '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
	cDAI: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
	cETH: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
	cREP: '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1',
	cSAI: '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC',
	cUNI: '0x35A18000230DA775CAc24873d00Ff85BccdeD550',
	cUSDC: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
	cUSDT: '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
	cWBTC: '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4',
	cZRX: '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407',
	DAI: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
};

const BECOME_UNITROLLER = '_become(address,uint256,address[],address[])';
const BECOME_COMPTROLLER = '_become(address)';
const SET_ORACLE_SIG = '_setPriceOracle(address)';
const SET_PENDING_IMPLEMENTATION = '_setPendingImplementation(address)';

const SET_COMP_RATE = '_setCompRate(uint256)';
const ADD_COMP_MARKETS = '_addCompMarkets(address[])';
const DROP_COMP_MARKET = '_dropCompMarket(address)';

const SUPPORT_MARKET_SIG = '_supportMarket(address)';
const SET_INTEREST_RATE_MODEL = '_setInterestRateModel(address)';
const SET_RESERVE_FACTOR = '_setReserveFactor(uint256)';
const SET_COLLATERAL_FACTOR = '_setCollateralFactor(address,uint256)';
const SET_MARKET_BORROW_CAPS = '_setMarketBorrowCaps(address[],uint256[])';
const SET_MINT_PAUSED = '_setMintPaused(address,bool)';
const SET_BORROW_PAUSED = '_setBorrowPaused(address,bool)';
const REDUCE_RESERVES = '_reduceReserves(uint256)';

const TRANSFER = 'transfer(address,uint256)';

const STATE_EXECUTED = 7;

export default {
	data() {
		return {
			rawProposals: [],
		};
	},
	computed: {
		proposals() {
			const values = this._getInitialValues();
			const proposals = [];
			for (const rawProposal of this.rawProposals) {
				const changes = [];
				const { id, state, votes } = rawProposal;
				for (const rawChange of rawProposal.changes) {
					const { target, signature, calldata: rawCalldata } = rawChange;
					const calldata = this._parseCalldata(signature, rawCalldata);
					const title = this._getTitle(target, signature, calldata);
					const key = this._getKey(target, signature, calldata);
					const newValue = this._getValue(signature, calldata);
					const oldValue = values[key];
					if (!calldata || !title || !key || newValue === undefined) {
						console.log(target, signature, calldata);
					}
					const change = {
						title,
						key,
						oldValue,
						newValue,
					};
					changes.push(change);
					if (state === STATE_EXECUTED) {
						values[key] = newValue;
					}
				}
				const proposal = {
					id,
					state,
					votes,
					changes,
				};
				proposals.push(proposal);
			}
			proposals.reverse();
			return proposals;
		},
	},
	mounted() {
		this._loadProposals();
	},
	methods: {
		formatState(state) {
			const states = [
				'Pending',
				'Active',
				'Canceled',
				'Defeated',
				'Succeeded',
				'Queued',
				'Expired',
				'Executed',
			];
			return states[state];
		},
		formatVotes(votes) {
			return Formatter.formatMultiplier(Converter.fromWad(votes), 0);
		},
		getEtherscanLink(txHash) {
			return `https://etherscan.io/tx/${txHash}`;
		},
		_getTitle(target, signature, calldata) {
			if (signature === BECOME_UNITROLLER) {
				return 'Accept Unitroller implementation';
			}
			if (signature === BECOME_COMPTROLLER) {
				return 'Accept Comptroller implementation';
			}
			if (signature === SET_ORACLE_SIG) {
				return 'Price oracle';
			}
			if (signature === SET_PENDING_IMPLEMENTATION) {
				return 'Comptroller implementation';
			}
			if (signature === SET_COMP_RATE) {
				return 'COMP rate';
			}
			if (signature === ADD_COMP_MARKETS) {
				const marketString = calldata[0]
					.map(marketAddress => this._getToken(marketAddress))
					.join(',');
				return `Enable COMP for ${marketString}`;
			}
			if (signature === DROP_COMP_MARKET) {
				const marketAddress = calldata[0];
				const market = this._getToken(marketAddress);
				return `Disable COMP for ${market}`;
			}
			if (signature === SUPPORT_MARKET_SIG) {
				const marketAddress = calldata[0];
				const market = this._getToken(marketAddress);
				return `Add ${market} market`;
			}
			if (signature === SET_INTEREST_RATE_MODEL) {
				const market = this._getToken(target);
				return `${market}: interest rate model`;
			}
			if (signature === SET_RESERVE_FACTOR) {
				const market = this._getToken(target);
				return `${market}: reserve factor`;
			}
			if (signature === SET_COLLATERAL_FACTOR) {
				const market = this._getToken(calldata[0]);
				return `${market}: collateral factor`;
			}
			if (signature === SET_MARKET_BORROW_CAPS) {
				const capList = [];
				for (let i = 0; i < calldata[0].length; i++) {
					const market = this._getToken(calldata[0][i]);
					const cap = this._formatAmount(calldata[1][i]);
					capList.push({
						market,
						cap,
					});
				}
				const capString = capList
					.map(({market, cap}) => `${market} to ${cap}`)
					.join(',');
				return `Set borrow cap: ${capString}`;
			}
			if (signature === SET_MINT_PAUSED) {
				const market = this._getToken(calldata[0]);
				const paused = calldata[1];
				if (paused) {
					return `${market}: pause deposits`;
				} else {
					return `${market}: resume deposits`;
				}
			}
			if (signature === SET_BORROW_PAUSED) {
				const market = this._getToken(calldata[0]);
				const paused = calldata[1];
				if (paused) {
					return `${market}: pause borrowing`;
				} else {
					return `${market}: resume borrowing`;
				}
			}
			if (signature === REDUCE_RESERVES) {
				const market = this._getToken(target);
				const amount = this._formatAmount(calldata[0]);
				return `${market}: reduce reserves by ${amount}`;
			}
			if (signature === TRANSFER) {
				const token = this._getToken(target);
				const guy = this._formatAddress(calldata[0]);
				const amount = this._formatAmount(calldata[1]);
				return `Send ${amount} ${token} to ${guy}`;
			}
		},
		_getKey(target, signature, calldata) {
			if (signature === BECOME_UNITROLLER) {
				return 'become_unitroller';
			}
			if (signature === BECOME_COMPTROLLER) {
				return 'become_comptroller';
			}
			if (signature === SET_ORACLE_SIG) {
				return 'price_oracle';
			}
			if (signature === SET_PENDING_IMPLEMENTATION) {
				return 'pending_implementation';
			}
			if (signature === SET_COMP_RATE) {
				return 'comp_rate';
			}
			if (signature === ADD_COMP_MARKETS) {
				return 'comp_add_markets';
			}
			if (signature === DROP_COMP_MARKET) {
				return 'comp_drop_market';
			}
			if (signature === SUPPORT_MARKET_SIG) {
				const marketAddress = calldata[0];
				const market = this._getToken(marketAddress);
				return `${market}_support_market`;
			}
			if (signature === SET_INTEREST_RATE_MODEL) {
				const market = this._getToken(target);
				return `${market}_interest_rate_model`;
			}
			if (signature === SET_RESERVE_FACTOR) {
				const market = this._getToken(target);
				return `${market}_reserve_factor`;
			}
			if (signature === SET_COLLATERAL_FACTOR) {
				const market = this._getToken(calldata[0]);
				return `${market}_collateral_factor`;
			}
			if (signature === SET_MARKET_BORROW_CAPS) {
				return 'borrow_cap';
			}
			if (signature === SET_MINT_PAUSED) {
				const market = this._getToken(calldata[0]);
				const paused = calldata[1];
				if (paused) {
					return `${market}_mint_pause`;
				} else {
					return `${market}_mint_resume`;
				}
			}
			if (signature === SET_BORROW_PAUSED) {
				const market = this._getToken(calldata[0]);
				const paused = calldata[1];
				if (paused) {
					return `${market}_borrow_pause`;
				} else {
					return `${market}_borrow_resume`;
				}
			}
			if (signature === REDUCE_RESERVES) {
				const market = this._getToken(target);
				return `${market}_reduce_reserves`;
			}
			if (signature === TRANSFER) {
				return 'transfer';
			}
		},
		_getValue(signature, calldata) {
			if (signature === BECOME_UNITROLLER) {
				return '';
			}
			if (signature === BECOME_COMPTROLLER) {
				return '';
			}
			if (signature === SET_ORACLE_SIG) {
				const oracleAddress = calldata[0];
				return this._formatAddress(oracleAddress);
			}
			if (signature === SET_PENDING_IMPLEMENTATION) {
				const implementation = calldata[0];
				return this._formatAddress(implementation);
			}
			if (signature === SET_COMP_RATE) {
				const rate = this._formatAmount(calldata[0]);
				return rate;
			}
			if (signature === ADD_COMP_MARKETS) {
				return '';
			}
			if (signature === DROP_COMP_MARKET) {
				return '';
			}
			if (signature === SUPPORT_MARKET_SIG) {
				return '';
			}
			if (signature === SET_INTEREST_RATE_MODEL) {
				const interestRateModelAddress = calldata[0];
				return this._formatAddress(interestRateModelAddress);
			}
			if (signature === SET_RESERVE_FACTOR) {
				const reserveFactor = this._formatRatio(calldata[0]);
				return reserveFactor;
			}
			if (signature === SET_COLLATERAL_FACTOR) {
				const collateralFactor = this._formatRatio(calldata[1]);
				return collateralFactor;
			}
			if (signature === SET_MARKET_BORROW_CAPS) {
				return '';
			}
			if (signature === SET_MINT_PAUSED) {
				return '';
			}
			if (signature === SET_BORROW_PAUSED) {
				return '';
			}
			if (signature === REDUCE_RESERVES) {
				return '';
			}
			if (signature === TRANSFER) {
				return '';
			}
		},
		_getToken(address) {
			return Object.keys(tokens).find(token => tokens[token] === address);
		},
		_parseCalldata(signature, rawCalldata) {
			const inputStartIndex = signature.indexOf('(') + 1;
			const inputEndIndex = signature.lastIndexOf(')');
			const inputString = signature.substring(inputStartIndex, inputEndIndex);
			const inputs = inputString.split(',').map(type => {
				return {
					type,
				};
			});

			const abiCoder = new ethers.utils.AbiCoder();
			const params = abiCoder.decode(inputs, rawCalldata);
			return params;
		},
		async _loadProposals() {
			const proposalCount = await this._getProposalCount();
			this.rawProposals = await this._getProposals(proposalCount);
		},
		async _getProposalCount() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);
			const governor = new ethcall.Contract(addresses.governor, governorAbi);
			const proposalCountCall = governor.proposalCount();
			const data = await ethcallProvider.all([proposalCountCall]);
			const proposalCount = data[0].toNumber();
			return proposalCount;
		},
		async _getProposals(proposalCount) {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);
			const governor = new ethcall.Contract(addresses.governor, governorAbi);
			const calls = [];
			for (let i = 1; i <= proposalCount; i++) {
				const actionsCall = governor.getActions(i);
				const proposalCall = governor.proposals(i);
				const stateCall = governor.state(i);
				calls.push(actionsCall);
				calls.push(proposalCall);
				calls.push(stateCall);
			}
			const data = await ethcallProvider.all(calls);
			const proposals = [];
			for (let i = 0; i < proposalCount; i++) {
				const actions = data[3 * i];
				const proposalData = data[3 * i + 1];
				const state = data[3 * i + 2];
				const id = proposalData.id.toNumber();
				const votes = {
					for: proposalData.forVotes.toString(),
					against: proposalData.againstVotes.toString(),
				};
				const changes = [];
				const actionCount = actions[0].length;
				for (let i = 0; i < actionCount; i++) {
					const target = actions[0][i];
					const signature = actions[2][i];
					const calldata = actions[3][i];
					const change = {
						target,
						signature,
						calldata,
					};
					changes.push(change);
				}
				const proposal = {
					id,
					state,
					votes,
					changes,
				};
				proposals.push(proposal);
			}
			return proposals;
		},
		_formatAddress(value) {
			return Formatter.formatAddress(value);
		},
		_formatAmount(value) {
			return Formatter.formatAmount(Converter.fromWad(value), 3);
		},
		_formatRatio(value) {
			return Formatter.formatRatio(Converter.fromWad(value));
		},
		_formatWadRate(value) {
			return Formatter.formatRate(Converter.fromWad(value));
		},
		_getInitialValues() {
			// TODO
			return {};
		},
	},
};
</script>

<style scoped>
h1 {
	text-align: center;
	margin-top: 1rem;
}

#proposals {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 1rem 0;
}

.proposal {
	width: 80%;
	border: 1px solid #dedede;
	background: white;
	margin-top: 1rem;
}

.header {
	display: flex;
	justify-content: space-between;
	font-size: 18px;
	padding: 0.5rem 0.5rem 0 0.5rem;
}

.changes {
	margin-top: 1rem;
}

.change {
	padding: 0.5rem;
	font-size: 14px;
	display: flex;
	justify-content: space-between;
}

.change:nth-child(even) {
	background: #eceff1;
}

@media all and (max-width: 768px) {
	.change {
		flex-direction: column;
	}
}
</style>
