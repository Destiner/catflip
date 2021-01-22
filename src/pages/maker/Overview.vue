<template>
	<div>
		<h1>Overview</h1>
		<div id="sections">
			<div class="section">
				<h2>
					Basic
					<span class="term">
						(Vat <ExternalLink :link="getEtherscanLink('vat')" />,
						Jug <ExternalLink :link="getEtherscanLink('jug')" />,
						Pot <ExternalLink :link="getEtherscanLink('pot')" />,
						Spot <ExternalLink :link="getEtherscanLink('spot')" />)
					</span>
				</h2>
				<LoadingIndicator v-if="!state.vatLine" />
				<div
					v-else
					class="stats"
				>
					<div class="stat">
						<div class="value">
							{{ formatDaiAmount(state.vatLine) }} DAI
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
							{{ formatWadRate(state.jugBase) }}
						</div>
						<div class="param">
							<div>Base stability fee</div>
							<div class="term">
								Jug_base
							</div>
						</div>
					</div>
					<div class="stat">
						<div class="value">
							{{ formatFee(state.potDsr) }}
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
				<LoadingIndicator v-if="state.ilks.length === 0" />
				<div
					v-else
					class="cards"
				>
					<div
						v-for="ilk in state.ilks"
						:key="ilk.id"
						class="card"
					>
						<div class="card-header">
							<span>{{ ilk.asset }}</span>
						</div>
						<div class="row">
							<div class="row-label">
								Ceiling <span class="term">(Vat_line)</span>
							</div>
							<div class="row-number">
								{{ formatDaiAmount(ilk.line) }} DAI
							</div>
						</div>
						<div class="row">
							<div class="row-label">
								Min. per Vault <span class="term">(Vat_dust)</span>
							</div>
							<div class="row-number">
								{{ formatDaiAmount(ilk.dust) }} DAI
							</div>
						</div>
						<div class="row">
							<div class="row-label">
								Stability fee <span class="term">(Jug_duty)</span>
							</div>
							<div class="row-number">
								{{ formatFee(ilk.duty) }}
							</div>
						</div>
						<div class="row">
							<div class="row-label">
								Col. ratio <span class="term">(Spot_mat)</span>
							</div>
							<div class="row-number">
								{{ formatRatio(ilk.mat) }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>
					Liquidation
					<span class="term">
						(Cat <ExternalLink :link="getEtherscanLink('cat')" />)
					</span>
				</h2>
				<LoadingIndicator v-if="state.cats.length === 0 && !state.catBox" />
				<template v-else>
					<div class="stats">
						<div class="stat">
							<div class="value">
								{{ formatDaiAmount(state.catBox) }} DAI
							</div>
							<div class="param">
								<div>Total auction limit</div>
								<div class="term">
									Cat_box
								</div>
							</div>
						</div>
					</div>
					<div class="cards">
						<div
							v-for="cat in state.cats"
							:key="cat.id"
							class="card"
						>
							<div class="card-header">
								<span>{{ cat.asset }}</span>
							</div>
							<div class="row">
								<div class="row-label">
									Penalty <span class="term">(chop)</span>
								</div>
								<div class="row-number">
									{{ formatWadRate(cat.chop) }}
								</div>
							</div>
							<div class="row">
								<div class="row-label">
									Auction size <span class="term">(dunk)</span>
								</div>
								<div class="row-number">
									{{ formatDaiAmount(cat.dunk) }} DAI
								</div>
							</div>
						</div>
					</div>
				</template>
			</div>

			<div class="section">
				<h2>Collateral auction <span class="term">(Flip)</span></h2>
				<LoadingIndicator v-if="state.flips.length === 0" />
				<div
					v-else
					class="cards"
				>
					<div
						v-for="flip in state.flips"
						:key="flip.id"
						class="card"
					>
						<div class="card-header">
							<span>{{ flip.asset }}</span>
						</div>
						<div class="row">
							<div class="row-label">
								Min. bid increase <span class="term">(beg)</span>
							</div>
							<div class="row-number">
								{{ formatWadRate(flip.beg) }}
							</div>
						</div>
						<div class="row">
							<div class="row-label">
								Bid duration <span class="term">(ttl)</span>
							</div>
							<div class="row-number">
								{{ formatDuration(flip.ttl) }}
							</div>
						</div>
						<div class="row">
							<div class="row-label">
								Auction duration <span class="term">(tau)</span>
							</div>
							<div class="row-number">
								{{ formatDuration(flip.tau) }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="section">
				<h2>
					Surplus auction
					<span class="term">
						(Flap <ExternalLink :link="getEtherscanLink('flap')" />)
					</span>
				</h2>
				<LoadingIndicator v-if="!state.flapTau" />
				<div
					v-else
					class="stats"
				>
					<div class="stat">
						<div class="value">
							{{ formatWadRate(state.flapBeg) }}
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
							{{ formatDuration(state.flapTtl) }}
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
							{{ formatDuration(state.flapTau) }}
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
						(Flop <ExternalLink :link="getEtherscanLink('flop')" />)
					</span>
				</h2>
				<LoadingIndicator v-if="!state.flopTau" />
				<div
					v-else
					class="stats"
				>
					<div class="stat">
						<div class="value">
							{{ formatWadRate(state.flopBeg) }}
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
							{{ formatDuration(state.flopTtl) }}
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
							{{ formatDuration(state.flopTau) }}
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
							{{ formatWadRate(state.flopPad) }}
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
						(Vow <ExternalLink :link="getEtherscanLink('vow')" />)
					</span>
				</h2>
				<LoadingIndicator v-if="!state.wait" />
				<div
					v-else
					class="stats"
				>
					<div class="stat">
						<div class="value">
							{{ formatDaiAmount(state.hump) }} DAI
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
							{{ formatDaiAmount(state.bump) }} DAI
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
							{{ formatDaiAmount(state.sump) }} DAI
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
							{{ formatAmount(state.dump) }} MKR
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
							{{ formatDuration(state.wait) }}
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
						(Pause <ExternalLink :link="getEtherscanLink('pause')" />,
						ESM <ExternalLink :link="getEtherscanLink('esm')" />,
						End <ExternalLink :link="getEtherscanLink('end')" />)
					</span>
				</h2>
				<LoadingIndicator v-if="!state.esmMin" />
				<div
					v-else
					class="stats"
				>
					<div class="stat">
						<div class="value">
							{{ formatDuration(state.pauseDelay) }}
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
							{{ formatAmount(state.esmMin) }} MKR
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
							{{ formatDuration(state.endWait) }}
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

<script lang="ts">
import { reactive, onMounted, defineComponent } from 'vue';
import { InfuraProvider } from '@ethersproject/providers';
import { formatBytes32String } from '@ethersproject/strings';
import { Contract, Provider } from 'ethcall';

import vatAbi from '@/abi/maker/vat.json';
import jugAbi from '@/abi/maker/jug.json';
import spotAbi from '@/abi/maker/spot.json';
import potAbi from '@/abi/maker/pot.json';
import catAbi from '@/abi/maker/cat.json';
import flipAbi from '@/abi/maker/flip.json';
import flapAbi from '@/abi/maker/flap.json';
import flopAbi from '@/abi/maker/flop.json';
import vowAbi from '@/abi/maker/vow.json';
import pauseAbi from '@/abi/maker/pause.json';
import esmAbi from '@/abi/maker/esm.json';
import endAbi from '@/abi/maker/end.json';

import Formatter from '@/utils/formatter';
import Converter from '@/utils/converter';

import ExternalLink from '@/components/ExternalLink.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';

const infuraKey = '2c010c2fdb8b4ef1a7617571553fc982';
const provider = new InfuraProvider('mainnet', infuraKey);

const ilkIds = [
	'ETH-A',
	'ETH-B',
	'USDC-A',
	'USDC-B',
	'TUSD-A',
	'USDT-A',
	'PAXUSD-A',
	'WBTC-A',
	'BAT-A',
	'KNC-A',
	'ZRX-A',
	'MANA-A',
	'LRC-A',
	'COMP-A',
	'LINK-A',
	'BAL-A',
	'YFI-A',
	'GUSD-A',
	'RENBTC-A',
	'UNI-A',
	'AAVE-A',
	'UNIV2DAIETH-A',
	// 'SAI',
];

const addresses = {
	vat: '0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B',
	jug: '0x19c0976f590D67707E62397C87829d896Dc0f1F1',
	spot: '0x65C79fcB50Ca1594B025960e539eD7A9a6D434A3',
	pot: '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7',
	cat: '0xa5679C04fc3d9d8b0AaB1F0ab83555b301cA70Ea',
	flip: {
		'ETH-A': '0xF32836B9E1f47a0515c6Ec431592D5EbC276407f',
		'ETH-B': '0xD499d71bE9e9E5D236A07ac562F7B6CeacCa624c',
		'WBTC-A': '0x58CD24ac7322890382eE45A3E4F903a5B22Ee930',
		'BAT-A': '0xF7C569B2B271354179AaCC9fF1e42390983110BA',
		'KNC-A': '0x57B01F1B3C59e2C0bdfF3EC9563B71EEc99a3f2f',
		'ZRX-A': '0xa4341cAf9F9F098ecb20fb2CeE2a0b8C78A18118',
		'MANA-A': '0x0a1D75B4f49BA80724a214599574080CD6B68357',
		'USDC-A': '0xbe359e53038E41a1ffA47DAE39645756C80e557a',
		'USDC-B': '0x77282aD36aADAfC16bCA42c865c674F108c4a616',
		'TUSD-A': '0x9E4b213C4defbce7564F2Ac20B6E3bF40954C440',
		'USDT-A': '0x667F41d0fDcE1945eE0f56A79dd6c142E37fCC26',
		'PAXUSD-A': '0x52D5D1C05CC79Fc24A629Cb24cB06C5BE5d766E7',
		'LRC-A': '0x7FdDc36dcdC435D8F54FDCB3748adcbBF70f3dAC',
		'COMP-A': '0x524826F84cB3A19B6593370a5889A58c00554739',
		'LINK-A': '0xB907EEdD63a30A3381E6D898e5815Ee8c9fd2c85',
		'BAL-A': '0xb2b9bd446eE5e58036D2876fce62b7Ab7334583e',
		'YFI-A': '0xEe4C9C36257afB8098059a4763A374a4ECFE28A7',
		'GUSD-A': '0xCAa8D152A8b98229fB77A213BE16b234cA4f612f',
		'RENBTC-A': '0x30BC6eBC27372e50606880a36B279240c0bA0758',
		'UNI-A': '0xF5b8cD9dB5a0EC031304A7B815010aa7761BD426',
		'AAVE-A': '0x16e1b844094c885a37509a8f76c533B5fbFED13a',
		'UNIV2DAIETH-A': '0x57dfd99f45747DD55C1c432Db4aEa07FBd5d2B5c',
		// 'SAI': '0x5432b2f3c0DFf95AA191C45E5cbd539E2820aE72',
	},
	flap: '0xC4269cC7acDEdC3794b221aA4D9205F564e27f0d',
	flop: '0xA41B6EF151E06da0e34B009B86E828308986736D',
	vow: '0xA950524441892A31ebddF91d3cEEFa04Bf454466',
	pause: '0xbE286431454714F511008713973d3B053A2d38f3',
	esm: '0x0581A0AbE32AAe9B5f0f68deFab77C6759100085',
	end: '0xaB14d3CE3F733CACB76eC2AbE7d2fcb00c99F3d5',
};

const vatContract = new Contract(addresses.vat, vatAbi);
const jugContract = new Contract(addresses.jug, jugAbi);
const spotContract = new Contract(addresses.spot, spotAbi);
const potContract = new Contract(addresses.pot, potAbi);
const catContract = new Contract(addresses.cat, catAbi);
const flapContract = new Contract(addresses.flap, flapAbi);
const flopContract = new Contract(addresses.flop, flopAbi);
const vowContract = new Contract(addresses.vow, vowAbi);
const pauseContract = new Contract(addresses.pause, pauseAbi);
const esmContract = new Contract(addresses.esm, esmAbi);
const endContract = new Contract(addresses.end, endAbi);

export default defineComponent({
	components: {
		ExternalLink,
		LoadingIndicator,
	},
	setup() {
		const state = reactive({
			vatLine: 0,
			jugBase: 0,
			potDsr: 1,
			ilks: [],
			catBox: 0,
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
		});

		onMounted(() => {
			_loadBase();
			_loadCollaterals();
			_loadCats();
			_loadFlips();
			_loadFlapFlop();
			_loadVow();
			_loadMisc();
		});

		function formatAmount(value: string) {
			return Formatter.formatMultiplier(Converter.fromWad(value), 0);
		}

		function formatDaiAmount(value: string) {
			// @ts-ignore
			return Formatter.formatMultiplier(Converter.fromWad(Converter.fromRay(value)), 0);
		}

		function formatRatio(value: string) {
			return Formatter.formatRatio(Converter.fromRay(value));
		}

		function formatRayRate(value: string) {
			return Formatter.formatRate(Converter.fromRay(value));
		}

		function formatWadRate(value: string) {
			return Formatter.formatRate(Converter.fromWad(value));
		}

		function formatFee(value: string) {
			return Formatter.formatFee(Converter.fromRay(value));
		}

		function formatDuration(value: number) {
			return Formatter.formatDuration(value);
		}

		function getEtherscanLink(contract: string) {
			const contractAddress = addresses[contract];
			return `https://etherscan.io/address/${contractAddress}`;
		}

		async function _loadBase() {
			const ethcallProvider = new Provider();
			await ethcallProvider.init(provider);

			const vatLineCall = vatContract.Line();
			const jugBaseCall = jugContract.base();
			const potDsrCall = potContract.dsr();
			const catBoxCall = catContract.box();

			const data = await ethcallProvider.all([vatLineCall, jugBaseCall, potDsrCall, catBoxCall]);
			const vatLine = data[0].toString();
			const jugBase = data[1].toString();
			const potDsr = data[2].toString();
			const catBox = data[3].toString();

			state.vatLine = vatLine;
			state.jugBase = jugBase;
			state.potDsr = potDsr;
			state.catBox = catBox;
		}

		async function _loadCollaterals() {
			const ethcallProvider = new Provider();
			await ethcallProvider.init(provider);

			const count = ilkIds.length;
			const collateralIdBytes = ilkIds.map(id => formatBytes32String(id));
			const jugIlkCalls = collateralIdBytes.map(ilk =>
				jugContract.ilks(ilk),
			);
			const vatIlkCalls = collateralIdBytes.map(ilk =>
				vatContract.ilks(ilk),
			);
			const spotIlkCalls = collateralIdBytes.map(ilk =>
				spotContract.ilks(ilk),
			);
			const ilkCalls = jugIlkCalls.concat(vatIlkCalls).concat(spotIlkCalls);

			const data = await ethcallProvider.all(ilkCalls);

			// @ts-ignore
			state.ilks = ilkIds.map(id => {
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
		}

		async function _loadCats() {
			const ethcallProvider = new Provider();
			await ethcallProvider.init(provider);

			const collateralIdBytes = ilkIds.map(id => formatBytes32String(id));
			const catIlkCalls = collateralIdBytes.map(ilk =>
				catContract.ilks(ilk),
			);

			const data = await ethcallProvider.all(catIlkCalls);
			// @ts-ignore
			state.cats = ilkIds.map(id => {
				const index = ilkIds.indexOf(id);
				const cat = data[index];
				const chop = cat.chop.toString();
				const dunk = cat.dunk.toString();

				const flip = {
					id: `cat-${id}`,
					asset: id,
					chop,
					dunk,
				};
				return flip;
			});
		}

		async function _loadFlips() {
			const ethcallProvider = new Provider();
			await ethcallProvider.init(provider);

			const flipIds = Object.keys(addresses.flip);
			const count = flipIds.length;
			const flipContracts = flipIds.map(flipId => {
				const flipAddress = addresses.flip[flipId];
				const flipContract = new Contract(flipAddress, flipAbi);
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
			// @ts-ignore
			state.flips = flipIds.map(id => {
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
		}

		async function _loadFlapFlop() {
			const ethcallProvider = new Provider();
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

			state.flapBeg = flapBeg.toString();
			state.flapTtl = flapTtl;
			state.flapTau = flapTau;
			state.flopBeg = flopBeg.toString();
			state.flopTtl = flopTtl;
			state.flopTau = flopTau;
			state.flopPad = flopPad.toString();
		}

		async function _loadVow() {
			const ethcallProvider = new Provider();
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

			state.hump = hump.toString();
			state.bump = bump.toString();
			state.sump = sump.toString();
			state.dump = dump.toString();
			state.wait = wait.toNumber();
		}

		async function _loadMisc() {
			const ethcallProvider = new Provider();
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

			state.pauseDelay = pauseDelay.toNumber();
			state.esmMin = esmMin.toString();
			state.endWait = endWait.toNumber();
		}

		return {
			state,

			formatAmount,
			formatDaiAmount,
			formatRatio,
			formatRayRate,
			formatWadRate,
			formatFee,
			formatDuration,
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
