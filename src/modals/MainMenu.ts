import { ButtonComponent, Modal } from "obsidian";

import C4JudgingPlugin from "../main";

export class MainMenu extends Modal {
  constructor(private plugin: C4JudgingPlugin) {
    super(plugin.app);
  }

  getElement(el?: HTMLElement): HTMLElement {
    return el || this.contentEl;
  }

  button(text?: string, cls?: string, parent?: HTMLElement): ButtonComponent {
    const button = new ButtonComponent(this.getElement(parent));
    button.setButtonText(text || 'Submit');
    button.setClass(cls || 'btn');
    return button;    
  }

  div(text?: string, cls?: string, parent?: HTMLElement): HTMLElement {
    return this.getElement(parent).createEl('div', { text, cls });
  }

  h2(text?: string, cls?: string, parent?: HTMLElement): HTMLElement {
    return this.getElement(parent).createEl('h2', { text, cls });
  }

  onOpen() {
    const {contentEl} = this;

    if (this.plugin.judger.finished()) {
      this.div(`Congrats! You have completed judging ${this.plugin.settings.data_folder}.`);
      this.div(this.plugin.judger.status());

      return true;
    }

    if (this.plugin.judger.started()) {
      contentEl.setText(
        `You have started judging ${this.plugin.settings.data_folder}.\n\n` +
        `There are ${this.plugin.judger.gasRemainingCount()} Gas issues left and ` +
        `${this.plugin.judger.qaRemainingCount()} QA issues left to be judged.`
      );
      
      return true;
    }

    this.h2('Welcome to the C4 Judger');
    this.div(
      `There are ${this.plugin.judger.gasCount()} Gas issues and ${this.plugin.judger.qaCount()} ` +
      `QA issues that require your wisdom.`
    );

    const cta = this.button('Get Started', 'btn', this.div('', 'templater-button-div'));
    cta.setCta()
    cta.onClick(() => {
      this.plugin.judger.startJudging(this);
    });
  }

  onClose() {
    const {contentEl} = this;
    contentEl.empty();
  }
}
