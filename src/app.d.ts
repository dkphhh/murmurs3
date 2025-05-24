// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}

		interface Locals {
			notification: {
				get: () => NotificationType | null;
				set: (data: NotificationType) => void;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface NotificationType {
		type: "error" | "info" | "warning"| undefined;
		description: string;
	}
}

export { };
