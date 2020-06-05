<template>
	<div>
		<h1>System parameters</h1>
		<div id="sections">
			<div class="section">
				<h2>
					Basic 
					<span class="term">
						(Vat <EtherscanIcon :link="getEtherscanLink('vat')" />,
						Jug <EtherscanIcon :link="getEtherscanLink('jug')" />,
						Pot <EtherscanIcon :link="getEtherscanLink('pot')" />,
						Spot <EtherscanIcon :link="getEtherscanLink('spot')" />)
					</span>
				</h2>
				<div class="stats">
					<div class="stat">
						<div class="value">
							{{ formatDaiAmount(vatLine) }} DAI
						</div>
						<div class="param">
							<div>Ceiling</div>
							<div class="term">
								Vat_Line
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatWadRate(jugBase) }}
						</div>
						<div class="param">
							<div>Base stabitily fee</div>
							<div class="term">
								Jug_base
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatFee(potDsr) }}
						</div>
						<div class="param">
							<div>Savings rate</div>
							<div class="term">
								Pot_dsr
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>Collateral <span class="term">(Ilk)</span></h2>
				<div class="cards">
					<div
						v-for="ilk in ilks"
						:key="ilk.id"
						class="card"
					>
						<div class="card-header">
							<span>{{ ilk.asset }}</span>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatDaiAmount(ilk.line) }} DAI
							</div>
							<div class="row-label">
								Ceiling <span class="term">(Vat_line)</span>
							</div>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatDaiAmount(ilk.dust) }} DAI
							</div>
							<div class="row-label">
								Min. per Vault <span class="term">(Vat_dust)</span>
							</div>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatFee(ilk.duty) }}
							</div>
							<div class="row-label">
								Stability fee <span class="term">(Jug_duty)</span>
							</div>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatRatio(ilk.mat) }}
							</div>
							<div class="row-label">
								Col. ratio <span class="term">(Spot_mat)</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>
					Liquidation
					<span class="term">
						(Cat <EtherscanIcon :link="getEtherscanLink('cat')" />)
					</span>
				</h2>
				<div class="cards">
					<div
						v-for="cat in cats"
						:key="cat.id"
						class="card"
					>
						<div class="card-header">
							<span>{{ cat.asset }}</span>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatRayRate(cat.chop) }}
							</div>
							<div class="row-label">
								Penalty <span class="term">(chop)</span>
							</div>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatAmount(cat.lump) }}
							</div>
							<div class="row-label">
								Lot size <span class="term">(lump)</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>Collateral auction <span class="term">(Flip)</span></h2>
				<div class="cards">
					<div
						v-for="flip in flips"
						:key="flip.id"
						class="card"
					>
						<div class="card-header">
							<span>{{ flip.asset }}</span>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatWadRate(flip.beg) }}
							</div>
							<div class="row-label">
								Min. bid increase <span class="term">(beg)</span>
							</div>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatDuration(flip.ttl) }}
							</div>
							<div class="row-label">
								Bid duration <span class="term">(ttl)</span>
							</div>
						</div>
						<div class="row">
							<div class="row-number">
								{{ formatDuration(flip.tau) }}
							</div>
							<div class="row-label">
								Auction duration <span class="term">(tau)</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>
					Surplus auction
					<span class="term">
						(Flap <EtherscanIcon :link="getEtherscanLink('flap')" />)
					</span>
				</h2>
				<div class="stats">
					<div class="stat">
						<div class="value">
							{{ formatWadRate(flapBeg) }}
						</div>
						<div class="param">
							<div>Minimal bid increase</div>
							<div class="term">
								beg
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatDuration(flapTtl) }}
						</div>
						<div class="param">
							<div>Bid duration</div>
							<div class="term">
								ttl
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatDuration(flapTau) }}
						</div>
						<div class="param">
							<div>Auction duration</div>
							<div class="term">
								tau
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>
					Debt auction
					<span class="term">
						(Flop <EtherscanIcon :link="getEtherscanLink('flop')" />)
					</span>
				</h2>
				<div class="stats">
					<div class="stat">
						<div class="value">
							{{ formatWadRate(flopBeg) }}
						</div>
						<div class="param">
							<div>Minimal bid increase</div>
							<div class="term">
								beg
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatDuration(flopTtl) }}
						</div>
						<div class="param">
							<div>Bid duration</div>
							<div class="term">
								ttl
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatDuration(flopTau) }}
						</div>
						<div class="param">
							<div>Auction duration</div>
							<div class="term">
								tau
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatWadRate(flopPad) }}
						</div>
						<div class="param">
							<div>Lot size increase</div>
							<div class="term">
								pad
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>
					Accounting
					<span class="term">
						(Vow <EtherscanIcon :link="getEtherscanLink('vow')" />)
					</span>
				</h2>
				<div class="stats">
					<div class="stat">
						<div class="value">
							{{ formatDaiAmount(hump) }} DAI
						</div>
						<div class="param">
							<div>Surplus auction buffer</div>
							<div class="term">
								hump
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatDaiAmount(bump) }} DAI
						</div>
						<div class="param">
							<div>Surplus lot size</div>
							<div class="term">
								bump
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatDaiAmount(sump) }} DAI
						</div>
						<div class="param">
							<div>Debt auction bid size</div>
							<div class="term">
								sump
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAmount(dump) }} MKR
						</div>
						<div class="param">
							<div>Debt auction initial lot size</div>
							<div class="term">
								dump
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatDuration(wait) }}
						</div>
						<div class="param">
							<div>Debt auction delay</div>
							<div class="term">
								wait
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>
					Misc
					<span class="term">
						(Pause <EtherscanIcon :link="getEtherscanLink('pause')" />,
						ESM <EtherscanIcon :link="getEtherscanLink('esm')" />,
						End <EtherscanIcon :link="getEtherscanLink('end')" />)
					</span>
				</h2>
				<div class="stats">
					<div class="stat">
						<div class="value">
							{{ formatDuration(pauseDelay) }}
						</div>
						<div class="param">
							<div>Timelock</div>
							<div class="term">
								Pause_delay
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatAmount(esmMin) }} MKR
						</div>
						<div class="param">
							<div>ES amount</div>
							<div class="term">
								Esm_min
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatDuration(endWait) }}
						</div>
						<div class="param">
							<div>ES delay</div>
							<div class="term">
								End_wait
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ethers } from 'ethers';
import ethcall from 'ethcall';

