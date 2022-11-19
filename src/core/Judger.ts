import {
  Modal,
  Notice,
  TAbstractFile,
  TFile,
  TFolder,
} from "obsidian";
import C4JudgingPlugin from "../main";
import {
  FunctionsGenerator,
  FunctionsMode,
} from "./functions/FunctionsGenerator";
import { errorWrapper } from "../utils/Error";
import { Parser } from "./parser/Parser";
import { Settings } from "../settings/Settings";

import { MainMenu } from "../modals/MainMenu";

import { GasFile } from "./Gas";
import { QAFile } from "./QA";

export enum RunMode {
  CreateNewFromTemplate,
  AppendActiveFile,
  OverwriteFile,
  OverwriteActiveFile,
  DynamicProcessor,
  StartupTemplate,
}

export type RunningConfig = {
  template_file: TFile | undefined;
  target_file: TFile;
  run_mode: RunMode;
  active_file?: TFile | null;
};

export class Judger {
  // modals
  public mainMenu: MainMenu;

  // data
  public gasMap: {[filename: string]: GasFile}
  public qaMap: {[filename: string]: QAFile}

  // other things
  public parser: Parser;
  public functions_generator: FunctionsGenerator;
  public current_functions_object: Record<string, unknown>;

  constructor(private plugin: C4JudgingPlugin) {
    this.functions_generator = new FunctionsGenerator(this.plugin);
    this.parser = new Parser();

    // data
    this.gasMap = {};
    this.qaMap = {};

    // modals
    this.mainMenu = new MainMenu(this.plugin);
  }

  async setup(): Promise<void> {
    await this.parser.init();
    await this.functions_generator.init();
  }

  // accessors

  get dataFolder(): TFolder {
    // @ts-ignore
    return this.plugin.app.vault.fileMap[this.plugin.settings.data_folder];
  }

  get gasFolder(): TFolder {
    // @ts-ignore
    return this.plugin.app.vault.fileMap[this.plugin.settings.gas_folder];
  }

  get qaFolder(): TFolder {
    // @ts-ignore
    return this.plugin.app.vault.fileMap[this.plugin.settings.qa_folder];
  }

  get settings(): Settings {
    return this.plugin.settings;
  }

  // CONTROL

  openMainMenu(): void {
    this.mainMenu.open();
  }

  async loadExisting(): Promise<void> {
    new Notice('Loading Existing Reports');

    new Notice(`Processing ${this.gasCount()} Gas Reports`);

    // copy all gas files
    const gasFileNames = this.gasDataFileNames()
    for (let i = 0; i < gasFileNames.length; i++) {
      const file = new GasFile(this, gasFileNames[i].replace(this.plugin.settings.data_folder + '/', ''));
      await file.load(false);
      console.log(i, file, file.filename);
      this.gasMap[file.filename] = file;
    }

    // copy all qa files
    new Notice(`Processing ${this.qaCount()} QA Reports`);

    // copy all qa files
    const qaFileNames = this.qaDataFileNames()
    for (let i = 0; i < qaFileNames.length; i++) {
      const file = new QAFile(this, qaFileNames[i].replace(this.plugin.settings.data_folder + '/', ''));
      await file.load(false);
      console.log(i, file, file.filename);
      this.qaMap[file.filename] = file;
    }

    this.plugin.updateStatusBar();

    new Notice(`Processed!!`);
  }

  async startJudging(modal: Modal): Promise<void> {
    modal.close();

    new Notice('Starting to Judge');

    new Notice(`Processing ${this.gasCount()} Gas Reports`);

    // copy all gas files
    const gasFileNames = this.gasDataFileNames()
    for (let i = 0; i < gasFileNames.length; i++) {
      const file = new GasFile(this, gasFileNames[i].replace(this.plugin.settings.data_folder + '/', ''));
      await file.load();
      console.log(i, file, file.filename);
      this.gasMap[file.filename] = file;
    }

    // copy all qa files
    new Notice(`Processing ${this.qaCount()} QA Reports`);

    // copy all qa files
    const qaFileNames = this.qaDataFileNames()
    for (let i = 0; i < qaFileNames.length; i++) {
      const file = new QAFile(this, qaFileNames[i].replace(this.plugin.settings.data_folder + '/', ''));
      await file.load();
      console.log(i, file, file.filename);
      this.qaMap[file.filename] = file;
    }

    this.plugin.updateStatusBar();

    new Notice(`Processed!!`);

    // Open Main Menu again
    this.openMainMenu();
  }

  // STATUS

  gasCount(): number {
    return this.gasDataFileNames().length;
  }

  gasFinishedCount(): number {
    return this.gasFinishedFileNames().length;
  }

  gasNoteCount(): number {
    return this.gasNoteFileNames().length;
  }

  gasRemainingCount(): number {
    return this.gasCount() - this.gasFinishedCount();
  }

  finished(): boolean {
    return this.started() && this.gasFinishedCount() === this.gasNoteCount() && this.qaFinishedCount() === this.qaNoteCount();
  }

