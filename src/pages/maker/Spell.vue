<template>
	<div class="spell">
		<div class="spell-header">
			<h1 v-if="spell">
				{{ spell.title }}
			</h1>
		</div>
		<div class="spell-meta">
			<h2>Details</h2>
			<div
				v-if="address"
				class="spell-meta-item"
			>
				<span class="spell-meta-header">
					Address: 
				</span>
				{{ address }}
			</div>
			<div
				v-if="votes"
				class="spell-meta-item"
			>
				<span class="spell-meta-header">
					Support: 
				</span>
				{{ formatVotes(votes.current) }} (current)
				<span v-if="votes.lifted">/ {{ formatVotes(votes.lifted) }} (lifted)</span>
			</div>
		</div>
		<div class="spell-timeline">
			<h2>Timeline</h2>
			<div
				v-for="event in timeline"
				:key="event.hash"
				class="event"
			>
				<div class="event-timestamp">
					{{ formatTimestamp(event.timestamp) }}
				</div>
				<div class="event-action">
					{{ formatType(event.type, event.amount) }}
				</div>
				<div class="event-transaction">
					<ExternalLink :link="getEtherscanLink(event.hash)" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { Ref, defineComponent, ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery, useResult } from '@vue/apollo-composable';

import { Maker } from '@/queries';
import { SpellMetadata, SubgraphSpellResponse } from '@/utils/spell';

import ExternalLink from '@/components/ExternalLink.vue';

enum EventType {
	Vote,
	Unvote,
	Create,
	Lift,
	Cast,
}

interface TimelineResponse {
	spell: {
		timeline: TimelineItem[];
	};
}

interface TimelineItem {
	id: string;
	locked: string;
	sender: string;
	timestamp: string;
	transactionHash: string;
}

interface Event {
	type: EventType;
	timestamp: number;
	hash: string;
	amount: number | null;
	sender: string | null;
}

export default defineComponent({
	components: {
		ExternalLink,
	},
	setup() {
		const route = useRoute();

		const spellMetadata: Ref<SpellMetadata[]> = ref([]);

		onMounted(async () => {
			spellMetadata.value = await _fetchSpellMetadata();
		});

		const address = computed(() => {
			return route.params.address as string;
		});

		const { result: subgraphSpellResponse } = useQuery<SubgraphSpellResponse>(Maker.GET_SPELL, {
			address,
		}, {
			clientId: 'MakerGovernance',
		});

		const subgraphSpell = useResult(subgraphSpellResponse, null, data => data.spell);

		const { result: subgraphTimelineResponse } = useQuery<TimelineResponse>(Maker.GET_SPELL_TIMELINE, {
			address,
		}, {
			clientId: 'MakerGovernance',
		});

		const voteTimeline = useResult(subgraphTimelineResponse, [] as TimelineItem[], data => data.spell.timeline);

		const spell = computed(() => spellMetadata.value
			.find(metadata => metadata.source.toLowerCase() === address.value),
		);

		const votes = computed(() => {
			if (!voteTimeline.value) {
				return null;
			}
			const current = voteTimeline.value.reduce((current, vote) => {
				if (vote.id.startsWith('ADD')) {
					return current + parseFloat(vote.locked);
				}
				if (vote.id.startsWith('REMOVE')) {
					return current - parseFloat(vote.locked);
				}
				return current;
			}, 0);
			if (!subgraphSpell.value) {
				return {
					current,
				};
			}
			const lifted = parseFloat(subgraphSpell.value.liftedWith || '0');
			return {
				current,
				lifted,
			};
		});

		const timeline = computed(() => {
			if (voteTimeline.value.length === 0) {
				return [];
			}
			const timeline = voteTimeline.value
				.filter(vote => {
					const { id } = vote;
					return id.startsWith('ADD') || id.startsWith('REMOVE');
				})
				.map(vote => {
					const { id, sender, transactionHash: hash } = vote;
					const timestamp = parseInt(vote.timestamp);
					const amount = parseFloat(vote.locked);
					const type = id.startsWith('ADD') ? EventType.Vote : EventType.Unvote;
					return {
						type,
						hash,
						amount,
						sender,
						timestamp,
					};
				}) as Event[];
			if (subgraphSpell.value) {
				timeline.push({
					type: EventType.Create,
					timestamp: parseInt(subgraphSpell.value.timestamp || '0'),
					hash: '',
					amount: null,
					sender: null,
				});
				timeline.push({
					type: EventType.Lift,
					timestamp: parseInt(subgraphSpell.value.lifted || '0'),
					hash: '',
					amount: null,
					sender: null,
				});
				timeline.push({
					type: EventType.Cast,
					timestamp: parseInt(subgraphSpell.value.casted || '0'),
					hash: '',
					amount: null,
					sender: null,
				});
			}
			timeline.sort((a, b) => b.timestamp - a.timestamp);
			return timeline;
		});

		function getEtherscanLink(txHash: string) {
			return `https://etherscan.io/tx/${txHash}`;
		}

		function formatType(type: EventType, amount: number) {
			if (type === EventType.Vote) {
				return `Vote: ${amount.toFixed(2)} MKR`;
			}
			if (type === EventType.Unvote) {
				return `Unvote: ${amount.toFixed(2)} MKR`;
			}
			if (type === EventType.Lift) {
				return 'Lift';
			}
			if (type === EventType.Create) {
				return 'Create';
			}
			if (type === EventType.Cast) {
				return 'Cast';
			}
			return '';
		}

		function formatVotes(votes: number) {
			return votes.toFixed(2);
		}

		function formatTimestamp(timestampString: string) {
			const timestamp = parseInt(timestampString);
			const date = new Date(timestamp * 1000);
			const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
			return date.toLocaleString('en-US', options);
		}

		async function _fetchSpellMetadata() {
			const metadataUrl = 'https://cms-gov.makerfoundation.com/content/all-spells?network=mainnet';
			const response = await fetch(metadataUrl);
			const json = await response.json();
			return json as SpellMetadata[];
		}

		return {
			spell,
			address,
			votes,
			timeline,

			getEtherscanLink,
			formatType,
			formatVotes,
			formatTimestamp,
		};
	},
});
</script>

<style scoped>
.spell {
	margin: 16px;
}

.spell-header {
	display: flex;
	align-items: center;
}

.spell-meta-header {
	font-weight: bold;
}

.event {
	display: flex;
}

.event-action {
	margin-left: 8px;
}

.event-transaction {
	margin-left: 8px;
}
</style>
