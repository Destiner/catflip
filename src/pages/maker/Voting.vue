<template>
	<div>
		<h1>Voting</h1>
		<div id="subtitle">
			Recently passed executives
		</div>
		<div
			v-if="votesLoaded"
			id="votes"
		>
			<div>Rows = voters, colums = spells (from latest to earliest), %% = voter share.</div>
			<table>
				<tr>
					<th>
						Voter
					</th>
					<th
						v-for="spell in spells"
						:key="spell.address"
						:class="{ 'hat': spell.address === hat }"
					>
						<a
							:href="getEtherscanLink(spell.address)"
							target="_blank"
						>
							{{ formatSpell(spell.address) }}
						</a>
					</th>
				</tr>
				<tr
					v-for="voter in holderData"
					:key="voter.address"
				>
					<td class="voter">
						<div>
							<a
								:href="getEtherscanLink(voter.address)"
								target="_blank"
							>
								{{ formatVoter(voter.address) }}
							</a>
						</div>
						<div>{{ formatAmount(voter.locked) }} MKR</div>
					</td>
					<td
						v-for="(voterVote, index) in votes[voter.address]"
						:key="index"
						class="number"
					>
						{{ formatVote(voterVote) }}
					</td>
				</tr>
			</table>
		</div>
		<div
			v-else
			id="votes"
		>
			Loading…
		</div>
	</div>
</template>

<script lang="ts">
import { ref, computed, onMounted, defineComponent } from 'vue';
import BigNumber from 'bignumber.js';

import Formatter from '@/utils/formatter';

export default defineComponent({
	setup() {
		onMounted(async () => {
			const proxiesAndVoters = await _loadProxiesAndVoters();
			// @ts-ignore
			holderData.value = _mergeProxiesAndVoters(proxiesAndVoters);
			spellData.value = await _loadSpells();
		});

		const holderData = ref([]);
		const spellData = ref([]);

		const spells = computed(() => {
			return spellData.value.map((data: any) => { 
				return {
					address: data.id,
					liftedWith: data.liftedWith,
				};
			});
		});

		const hat = computed(() => {
			return spells.value[0].address;
		});

		const votes = computed(() => {
			const votes = {};
			// @ts-ignore
			for (const voter of holderData.value) {
				// @ts-ignore
				const voterAddress = voter.address;
				votes[voterAddress] = {};
				// @ts-ignore
				for (const spell of spells.value) {
					const spellAddress = spell.address;
					votes[voterAddress][spellAddress] = 0;
				}
			}
			// @ts-ignore
			for (const data of spellData.value) {
				const { id, lifted, liftedWith, timeLine } = data;
				const holderData = {};
				// @ts-ignore
				for (const event of timeLine) {
					const { id: eventId, locked, wad, sender, timestamp } = event;
					const amount = locked || wad;
					const type = eventId.substr(0, eventId.indexOf('-'));
					if (timestamp > lifted) {
						// Ignore events that happened after lift
						continue;
					}
					if (!(sender in holderData)) {
						holderData[sender] = new BigNumber(0);
					}
					if (type == 'ADD' || type == 'LOCK') {
						const initialAmount = holderData[sender];
						holderData[sender] = initialAmount.plus(amount);
					}
					if (type == 'REMOVE' || type == 'FREE') {
						const initialAmount = holderData[sender];
						holderData[sender] = initialAmount.minus(amount);
					}

					for (const holder in holderData) {
						if (!(holder in votes)) {
							continue;
						}
						const amount = holderData[holder];
						const amountNumber = new BigNumber(amount);
						const shareNumber = amountNumber.div(liftedWith);
						votes[holder][id] = shareNumber.toNumber();
					}
				}
			}
			return votes;
		});

		const votesLoaded = computed(() => {
			const holders = Object.keys(votes.value);
			if (holders.length == 0) {
				return false;
			}
			const holder = holders[0];
			const holderVotes = Object.keys(votes.value[holder]);
			if (holderVotes.length == 0) {
				return false;
			}
			return true;
		});

		function formatAmount(amount: number) {
			return Formatter.formatAmount(amount);
		}

		function formatSpell(spell: string) {
			return Formatter.formatAddress(spell, 4);
		}

		function formatVoter(voter: string) {
			return Formatter.formatAddress(voter, 8);
		}

		function formatVote(vote: number) {
			if (!vote || vote == 0) {
				return '';
			}
			if (vote < 0.01) {
				return '<1%';
			}
			return Formatter.formatRatio(vote);
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
			const data = json.data;
			return data;
		}

		async function _loadSpells() {
			const query = `
				{
					spells(
						first: 20,
						orderBy: timestamp,
						orderDirection: desc,
						where: {
							lifted_not: null,
						}

					) {
						id
						casted
						castedWith
						lifted
						liftedWith
						approvals
						timeLine(first: 1000) {
							id
							sender
							timestamp
							...on AddAction {
								locked
							}
							...on RemoveAction {
								locked
							}
							...on LockAction {
								wad
							}
							...on FreeAction {
								wad
							}
						}
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
			const data = json.data.spells;
			return data;
		}

		function _mergeProxiesAndVoters(proxiesAndVoters: any) {
			const proxies = proxiesAndVoters.voteProxies;
			const voters = proxiesAndVoters.addressVoters;
			const holders = [];
			for (const proxy of proxies) {
				const holder = {
					address: proxy.id,
					locked: proxy.locked,
				};
				holders.push(holder);
			}
			for (const voter of voters) {
				const holder = {
					address: voter.id,
					locked: voter.locked,
				};
				holders.push(holder);
			}
			holders.sort((a, b) => {
				const aLocked = new BigNumber(a.locked);
				const bLocked = new BigNumber(b.locked);
				return aLocked.gt(bLocked)
					? -1
					: aLocked.lt(bLocked)
						? 1
						: 0;
			});
			const topHolders = holders.slice(0, 100);
			return topHolders;
		}

		return {
			holderData,
			spellData,
			spells,
			hat,
			votes,
			votesLoaded,

			getEtherscanLink,
			formatSpell,
			formatVoter,
			formatAmount,
			formatVote,
		};
	},
});
</script>

<style scoped>
h1 {
	text-align: center;
	margin-top: 1rem;
}

#subtitle {
	margin-top: 0.5em;
	text-align: center;
	color: #818da4;
}

#votes {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 3rem 0 1rem 0;
}

table {
	border: 1px solid #dedede;
	background: white;
	margin: 1em;
	border-collapse: collapse;
}

td,
th {
	border: 1px solid #dedede;
	padding: 0.25em;
	min-width: 2em;
}

th {
	writing-mode: tb-rl;
	color: #818da4;
	font-weight: normal;
}

th > a {
	color: #818da4;
	text-decoration: none;
}

td > div > a {
	color: #3a4359;
	text-decoration: none;
}

th:first-child {
	writing-mode: initial;
}

.voter {
	width: 210px;
	display: flex;
	justify-content: space-between;
}

.number {
	text-align: right;
}

.hat {
	font-weight: bold;
}
</style>
