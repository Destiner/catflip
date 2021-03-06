import { createWebHistory, createRouter } from 'vue-router';

import CompoundOverview from './pages/compound/Overview.vue';
import CompoundProposals from './pages/compound/Proposals.vue';
import CompoundAccountList from './pages/compound/AccountList.vue';

import MakerOverview from './pages/maker/Overview.vue';
import MakerSpellList from './pages/maker/SpellList.vue';
import MakerSpell from './pages/maker/Spell.vue';
import MakerVoterList from './pages/maker/VoterList.vue';

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

export const routerHistory = createWebHistory();
export const router = createRouter({
	history: routerHistory,
	routes,
});
