import { addIcon, Plugin, Notice } from "obsidian";

import {
  DEFAULT_SETTINGS,
  Settings,
  C4JudgingSettingTab,
} from "./settings/Settings";

import { Judger } from './core/Judger';

// export const ICON_DATA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.1328 28.7"><path d="M0 15.14 0 10.15 18.67 1.51 18.67 6.03 4.72 12.33 4.72 12.76 18.67 19.22 18.67 23.74 0 15.14ZM33.6928 1.84C33.6928 1.84 33.9761 2.1467 34.5428 2.76C35.1094 3.38 35.3928 4.56 35.3928 6.3C35.3928 8.0466 34.8195 9.54 33.6728 10.78C32.5261 12.02 31.0995 12.64 29.3928 12.64C27.6862 12.64 26.2661 12.0267 25.1328 10.8C23.9928 9.5733 23.4228 8.0867 23.4228 6.34C23.4228 4.6 23.9995 3.1066 25.1528 1.86C26.2994.62 27.7261 0 29.4328 0C31.1395 0 32.5594.6133 33.6928 1.84M49.8228.67 29.5328 28.38 24.4128 28.38 44.7128.67 49.8228.67M31.0328 8.38C31.0328 8.38 31.1395 8.2467 31.3528 7.98C31.5662 7.7067 31.6728 7.1733 31.6728 6.38C31.6728 5.5867 31.4461 4.92 30.9928 4.38C30.5461 3.84 29.9995 3.57 29.3528 3.57C28.7061 3.57 28.1695 3.84 27.7428 4.38C27.3228 4.92 27.1128 5.5867 27.1128 6.38C27.1128 7.1733 27.3361 7.84 27.7828 8.38C28.2361 8.9267 28.7861 9.2 29.4328 9.2C30.0795 9.2 30.6128 8.9267 31.0328 8.38M49.4328 17.9C49.4328 17.9 49.7161 18.2067 50.2828 18.82C50.8495 19.4333 51.1328 20.6133 51.1328 22.36C51.1328 24.1 50.5594 25.59 49.4128 26.83C48.2595 28.0766 46.8295 28.7 45.1228 28.7C43.4228 28.7 42.0028 28.0833 40.8628 26.85C39.7295 25.6233 39.1628 24.1366 39.1628 22.39C39.1628 20.65 39.7361 19.16 40.8828 17.92C42.0361 16.6733 43.4628 16.05 45.1628 16.05C46.8694 16.05 48.2928 16.6667 49.4328 17.9M46.8528 24.52C46.8528 24.52 46.9595 24.3833 47.1728 24.11C47.3795 23.8367 47.4828 23.3033 47.4828 22.51C47.4828 21.7167 47.2595 21.05 46.8128 20.51C46.3661 19.97 45.8162 19.7 45.1628 19.7C44.5161 19.7 43.9828 19.97 43.5628 20.51C43.1428 21.05 42.9328 21.7167 42.9328 22.51C42.9328 23.3033 43.1561 23.9733 43.6028 24.52C44.0494 25.06 44.5961 25.33 45.2428 25.33C45.8895 25.33 46.4261 25.06 46.8528 24.52Z" fill="currentColor"/></svg>`;

