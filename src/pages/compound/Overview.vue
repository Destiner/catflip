<template>
	<div>
		<h1>Overview</h1>

		<div id="sections">
			<div class="section">
				<h2>
					Comptroller
					<ExternalLink :link="getEtherscanLink('comptroller')" />
				</h2>
				<div class="stats">
					<div class="stat">
						<div class="value">
							{{ state.maxAssets }}
						</div>
						<div class="param">
							<div>Max assets</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatWadRate(state.liquidationIncentiveMantissa) }}
						</div>
						<div class="param">
							<div>Liquidation incentive</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatWadRatio(state.closeFactorMantissa) }}
						</div>
						<div class="param">
							<div>Close factor</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAmount(state.compRate) }}
						</div>
						<div class="param">
							<div>COMP rate</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAddress(state.comptrollerAdmin) }}
						</div>
						<div class="param">
							<div>Admin</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAddress(state.pauseGuardian) }}
						</div>
						<div class="param">
							<div>Pause guardian</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAddress(state.comptrollerImplementation) }}
						</div>
						<div class="param">
							<div>Implementation</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAddress(state.oracle) }}
						</div>
						<div class="param">
							<div>Oracle</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>
					Timelock
					<ExternalLink :link="getEtherscanLink('timelock')" />
				</h2>
				<div class="stats">
					<div class="stat">
						<div class="value">
							{{ formatDuration(state.delay) }}
						</div>
						<div class="param">
							<div>Delay</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatDuration(state.gracePeriod) }}
						</div>
						<div class="param">
							<div>Grace period</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAddress(state.timelockAdmin) }}
						</div>
						<div class="param">
							<div>Timelock admin</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>
					Governor
					<ExternalLink :link="getEtherscanLink('governor')" />
				</h2>
				<div class="stats">
					<div class="stat">
						<div class="value">
							{{ state.proposalMaxOperations }}
						</div>
						<div class="param">
							<div>Max operations in proposal</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatBlockDuration(state.votingPeriod) }}
						</div>
						<div class="param">
							<div>Voting period</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAmount(state.proposalThreshold) }}
						</div>
						<div class="param">
							<div>Proposal threshold</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAmount(state.quorumVotes) }}
						</div>
						<div class="param">
							<div>Quorum votes</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>cTokens</h2>
				<div class="cards">
					<div
						v-for="token in state.tokens"
						:key="token.id"
						class="card"
					>
						<div class="card-header">
							<span>{{ token.title }}</span>
						</div>
						<div class="row">
							<div class="row-label">
								Collateral factor
							</div>
							<div class="row-number">
								{{ formatWadRatio(token.collateralFactorMantissa) }}
							</div>
						</div>
						<div class="row">
							<div class="row-label">
								Reserve factor
							</div>
							<div class="row-number">
								{{ formatWadRatio(token.reserveFactorMantissa) }}
							</div>
						</div>
						<div class="row">
							<div class="row-label">
								Total reserve
							</div>
							<div class="row-number">
								{{ formatAmount(token.totalReserve) }}
							</div>
						</div>
						<div class="row">
							<div class="row-label">
								Interest rate model
							</div>
							<div class="row-number">
								{{ formatAddress(token.interestRateModel) }}
							</div>
						</div>
						<div class="row">
							<div class="row-label">
								Borrow cap
							</div>
							<div class="row-number">
								{{ formatAmount(token.borrowCap) }}
							</div>
						</div>
						<div class="row">
							<div class="row-label">
								Deposit enabled
							</div>
							<div class="row-number">
								{{ token.mintEnabled }}
							</div>
						</div>
						<div class="row">
							<div class="row-label">
								Borrow enabled
							</div>
							<div class="row-number">
								{{ token.borrowEnabled }}
							</div>
						</div>
						<div class="row">
							<div class="row-label">
								COMP enabled
							</div>
							<div class="row-number">
								{{ token.compEnabled }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { reactive, onMounted, defineComponent } from 'vue';
import { InfuraProvider } from '@ethersproject/providers';
import { Contract, Provider } from 'ethcall';

import comptrollerAbi from '@/abi/compound/comptroller.json';
import cTokenAbi from '@/abi/compound/cToken.json';
import governorAbi from '@/abi/compound/governor.json';
import timelockAbi from '@/abi/compound/timelock.json';
import Formatter from '@/utils/formatter';
import Converter from '@/utils/converter';

import ExternalLink from '@/components/ExternalLink.vue';

const infuraKey = '2c010c2fdb8b4ef1a7617571553fc982';
const provider = new InfuraProvider('mainnet', infuraKey);
const addresses = {
	comptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
	comp: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
	timelock: '0x6d903f6003cca6255D85CcA4D3B5E5146dC33925',
	governor: '0xc0dA01a04C3f3E0be433606045bB7017A7323E38',
	tokens: {
		cBAT: '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
		cCOMP: '0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4',
		cDAI: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
		cETH: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
		cREP: '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1',
		cSAI: '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC',
		cUNI: '0x35A18000230DA775CAc24873d00Ff85BccdeD550',
		cUSDC: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
		cUSDT: '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
		cWBTC: '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4',
		cZRX: '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407',
	},
};

export default defineComponent({
	components: {
		ExternalLink,
	},
	setup() {
		const state = reactive({
			tokens: [],
			maxAssets: 0,
			liquidationIncentiveMantissa: '0',
			closeFactorMantissa: '0',
			compRate: '0',
			comptrollerAdmin: '',
			pauseGuardian: '',
			comptrollerImplementation: '',
			oracle: '',
			delay: 0,
			gracePeriod: 0,
			timelockAdmin: '',
			proposalMaxOperations: 0,
			votingPeriod: 0,
			proposalThreshold: '0',
			quorumVotes: '0',
		});

		function formatAmount(value: string) {
			return Formatter.formatMultiplier(Converter.fromWad(value));
		}

		function formatWadRate(value: string) {
			return Formatter.formatRate(Converter.fromWad(value));
		}

		function formatWadRatio(value: string) {
			return Formatter.formatRatio(Converter.fromWad(value));
		}

		function formatAddress(value: string) {
			return Formatter.formatAddress(value, 4);
		}

		function formatDuration(value: number) {
			return Formatter.formatDuration(value);
		}

		function formatBlockDuration(value: number) {
			return Formatter.formatDuration(Converter.fromBlockCount(value));
		}

		function getEtherscanLink(contract: string) {
			const contractAddress = addresses[contract];
			return `https://etherscan.io/address/${contractAddress}`;
		}

		onMounted(() => {
			loadTokens();
			loadComptroller();
			loadTimelock();
			loadGovernor();
		});

		async function loadTokens() {
			const ethcallProvider = new Provider();
			await ethcallProvider.init(provider);
			const calls = [];
			const comptroller = new Contract(addresses.comptroller, comptrollerAbi);
			const tokenAddresses = addresses.tokens;
			const tokens = Object.keys(tokenAddresses);
			for (const token in tokenAddresses) {
				const tokenAddress = tokenAddresses[token];
				const cToken = new Contract(tokenAddress, cTokenAbi);
				const marketCall = comptroller.markets(tokenAddress);
				const reserveFactorMantissaCall = cToken.reserveFactorMantissa();
				const borrowCapCall = comptroller.borrowCaps(tokenAddress);
				const totalReserveCall = cToken.totalReserves();
				const interestRateModelCall = cToken.interestRateModel();
				const mintGuardianPausedCall = comptroller.mintGuardianPaused(tokenAddress);
				const borrowGuardianPausedCall = comptroller.borrowGuardianPaused(tokenAddress);
				calls.push(marketCall);
				calls.push(reserveFactorMantissaCall);
				calls.push(borrowCapCall);
				calls.push(totalReserveCall);
				calls.push(interestRateModelCall);
				calls.push(mintGuardianPausedCall);
				calls.push(borrowGuardianPausedCall);
			}
			const data = await ethcallProvider.all(calls);
			// @ts-ignore
			state.tokens = tokens.map(token => {
				const index = tokens.indexOf(token);
				const tokenTitle = tokens[index];
				const market = data[7 * index];
				const collateralFactorMantissa = market.collateralFactorMantissa.toString();
				const reserveFactorMantissa = data[7 * index + 1].toString();
				const borrowCap = data[7 * index + 2].toString();
				const totalReserve = data[7 * index + 3].toString();
				const interestRateModel = data[7 * index + 4];
				const mintEnabled = !data[7 * index + 5];
				const borrowEnabled = !data[7 * index + 6];
				const compEnabled = market.isComped;
				return {
					title: tokenTitle,
					collateralFactorMantissa,
					reserveFactorMantissa,
					borrowCap,
					totalReserve,
					interestRateModel,
					mintEnabled,
					borrowEnabled,
					compEnabled,
				};
			});
		}

		async function loadComptroller() {
			const ethcallProvider = new Provider();
			await ethcallProvider.init(provider);
			
			const comptroller = new Contract(addresses.comptroller, comptrollerAbi);
			const maxAssetsCall = comptroller.maxAssets();
			const liquidationIncentiveMantissaCall = comptroller.liquidationIncentiveMantissa();
			const closeFactorMantissaCall = comptroller.closeFactorMantissa();
			const compRateCall = comptroller.compRate();
			const adminCall = comptroller.admin();
			const pauseGuardianCall = comptroller.pauseGuardian();
			const comptrollerImplementationCall = comptroller.comptrollerImplementation();
			const oracleCall = comptroller.oracle();
			const calls = [
				maxAssetsCall,
				liquidationIncentiveMantissaCall,
				closeFactorMantissaCall,
				compRateCall,
				adminCall,
				pauseGuardianCall,
				comptrollerImplementationCall,
				oracleCall,
			];
			const data = await ethcallProvider.all(calls);
			const maxAssets = data[0].toNumber();
			const liquidationIncentiveMantissa = data[1].toString();
			const closeFactorMantissa = data[2].toString();
			const compRate = data[3].toString();
			const comptrollerAdmin = data[4];
			const pauseGuardian = data[5];
			const comptrollerImplementation = data[6];
			const oracle = data[7];
			state.maxAssets = maxAssets;
			state.liquidationIncentiveMantissa = liquidationIncentiveMantissa;
			state.closeFactorMantissa = closeFactorMantissa;
			state.compRate = compRate;
			state.comptrollerAdmin = comptrollerAdmin;
			state.pauseGuardian = pauseGuardian;
			state.comptrollerImplementation = comptrollerImplementation;
			state.oracle = oracle;
		}

		async function loadTimelock() {
			const ethcallProvider = new Provider();
			await ethcallProvider.init(provider);
			const timelock = new Contract(addresses.timelock, timelockAbi);
			const delayCall = timelock.delay();
			const gracePeriodCall = timelock.GRACE_PERIOD();
			const adminCall = timelock.admin();
			const calls = [
				delayCall,
				gracePeriodCall,
				adminCall,
			];
			const data = await ethcallProvider.all(calls);
			const delay = data[0].toNumber();
			const gracePeriod = data[1].toNumber();
			const timelockAdmin = data[2];
			state.delay = delay;
			state.gracePeriod = gracePeriod;
			state.timelockAdmin = timelockAdmin;
		}

		async function loadGovernor() {
			const ethcallProvider = new Provider();
			await ethcallProvider.init(provider);
			const governor = new Contract(addresses.governor, governorAbi);
			const proposalMaxOperationsCall = governor.proposalMaxOperations();
			const votingPeriodCall = governor.votingPeriod();
			const proposalThresholdCall = governor.proposalThreshold();
			const quorumVotesCall = governor.quorumVotes();
			const calls = [
				proposalMaxOperationsCall,
				votingPeriodCall,
				proposalThresholdCall,
				quorumVotesCall,
			];
			const data = await ethcallProvider.all(calls);
			const proposalMaxOperations = data[0].toNumber();
			const votingPeriod = data[1].toNumber();
			const proposalThreshold = data[2].toString();
			const quorumVotes = data[3].toString();
			state.proposalMaxOperations = proposalMaxOperations;
			state.votingPeriod = votingPeriod;
			state.proposalThreshold = proposalThreshold;
			state.quorumVotes = quorumVotes;
		}

		return {
			state,

			formatAmount,
			formatWadRate,
			formatWadRatio,
			formatAddress,
			formatDuration,
			formatBlockDuration,
			getEtherscanLink,
		};
	},
});
</script>

<style scoped>
h1 {
	text-align: center;
	margin-top: 1rem;
}

h2 {
	font-size: 18px;
	margin: 0.5rem 0 0 0.5rem;
}

#sections {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 1rem 0;
}

.section {
	width: 90%;
	background: var(--color-background-card);
	border: 1px solid var(--color-border);
	margin-top: 1rem;
}

.stats {
	display: flex;
	margin: 1rem 0 1rem 0;
	flex-wrap: wrap;
}

.stat {
	display: flex;
	margin: 1rem 0 0 1.5rem;
}

.value {
	font-size: 24px;
}

.param {
	font-size: 12px;
	margin-left: 0.5rem;
	display: flex;
	align-items: center;
}

.term {
	color: var(--color-text-secondary);
}

.cards {
	display: flex;
	margin: 1em 0;
	justify-content: space-evenly;
	flex-wrap: wrap;
}

.card {
	width: 240px;
	border: 1px solid var(--color-border);
	padding: 0.25em 0.5em;
	margin: 0.25em;
}

.card-header {
	display: flex;
	justify-content: center;
	margin-bottom: 0.5em;
	font-size: 16px;
}

.row {
	display: flex;
	font-size: 14px;
}

.row-number {
	flex: 1;
}

.row-label {
	flex: 2;
}
</style>
