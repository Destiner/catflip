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
import Converter from '../utils/converter.js';
import Formatter from '../utils/formatter.js';

import EtherscanIcon from '../components/EtherscanIcon.vue';

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
				'Vat-BAT-A-dust': 'Min DAI in BAT Vault',
				'Vat-BAT-A-line': 'BAT Ceiling',
				'Vat-ETH-A-dust': 'Min DAI in ETH Vault',
				'Vat-ETH-A-line': 'ETH Ceiling',
				'Vat-WBTC-A-dust': 'Min DAI in WBTC Vault',
				'Vat-WBTC-A-line': 'WBTC Ceiling',
				'Vat-USDC-A-dust': 'Min DAI in USDC-A Vault',
				'Vat-USDC-A-line': 'USDC-A Ceiling',
				'Vat-USDC-B-dust': 'Min DAI in USDC-B Vault',
				'Vat-USDC-B-line': 'USDC-B Ceiling',
				'Vat-TUSD-A-dust': 'Min DAI in TUSD Vault',
				'Vat-TUSD-A-line': 'TUSD Ceiling',
				'Vat-SAI-dust': 'Min DAI in SAI Vault',
				'Vat-SAI-line': 'SAI Ceiling',
				'Spot-BAT-A-mat': 'BAT col. ratio',
				'Spot-ETH-A-mat': 'ETH col. ratio',
				'Spot-WBTC-A-mat': 'WBTC col. ratio',
				'Spot-USDC-A-mat': 'USDC-A col. ratio',
				'Spot-USDC-B-mat': 'USDC-B col. ratio',
				'Spot-TUSD-A-mat': 'TUSD col. ratio',
				'Spot-SAI-mat': 'SAI col. ratio',
				'Jug-base': 'Base stability fee',
				'Jug-BAT-A-duty': 'BAT stability fee',
				'Jug-ETH-A-duty': 'ETH stability fee',
				'Jug-WBTC-A-duty': 'WBTC stability fee',
				'Jug-USDC-A-duty': 'USDC-A stability fee',
				'Jug-USDC-B-duty': 'USDC-B stability fee',
				'Jug-TUSD-A-duty': 'TUSD stability fee',
				'Jug-SAI-duty': 'SAI stability fee',
				'Pot-dsr': 'Savings rate',
				'Cat-BAT-A-chop': 'BAT liquidation penalty',
				'Cat-BAT-A-lump': 'BAT liquidation lot size',
				'Cat-ETH-A-chop': 'ETH liquidation penalty',
				'Cat-ETH-A-lump': 'ETH liquidation lot size',
				'Cat-WBTC-A-chop': 'WBTC liquidation penalty',
				'Cat-WBTC-A-lump': 'WBTC liquidation lot size',
				'Cat-USDC-A-chop': 'USDC-A liquidation penalty',
				'Cat-USDC-A-lump': 'USDC-A liquidation lot size',
				'Cat-USDC-B-chop': 'USDC-B liquidation penalty',
				'Cat-USDC-B-lump': 'USDC-B liquidation lot size',
				'Cat-TUSD-A-chop': 'TUSD liquidation penalty',
				'Cat-TUSD-A-lump': 'TUSD liquidation lot size',
				'Cat-SAI-chop': 'SAI liquidation penalty',
				'Cat-SAI-lump': 'SAI liquidation lot size',
				'Flip-BAT-A-beg': 'BAT auction min. bid increase',
				'Flip-BAT-A-tau': 'BAT auction duration',
				'Flip-BAT-A-ttl': 'BAT auction bid duration',
				'Flip-ETH-A-beg': 'ETH auction min. bid increase',
				'Flip-ETH-A-tau': 'ETH auction duration',
				'Flip-ETH-A-ttl': 'ETH auction bid duration',
				'Flip-WBTC-A-beg': 'WBTC auction min. bid increase',
				'Flip-WBTC-A-tau': 'WBTC auction duration',
				'Flip-WBTC-A-ttl': 'WBTC auction bid duration',
				'Flip-USDC-A-beg': 'USDC-A auction min. bid increase',
				'Flip-USDC-A-tau': 'USDC-A auction duration',
				'Flip-USDC-A-ttl': 'USDC-A auction bid duration',
				'Flip-USDC-B-beg': 'USDC-B auction min. bid increase',
				'Flip-USDC-B-tau': 'USDC-B auction duration',
				'Flip-USDC-B-ttl': 'USDC-B auction bid duration',
				'Flip-TUSD-A-beg': 'TUSD auction min. bid increase',
				'Flip-TUSD-A-tau': 'TUSD auction duration',
				'Flip-TUSD-A-ttl': 'TUSD auction bid duration',
				'Flip-SAI-beg': 'SAI auction min. bid increase',
				'Flip-SAI-tau': 'SAI auction duration',
				'Flip-SAI-ttl': 'SAI auction bid duration',
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
				'Vat-WBTC-A-dust': 'Vat[WBTC-A]_dust',
				'Vat-WBTC-A-line': 'Vat[WBTC-A]_line',
				'Vat-USDC-A-dust': 'Vat[USDC-A]_dust',
				'Vat-USDC-A-line': 'Vat[USDC-A]_line',
				'Vat-USDC-B-dust': 'Vat[USDC-B]_dust',
				'Vat-USDC-B-line': 'Vat[USDC-B]_line',
				'Vat-TUSD-A-dust': 'Vat[TUSD-A]_dust',
				'Vat-TUSD-A-line': 'Vat[TUSD-A]_line',
				'Vat-SAI-dust': 'Vat[SAI]_dust',
				'Vat-SAI-line': 'Vat[SAI]_line',
				'Spot-BAT-A-mat': 'Spot[BAT-A]_mat',
				'Spot-ETH-A-mat': 'Spot[ETH-A]_mat',
				'Spot-WBTC-A-mat': 'Spot[WBTC-A]_mat',
				'Spot-USDC-A-mat': 'Spot[USDC-A]_mat',
				'Spot-USDC-B-mat': 'Spot[USDC-B]_mat',
				'Spot-TUSD-A-mat': 'Spot[TUSD-A]_mat',
				'Spot-SAI-mat': 'Spot[SAI]_mat',
				'Jug-base': 'Jug_base',
				'Jug-BAT-A-duty': 'Jug[BAT-A]_duty',
				'Jug-ETH-A-duty': 'Jug[ETH-A]_duty',
				'Jug-WBTC-A-duty': 'Jug[WBTC-A]_duty',
				'Jug-USDC-A-duty': 'Jug[USDC-A]_duty',
				'Jug-USDC-B-duty': 'Jug[USDC-B]_duty',
				'Jug-TUSD-A-duty': 'Jug[TUSD-A]_duty',
				'Jug-SAI-duty': 'Jug[SAI]_duty',
				'Pot-dsr': 'Pot_dsr',
				'Cat-BAT-A-chop': 'Cat[BAT-A]_chop',
				'Cat-BAT-A-lump': 'Cat[BAT-A]_lump',
				'Cat-ETH-A-chop': 'Cat[ETH-A]_chop',
				'Cat-ETH-A-lump': 'Cat[ETH-A]_lump',
				'Cat-WBTC-A-chop': 'Cat[WBTC-A]_chop',
				'Cat-WBTC-A-lump': 'Cat[WBTC-A]_lump',
				'Cat-USDC-A-chop': 'Cat[USDC-A]_chop',
				'Cat-USDC-A-lump': 'Cat[USDC-A]_lump',
				'Cat-USDC-B-chop': 'Cat[USDC-B]_chop',
				'Cat-USDC-B-lump': 'Cat[USDC-B]_lump',
				'Cat-TUSD-A-chop': 'Cat[TUSD-A]_chop',
				'Cat-TUSD-A-lump': 'Cat[TUSD-A]_lump',
				'Cat-SAI-chop': 'Cat[SAI]_chop',
				'Cat-SAI-lump': 'Cat[SAI]_lump',
				'Flip-BAT-A-beg': 'Flip[BAT-A]_beg',
				'Flip-BAT-A-tau': 'Flip[BAT-A]_tau',
				'Flip-BAT-A-ttl': 'Flip[BAT-A]_ttl',
				'Flip-ETH-A-beg': 'Flip[ETH-A]_beg',
				'Flip-ETH-A-tau': 'Flip[ETH-A]_tau',
				'Flip-ETH-A-ttl': 'Flip[ETH-A]_ttl',
				'Flip-WBTC-A-beg': 'Flip[WBTC-A]_beg',
				'Flip-WBTC-A-tau': 'Flip[WBTC-A]_tau',
				'Flip-WBTC-A-ttl': 'Flip[WBTC-A]_ttl',
				'Flip-USDC-A-beg': 'Flip[USDC-A]_beg',
				'Flip-USDC-A-tau': 'Flip[USDC-A]_tau',
				'Flip-USDC-A-ttl': 'Flip[USDC-A]_ttl',
				'Flip-USDC-B-beg': 'Flip[USDC-B]_beg',
				'Flip-USDC-B-tau': 'Flip[USDC-B]_tau',
				'Flip-USDC-B-ttl': 'Flip[USDC-B]_ttl',
				'Flip-TUSD-A-beg': 'Flip[TUSD-A]_beg',
				'Flip-TUSD-A-tau': 'Flip[TUSD-A]_tau',
				'Flip-TUSD-A-ttl': 'Flip[TUSD-A]_ttl',
				'Flip-SAI-beg': 'Flip[SAI]_beg',
				'Flip-SAI-tau': 'Flip[SAI]_tau',
				'Flip-SAI-ttl': 'Flip[SAI]_ttl',
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
				'Vat-WBTC-A-dust': this._formatDaiAmount,
				'Vat-WBTC-A-line': this._formatDaiAmount,
				'Vat-USDC-A-dust': this._formatDaiAmount,
				'Vat-USDC-A-line': this._formatDaiAmount,
				'Vat-USDC-B-dust': this._formatDaiAmount,
				'Vat-USDC-B-line': this._formatDaiAmount,
				'Vat-TUSD-A-dust': this._formatDaiAmount,
				'Vat-TUSD-A-line': this._formatDaiAmount,
				'Vat-SAI-dust': this._formatDaiAmount,
				'Vat-SAI-line': this._formatDaiAmount,
				'Spot-BAT-A-mat': this._formatRatio,
				'Spot-ETH-A-mat': this._formatRatio,
				'Spot-WBTC-A-mat': this._formatRatio,
				'Spot-USDC-A-mat': this._formatRatio,
				'Spot-USDC-B-mat': this._formatRatio,
				'Spot-TUSD-A-mat': this._formatRatio,
				'Spot-SAI-mat': this._formatRatio,
				'Jug-base': this._formatWadRate,
				'Jug-BAT-A-duty': this._formatFee,
				'Jug-ETH-A-duty': this._formatFee,
				'Jug-WBTC-A-duty': this._formatFee,
				'Jug-USDC-A-duty': this._formatFee,
				'Jug-USDC-B-duty': this._formatFee,
				'Jug-TUSD-A-duty': this._formatFee,
				'Jug-SAI-duty': this._formatFee,
				'Pot-dsr': this._formatFee,
				'Cat-BAT-A-chop': this._formatRayRate,
				'Cat-BAT-A-lump': this._formatAmount,
				'Cat-ETH-A-chop': this._formatRayRate,
				'Cat-ETH-A-lump': this._formatAmount,
				'Cat-WBTC-A-chop': this._formatRayRate,
				'Cat-WBTC-A-lump': this._formatAmount,
				'Cat-USDC-A-chop': this._formatRayRate,
				'Cat-USDC-A-lump': this._formatAmount,
				'Cat-USDC-B-chop': this._formatRayRate,
				'Cat-USDC-B-lump': this._formatAmount,
				'Cat-TUSD-A-chop': this._formatRayRate,
				'Cat-TUSD-A-lump': this._formatAmount,
				'Cat-SAI-chop': this._formatRayRate,
				'Cat-SAI-lump': this._formatAmount,
				'Flip-BAT-A-beg': this._formatWadRate,
				'Flip-BAT-A-tau': this._formatDuration,
				'Flip-BAT-A-ttl': this._formatDuration,
				'Flip-ETH-A-beg': this._formatWadRate,
				'Flip-ETH-A-tau': this._formatDuration,
				'Flip-ETH-A-ttl': this._formatDuration,
				'Flip-WBTC-A-beg': this._formatWadRate,
				'Flip-WBTC-A-tau': this._formatDuration,
				'Flip-WBTC-A-ttl': this._formatDuration,
				'Flip-USDC-A-beg': this._formatWadRate,
				'Flip-USDC-A-tau': this._formatDuration,
				'Flip-USDC-A-ttl': this._formatDuration,
				'Flip-USDC-B-beg': this._formatWadRate,
				'Flip-USDC-B-tau': this._formatDuration,
				'Flip-USDC-B-ttl': this._formatDuration,
				'Flip-TUSD-A-beg': this._formatWadRate,
				'Flip-TUSD-A-tau': this._formatDuration,
				'Flip-TUSD-A-ttl': this._formatDuration,
				'Flip-SAI-beg': this._formatWadRate,
				'Flip-SAI-tau': this._formatDuration,
				'Flip-SAI-ttl': this._formatDuration,
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
