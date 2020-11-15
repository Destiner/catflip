<template>
	<div>
		<h1>Accounts</h1>
		<div id="accounts-wrapper">
			<div id="accounts">
				<div
					v-for="account in accounts"
					:key="account.address"
					class="account"
				>
					<div class="account-meta">
						<div
							v-if="account.name"
							class="account-name"
						>
							{{ account.name }}
						</div>
						<div class="account-address">
							{{ formatAddress(account.address) }}
						</div>
						<EtherscanIcon
							class="account-link"
							:link="getEtherscanLink(account.address)"
						/>
					</div>
					<div class="account-votes">
						{{ formatCompAmount(account.votes) }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import BigNumber from 'bignumber.js';
import { Ref, ComputedRef, defineComponent, ref, computed, onMounted } from 'vue';

import Converter from '@/utils/converter';
import Formatter from '@/utils/formatter';
import accountMeta from '@/accounts.json';

import EtherscanIcon from '@/components/EtherscanIcon.vue';

interface SubgraphRow {
	id: string;
	delegatedVotesRaw: string;
}

interface SubgraphResponse {
	delegates: SubgraphRow[];
}

interface SubgraphAccount {
	address: string;
	votes: BigNumber;
}

interface Account {
	address: string;
	name: string;
	votes: BigNumber;
}

export default defineComponent({
	components: {
		EtherscanIcon,
	},
	setup() {
		const delegates: Ref<SubgraphAccount[]> = ref([]);

		const accounts: ComputedRef<Account[]> = computed(() => {
			return delegates.value.map(delegate => {
				const meta = accountMeta[delegate.address];
				const name = meta ? meta.name : '';
				return {
					address: delegate.address,
					name,
					votes: delegate.votes,
				};
			});
		});

		onMounted(async () => {
			delegates.value = await fetchDelegates();
		});

		function formatCompAmount(value: BigNumber) {
			return Formatter.formatMultiplier(Converter.fromWad(value.toString()), 0);
		}

		function formatAddress(address: string) {
			return Formatter.formatAddress(address, 8);
		}

		function getEtherscanLink(txHash: string) {
			return `https://etherscan.io/address/${txHash}`;
		}

		async function fetchDelegates() {
			const COUNT = 100;
			const query = `
				{
					delegates(
						first: ${COUNT},
						orderBy: delegatedVotesRaw,
						orderDirection: desc,
					) {
						id
						delegatedVotesRaw
					}
				}
			`;
			const url = 'https://api.thegraph.com/subgraphs/name/protofire/compound-governance';
			const opts = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query }),
			};
			const response = await fetch(url, opts);
			const json = await response.json();
			const data = json.data as SubgraphResponse;
			const delegates = data.delegates.map(row => {
				return {
					address: row.id,
					votes: new BigNumber(row.delegatedVotesRaw),
				};
			});
			return delegates;
		}

		return {
			accounts,

			formatCompAmount,
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

	#accounts-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 1rem 0;
	}

	#accounts {
		width: 80%;
		border: 1px solid #dedede;
		background: white;
		margin-top: 1rem;
	}

	.account {
		padding: 0.5rem;
		display: flex;
		justify-content: space-between;
	}

	.account:nth-child(2n) {
		background: #eceff1;
	}

	.account-meta {
		display: flex;
	}

	.account-name {
		margin-right: 8px;
	}

	.account-address {
		color: #818da4;
	}

	.account-link {
		margin-left: 4px;
	}
</style>
