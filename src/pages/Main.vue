<template>
	<div>
		<h1>MakerDAO system params</h1>
		<h2>Basic 
			<span class="term">
				Vat <a :href="getEtherscanLink('vat')" target="_blank"><img :src="etherscanLogo" class="logo"></a>,
				Jug <a :href="getEtherscanLink('jug')" target="_blank"><img :src="etherscanLogo" class="logo"></a>,
				Pot <a :href="getEtherscanLink('pot')" target="_blank"><img :src="etherscanLogo" class="logo"></a>,
				Spot <a :href="getEtherscanLink('spot')" target="_blank"><img :src="etherscanLogo" class="logo"></a>
			</span>
		</h2>
		<div class="card">
			<div class="row">
				<div>Ceiling <span class="term">Vat_Line</span></div>
				<div>{{ formatAmount(vatLine) }} DAI</div>
			</div>
			<div class="row">
				<div>Base stabitily fee <span class="term">Jug_base</span></div>
				<div>{{ formatFee(jugBase) }}</div>
			</div>
			<div class="row">
				<div>Savings rate <span class="term">Pot_dsr</span></div>
				<div>{{ formatFee(potDsr) }}</div>
			</div>
		</div>
		<h2>Collateral <span class="term">Ilk</span></h2>
		<div class="card-list">
			<div
				v-for="ilk in ilks"
				:key="ilk.id"
				class="card"
			>
				<div><span class="asset">{{ ilk.asset }}</span></div>
				<div class="row">
					<div>Ceiling <span class="term">Vat_line</span></div>
					<div>{{ formatAmount(ilk.line) }} DAI</div>
				</div>
				<div class="row">
					<div>Stability fee <span class="term">Vat_duty</span></div>
					<div>{{ formatFee(ilk.duty) }}</div>
				</div>
				<div class="row">
					<div>Col. ratio <span class="term">Spot_mat</span></div>
					<div>{{ formatRatio(ilk.mat) }}</div>
				</div>
			</div>
		</div>
		<h2>Liquidation
			<span class="term">
				Cat <a :href="getEtherscanLink('cat')" target="_blank"><img :src="etherscanLogo" class="logo"></a>
			</span>
		</h2>
		<div class="card-list">
			<div
				v-for="cat in cats"
				:key="cat.id"
				class="card"
			>
				<div><span class="asset">{{ cat.asset }}</span></div>
				<div class="row">
					<div>Penalty <span class="term">chop</span></div>
					<div>{{ formatRate(cat.chop) }}</div>
				</div>
				<div class="row">
					<div>Lot size <span class="term">lump</span></div>
					<div>{{ formatAmount(cat.lump) }}</div>
				</div>
			</div>
		</div>
		<h2>Collateral auction <span class="term">Flip</span></h2>
		<div class="card-list">
			<div
				v-for="flip in flips"
				:key="flip.id"
				class="card"
			>
				<div><span class="asset">{{ flip.asset }}</span></div>
				<div class="row">
					<div>Minimal bid increase <span class="term">beg</span></div>
					<div>{{ formatRate(flip.beg) }}</div>
				</div>
				<div class="row">
					<div>Bid duration <span class="term">ttl</span></div>
					<div>{{ formatDuration(flip.ttl) }}</div>
				</div>
				<div class="row">
					<div>Auction length <span class="term">tau</span></div>
					<div>{{ formatDuration(flip.tau) }}</div>
				</div>
			</div>
		</div>
		<h2>Surplus auction
			<span class="term">
				Flap <a :href="getEtherscanLink('flap')" target="_blank"><img :src="etherscanLogo" class="logo"></a>
			</span>
		</h2>
		<div class="card">
			<div class="row">
				<div>Minimal bid increase <span class="term">beg</span></div>
				<div>{{ formatRate(flapBeg) }}</div>
			</div>
			<div class="row">
				<div>Bid duration <span class="term">ttl</span></div>
				<div>{{ formatDuration(flapTtl) }}</div>
			</div>
			<div class="row">
				<div>Auction duration <span class="term">tau</span></div>
				<div>{{ formatDuration(flapTau) }}</div>
			</div>
		</div>
		<h2>Debt auction
			<span class="term">
				Flop <a :href="getEtherscanLink('flop')" target="_blank"><img :src="etherscanLogo" class="logo"></a>
			</span>
		</h2>
		<div class="card">
			<div class="row">
				<div>Minimal bid increase <span class="term">beg</span></div>
				<div>{{ formatRate(flopBeg) }}</div>
			</div>
			<div class="row">
				<div>Bid duration <span class="term">ttl</span></div>
				<div>{{ formatDuration(flopTtl) }}</div>
			</div>
			<div class="row">
				<div>Auction duration <span class="term">tau</span></div>
				<div>{{ formatDuration(flopTau) }}</div>
			</div>
			<div class="row">
				<div>Lot size increase <span class="term">pad</span></div>
				<div>{{ formatRate(flopPad) }}</div>
			</div>
		</div>
		<h2>Accounting
			<span class="term">
				Vow <a :href="getEtherscanLink('vow')" target="_blank"><img :src="etherscanLogo" class="logo"></a>
			</span>
		</h2>
		<div class="card card-big">
			<div class="row">
				<div>Surplus auction buffer <span class="term">hump</span></div>
				<div>{{ formatAmount(hump) }} DAI</div>
			</div>
			<div class="row">
				<div>Surplus lot size <span class="term">bump</span></div>
				<div>{{ formatAmount(bump) }} DAI</div>
			</div>
			<div class="row">
				<div>Debt auction bid size <span class="term">sump</span></div>
				<div>{{ formatAmount(sump) }} DAI</div>
			</div>
			<div class="row">
				<div>Debt auction initial lot size <span class="term">dump</span></div>
				<div>{{ formatAmount(dump) }} MKR</div>
			</div>
			<div class="row">
				<div>Debt auction delay <span class="term">wait</span></div>
				<div>{{ formatDuration(wait) }}</div>
			</div>
		</div>
		<h2>
			Misc
			<span class="term">
				Pause <a :href="getEtherscanLink('pause')" target="_blank"><img :src="etherscanLogo" class="logo"></a>,
				ESM <a :href="getEtherscanLink('esm')" target="_blank"><img :src="etherscanLogo" class="logo"></a>,
				End <a :href="getEtherscanLink('end')" target="_blank"><img :src="etherscanLogo" class="logo"></a>
			</span>
		</h2>
		<div class="card">
			<div class="row">
				<div>Timelock <span class="term">Pause_delay</span></div>
				<div>{{ formatDuration(pauseDelay) }}</div>
			</div>
			<div class="row">
				<div>ES amount <span class="term">Esm_min</span></div>
				<div>{{ formatAmount(esmMin) }} MKR</div></div>
			<div class="row">
				<div>ES delay <span class="term">End_wait</span></div>
				<div>{{ formatDuration(endWait) }}</div>
			</div>
		</div>
		<footer>
			<div id="links">
				<div><a href="https://docs.makerdao.com/other-documentation/system-glossary" target="_blank">Glossary</a></div>
				<div><a href="https://changelog.makerdao.com/releases/mainnet/1.0.4/contracts.json" target="_blank">Contracts</a></div>
			</div>
		</footer>
	</div>
