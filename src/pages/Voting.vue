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
			<div>Rows = voters, colums = spells, %% = voter share.</div>
			<table>
				<tr>
					<th>
						Voter
					</th>
					<th
						v-for="spell in spells"
						:key="spell.address"
						:class="{ 'hat': isHat(spell.address) }"
					>
						{{ formatSpell(spell.address) }}
					</th>
				</tr>
				<tr>
					<td>
						Passed with (1000s of MKR)
					</td>
					<td
						v-for="spell in spells"
						:key="spell.address"
					>
						{{ formatLifted(spell.liftedWith) }}
					</td>
				</tr>
				<tr
					v-for="voter in holderData"
					:key="voter.address"
				>
					<td class="voter">
						<div>{{ formatVoter(voter.address) }}</div>
						<div>{{ formatAmount(voter.locked) }} MKR</div>
					</td>
					<td
						v-for="(voterVote, index) in votes[voter.address]"
						:key="index"
					>
						{{ formatVote(voterVote) }}
					</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<script>
import BigNumber from 'bignumber.js';

import Formatter from '../utils/formatter.js';

export default {
	data() {
		return {
			holderData: [],
			spellData: [],
		};
	},
	computed: {
		spells() {
			return this.spellData.map(data => { 
				return {
					address: data.id,
					liftedWith: data.liftedWith,
				};
			});
		},
		hat() {
			return this.spells[0].address;
		},
		votes() {
			const votes = {};
			for (const voter of this.holderData) {
				const voterAddress = voter.address;
				votes[voterAddress] = {};
				for (const spell of this.spells) {
					const spellAddress = spell.address;
					votes[voterAddress][spellAddress] = 0;
				}
			}
			for (const data of this.spellData) {
				const { id, lifted, liftedWith, timeLine } = data;
				const holderData = {};
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
		},
		votesLoaded() {
			const holders = Object.keys(this.votes);
			if (holders.length == 0) {
				return false;
			}
			const holder = holders[0];
			const holderVotes = Object.keys(this.votes[holder]);
			if (holderVotes.length == 0) {
				return false;
			}
			return true;
		},
	},
	async mounted() {
		const proxiesAndVoters = await this._loadProxiesAndVoters();
		this.holderData = this._mergeProxiesAndVoters(proxiesAndVoters);
		this.spellData = await this._loadSpells();
	},
	methods: {
		isHat(spell) {
			return this.hat == spell;
		},
		formatAmount(amount) {
			return Formatter.formatAmount(amount);
		},
		formatLifted(amount) {
			return Formatter.formatMultiplier(amount, 0);
		},
		formatSpell(spell) {
			return Formatter.formatAddress(spell, 4);
		},
		formatVoter(voter) {
			return Formatter.formatAddress(voter, 8);
		},
		formatVote(vote) {
			if (!vote || vote == 0) {
				return '';
			}
			if (vote < 0.01) {
				return '<1%';
			}
			return Formatter.formatRatio(vote);
		},
		async _loadProxiesAndVoters() {
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
		},
		async _loadSpells() {
			const query = `
				{
					spells(
						first: 20,
						orderBy: timestamp,
						orderDirection: desc,
						where: {
							lifted_not: null,
						},
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
		},
		_mergeProxiesAndVoters(proxiesAndVoters) {
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
		},
	},
};
</script>

<style scoped>
h1 {
	text-align: center;
	margin-top: 1rem;
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

th:first-child {
	writing-mode: initial;
}

table {
	border: 1px solid #dedede;
	background: white;
	margin: 1em;
	border-collapse: collapse;
}

#votes {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 3rem 0 1rem 0;
}

#subtitle {
	margin-top: 0.5em;
	text-align: center;
	color: #818da4;
}

.voter {
	width: 210px;
	display: flex;
	justify-content: space-between;
}

.hat {
	font-weight: bold;
}
</style>
