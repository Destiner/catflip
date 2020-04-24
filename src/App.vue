<template>
	<div id="app">
		<section id="nav">
			<h1 id="app-title">
				Catflip
			</h1>
			<div>
				<div class="nav-section">
					<div class="nav-links">
						<router-link
							:to="'/'"
						>
							System parameters
						</router-link>
						<router-link
							:to="'/vote-history'"
						>
							Vote history
						</router-link>
						<router-link
							:to="'/changelog'"
						>
							Changelog
						</router-link>
						<router-link
							:to="'/wards'"
						>
							Wards
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
							Source code
						</a>
						<a
							href="https://changelog.makerdao.com/releases/mainnet/1.0.4/contracts.json"
							target="_blank"
						>
							Contract addresses
						</a>
						<a
							href="https://docs.makerdao.com/other-documentation/system-glossary"
							target="_blank"
						>
							Glossary
						</a>
						<a
							href="https://mkrgov.science/"
							target="_blank"
						>
							Governance dashboard
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