</template>

<script>
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import ethcall from 'ethcall';

import etherscanLogo from '../../public/etherscan.svg';

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

const infuraKey = '93e3393c76ed4e1f940d0266e2fdbda2';
const provider = new ethers.providers.InfuraProvider('mainnet', infuraKey);

const ilkIds = [
	'ETH-A',
	'BAT-A',
	'USDC-A',
	'SAI',
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
		'USDC-A': '0xE6ed1d09a19Bd335f051d78D5d22dF3bfF2c28B1',
		'SAI': '0x5432b2f3c0DFf95AA191C45E5cbd539E2820aE72',
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

const TEN = new BigNumber(10);
const WAD = TEN.pow(18);
const RAY = TEN.pow(27);

export default {
	data() {
		return {
			vatLine: 0,
			jugBase: 1,
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
	computed: {
		etherscanLogo() {
			return etherscanLogo;
		},
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
		formatFee(fee) {
			const apy = fee ** (60*60*24*365) - 1;
			return `${apy.toFixed(6) * 100}%`;
		},
		formatRate(rate) {
			const percentage = rate == 0
				? 100 * rate
				: 100 * (rate - 1);
			return `${percentage.toFixed(2)}%`;
		},
		formatRatio(ratio) {
			return `${ratio * 100}%`;
		},
		formatDuration(duration) {
			const mins = duration / 60;
			if (duration < 60 * 60) {
				return `${mins.toFixed(2)} mins`;
			}
			const hours = mins / 60;
			if (duration < 24 * 60 * 60) {
				return `${hours.toFixed(2)} hrs`;
			}
			const days = hours / 24;
			return `${days.toFixed(2)} days`;
		},
		formatAmount(amount) {
			const amountNumber = new Number(amount.toString());
			const options = {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			};
			return amountNumber.toLocaleString(undefined, options);
		},
		getEtherscanLink(contract) {
			const contractAddress = addresses[contract];
			return `https://etherscan.io/address/${contractAddress}`;
		},
		async _loadBase() {
			const vatLineCall = vatContract.Line();
			const jugBaseCall = jugContract.base();
			const potDsrCall = potContract.dsr();

			const data = await ethcall.all([vatLineCall, jugBaseCall, potDsrCall], provider);
			const vatLine = data[0];
			// const jugBase = data[1];
			const potDsr = data[2];

			const vatLineNumber = new BigNumber(vatLine);
			// const jugBaseNumber = new BigNumber(jugBase);
			const potDsrNumber = new BigNumber(potDsr);

			this.vatLine = vatLineNumber.div(RAY).div(WAD).toNumber();
			// this.jugBase = jugBaseNumber.div(RAY).toNumber();
			this.potDsr = potDsrNumber.div(RAY).toNumber();
		},
		async _loadCollaterals() {
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

			const data = await ethcall.all(ilkCalls, provider);

			this.ilks = ilkIds.map(id => {
				const index = ilkIds.indexOf(id);
				const duty = data[index].duty;
				const line = data[count + index].line;
				const mat = data[2 * count + index].mat;

				const dutyNumber = new BigNumber(duty);
				const lineNumber = new BigNumber(line);
				const matNumber = new BigNumber(mat);

				const ilk = {
					id: `ilk-${id}`,
					asset: id,
					duty: dutyNumber.div(RAY).toNumber(),
					line: lineNumber.div(RAY).div(WAD).toNumber(),
					mat: matNumber.div(RAY).toNumber(),
				};
				return ilk;
			});
		},
		async _loadCats() {
			const collateralIdBytes = ilkIds.map(id =>
				ethers.utils.formatBytes32String(id)
			);
			const catIlkCalls = collateralIdBytes.map(ilk =>
				catContract.ilks(ilk)
			);

			const data = await ethcall.all(catIlkCalls, provider);
			this.cats = ilkIds.map(id => {
				const index = ilkIds.indexOf(id);
				const { chop, lump } = data[index];

				const chopNumber = new BigNumber(chop);
				const lumpNumber = new BigNumber(lump);

				const flip = {
					id: `cat-${id}`,
					asset: id,
					chop: chopNumber.div(RAY).toNumber(),
					lump: lumpNumber.div(WAD).toNumber(),
				};
				return flip;
			});
		},
		async _loadFlips() {
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

			const data = await ethcall.all(flipCalls, provider);
			this.flips = flipIds.map(id => {
				const index = flipIds.indexOf(id);
				const beg = data[index];
				const ttl = data[count + index];
				const tau = data[2 * count + index];

				const begNumber = new BigNumber(beg);
				const ttlNumber = new BigNumber(ttl);
				const tauNumber = new BigNumber(tau);

				const flip = {
					id: `flip-${id}`,
					asset: id,
					beg: begNumber.div(WAD).toNumber(),
					ttl: ttlNumber.toNumber(),
					tau: tauNumber.toNumber(),
				};
				return flip;
			});
		},
		async _loadFlapFlop() {
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
			const data = await ethcall.all(calls, provider);
			const flapBeg = data[0];
			const flapTtl = data[1];
			const flapTau = data[2];
			const flopBeg = data[3];
			const flopTtl = data[4];
			const flopTau = data[5];
			const flopPad = data[6];

			const flapBegNumber = new BigNumber(flapBeg);
			const flapTtlNumber = new BigNumber(flapTtl);
			const flapTauNumber = new BigNumber(flapTau);
			const flopBegNumber = new BigNumber(flopBeg);
			const flopTtlNumber = new BigNumber(flopTtl);
			const flopTauNumber = new BigNumber(flopTau);
			const flopPadNumber = new BigNumber(flopPad);

			this.flapBeg = flapBegNumber.div(WAD).toNumber();
			this.flapTtl = flapTtlNumber.toNumber();
			this.flapTau = flapTauNumber.toNumber();
			this.flopBeg = flopBegNumber.div(WAD).toNumber();
			this.flopTtl = flopTtlNumber.toNumber();
			this.flopTau = flopTauNumber.toNumber();
			this.flopPad = flopPadNumber.div(WAD).toNumber();
		},
		async _loadVow() {
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
			const data = await ethcall.all(calls, provider);
			const hump = data[0];
			const bump = data[1];
			const sump = data[2];
			const dump = data[3];
			const wait = data[4];

			const humpNumber = new BigNumber(hump);
			const bumpNumber = new BigNumber(bump);
			const sumpNumber = new BigNumber(sump);
			const dumpNumber = new BigNumber(dump);
			const waitNumber = new BigNumber(wait);

			this.hump = humpNumber.div(RAY).div(WAD).toNumber();
			this.bump = bumpNumber.div(RAY).div(WAD).toNumber();
			this.sump = sumpNumber.div(RAY).div(WAD).toNumber();
			this.dump = dumpNumber.div(WAD).toNumber();
			this.wait = waitNumber.toNumber();
		},
		async _loadMisc() {
			const pauseDelayCall = pauseContract.delay();
			const esmMinCall = esmContract.min();
			const endWaitCall = endContract.wait();

			const calls = [
				pauseDelayCall,
				esmMinCall,
				endWaitCall,
			];

			const data = await ethcall.all(calls, provider);
			const pauseDelay = data[0];
			const esmMin = data[1];
			const endWait = data[2];

			const pauseDelayNumber = new BigNumber(pauseDelay);
			const esmMinNumber = new BigNumber(esmMin);
			const endWaitNumber = new BigNumber(endWait);

			this.pauseDelay = pauseDelayNumber.toNumber();
			this.esmMin = esmMinNumber.div(WAD).toNumber();
			this.endWait = endWaitNumber.toNumber();
		},
	},
};
</script>

<style scoped>
footer {
	margin-top: 1em;
}

.card-list {
	display: flex;
}

.card {
	margin: 0 1em;
	padding: 0.5em;
	width: 14em;
	background: white;
	border: 1px solid #eceef0;
	border-radius: 0.5em;
}

.card-big {
	width: 18em;
}

.row {
	display: flex;
	justify-content: space-between;
}

.term {
	color: #888;
}

.asset {
	font-weight: bold;
}

.logo {
	height: 16px;
}

#links {
	display: flex;
	justify-content: center;
}

#links > div {
	margin-left: 1em;
}
</style>