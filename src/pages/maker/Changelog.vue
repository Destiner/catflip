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
						<EtherscanIcon :link="getEtherscanLink(spell.txHash)" />
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
import Converter from '../../utils/converter.js';
import Formatter from '../../utils/formatter.js';

import EtherscanIcon from '../../components/EtherscanIcon.vue';

const ilkIds = [
	'ETH-A',
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
	'SAI',
];

export default {
	components: {
		EtherscanIcon,
	},
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
				const oldValue = this._getValue(param, values[param]);
				const newValue = this._getValue(param, value);
				if (oldValue == newValue) {
					continue;
				}
				spellMap[txHash].push({
					id,
					timestamp,
					param: this._getParamName(param),
					term: this._getTermName(param),
					oldValue,
					newValue,
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
			const url = 'https://api.thegraph.com/subgraphs/name/graphitetools/maker';
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
				'Jug-base': 'Base stability fee',
				'Pot-dsr': 'Savings rate',
				'Cat-box': 'Total auction limit',
				'Flap-beg': 'Surplus auction min bid increase',
				'Flap-tau': 'Surplus auction duration',
				'Flap-ttl': 'Surplus auction bid duration',
				'Flop-beg': 'Debt auction min bid increase',
				'Flop-tau': 'Debt auction duration',
				'Flop-ttl': 'Debt auction bid duration',
				'Flop-pad': 'Debt auction lot size increase',
				'Vow-hump': 'Surplus auction buffer',
				'Vow-bump': 'Surplus lot size',
				'Vow-sump': 'Debt auction bid size',
				'Vow-dump': 'Debt auction initial lot size',
				'Vow-wait': 'Debt auction delay',
				'Pause-delay': 'Timelock',
			};
			for (const ilk of ilkIds) {
				paramMap[`Vat-${ilk}-dust`] = `Min DAI in ${ilk} Vault`;
				paramMap[`Vat-${ilk}-line`] = `${ilk} Ceiling`;
				paramMap[`Spot-${ilk}-mat`] = `${ilk} col. ratio`;
				paramMap[`Jug-${ilk}-duty`] = `${ilk} stability fee`;
				paramMap[`Cat-${ilk}-chop`] = `${ilk} liquidation penalty`;
				paramMap[`Cat-${ilk}-dunk`] = `${ilk} liquidation auction size`;
				paramMap[`Cat-${ilk}-lump`] = `${ilk} liquidation lot size`;
				paramMap[`Flip-${ilk}-beg`] = `${ilk} auction min. bid increase`;
				paramMap[`Flip-${ilk}-tau`] = `${ilk} auction duration`;
				paramMap[`Flip-${ilk}-ttl`] = `${ilk} auction bid duration`;
			}
			const paramName = paramMap[param];
			return paramName;
		},
		_getTermName(param) {
			const termMap = {
				'Vat-Line': 'Vat_Line',
				'Jug-base': 'Jug_base',
				'Pot-dsr': 'Pot_dsr',
				'Cat-box': 'Cat_box',
				'Flap-beg': 'Flap_beg',
				'Flap-tau': 'Flap_tau',
				'Flap-ttl': 'Flap_ttl',
				'Flop-beg': 'Flop_beg',
				'Flop-tau': 'Flop_tau',
				'Flop-ttl': 'Flop_ttl',
				'Flop-pad': 'Flop_pad',
				'Vow-hump': 'Vow_hump',
				'Vow-bump': 'Vow_bump',
				'Vow-sump': 'Vow_sump',
				'Vow-dump': 'Vow_dump',
				'Vow-wait': 'Vow_wait',
				'Pause-delay': 'Pause_delay',
			};
			for (const ilk of ilkIds) {
				termMap[`Vat-${ilk}-dust`] = `Vat[${ilk}]_dust`;
				termMap[`Vat-${ilk}-line`] = `Vat[${ilk}]_line`;
				termMap[`Spot-${ilk}-mat`] = `Spot[${ilk}]_mat`;
				termMap[`Jug-${ilk}-duty`] = `Jug[${ilk}]_duty`;
				termMap[`Cat-${ilk}-chop`] = `Cat[${ilk}]_chop`;
				termMap[`Cat-${ilk}-dunk`] = `Cat[${ilk}]_dunk`;
				termMap[`Cat-${ilk}-lump`] = `Cat[${ilk}]_lump`;
				termMap[`Flip-${ilk}-beg`] = `Flip[${ilk}]_beg`;
				termMap[`Flip-${ilk}-tau`] = `Flip[${ilk}]_tau`;
				termMap[`Flip-${ilk}-ttl`] = `Flip[${ilk}]_ttl`;
			}
			const termName = termMap[param];
			return termName;
		},
		_getValue(param, value) {
			if (!value) {
				return;
			}
			const formatFuncMap = {
				'Vat-Line': this._formatDaiAmount,
				'Jug-base': this._formatWadRate,
				'Pot-dsr': this._formatFee,
				'Cat-box': this._formatDaiAmount,
				'Flap-beg': this._formatWadRate,
				'Flap-tau': this._formatDuration,
				'Flap-ttl': this._formatDuration,
				'Flop-beg': this._formatWadRate,
				'Flop-tau': this._formatDuration,
				'Flop-ttl': this._formatDuration,
				'Flop-pad': this._formatWadRate,
				'Vow-hump': this._formatDaiAmount,
				'Vow-bump': this._formatDaiAmount,
				'Vow-sump': this._formatDaiAmount,
				'Vow-dump': this._formatAmount,
				'Vow-wait': this._formatDuration,
				'Pause-delay': this._formatDuration,
			};
			for (const ilk of ilkIds) {
				formatFuncMap[`Vat-${ilk}-dust`] = this._formatDaiAmount;
				formatFuncMap[`Vat-${ilk}-line`] = this._formatDaiAmount;
				formatFuncMap[`Spot-${ilk}-mat`] = this._formatRatio;
				formatFuncMap[`Jug-${ilk}-duty`] = this._formatFee;
				formatFuncMap[`Cat-${ilk}-chop`] = this._formatWadRate;
				formatFuncMap[`Cat-${ilk}-dunk`] = this._formatDaiAmount;
				formatFuncMap[`Cat-${ilk}-lump`] = this._formatAmount;
				formatFuncMap[`Flip-${ilk}-beg`] = this._formatWadRate;
				formatFuncMap[`Flip-${ilk}-tau`] = this._formatDuration;
				formatFuncMap[`Flip-${ilk}-ttl`] = this._formatDuration;
			}
			const formatFunc = formatFuncMap[param] || this._noFormat;
			return formatFunc(value);
		},
		_noFormat(value) {
			return value;
		},
		_formatAmount(value) {
			return Formatter.formatAmount(Converter.fromWad(value));
		},
		_formatDaiAmount(value) {
			return `${ Formatter.formatAmount(Converter.fromWad(Converter.fromRay(value))) } DAI`;
		},
		_formatRatio(value) {
			return Formatter.formatRatio(Converter.fromRay(value));
		},
		_formatWadRate(value) {
			return Formatter.formatRate(Converter.fromWad(value));
		},
		_formatRayRate(value) {
			return Formatter.formatRate(Converter.fromRay(value));
		},
		_formatFee(value) {
			return Formatter.formatFee(Converter.fromRay(value));
		},
		_formatDuration(value) {
			return Formatter.formatDuration(value);
		},
	},
};
</script>

<style scoped>
h1 {
	text-align: center;
	margin-top: 1rem;
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
	display: flex;
	justify-content: space-between;
	font-size: 14px;
}

.change:nth-child(even) {
	background: #eceff1;
}

.term {
	color: #818da4;
}

@media all and (max-width: 768px) {
	.change {
		flex-direction: column;
	}
}
</style>
