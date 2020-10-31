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

<script lang="ts">
import { ref, computed, onMounted, defineComponent } from 'vue';

import Converter from '@/utils/converter';
import Formatter from '@/utils/formatter';

import EtherscanIcon from '@/components/EtherscanIcon.vue';

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
	'SAI',
];

export default defineComponent({
	components: {
		EtherscanIcon,
	},
	setup() {
		const changes = ref([]);

		onMounted(() => {
			_loadChanges();
		});

		const spells = computed(() => {
			const values = {};
			const timestamps = {};
			const spellMap = {};
			for (let change of changes.value) {
				const { id, timestamp, param, value, txHash } = change;
				timestamps[txHash] = timestamp;
				if (!(txHash in spellMap)) {
					// @ts-ignore
					spellMap[txHash] = [];
				}
				const oldValue = _getValue(param, values[param]);
				const newValue = _getValue(param, value);
				if (oldValue == newValue) {
					continue;
				}
				// @ts-ignore
				spellMap[txHash].push({
					id,
					timestamp,
					param: _getParamName(param),
					term: _getTermName(param),
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
		});

		function formatTimestamp(timestamp: number) {
			const date = new Date(timestamp * 1000);
			const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
			return date.toLocaleString('en-US', options);
		}

		function formatHash(hash: string) {
			return `tx ${hash.substr(0, 6)}…${hash.substr(66 - 6)}`;
		}

		function getEtherscanLink(txHash: string) {
			return `https://etherscan.io/tx/${txHash}`;
		}

		async function _loadChanges() {
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
			changes.value = json.data.changes;
		}

		function _getParamName(param: string) {
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
		}

		function _getTermName(param: string) {
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
		}

		function _getValue(param: string, value: string) {
			if (!value) {
				return;
			}
			const formatFuncMap = {
				'Vat-Line': _formatDaiAmount,
				'Jug-base': _formatWadRate,
				'Pot-dsr': _formatFee,
				'Cat-box': _formatDaiAmount,
				'Flap-beg': _formatWadRate,
				'Flap-tau': _formatDuration,
				'Flap-ttl': _formatDuration,
				'Flop-beg': _formatWadRate,
				'Flop-tau': _formatDuration,
				'Flop-ttl': _formatDuration,
				'Flop-pad': _formatWadRate,
				'Vow-hump': _formatDaiAmount,
				'Vow-bump': _formatDaiAmount,
				'Vow-sump': _formatDaiAmount,
				'Vow-dump': _formatAmount,
				'Vow-wait': _formatDuration,
				'Pause-delay': _formatDuration,
			};
			for (const ilk of ilkIds) {
				formatFuncMap[`Vat-${ilk}-dust`] = _formatDaiAmount;
				formatFuncMap[`Vat-${ilk}-line`] = _formatDaiAmount;
				formatFuncMap[`Spot-${ilk}-mat`] = _formatRatio;
				formatFuncMap[`Jug-${ilk}-duty`] = _formatFee;
				formatFuncMap[`Cat-${ilk}-chop`] = _formatWadRate;
				formatFuncMap[`Cat-${ilk}-dunk`] = _formatDaiAmount;
				formatFuncMap[`Cat-${ilk}-lump`] = _formatAmount;
				formatFuncMap[`Flip-${ilk}-beg`] = _formatWadRate;
				formatFuncMap[`Flip-${ilk}-tau`] = _formatDuration;
				formatFuncMap[`Flip-${ilk}-ttl`] = _formatDuration;
			}
			const formatFunc = formatFuncMap[param] || _noFormat;
			return formatFunc(value);
		}

		function _noFormat(value: string) {
			return value;
		}

		function _formatAmount(value: string) {
			return Formatter.formatAmount(Converter.fromWad(value));
		}

		function _formatDaiAmount(value: string) {
			// @ts-ignore
			return `${ Formatter.formatAmount(Converter.fromWad(Converter.fromRay(value))) } DAI`;
		}

		function _formatRatio(value: string) {
			return Formatter.formatRatio(Converter.fromRay(value));
		}

		function _formatWadRate(value: string) {
			return Formatter.formatRate(Converter.fromWad(value));
		}

		function _formatRayRate(value: string) {
			return Formatter.formatRate(Converter.fromRay(value));
		}

		function _formatFee(value: string) {
			return Formatter.formatFee(Converter.fromRay(value));
		}

		function _formatDuration(value: number) {
			return Formatter.formatDuration(value);
		}

		return {
			changes,
			spells,

			formatTimestamp,
			formatHash,
			getEtherscanLink,
		}
	},
});
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
