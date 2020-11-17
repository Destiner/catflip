<template>
	<div>
		<h1>Voters</h1>
		<div id="voters-wrapper">
			<div id="voters">
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
import { Ref, defineComponent, ref, onMounted } from 'vue';
import BigNumber from 'bignumber.js';

import Formatter from '@/utils/formatter';
import accountMeta from '@/accounts.json';

import ExternalLink from '@/components/ExternalLink.vue';

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
	},
	setup() {
		const voters: Ref<Voter[]> = ref([]);

		onMounted(async () => {
			const proxiesAndVoters = await _loadProxiesAndVoters();
			voters.value = _mergeProxiesAndVoters(proxiesAndVoters);
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

		async function _loadProxiesAndVoters() {
			const query = `
				{
					voteProxies(
						first: 100,
						orderBy: locked,
						orderDirection: desc,
					) {
						id
						locked
					}
					addressVoters(
						first: 100,
						orderBy: locked,
						orderDirection: desc,
					) {
						id
						locked
					}
				}
			`;
			const url = 'https://api.thegraph.com/subgraphs/name/protofire/makerdao-governance';
			const opts = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query }),
			};
			const response = await fetch(url, opts);
			const json = await response.json();
			return json.data as ProxyVoterData;
		}

		function _mergeProxiesAndVoters(proxyVoterData: ProxyVoterData) {
			const { voteProxies, addressVoters } = proxyVoterData;
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

#voters-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 1rem 0;
}

#voters {
	width: 80%;
	border: 1px solid #dedede;
	background: white;
	margin-top: 1rem;
}

.voter {
	padding: 0.5rem;
	display: flex;
	justify-content: space-between;
}

.voter:nth-child(2n) {
	background: #eceff1;
}

.voter-meta {
	display: flex;
}

.voter-name {
	margin-right: 8px;
}

.voter-address {
	color: #818da4;
}

.voter-link {
	margin-left: 4px;
}
</style>