import vatAbi from '../abi/vat.json';
import jugAbi from '../abi/jug.json';
import spotAbi from '../abi/spot.json';
import potAbi from '../abi/pot.json';
import catAbi from '../abi/cat.json';
import flipAbi from '../abi/flip.json';
import flapAbi from '../abi/flap.json';
import flopAbi from '../abi/flop.json';
import vowAbi from '../abi/vow.json';
import pauseAbi from '../abi/pause.json';
import esmAbi from '../abi/esm.json';
import endAbi from '../abi/end.json';

import Formatter from '../utils/formatter.js';
import Converter from '../utils/converter.js';

import EtherscanIcon from '../components/EtherscanIcon.vue';

const infuraKey = '2c010c2fdb8b4ef1a7617571553fc982';
const provider = new ethers.providers.InfuraProvider('mainnet', infuraKey);

const ilkIds = [
	'ETH-A',
	'BAT-A',
	'WBTC-A',
	'USDC-A',
	'USDC-B',
	'TUSD-A',
	// 'SAI',
];

const addresses = {
	vat: '0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B',
	jug: '0x19c0976f590D67707E62397C87829d896Dc0f1F1',
	spot: '0x65C79fcB50Ca1594B025960e539eD7A9a6D434A3',
	pot: '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7',
	cat: '0x78F2c2AF65126834c51822F56Be0d7469D7A523E',
	flip: {
		'ETH-A': '0xd8a04F5412223F513DC55F839574430f5EC15531',
		'BAT-A': '0xaA745404d55f88C108A28c86abE7b5A1E7817c07',
		'WBTC-A': '0x3E115d85D4d7253b05fEc9C0bB5b08383C2b0603',
		'USDC-A': '0xE6ed1d09a19Bd335f051d78D5d22dF3bfF2c28B1',
		'USDC-B': '0xec25Ca3fFa512afbb1784E17f1D414E16D01794F',
		'TUSD-A': '0xba3f6a74BD12Cf1e48d4416c7b50963cA98AfD61',
		// 'SAI': '0x5432b2f3c0DFf95AA191C45E5cbd539E2820aE72',
	},
	flap: '0xdfE0fb1bE2a52CDBf8FB962D5701d7fd0902db9f',
	flop: '0x4D95A049d5B0b7d32058cd3F2163015747522e99',
	vow: '0xA950524441892A31ebddF91d3cEEFa04Bf454466',
	pause: '0xbE286431454714F511008713973d3B053A2d38f3',
	esm: '0x0581A0AbE32AAe9B5f0f68deFab77C6759100085',
	end: '0xaB14d3CE3F733CACB76eC2AbE7d2fcb00c99F3d5',
};

