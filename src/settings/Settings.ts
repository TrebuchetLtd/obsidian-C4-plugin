import { PluginSettingTab, Setting } from "obsidian";
import { FolderSuggest } from "./suggesters/FolderSuggester";
import C4JudgingPlugin from "../main";

export interface FolderTemplate {
  folder: string;
  template: string;
}

export const DEFAULT_SETTINGS: Settings = {
  data_folder: "",
  gas_folder: "",
  qa_folder: "",
};

export interface Settings {
  data_folder: string;
  gas_folder: string;
  qa_folder: string;
}

export class C4JudgingSettingTab extends PluginSettingTab {
  constructor(private plugin: C4JudgingPlugin) {
    super(app, plugin);
  }

  display(): void {
    this.containerEl.empty();

    this.add_folder_setting(
      'data_folder',
      'Data folder location',
      'Location of the contest findings data folder',
      '2022-11-debtdao-findings/data'
    );

    this.add_folder_setting(
      'gas_folder',
      'Gas folder location',
      'Location where Gas files will be generated',
      'Gas'
    );

    this.add_folder_setting(
      'qa_folder',
      'QA folder location',
      'Location where QA files will be generated',
      'QA'
    );
  }

  add_folder_setting(folder: string, name: string, desc: string, example: string): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc)
      .addSearch((cb) => {
        new FolderSuggest(cb.inputEl);
        cb.setPlaceholder("Example: " + example)
          // @ts-ignore
          .setValue(this.plugin.settings[folder])
          .onChange((new_folder) => {
            // @ts-ignore
            this.plugin.settings[folder] = new_folder;
            this.plugin.save_settings();
          });
        // @ts-ignore
        cb.containerEl.addClass("templater_search");
      });
  }
}
