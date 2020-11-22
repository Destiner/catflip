import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core';
import { ApolloClients } from '@vue/apollo-composable';
import { createApp, provide, h } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';

import App from './App.vue';

import CompoundOverview from './pages/compound/Overview.vue';
import CompoundProposals from './pages/compound/Proposals.vue';
import CompoundAccountList from './pages/compound/AccountList.vue';

import MakerOverview from './pages/maker/Overview.vue';
import MakerSpellList from './pages/maker/SpellList.vue';
import MakerSpell from './pages/maker/Spell.vue';
import MakerVoterList from './pages/maker/VoterList.vue';

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

const routes = [
	{ path: '/', redirect: '/maker/' },
	{ path: '/changelog', redirect: '/maker/changelog' },
	{ path: '/compound/', component: CompoundOverview },
	{ path: '/compound/proposals', component: CompoundProposals },
	{ path: '/compound/accounts', component: CompoundAccountList },
	{ path: '/maker/', component: MakerOverview },
	{ path: '/maker/changelog', redirect: '/maker/spells' },
	{ path: '/maker/spells', component: MakerSpellList },
	{ path: '/maker/spell/:address', component: MakerSpell },
	{ path: '/maker/voters', component: MakerVoterList },
];

const routerHistory = createWebHistory();
const router = createRouter({
	history: routerHistory,
	routes,
});

const app = createApp({
	setup () {
		provide(ApolloClients, {
			compoundGovernance: compoundGovernanceClient,
			maker: makerClient,
			makerGovernance: makerGovernanceClient,
		});
	},
	render: () => h(App),
});

app.use(router);

app.mount('#app');

export {
	routerHistory,
	router,
};