const vatContract = new ethcall.Contract(addresses.vat, vatAbi);
const jugContract = new ethcall.Contract(addresses.jug, jugAbi);
const spotContract = new ethcall.Contract(addresses.spot, spotAbi);
const potContract = new ethcall.Contract(addresses.pot, potAbi);
const catContract = new ethcall.Contract(addresses.cat, catAbi);
const flapContract = new ethcall.Contract(addresses.flap, flapAbi);
const flopContract = new ethcall.Contract(addresses.flop, flopAbi);
const vowContract = new ethcall.Contract(addresses.vow, vowAbi);
const pauseContract = new ethcall.Contract(addresses.pause, pauseAbi);
const esmContract = new ethcall.Contract(addresses.esm, esmAbi);
const endContract = new ethcall.Contract(addresses.end, endAbi);

export default {
	components: {
		EtherscanIcon,
	},
	data() {
		return {
			vatLine: 0,
			jugBase: 0,
			potDsr: 1,
			ilks: [],
			cats: [],
			flips: [],
			flapBeg: 0,
			flapTtl: 0,
			flapTau: 0,
			flopBeg: 0,
			flopTtl: 0,
			flopTau: 0,
			flopPad: 0,
			hump: 0,
			bump: 0,
			sump: 0,
			dump: 0,
			wait: 0,
			pauseDelay: 0,
			esmMin: 0,
			endWait: 0,
		};
	},
	mounted() {
		this._loadBase();
		this._loadCollaterals();
		this._loadCats();
		this._loadFlips();
		this._loadFlapFlop();
		this._loadVow();
		this._loadMisc();
	},
	methods: {
		formatAmount(value) {
			return Formatter.formatMultiplier(Converter.fromWad(value), 0);
		},
		formatDaiAmount(value) {
			return Formatter.formatMultiplier(Converter.fromWad(Converter.fromRay(value)), 0);
		},
		formatRatio(value) {
			return Formatter.formatRatio(Converter.fromRay(value));
		},
		formatRayRate(value) {
			return Formatter.formatRate(Converter.fromRay(value));
		},
		formatWadRate(value) {
			return Formatter.formatRate(Converter.fromWad(value));
		},
		formatFee(value) {
			return Formatter.formatFee(Converter.fromRay(value));
		},
		formatDuration(value) {
			return Formatter.formatDuration(value);
		},
		getEtherscanLink(contract) {
			const contractAddress = addresses[contract];
			return `https://etherscan.io/address/${contractAddress}`;
		},
		async _loadBase() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);

			const vatLineCall = vatContract.Line();
			const jugBaseCall = jugContract.base();
			const potDsrCall = potContract.dsr();

			const data = await ethcallProvider.all([vatLineCall, jugBaseCall, potDsrCall]);
			const vatLine = data[0].toString();
			const jugBase = data[1].toString();
			const potDsr = data[2].toString();

			this.vatLine = vatLine;
			this.jugBase = jugBase;
			this.potDsr = potDsr;
		},
		async _loadCollaterals() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);

			const count = ilkIds.length;
			const collateralIdBytes = ilkIds.map(id =>
				ethers.utils.formatBytes32String(id)
			);
			const jugIlkCalls = collateralIdBytes.map(ilk =>
				jugContract.ilks(ilk)
			);
			const vatIlkCalls = collateralIdBytes.map(ilk =>
				vatContract.ilks(ilk)
			);
			const spotIlkCalls = collateralIdBytes.map(ilk =>
				spotContract.ilks(ilk)
			);
			const ilkCalls = jugIlkCalls.concat(vatIlkCalls).concat(spotIlkCalls);

			const data = await ethcallProvider.all(ilkCalls);

			this.ilks = ilkIds.map(id => {
				const index = ilkIds.indexOf(id);
				const duty = data[index].duty.toString();
				const line = data[count + index].line.toString();
				const dust = data[count + index].dust.toString();
				const mat = data[2 * count + index].mat.toString();

				const ilk = {
					id: `ilk-${id}`,
					asset: id,
					duty,
					line,
					dust,
					mat,
				};
				return ilk;
			});
		},
		async _loadCats() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);

			const collateralIdBytes = ilkIds.map(id =>
				ethers.utils.formatBytes32String(id)
			);
			const catIlkCalls = collateralIdBytes.map(ilk =>
				catContract.ilks(ilk)
			);

			const data = await ethcallProvider.all(catIlkCalls);
			this.cats = ilkIds.map(id => {
				const index = ilkIds.indexOf(id);
				const cat = data[index];
				const chop = cat.chop.toString();
				const lump = cat.lump.toString();

				const flip = {
					id: `cat-${id}`,
					asset: id,
					chop,
					lump,
				};
				return flip;
			});
		},
		async _loadFlips() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);

			const flipIds = Object.keys(addresses.flip);
			const count = flipIds.length;
			const flipContracts = flipIds.map(flipId => {
				const flipAddress = addresses.flip[flipId];
				const flipContract = new ethcall.Contract(flipAddress, flipAbi);
				return flipContract;
			});
			const begCalls = flipContracts.map(flipContract => {
				const begCall = flipContract.beg();
				return begCall;
			});
			const ttlCalls = flipContracts.map(flipContract => {
				const ttlCall = flipContract.ttl();
				return ttlCall;
			});
			const tauCalls = flipContracts.map(flipContract => {
				const tauCall = flipContract.tau();
				return tauCall;
			});
			const flipCalls = begCalls.concat(ttlCalls).concat(tauCalls);

			const data = await ethcallProvider.all(flipCalls);
			this.flips = flipIds.map(id => {
				const index = flipIds.indexOf(id);
				const beg = data[index].toString();
				const ttl = data[count + index];
				const tau = data[2 * count + index];

				const flip = {
					id: `flip-${id}`,
					asset: id,
					beg,
					ttl,
					tau,
				};
				return flip;
			});
		},
		async _loadFlapFlop() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);

			const flapBegCall = flapContract.beg();
			const flapTtlCall = flapContract.ttl();
			const flapTauCall = flapContract.tau();
			const flopBegCall = flopContract.beg();
			const flopTtlCall = flopContract.ttl();
			const flopTauCall = flopContract.tau();
			const flopPadCall = flopContract.pad();

			const calls = [
				flapBegCall,
				flapTtlCall,
				flapTauCall,
				flopBegCall,
				flopTtlCall,
				flopTauCall,
				flopPadCall,
			];

			const data = await ethcallProvider.all(calls);
			const flapBeg = data[0];
			const flapTtl = data[1];
			const flapTau = data[2];
			const flopBeg = data[3];
			const flopTtl = data[4];
			const flopTau = data[5];
			const flopPad = data[6];

			this.flapBeg = flapBeg.toString();
			this.flapTtl = flapTtl;
			this.flapTau = flapTau;
			this.flopBeg = flopBeg.toString();
			this.flopTtl = flopTtl;
			this.flopTau = flopTau;
			this.flopPad = flopPad.toString();
		},
		async _loadVow() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);

			const humpCall = vowContract.hump();
			const bumpCall = vowContract.bump();
			const sumpCall = vowContract.sump();
			const dumpCall = vowContract.dump();
			const waitCall = vowContract.wait();

			const calls = [
				humpCall,
				bumpCall,
				sumpCall,
				dumpCall,
				waitCall,
			];

			const data = await ethcallProvider.all(calls);
			const hump = data[0];
			const bump = data[1];
			const sump = data[2];
			const dump = data[3];
			const wait = data[4];

			this.hump = hump.toString();
			this.bump = bump.toString();
			this.sump = sump.toString();
			this.dump = dump.toString();
			this.wait = wait.toNumber();
		},
		async _loadMisc() {
			const ethcallProvider = new ethcall.Provider();
			await ethcallProvider.init(provider);

			const pauseDelayCall = pauseContract.delay();
			const esmMinCall = esmContract.min();
			const endWaitCall = endContract.wait();

			const calls = [
				pauseDelayCall,
				esmMinCall,
				endWaitCall,
			];

			const data = await ethcallProvider.all(calls);
			const pauseDelay = data[0];
			const esmMin = data[1];
			const endWait = data[2];

			this.pauseDelay = pauseDelay.toNumber();
			this.esmMin = esmMin.toString();
			this.endWait = endWait.toNumber();
		},
	},
};
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
	background: white;
	border: 1px solid #dedede;
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
}

.term {
	color: #818da4;
}

.cards {
	display: flex;
	margin: 1em 0;
	justify-content: space-evenly;
	flex-wrap: wrap;
}

.card {
	width: 240px;
	border: 1px solid #dedede;
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
