import { Judger } from './Judger';

export interface GasIssueData {
  content: string;
  copyPasta: boolean; // true = -1
  inScope: boolean; // false = -1
  hasGasSavings: boolean; // false = -1
  readable: boolean; // false = -1
  hasLinkToCode: boolean; // false = -1
}

export class GasIssue {
  public data: GasIssueData;

  constructor(issueData?: GasIssueData) {
    if (issueData) {
      this.data = issueData;
    } else {
      this.content = '';
    }
  }

  set content(value: string) {
    this.data.content = value;
    this.data.copyPasta = false;
    this.data.inScope = true;
    this.data.hasGasSavings = true;
    this.data.readable = true;
    this.data.hasLinkToCode = true;
  }

  score(): number {
    let tally = 0;

    if (this.data.copyPasta) {
      tally -= 1;
    }

    if (!this.data.inScope) {
      tally -= 1;
    }

    if (!this.data.hasGasSavings) {
      tally -= 1;
    }

    if (!this.data.readable) {
      tally -= 1;
    }

    if (!this.data.hasLinkToCode) {
      tally -= 1;
    }

    if (tally === 0) {
      return 1;
    }

    return tally;
  }

  toJSON(): GasIssueData {
    return this.data;
  } 
}

export class GasData {
  public started: boolean;
  public issues: Array<GasIssue>
  public filename: string
  public markdown: string
  public issueId: string

  constructor(markdown: string, serialized?: string) {
    this.markdown = markdown;

    try {
      // @ts-ignore
      const { started, filename, issues, issueId } = JSON.parse(serialized);

      this.started = started;
      this.filename = filename;
      this.issueId = issueId;
      this.issues = issues.map((issueData: GasIssueData) => new GasIssue(issueData));
    } catch (e) {
      this.started = false;
      this.filename = '';
      this.issueId = '';
      this.issues = [];
    }
  }

  init(filename: string, markdown?: string) {
    this.filename = filename;
    if (markdown) {
      this.markdown = markdown;
    }
  }

  serialize(): string {
    const { started, filename, issueId, issues } = this;

    return JSON.stringify({
      started,
      filename,
      issueId,
      issues,
    });
  }
}

export class GasFile {
  public _filename: string
  public data: GasData
  public isLoaded: boolean
  public markdown: string

  constructor(private judger: Judger, fileName: string) {
    this.isLoaded = false;
    this._filename = fileName;
  }

  get dataPath(): string {
    return `${this.judger.dataFolder.path}/${this._filename}`;
  }

  get filename(): string {
    return this._filename.replace('-G.md', ' - Gas.md');
  }

  get path(): string {
    return `${this.judger.gasFolder.path}/${this.filename}`;
  }

  deserialize() {
    const lines = this.markdown.split('\n');
    const regexp = new RegExp("^<!--DATA: ({.*})-->$")
    const serialized = lines.reverse().find((line) => !!line.match(regexp));
    // @ts-ignore
    this.data = serialized ? new GasData(this.markdown, serialized.match(regexp)[1]) : new GasData(this.markdown);
  }

  serialize() {
    // remove old data
    const markdown = this.markdown.split('\n').filter((line) => !line.match(new RegExp("^<!--DATA: ({.*})-->$"))).join('\n');
    return `${markdown}\n<!--DATA: ${this.data.serialize()}-->`
  }

  async load(create = true) {
    // has the file been created
    let file = this.judger.file(this.path);

    console.log('PATHS:', this.path, this.dataPath);

    // yes?
    if (file) {
      // read and deserialize the file
      this.markdown = await this.judger.read(file);
      this.deserialize();
      this.isLoaded = true;
      return true;
    }

    // no?
    file = this.judger.file(this.dataPath);
    // look for file in data folder
    if (create && file) {
      // set up the data
      this.markdown = await this.judger.read(file);
      this.data = new GasData(this.markdown);
      this.data.init(this.filename)

      // copy the file
      await this.judger.create(this.judger.gasFolder, this.filename, this.serialize());

      this.isLoaded = true;
      return true;
    }

    return Promise.reject(new Error('File not found!! - ' + this.filename));
  }

  async loaded(): Promise<boolean> {
    if (this.isLoaded) {
      return Promise.resolve(this.isLoaded);
    }

    return new Promise((resolve, reject) => {
      // @ts-ignore
      setTimeout(this.loaded().then(resolve, reject), 100);
    });
  }
}