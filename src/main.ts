import { createApp } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';

import App from './App.vue';

import CompoundOverview from './pages/compound/Overview.vue';
import CompoundProposals from './pages/compound/Proposals.vue';
import CompoundAccountList from './pages/compound/AccountList.vue';
import MakerOverview from './pages/maker/Overview.vue';
import MakerSpells from './pages/maker/Spells.vue';
import MakerVoterList from './pages/maker/VoterList.vue';

const routes = [
	{ path: '/', redirect: '/maker/' },
	{ path: '/changelog', redirect: '/maker/changelog' },
	{ path: '/compound/', component: CompoundOverview },
	{ path: '/compound/proposals', component: CompoundProposals },
	{ path: '/compound/accounts', component: CompoundAccountList },
	{ path: '/maker/', component: MakerOverview },
	{ path: '/maker/changelog', redirect: '/maker/spells' },
	{ path: '/maker/spells', component: MakerSpells },
	{ path: '/maker/voters', component: MakerVoterList },
];

const routerHistory = createWebHistory();
const router = createRouter({
	history: routerHistory,
	routes,
});

const app = createApp(App);

app.use(router);

app.mount('#app');

export {
	routerHistory,
	router,
};
