<template>
	<div>
		<h1>Voters</h1>
		<div class="voters-wrapper">
			<LoadingIndicator v-if="voters.length === 0" />
			<div
				v-else
				class="voters"
			>
				<div
					v-for="voter in voters"
					:key="voter.address"
					class="voter"
				>
					<div class="voter-meta">
						<div
							v-if="voter.name"
							class="voter-name"
						>
							{{ voter.name }}
						</div>
						<div class="voter-address">
							{{ formatAddress(voter.address) }}
						</div>
						<ExternalLink
							class="voter-link"
							:link="getEtherscanLink(voter.address)"
						/>
					</div>
					<div class="voter-votes">
						{{ formatMkrAmount(voter.locked) }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import BigNumber from 'bignumber.js';
import { defineComponent } from 'vue';
import { useQuery, useResult } from '@vue/apollo-composable';

import { Maker } from '@/queries';
import Formatter from '@/utils/formatter';
import accountMeta from '@/accounts.json';

import ExternalLink from '@/components/ExternalLink.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';

interface VoterData {
	id: string;
	locked: string;
}

interface ProxyVoterData {
	voteProxies: VoterData[];
	addressVoters: VoterData[];
}

interface Voter {
	name: string;
	address: string;
	locked: BigNumber;
}

export default defineComponent({
	components: {
		ExternalLink,
		LoadingIndicator,
	},
	setup() {
		const { result: proxyVoterData } = useQuery<ProxyVoterData>(Maker.GET_PROXY_VOTER_DATA, {}, {
			clientId: 'MakerGovernance',
		});

		const voters = useResult(proxyVoterData, [] as Voter[], data => {
			const { voteProxies, addressVoters } = data;
			const voters = [];
			for (const proxy of voteProxies) {
				const meta = accountMeta[proxy.id];
				const name = meta ? meta.name : '';
				const voter = {
					address: proxy.id,
					locked: new BigNumber(proxy.locked),
					name,
				};
				voters.push(voter);
			}
			for (const addressVoter of addressVoters) {
				const meta = accountMeta[addressVoter.id];
				const name = meta ? meta.name : '';
				const voter = {
					address: addressVoter.id,
					locked: new BigNumber(addressVoter.locked),
					name,
				};
				voters.push(voter);
			}
			voters.sort((a, b) => {
				return a.locked.gt(b.locked)
					? -1
					: a.locked.lt(b.locked)
						? 1
						: 0;
			});
			const topVoters = voters.slice(0, 100);
			return topVoters;
		});

		function formatAddress(address: string) {
			return Formatter.formatAddress(address);
		}

		function formatMkrAmount(value: BigNumber) {
			return Formatter.formatMultiplier(value.toNumber(), 2);
		}

		function getEtherscanLink(address: string) {
			return `https://etherscan.io/address/${address}`;
		}

		return {
			voters,

			formatAddress,
			formatMkrAmount,
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

.voters-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 1rem 0;
}

.voters {
	width: 80%;
	border: 1px solid var(--color-border);
	background: var(--color-background-card);
	margin-top: 1rem;
}

.voter {
	padding: 0.5rem;
	display: flex;
	justify-content: space-between;
}

.voter:nth-child(2n) {
	background: var(--color-card-row);
}

.voter-meta {
	display: flex;
}

.voter-name {
	margin-right: 8px;
}

.voter-address {
	color: var(--color-text-secondary);
}

.voter-link {
	margin-left: 4px;
}
</style>
