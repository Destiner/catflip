export enum Status {
	Hat,
	Passed,
	Pending,
	Skipped,
}

export interface SpellMetadata {
	source: string;
	title: string;
	about: string;
}

export interface SubgraphSpell {
	id: string;
	timestamp: string;
	casted: string | null;
	lifted: string | null;
	liftedWith: string | null;
}

export function formatStatus(status: Status): string {
	if (status === Status.Hat) {
		return 'Hat';
	}
	if (status === Status.Passed) {
		return 'Passed';
	}
	if (status === Status.Pending) {
		return 'Pending';
	}
	if (status === Status.Skipped) {
		return 'Skipped';
	}
	return '';
}
