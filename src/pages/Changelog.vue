<template>
	<div>
		<h1>Changelog</h1>
		<div id="spells">
			<div
				v-for="spell in spells"
				:key="spell.txHash"
				class="spell"
			>
				<div class="header">
					<div>
						{{ formatTimestamp(spell.timestamp) }}
					</div>
					<div>
						{{ formatHash(spell.txHash) }}
						<a :href="getEtherscanLink(spell.txHash)" target="_blank"><img :src="etherscanLogo" class="logo"></a>
					</div>
				</div>
				<div class="changes">
					<div
						v-for="change in spell.changes"
						:key="change.id"
						class="change"
					>
						<div class="param">
							{{ change.param }} <span class="term">({{ change.term }})</span>
						</div>
						<div class="value">
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
import BigNumber from 'bignumber.js';

import etherscanLogo from '../../public/etherscan.svg';

const TEN = new BigNumber(10);
const WAD = TEN.pow(18);
const RAY = TEN.pow(27);

export default {
	data() {
		return {
			changes: [],
		};
	},
	computed: {
		spells() {
			const values = {};
			const timestamps = {};
			const spellMap = {};
			for (let change of this.changes) {
				const { id, timestamp, param, value, txHash } = change;
				timestamps[txHash] = timestamp;
				if (!(txHash in spellMap)) {
					spellMap[txHash] = [];
				}
				spellMap[txHash].push({
					id,
					timestamp,
					param: this._getParamName(param),
					term: this._getTermName(param),
					oldValue: this._getValue(param, values[param]),
					newValue: this._getValue(param, value),
				});
				values[param] = value;
			}
			const txHashes = Object.keys(spellMap);
			const spells = txHashes.map(txHash => {
				const timestamp = timestamps[txHash];
				const changes = spellMap[txHash];
				return {
					timestamp,
					txHash,
					changes,
				};
			});
			spells.reverse();
			return spells;
		},
		etherscanLogo() {
			return etherscanLogo
		},
	},
	mounted() {
		this._loadChanges();
	},
	methods: {
		formatTimestamp(timestamp) {
			const date = new Date(timestamp * 1000);
			const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
			return date.toLocaleString('en-US', options);
		},
		formatHash(hash) {
			return `tx ${hash.substr(0, 6)}…${hash.substr(66 - 6)}`;
		},
		getEtherscanLink(txHash) {
			return `https://etherscan.io/tx/${txHash}`;
		},
		async _loadChanges() {
			const url = 'https://api.thegraph.com/subgraphs/id/Qmbvxsbr4e3xmuAqh3SzS3u4ZA912TyPoseVYKecFnMtAk';
			const query = `
				query {
					changes(
						first: 1000,
						orderBy: timestamp,
					) {
						id
						param
						value
						timestamp
						txHash
					}
				}`;
			const opts = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query }),
			};
			const response = await fetch(url, opts);
			const json = await response.json();
			this.changes = json.data.changes;
		},
		_getParamName(param) {
			const paramMap = {
				'Vat-Line': 'Ceiling',
				'Vat-BAT-A-dust': 'Min DAI in BAT Vault',
				'Vat-BAT-A-line': 'BAT Ceiling',
				'Vat-ETH-A-dust': 'Min DAI in ETH Vault',
				'Vat-ETH-A-line': 'ETH Ceiling',
				'Vat-USDC-A-dust': 'Min DAI in USDC Vault',
				'Vat-USDC-A-line': 'USDC Ceiling',
				'Vat-SAI-line': 'SAI Ceiling',
				'Jug-base': 'Base stability fee',
				'Jug-BAT-A-duty': 'BAT stability fee',
				'Jug-ETH-A-duty': 'ETH stability fee',
				'Jug-USDC-A-duty': 'USDC stability fee',
				'Jug-SAI-duty': 'SAI stability fee',
				'Pot-dsr': 'Savings rate',
				'Cat-BAT-A-chop': 'BAT liquidation penalty',
				'Cat-BAT-A-lump': 'BAT liquidation lot size',
				'Cat-ETH-A-chop': 'ETH liquidation penalty',
				'Cat-ETH-A-lump': 'ETH liquidation lot size',
				'Flip-BAT-A-beg': 'BAT auction min. bid increase',
				'Flip-BAT-A-tau': 'BAT auction duration',
				'Flip-BAT-A-ttl': 'BAT auction bid duration',
				'Flip-ETH-A-beg': 'ETH auction min. bid increase',
				'Flip-ETH-A-tau': 'ETH auction duration',
				'Flip-ETH-A-ttl': 'ETH auction bid duration',
				'Flap-beg': 'Surplus auction min bid increase',
				'Flap-tau': 'Surplus auction duration',
				'Flap-ttl': 'Surplus auction bid duration',
				'Flop-beg': 'Debt auction min bid increase',
				'Flop-tau': 'Debt auction duration',
				'Flop-ttl': 'Debt auction bid duration',
				'Flop-pad': 'Debt auction lot size increase',
				'Pause-delay': 'Timelock',
			};
			const paramName = paramMap[param];
			return paramName;
		},
		_getTermName(param) {
			const termMap = {
				'Vat-Line': 'Vat_Line',
				'Vat-BAT-A-dust': 'Vat[BAT-A]_dust',
				'Vat-BAT-A-line': 'Vat[BAT-A]_line',
				'Vat-ETH-A-dust': 'Vat[ETH-A]_dust',
				'Vat-ETH-A-line': 'Vat[ETH-A]_line',
				'Vat-USDC-A-dust': 'Vat[USDC-A]_dust',
				'Vat-USDC-A-line': 'Vat[USDC-A]_line',
				'Vat-SAI-line': 'Vat[SAI]_line',
				'Jug-base': 'Jug_base',
				'Jug-BAT-A-duty': 'Jug[BAT-A]_duty',
				'Jug-ETH-A-duty': 'Jug[ETH-A]_duty',
				'Jug-USDC-A-duty': 'Jug[USDC-A]_duty',
				'Jug-SAI-duty': 'Jug[SAI]_duty',
				'Pot-dsr': 'Pot_dsr',
				'Cat-BAT-A-chop': 'Cat[BAT-A]_chop',
				'Cat-BAT-A-lump': 'Cat[BAT-A]_lump',
				'Cat-ETH-A-chop': 'Cat[ETH-A]_chop',
				'Cat-ETH-A-lump': 'Cat[ETH-A]_lump',
				'Flip-BAT-A-beg': 'Flip[BAT-A]_beg',
				'Flip-BAT-A-tau': 'Flip[BAT-A]_tau',
				'Flip-BAT-A-ttl': 'Flip[BAT-A]_ttl',
				'Flip-ETH-A-beg': 'Flip[ETH-A]_beg',
				'Flip-ETH-A-tau': 'Flip[ETH-A]_tau',
				'Flip-ETH-A-ttl': 'Flip[ETH-A]_ttl',
				'Flap-beg': 'Flap_beg',
				'Flap-tau': 'Flap_tau',
				'Flap-ttl': 'Flap_ttl',
				'Flop-beg': 'Flop_beg',
				'Flop-tau': 'Flop_tau',
				'Flop-ttl': 'Flop_ttl',
				'Flop-pad': 'Flop_pad',
				'Pause-delay': 'Pause_delay',
			};
			const termName = termMap[param];
			return termName;
		},
		_getValue(param, value) {
			if (!value) {
				return;
			}
			const formatFuncMap = {
				'Vat-Line': this._formatDaiAmount,
				'Vat-BAT-A-dust': this._formatDaiAmount,
				'Vat-BAT-A-line': this._formatDaiAmount,
				'Vat-ETH-A-dust': this._formatDaiAmount,
				'Vat-ETH-A-line': this._formatDaiAmount,
				'Vat-USDC-A-dust': this._formatDaiAmount,
				'Vat-USDC-A-line': this._formatDaiAmount,
				'Vat-SAI-line': this._formatDaiAmount,
				'Jug-base': this._formatWadRate,
				'Jug-BAT-A-duty': this._formatFee,
				'Jug-ETH-A-duty': this._formatFee,
				'Jug-USDC-A-duty': this._formatFee,
				'Jug-SAI-duty': this._formatFee,
				'Pot-dsr': this._formatFee,
				'Cat-BAT-A-chop': this._formatRayRate,
				'Cat-BAT-A-lump': this._formatAmount,
				'Cat-ETH-A-chop': this._formatRayRate,
				'Cat-ETH-A-lump': this._formatAmount,
				'Flip-BAT-A-beg': this._formatWadRate,
				'Flip-BAT-A-tau': this._formatDuration,
				'Flip-BAT-A-ttl': this._formatDuration,
				'Flip-ETH-A-beg': this._formatWadRate,
				'Flip-ETH-A-tau': this._formatDuration,
				'Flip-ETH-A-ttl': this._formatDuration,
				'Flap-beg': this._formatWadRate,
				'Flap-tau': this._formatDuration,
				'Flap-ttl': this._formatDuration,
				'Flop-beg': this._formatWadRate,
				'Flop-tau': this._formatDuration,
				'Flop-ttl': this._formatDuration,
				'Flop-pad': this._formatWadRate,
				'Pause-delay': this._formatDuration,
			};
			const formatFunc = formatFuncMap[param] || this._noFormat;
			return formatFunc(value);
		},
		_noFormat(value) {
			return value;
		},
		_formatFee(rawFee) {
			const rawFeeNumber = new BigNumber(rawFee);
			const fee = rawFeeNumber.div(RAY).toNumber();
			const apy = fee ** (60*60*24*365) - 1;
			return `${apy.toFixed(6) * 100}%`;
		},
		_formatWadRate(rawRate) {
			const rawRateNumber = new BigNumber(rawRate);
			const rate = rawRateNumber.div(WAD).toNumber();
			const percentage = rate == 0
				? 100 * rate
				: 100 * (rate - 1);
			return `${percentage.toFixed(2)}%`;
		},
		_formatRayRate(rawRate) {
			const rawRateNumber = new BigNumber(rawRate);
			const rate = rawRateNumber.div(RAY).toNumber();
			const percentage = rate == 0
				? 100 * rate
				: 100 * (rate - 1);
			return `${percentage.toFixed(2)}%`;
		},
		_formatDuration(duration) {
			const mins = duration / 60;
			if (duration % (60 * 60) != 0) {
				return `${mins} mins`;
			}
			const hours = mins / 60;
			if (duration % (24 * 60 * 60) != 0) {
				return `${hours} hrs`;
			}
			const days = hours / 24;
			return `${days} days`;
		},
		_formatAmount(rawAmount) {
			const rawAmountNumber = new BigNumber(rawAmount);
			const amount = rawAmountNumber.div(WAD).toNumber();
			const amountNumber = new Number(amount.toString());
			const options = {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			};
			return `${amountNumber.toLocaleString(undefined, options)}`;
		},
		_formatDaiAmount(rawAmount) {
			const rawAmountNumber = new BigNumber(rawAmount);
			const amount = rawAmountNumber.div(RAY).div(WAD).toNumber();
			const amountNumber = new Number(amount.toString());
			const options = {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			};
			return `${amountNumber.toLocaleString(undefined, options)} DAI`;
		},
	},
};
</script>

<style scoped>
h1 {
	text-align: center;
}

#spells {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 1rem 0;
}

.spell {
	width: 80%;
	border: 1px solid #dedede;
	background: white;
	padding: 0.5rem;
	margin-top: 1rem;
}

.header {
	display: flex;
	justify-content: space-between;
	font-size: 18px;
}

.changes {
	margin-top: 1rem;
}

.change {
	margin-top: 0.5rem;
	display: flex;
	justify-content: space-between;
	font-size: 14px;
}

.term {
	color: #818da4;
}

.logo {
	height: 16px;
}
</style>
