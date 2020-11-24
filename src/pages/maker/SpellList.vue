<template>
	<div>
		<h1>Spells (changelog)</h1>
		<div class="spell-wrapper">
			<LoadingIndicator v-if="spells.length === 0" />
			<div
				v-for="spell in spells"
				v-else
				:key="spell.address"
				class="spell"
			>
				<div class="spell-header">
					<div class="spell-header-primary">
						<div class="spell-metadata">
							<div class="spell-status">
								{{ formatStatus(spell.status) }}
							</div>
							<div class="spell-title">
								{{ spell.title }}
							</div>
						</div>
						<div class="spell-address">
							{{ formatAddress(spell.address) }}
							<ExternalLink
								v-if="spell.address"
								:link="getEtherscanLink(spell.address)"
							/>
						</div>
					</div>
					<div class="spell-header-secondary">
						Created at {{ formatTimestamp(spell.created) }}
						<span v-if="spell.casted">
							, casted at {{ formatTimestamp(spell.casted) }}
						</span>
					</div>
				</div>
				<div
					v-if="spell.changes.length > 0"
					class="changes"
				>
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
import { Ref, ComputedRef, ref, computed, onMounted, defineComponent } from 'vue';
import { useQuery, useResult } from '@vue/apollo-composable';

import { Maker } from '@/queries';
import Converter from '@/utils/converter';
import Formatter from '@/utils/formatter';
import { Status, SpellMetadata, SubgraphSpellsResponse, SubgraphSpell, formatStatus } from '@/utils/spell';

import ExternalLink from '@/components/ExternalLink.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';

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
	'SAI',
];

interface ChangesResponse {
	changes: Change[];
}

interface Change {
	id: string;
	param: string;
	value: string;
	timestamp: number;
	txHash: string;
}

interface Spell {
	status: Status;
	address: string;
	title: string;
	created: string;
	casted: string | null;
	changes: SpellChange[];
}

interface SpellChange {
	id: string;
	param: string;
	term: string;
	oldValue: string | null;
	newValue: string;
}

export default defineComponent({
	components: {
		ExternalLink,
		LoadingIndicator,
	},
	setup() {
		const spellMetadata: Ref<SpellMetadata[]> = ref([]);

		onMounted(async () => {
			spellMetadata.value = await _fetchSpellMetadata();
		});

		const { result: subgraphSpellsResponse } = useQuery<SubgraphSpellsResponse>(Maker.GET_SPELLS, {}, {
			clientId: 'MakerGovernance',
		});

		const subgraphSpells = useResult(subgraphSpellsResponse, [] as SubgraphSpell[], data => data.spells);

		const { result: changesResponse } = useQuery<ChangesResponse>(Maker.GET_CHANGES, {}, {
			clientId: 'Maker',
		});

		const changes = useResult(changesResponse, [] as Change[], data => data.changes);

		const spells: ComputedRef<Spell[]> = computed(() => {
			if (changes.value.length === 0 ||
				subgraphSpells.value.length === 0 ||
				spellMetadata.value.length === 0) {
				return [];
			}

			const values = {};
			const spellMap: Record<number, SpellChange[]> = {};
			for (let change of changes.value) {
				const { id, timestamp, param, value } = change;
				if (!(timestamp in spellMap)) {
					spellMap[timestamp] = [];
				}
				const oldValue = _getValue(param, values[param]);
				const newValue = _getValue(param, value);
				if (oldValue == newValue) {
					continue;
				}
				spellMap[timestamp].push({
					id,
					param: _getParamName(param),
					term: _getTermName(param),
					oldValue,
					newValue,
				});
				values[param] = value;
			}
			const metadataMap: Record<string, SpellMetadata> = {};
			for (const metadata of spellMetadata.value) {
				const address = metadata.source.toLowerCase();
				metadataMap[address] = metadata;
			}

			const latestSpell = subgraphSpells.value[0];
			const latestPassedSpell = subgraphSpells.value.filter(spell => spell.casted)[0];
			const spells = subgraphSpells.value.map(subgraphSpell => {
				const { id: address, timestamp: created, lifted, casted } = subgraphSpell;
				const status = _getSpellStatus(address, latestSpell, latestPassedSpell, lifted);
				const title = metadataMap[address]
					? metadataMap[address].title
					: 'Spell';
				const changes = spellMap[casted || ''] || [];
				return {
					status,
					address,
					title,
					created,
					casted,
					changes,
				};
			});
			return spells;
		});

		function formatTimestamp(timestampString: string) {
			const timestamp = parseInt(timestampString);
			const date = new Date(timestamp * 1000);
			const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
			return date.toLocaleString('en-US', options);
		}

		function formatAddress(address: string) {
			return Formatter.formatAddress(address);
		}

		function getEtherscanLink(txHash: string) {
			return `https://etherscan.io/address/${txHash}`;
		}

		function _getSpellStatus(address: string, latestSpell: SubgraphSpell, latestPassedSpell: SubgraphSpell, lifted: string | null) {
			if (address === latestPassedSpell.id) {
				return Status.Hat;
			} else if (lifted) {
				return Status.Passed;
			} else if (address === latestSpell.id) {
				return Status.Pending;
			} else {
				return Status.Skipped;
			}
		}

		async function _fetchSpellMetadata() {
			const metadataUrl = 'https://cms-gov.makerfoundation.com/content/all-spells?network=mainnet';
			const response = await fetch(metadataUrl);
			const json = await response.json();
			return json as SpellMetadata[];
		}

		function _getParamName(param: string) {
			const paramMap: Record<string, string> = {
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
			return paramMap[param];
		}

		function _getTermName(param: string) {
			const termMap: Record<string, string> = {
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
			return termMap[param];
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

		function _formatFee(value: string) {
			return Formatter.formatFee(Converter.fromRay(value));
		}

		function _formatDuration(value: number) {
			return Formatter.formatDuration(value);
		}

		return {
			changes,
			spells,

			formatStatus,
			formatTimestamp,
			formatAddress,
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

.spell-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 1rem 0;
}

.spell {
	width: 80%;
	border: 1px solid var(--color-border);
	background: var(--color-background-card);
	margin-top: 1rem;
}

.spell-header {
	padding: 8px;
	border-bottom: 1px solid var(--color-card-row);
}

.spell-header-primary {
	display: flex;
	justify-content: space-between;
}

.spell-metadata {
	display: flex;
	align-items: center;
}

.spell-status {
	padding: 2px 4px;
	color: var(--color-text-secondary);
	font-size: 14px;
	border: 1px solid var(--color-text-secondary);
}

.spell-title {
	margin-left: 8px;
}

.spell-address {
	display: flex;
	align-items: center;
}

.spell-address > a {
	margin-left: 4px;
}

.spell-header-secondary {
	margin-top: 4px;
	font-size: 14px;
	color: var(--color-text-secondary);
}

.change {
	padding: 0.5rem;
	display: flex;
	justify-content: space-between;
	font-size: 14px;
}

.change:nth-child(even) {
	background: var(--color-card-row);
}

.term {
	color: var(--color-text-secondary);
}

@media all and (max-width: 768px) {
	.change {
		flex-direction: column;
	}
}
</style>
