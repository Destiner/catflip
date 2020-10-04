<template>
	<div id="app">
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
							:to="'/maker/changelog'"
						>
							Changelog
						</router-link>
						<router-link
							:to="'/maker/voting'"
						>
							Voting
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
	</div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import favicon from '../public/favicon.ico';

export default {};
</script>

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
	width: 192px;
	background: #000638;
	padding: 1rem;
	color: #d6daea;
	font-size: 14px;
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
	width: calc(100% - 200px);
}

@media all and (max-width: 768px) {
	#app {
		flex-direction: column;
	}

	#nav {
		width: 100%;
		box-sizing: border-box;
	}

	#content {
		width: 100%;
	}

	#app-title {
		display: none;
	}

	.nav-section {
		margin-top: 0;
	}

	.nav-section-secondary {
		display: none;
	}

	.nav-links {
		flex-direction: row;
		justify-content: space-between;
	}

	.nav-links > a {
		margin-top: 0;
	}
}
</style>
