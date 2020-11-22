import gql from 'graphql-tag';

export const GET_DELEGATES = gql`
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
`;
