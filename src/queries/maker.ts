import gql from 'graphql-tag';

export const GET_SPELL = gql`
	query getSpell {
		spell(id: $address) {
			id
			timestamp
			casted
			lifted
			liftedWith
		}
	}
`;

export const GET_SPELL_TIMELINE = gql`
	query getSpellTimeline {
		spell(id: $address) {
			timeLine(first: 1000) {
				...on AddAction {
					id
					locked
					sender
					timestamp
					transactionHash
				}
				...on RemoveAction {
					id
					locked
					sender
					timestamp
					transactionHash
				}
			}
		}
	}
`;

export const GET_SPELLS = gql`
	query getSpells {
		spells(
			first: 1000,
			orderBy: timestamp,
			orderDirection: desc,
		) {
			id
			timestamp
			casted
			lifted
			liftedWith
		}
	}
`;

export const GET_CHANGES = gql`
	query getSpells {
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
	}
`;

export const GET_PROXY_VOTER_DATA = gql`
	query getProxyVoterData {
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
