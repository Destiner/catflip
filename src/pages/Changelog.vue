<template>
	<div>
		<h1>MakerDAO params changelog</h1>
		<div
			v-for="change in changes"
			class="change"
		>
			<div class="date">
				{{ formatTimestamp(change.timestamp) }}
			</div>
			<div class="param">
				{{ change.param }}
			</div>
			<div class="term">
				{{ change.term }}
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
</template>

<script>
import BigNumber from 'bignumber.js';

const TEN = new BigNumber(10);
const WAD = TEN.pow(18);
const RAY = TEN.pow(27);

export default {
	data() {
		return {
			rawChanges: [],
		};
	},
	mounted() {
		this._loadChanges();
	},
	computed: {
		changes() {
			const changes = [];
			const values = {};
			for (let rawChange of this.rawChanges) {
				const { id, timestamp, param, value } = rawChange;
				const change = {
					id,
					timestamp,
					param: this._getParamName(param),
					term: this._getTermName(param),
					oldValue: this._getValue(param, values[param]),
					newValue: this._getValue(param, value),
				};
				values[param] = value;
				changes.push(change);
			}
			changes.reverse();
			return changes;
		},
	},
	methods: {
		formatTimestamp(timestamp) {
			const date = new Date(timestamp * 1000);
			return date.toLocaleString('en-US');
		},
		async _loadChanges() {
			const url = 'https://api.thegraph.com/subgraphs/name/destiner/maker';
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
					}
				}`;
			const opts = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query }),
			};
			const response = await fetch(url, opts);
			const json = await response.json();
			this.rawChanges = json.data.changes;
		},
		_getParamName(param) {
			const paramMap = {
				'Vat-Line': 'Ceiling',
				'Vat-BAT-A-dust': 'BAT ',
				'Vat-BAT-A-line': 'BAT Ceiling',
				'Vat-ETH-A-dust': 'Min DAI in ETH Vault',
				'Vat-ETH-A-line': 'ETH Ceiling',
				'Vat-SAI-line': 'SAI Ceiling',
				'Jug-base': 'Base stability fee',
				'Jug-BAT-A-duty': 'BAT stability fee',
				'Jug-ETH-A-duty': 'ETH stability fee',
				'Jug-SAI-duty': 'SAI stability fee',
				'Pot-dsr': 'Savings rate',
				'Flap-beg': 'Surplus auction min bid increase',
				'Flap-tau': 'Surplus auction duration',
				'Flap-ttl': 'Surplus auction bid duration',
				'Flop-beg': 'Debt auction min bid increase',
				'Flop-tau': 'Debt auction duration',
				'Flop-ttl': 'Debt auction bid duration',
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
				'Vat-SAI-line': 'Vat[SAI]_line',
				'Jug-base': 'Jug_base',
				'Jug-BAT-A-duty': 'Jug[BAT-A]_duty',
				'Jug-ETH-A-duty': 'Jug[ETH-A]_duty',
				'Jug-SAI-duty': 'Jug[SAI]_duty',
				'Pot-dsr': 'Pot_dsr',
				'Flap-beg': 'Flap_beg',
				'Flap-tau': 'Flap_tau',
				'Flap-ttl': 'Flap_ttl',
				'Flop-beg': 'Flop_beg',
				'Flop-tau': 'Flop_tau',
				'Flop-ttl': 'Flop_ttl',

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
				'Vat-SAI-line': this._formatDaiAmount,
				'Jug-base': this._formatFee,
				'Jug-BAT-A-duty': this._formatFee,
				'Jug-ETH-A-duty': this._formatFee,
				'Jug-SAI-duty': this._formatFee,
				'Pot-dsr': this._formatFee,
				'Flap-beg': this._formatRate,
				'Flap-tau': this._formatDuration,
				'Flap-ttl': this._formatDuration,
				'Flop-beg': this._formatRate,
				'Flop-tau': this._formatDuration,
				'Flop-ttl': this._formatDuration,
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
		_formatRate(rawRate) {
			const rawRateNumber = new BigNumber(rawRate);
			const rate = rawRateNumber.div(WAD).toNumber();
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
.change {
	display: flex;
}

.date {
	width: 200px;
}

.param {
	width: 250px;
}

.term {
	width: 150px;
}

.value {
	width: 300px;
}

</style>
