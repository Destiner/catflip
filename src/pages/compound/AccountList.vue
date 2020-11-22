<template>
	<div>
		<h1>Accounts</h1>
		<div class="accounts-wrapper">
			<LoadingIndicator v-if="loading" />
			<div
				v-else
				class="accounts"
			>
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
						<ExternalLink
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
import gql from 'graphql-tag';
import { defineComponent } from 'vue';
import { useQuery, useResult } from '@vue/apollo-composable';

import Converter from '@/utils/converter';
import Formatter from '@/utils/formatter';
import accountMeta from '@/accounts.json';

import ExternalLink from '@/components/ExternalLink.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';

interface SubgraphRow {
	id: string;
	delegatedVotesRaw: string;
}

interface SubgraphResponse {
	delegates: SubgraphRow[];
}

export default defineComponent({
	components: {
		ExternalLink,
		LoadingIndicator,
	},
	setup() {
		const { result: delegates, loading } = useQuery<SubgraphResponse>(gql`
			query getDelegates {
				delegates(
					first: 100,
					orderBy: delegatedVotesRaw,
					orderDirection: desc,
				) {
					id
					delegatedVotesRaw
				}
			}
		`, {}, {
			clientId: 'compoundGovernance',
		});

		const accounts = useResult(delegates, [], (data) => data.delegates.map(delegate => {
			const meta = accountMeta[delegate.id];
			const name = meta ? meta.name : '';
			return {
				address: delegate.id,
				name,
				votes: new BigNumber(delegate.delegatedVotesRaw),
			};
		}));

		function formatCompAmount(value: BigNumber) {
			return Formatter.formatMultiplier(Converter.fromWad(value.toString()), 0);
		}

		function formatAddress(address: string) {
			return Formatter.formatAddress(address, 8);
		}

		function getEtherscanLink(txHash: string) {
			return `https://etherscan.io/address/${txHash}`;
		}

		return {
			loading,
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

.accounts-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 1rem 0;
}

.accounts {
	width: 80%;
	border: 1px solid var(--color-border);
	background: var(--color-background-card);
	margin-top: 1rem;
}

.account {
	padding: 0.5rem;
	display: flex;
	justify-content: space-between;
}

.account:nth-child(2n) {
	background: var(--color-card-row);
}

.account-meta {
	display: flex;
}

.account-name {
	margin-right: 8px;
}

.account-address {
	color: var(--color-text-secondary);
}

.account-link {
	margin-left: 4px;
}
</style>