export const ICON_DATA=`<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
width="100.000000pt" height="100.000000pt" viewBox="0 0 100.000000 100.000000"
preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,100.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M365 909 c-55 -40 -143 -101 -196 -136 -72 -47 -99 -70 -104 -90 -16
-66 -55 -268 -55 -288 0 -12 9 -34 20 -47 20 -26 326 -266 389 -305 77 -48
144 -26 301 97 194 152 260 211 266 237 7 25 -36 261 -57 313 -6 16 -76 71
-199 155 -239 165 -229 163 -365 64z m170 -123 c19 -14 19 -15 -5 -34 -17 -14
-34 -19 -55 -15 -29 4 -29 4 -10 -12 12 -9 28 -13 40 -10 81 25 128 21 152
-12 17 -22 16 -65 -1 -89 -10 -14 -11 -22 -4 -32 16 -19 -15 -50 -35 -34 -10
8 -25 8 -59 -3 -33 -10 -56 -11 -80 -4 -36 10 -65 26 -58 32 55 42 63 46 80
37 10 -6 27 -10 37 -10 15 0 14 4 -7 20 -15 12 -33 18 -45 14 -95 -27 -134
-21 -154 23 -10 21 -8 31 8 59 12 20 16 36 10 40 -20 12 13 35 41 29 14 -3 37
-1 51 4 35 14 72 13 94 -3z"/>
<path d="M405 700 c-3 -5 1 -13 10 -16 22 -9 29 1 11 15 -10 8 -16 9 -21 1z"/>
<path d="M565 650 c20 -22 31 -20 22 5 -4 8 -14 15 -23 15 -16 0 -16 -2 1 -20z"/>
</g>
</svg>`

export default class C4JudgingPlugin extends Plugin {
  public statusBar: HTMLElement;
  public settings: Settings;
  public judger: Judger;

  async onload(): Promise<void> {
    await this.load_settings();
    this.statusBar = this.addStatusBarItem();

    this.judger = new Judger(this);
    await this.judger.setup();

    addIcon("c4-judger-icon", ICON_DATA);
    this.addRibbonIcon("c4-judger-icon", "C4 Judger", async () => {
      this.handleMenuClick();
    }).setAttribute("id", "c4-templater-icon");

    this.addSettingTab(new C4JudgingSettingTab(this));

    // Files might not be created yet
    app.workspace.onLayoutReady(() => {
      this.judger.execute_startup_scripts();
    });
  }

  async handleMenuClick(): Promise<void> {
    // do a thing or 3
    new Notice('C4 Judger Activated!');
    this.judger.openMainMenu();
    this.updateStatusBar();
  }

  async updateStatusBar() {
    this.statusBar.setText(this.judger.status());
  }

  async save_settings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async load_settings(): Promise<void> {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }
}

/*
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default'
}

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
      // Called when the user clicks the icon.
      new Notice('This is a notice!');
    });
    // Perform additional things with the ribbon
    ribbonIconEl.addClass('my-plugin-ribbon-class');

    // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    const statusBarItemEl = this.addStatusBarItem();
    statusBarItemEl.setText('Status Bar Text');

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'open-sample-modal-simple',
      name: 'Open sample modal (simple)',
      callback: () => {
        new SampleModal(this.app).open();
      }
    });
    // This adds an editor command that can perform some operation on the current editor instance
    this.addCommand({
      id: 'sample-editor-command',
      name: 'Sample editor command',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        console.log(editor.getSelection());
        editor.replaceSelection('Sample Editor Command');
      }
    });
    // This adds a complex command that can check whether the current state of the app allows execution of the command
    this.addCommand({
      id: 'open-sample-modal-complex',
      name: 'Open sample modal (complex)',
      checkCallback: (checking: boolean) => {
        // Conditions to check
        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (markdownView) {
          // If checking is true, we're simply "checking" if the command can be run.
          // If checking is false, then we want to actually perform the operation.
          if (!checking) {
            new SampleModal(this.app).open();
          }

          // This command will only show up in Command Palette when the check function returns true
          return true;
        }
      }
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));

    // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // Using this function will automatically remove the event listener when this plugin is disabled.
    this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
      console.log('click', evt);
    });

    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const {contentEl} = this;
    contentEl.setText('Woah!');
  }

  onClose() {
    const {contentEl} = this;
    contentEl.empty();
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

    new Setting(containerEl)
      .setName('Setting #1')
      .setDesc('It\'s a secret')
      .addText(text => text
        .setPlaceholder('Enter your secret')
        .setValue(this.plugin.settings.mySetting)
        .onChange(async (value) => {
          console.log('Secret: ' + value);
          this.plugin.settings.mySetting = value;
          await this.plugin.saveSettings();
        }));
  }
}
*/