  qaCount(): number {
    return this.qaDataFileNames().length;
  }

  qaFinishedCount(): number {
    return this.qaFinishedFileNames().length;
  }

  qaNoteCount(): number {
    return this.qaNoteFileNames().length;
  }

  qaRemainingCount(): number {
    return this.qaCount() - this.qaFinishedCount();
  }

  started(): boolean {
    return this.gasCount() === this.gasNoteCount() && this.qaCount() === this.qaNoteCount();
  }

  status(): string {
    return `C4 Stats - Gas: ${this.gasCount()}, QA: ${this.qaCount()}, Started: ${this.started()}, Finished: ${this.finished()}`;
  }

  // REGEX

  dataFolderRE(): RegExp {
    return new RegExp(this.plugin.settings.data_folder);
  }

  gasFolderRE(): RegExp {
    return new RegExp(this.plugin.settings.gas_folder);
  }

  qaFolderRE(): RegExp {
    return new RegExp(this.plugin.settings.qa_folder);
  }

  // FILE MANAGEMENT

  file(path: string): TFile {
    // @ts-ignore
    return this.plugin.app.vault.fileMap[path];
  }

  read(file: TFile): Promise<string> {
    return this.plugin.app.vault.read(file);
  }

  create(folder: TFolder, filename: string, content: string): Promise<TFile> {
    // @ts-ignore
    return this.plugin.app.fileManager.createNewMarkdownFile(folder, filename.replace('.md',''), content);
  }

  gasDataFileNames(): Array<string> {
    // @ts-ignore
    const fileNames = Object.keys(this.plugin.app.vault.fileMap);
    const dataFolderRE = this.dataFolderRE();

    return fileNames.filter((name) => {
      return !!name.match(dataFolderRE) && !!name.match(/-G.md$/);
    });
  }

  gasFinishedFileNames(): Array<string> {
    // @ts-ignore
    const fileNames = Object.keys(this.plugin.app.vault.fileMap);
    const gasFolderRE = this.gasFolderRE();

    return fileNames.filter((name) => {
      return !!name.match(gasFolderRE) && !!name.match(/^\d+ - Gas.md$/);
    });
  }

  gasNoteFileNames(): Array<string> {
    // @ts-ignore
    const fileNames = Object.keys(this.plugin.app.vault.fileMap);
    const gasFolderRE = this.gasFolderRE();

    return fileNames.filter((name) => {
      return !!name.match(gasFolderRE) && !!name.match(/- Gas.md$/);
    });
  }

  qaDataFileNames(): Array<string> {
    // @ts-ignore
    const fileNames = Object.keys(this.plugin.app.vault.fileMap);
    const dataFolderRE = this.dataFolderRE();

    return fileNames.filter((name) => {
      return !!name.match(dataFolderRE) && !!name.match(/-Q.md$/);
    });
  }

  qaFinishedFileNames(): Array<string> {
    // @ts-ignore
    const fileNames = Object.keys(this.plugin.app.vault.fileMap);
    const qaFolderRE = this.qaFolderRE();

    return fileNames.filter((name) => {
      return !!name.match(qaFolderRE) && !!name.match(/^\d+ - QA.md$/);
    });
  }

  qaNoteFileNames(): Array<string> {
    // @ts-ignore
    const fileNames = Object.keys(this.plugin.app.vault.fileMap);
    const qaFolderRE = this.qaFolderRE();

    return fileNames.filter((name) => {
      return !!name.match(qaFolderRE) && !!name.match(/- QA.md$/);
    });
  }









  create_running_config(
    template_file: TFile | undefined,
    target_file: TFile,
    run_mode: RunMode
  ): RunningConfig {
    return {
      template_file: template_file,
      target_file: target_file,
      run_mode: run_mode,
    };
  }

  async read_and_parse_template(config: RunningConfig): Promise<string> {
    const template_content = await app.vault.read(
      config.template_file as TFile
    );
    return this.parse_template(config, template_content);
  }

  async parse_template(
    config: RunningConfig,
    template_content: string
  ): Promise<string> {
    const functions_object = await this.functions_generator.generate_object(
      config,
      FunctionsMode.USER_INTERNAL
    );
    this.current_functions_object = functions_object;
    const content = await this.parser.parse_commands(
      template_content,
      functions_object
    );
    return content;
  }

  async write_template_to_file(
    template_file: TFile,
    file: TFile
  ): Promise<void> {
    const running_config = this.create_running_config(
      template_file,
      file,
      RunMode.OverwriteFile
    );
    const output_content = await errorWrapper(
      async () => this.read_and_parse_template(running_config),
      "Template parsing error, aborting."
    );
    // errorWrapper failed
    if (output_content == null) {
      return;
    }
    await app.vault.modify(file, output_content);
    app.workspace.trigger("templater:new-note-from-template", {
      file,
      content: output_content,
    });
  }

  static async on_file_creation(
    judger: Judger,
    file: TAbstractFile
  ): Promise<void> {
  }

  async execute_startup_scripts(): Promise<void> {
    await this.loadExisting();
  }
}
