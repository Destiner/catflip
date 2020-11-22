import { ApolloClient, createHttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client/core';

type Client = 'CompoundGovernance' | 'Maker' | 'MakerGovernance';

type Clients = Record<Client, ApolloClient<NormalizedCacheObject>>;

const compoundGovernanceClient = new ApolloClient({
	link: createHttpLink({
		uri: 'https://api.thegraph.com/subgraphs/name/protofire/compound-governance',
	}),
	cache: new InMemoryCache(),
});

const makerClient = new ApolloClient({
	link: createHttpLink({
		uri: 'https://api.thegraph.com/subgraphs/name/graphitetools/maker',
	}),
	cache: new InMemoryCache(),
});

const makerGovernanceClient = new ApolloClient({
	link: createHttpLink({
		uri: 'https://api.thegraph.com/subgraphs/name/protofire/makerdao-governance',
	}),
	cache: new InMemoryCache(),
});

const clients: Clients = {
	CompoundGovernance: compoundGovernanceClient,
	Maker: makerClient,
	MakerGovernance: makerGovernanceClient,
};

export default clients;
