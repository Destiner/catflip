<template>
	<section id="nav">
		<h1 id="app-title">
			Catflip
		</h1>
		<div>
			<div class="nav-section">
				<h2>Maker</h2>
				<div class="nav-links">
					<router-link
						:to="'/maker/'"
					>
						Overview
					</router-link>
					<router-link
						:to="'/maker/spells'"
					>
						Spells (changelog)
					</router-link>
					<router-link
						:to="'/maker/voters'"
					>
						Voters
					</router-link>
				</div>
			</div>
			<div class="nav-section">
				<h2>Compound</h2>
				<div class="nav-links">
					<router-link
						:to="'/compound/'"
					>
						Overview
					</router-link>
					<router-link
						:to="'/compound/proposals'"
					>
						Proposals
					</router-link>
				</div>
			</div>
			<div class="nav-section nav-section-secondary">
				<h2>Links</h2>
				<div class="nav-links">
					<a
						href="https://github.com/Destiner/catflip"
						target="_blank"
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

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

body {
	margin: 0;
	font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
	background: #f7f8fc;
	color: #3a4359;
}

h1 {
	font-size: 24px;
	margin: 0;
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
	color: #d6daea;
	background: #000638;
}

.nav-section {
	margin-top: 1rem;
}

.nav-section > h2 {
	font-size: 14px;
	margin: 2rem 0 0 0;
	color: #818da4;
	text-transform: uppercase;
}

.nav-links {
	display: flex;
	flex-direction: column;
}

.nav-links > a {
	margin-top: 1rem;
	text-decoration: none;
	color: #d6daea;
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
