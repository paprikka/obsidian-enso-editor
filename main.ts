import {
	App,
	Editor,
	EditorPosition,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

const log = (...args: any[]) => console.log("[enso-obsidian]", ...args);

interface EnsoPluginSettings {
	fadeEnabled: boolean;
}

const DEFAULT_SETTINGS: EnsoPluginSettings = {
	fadeEnabled: false,
};

export default class MyPlugin extends Plugin {
	settings: EnsoPluginSettings;

	async onload() {
		(window as unknown as any).pl = this;
		await this.loadSettings();
		log("Loaded plugin");
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "enso-toggle-mode",
			name: "Toggle fade mode",
			callback: async () => {
				this.toggleMode();
				new Notice("Simple sample modal");
			},
		});

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		this.render();
	}

	toggleMode() {
		this.settings.fadeEnabled = !this.settings.fadeEnabled;
		this.saveData(this.settings);
		this.loadSettings();
	}

	onunload() {
		log("baaaai");
	}

	render() {
		console.log("rendering", { settings: this.settings });
		document.body.classList.toggle(
			"enso-fade-enabled",
			this.settings.fadeEnabled
		);

		if (!this.settings.fadeEnabled) return this.disableFocusMode();
		this.enableFocusMode();
	}

	enableFocusMode() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		log("enable focus mode");

		if (!activeView) return;
		const editor = activeView.editor;

		// TODO: this is a hack, drop and optimise
		this.registerInterval(
			window.setInterval(() => {
				const finalPos: EditorPosition = {
					line: editor.lastLine(),
					ch: editor.getCursor().ch,
				};
				try {
					editor.setCursor(finalPos);
					editor.scrollIntoView(
						{ from: finalPos, to: finalPos },
						true
					);
				} catch (e) {}
			}, 1)
		);
	}

	disableFocusMode() {
		// TODO: cleanup logic
		log("disable focus mode");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		this.render();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
