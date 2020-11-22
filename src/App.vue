<template>
	<section id="nav">
		<h1 id="app-title">
			Catflip
		</h1>
		<div>
			<div class="nav-section">
				<div class="nav-header">
					<img
						:src="makerIcon"
						class="nav-icon"
					>
					<h2 class="nav-title">
						Maker
					</h2>
				</div>
				<div class="nav-links">
					<router-link
						class="nav-link"
						:to="'/maker/'"
					>
						Overview
					</router-link>
					<router-link
						class="nav-link"
						:to="'/maker/spells'"
					>
						Spells (changelog)
					</router-link>
					<router-link
						class="nav-link"
						:to="'/maker/voters'"
					>
						Voters
					</router-link>
				</div>
			</div>
			<div class="nav-section">
				<div class="nav-header">
					<img
						:src="compoundIcon"
						class="nav-icon"
					>
					<h2 class="nav-title">
						Compound
					</h2>
				</div>
				<div class="nav-links">
					<router-link
						class="nav-link"
						:to="'/compound/'"
					>
						Overview
					</router-link>
					<router-link
						class="nav-link"
						:to="'/compound/proposals'"
					>
						Proposals
					</router-link>
				</div>
			</div>
			<div class="nav-section nav-section-secondary">
				<div class="nav-header">
					<h2 class="nav-title">
						Links
					</h2>
				</div>
				<div class="nav-links">
					<a
						href="https://github.com/Destiner/catflip"
						target="_blank"
						class="nav-link"
					>
						Github
					</a>
				</div>
			</div>
		</div>
	</section>
	<section id="content">
		<router-view />
	</section>
</template>

<script>
import { defineComponent } from 'vue';

import compoundIcon from '@/assets/compound.svg';
import makerIcon from '@/assets/maker.svg';

export default defineComponent({
	setup() {
		return {
			compoundIcon,
			makerIcon,
		};
	},
});
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

:root {
	--color-brand: #000638;
	--color-background: #f7f8fc;
	--color-background-card: white;
	--color-card-row: #eceff1;
	--color-border: #dedede;
	--color-text-primary: #3a4359;
	--color-text-secondary: #818da4;
	--color-text-primary-inverted: #d6daea;
	--color-text-secondary-inverted: #818da4;
}

body {
	margin: 0;
	font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
	background: var(--color-background);
	color: var(--color-text-primary);
}

h1 {
	font-size: 24px;
	margin: 0;
}

h2 {
	font-size: 20px;
}

h1,
h2 {
	font-weight: normal;
}

#app {
	display: flex;
}

#nav {
	height: 100%;
	width: 192px;
	padding: 16px;
	position: fixed;
	font-size: 14px;
	color: var(--color-text-primary-inverted);
	background: var(--color-brand);
}

.nav-section {
	margin-top: 1rem;
}

.nav-header {
	margin: 2rem 0 0 0;
	display: flex;
	color: var(--color-text-secondary-inverted);
	text-transform: uppercase;
}

.nav-title {
	margin: 0;
	font-size: 14px;
}

.nav-icon {
	width: 16px;
	height: 16px;
	margin-right: 8px;
}

.nav-links {
	display: flex;
	flex-direction: column;
}

.nav-link {
	margin-top: 1rem;
	text-decoration: none;
	color: var(--color-text-secondary-inverted);
}

.nav-link:hover {
	color: var(--color-text-primary-inverted);
}

.router-link-active {
	font-weight: bold;
	color: var(--color-text-primary-inverted);
}

#content {
	margin-left: 224px;
	width: calc(100% - 224px);
}

@media all and (max-width: 768px) {
	#app {
		flex-direction: column;
	}

	#nav {
		height: initial;
		width: 100%;
		position: initial;
		box-sizing: border-box;
	}

	#content {
		margin-left: 0;
		width: 100%;
	}

	#app-title {
		display: none;
	}

	.nav-section {
		margin-top: 0;
	}

	.nav-section > h2 {
		margin-top: 8px;
	}

	.nav-section-secondary {
		display: none;
	}

	.nav-links {
		flex-direction: row;
	}

	.nav-links > a {
		margin-top: 0;
		margin-left: 16px;
	}
}
</style>
