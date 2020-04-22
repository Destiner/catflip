<template>
	<div>
		<h1>Wards</h1>
		<div id="term">
			Addresses that are allowed to call auth methods
		</div>
		<div id="contracts">
			<div
				v-for="contract in contracts"
				:key="contract.address"
				class="contract"
			>
				<div class="header">
					<div>
						{{ getContractName(contract.address) }}
					</div>
					<div class="address">
						{{ formatAddress(contract.address) }}
						<EtherscanIcon :link="getEtherscanLink(contract.address)" />
					</div>
				</div>
				<div class="wards">
					<div
						v-for="ward in contract.wards"
						:key="ward.address"
						class="ward"
					>
						<div>
							{{ getContractName(ward.address) }}
						</div>
						<div class="address">
							{{ formatAddress(ward.address) }}
							<EtherscanIcon :link="getEtherscanLink(ward.address)" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import EtherscanIcon from '../components/EtherscanIcon.vue';

const contractNameMap = {
	'0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b': 'Vat',
	'0x19c0976f590d67707e62397c87829d896dc0f1f1': 'Jug',
	'0x197e90f9fad81970ba7976f33cbd77088e5d7cf7': 'Pot',
	'0x65c79fcb50ca1594b025960e539ed7a9a6d434a3': 'Spot',
	'0x78f2c2af65126834c51822f56be0d7469d7a523e': 'Cat',
	'0xd8a04f5412223f513dc55f839574430f5ec15531': 'Flip ETH-A',
	'0xaa745404d55f88c108a28c86abe7b5a1e7817c07': 'Flip BAT-A',
	'0xe6ed1d09a19bd335f051d78d5d22df3bff2c28b1': 'Flip USDC-A',
	'0x5432b2f3c0dff95aa191c45e5cbd539e2820ae72': 'Flip SAI',
	'0x9bddb99625a711bf9bda237044924e34e8570f75': 'Flip Mom',
	'0xdfe0fb1be2a52cdbf8fb962d5701d7fd0902db9f': 'Flap',
	'0x4d95a049d5b0b7d32058cd3f2163015747522e99': 'Flop',
	'0xa950524441892a31ebddf91d3ceefa04bf454466': 'Vow',
	'0x2f0b23f53734252bda2277357e97e1517d6b042a': 'Join ETH-A',
	'0x3d0b1912b66114d4096f48a8cee3a56c231772ca': 'Join BAT-A',
	'0xa191e578a6736167326d05c119ce0c90849e84b7': 'Join USDC-A',
	'0xad37fd42185ba63009177058208dd1be4b136e6b': 'Join SAI',
	'0xbe8e3e3618f7474f8cb1d074a26affef007e98fb': 'Pause',
	'0xab14d3ce3f733cacb76ec2abe7d2fcb00c99f3d5': 'End',
};

export default {
	components: {
		EtherscanIcon,
	},
	data() {
		return {
			authorities: [],
		};
	},
	computed: {
		contracts() {
			const contracts = this.authorities.map(authority => {
				const wards = authority.owners.map(owner => {
					return {
						address: owner,
					};
				});
				this._sortContracts(wards);
				return {
					address: authority.id,
					wards,
				};
			});
			this._sortContracts(contracts);
			return contracts;
		},
	},
	mounted() {
		this._loadWards();
	},
	methods: {
		formatAddress(address) {
			return `${address.substr(0, 6)}…${address.substr(42 - 6)}`;
		},
		getEtherscanLink(address) {
			return `https://etherscan.io/address/${address}`;
		},
		getContractName(address) {
			return contractNameMap[address];
		},
		async _loadWards() {
			const url = 'https://api.thegraph.com/subgraphs/name/graphitetools/maker';
			const query = `
				query {
					authorities {
						id
						owners
					}
				}`;
			const opts = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query }),
			};
			const response = await fetch(url, opts);
			const json = await response.json();
			this.authorities = json.data.authorities;
		},
		_sortContracts(contracts) {
			const contractAddresses = Object.keys(contractNameMap);
			const contractRanks = {};
			for (let i = 0; i < contractAddresses.length; i++) {
				const address = contractAddresses[i];
				contractRanks[address] = i;
			}
			contracts.sort((a, b) => {
				const aRank = contractRanks[a.address];
				const bRank = contractRanks[b.address];
				return aRank < bRank
					? -1
					: aRank > bRank
						? 1
						: 0;
			});
		}
	},
};
</script>

<style scoped>
h1 {
	text-align: center;
	margin-top: 1rem;
}

#contracts {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 1rem 0;
}

.contract {
	min-width: 400px;
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

.wards {
	margin-top: 1rem;
}

.ward {
	padding: 0.5rem;
	display: flex;
	justify-content: space-between;
	font-size: 14px;
}

.ward:nth-child(even) {
	background: #eceff1;
}

#term {
	margin-top: 0.5em;
	text-align: center;
	color: #818da4;
}

.address {
	color: #818da4;
}

@media all and (max-width: 768px) {
	.contract {
		min-width: 300px;
	}
}
</style>
