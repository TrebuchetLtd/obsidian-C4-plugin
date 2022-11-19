import { Judger } from './Judger';

export interface QAIssueData {
  content: string;
  upgrade: boolean; // zero score if true
  invalid: boolean; // true = -3
  rating: number; // 1 = non-critical (+1), 2 = refactoring (+2), 3 = low risk (+2)

  wellWritten: boolean; // true = +1
  inScope: boolean; // false = -2
  readable: boolean; // false = -1
  hasLinkToCode: boolean; // false = -1
  hasRating: boolean; // false = -1
  correctRating: boolean; // false = -2
}

export class QAIssue {
  public data: QAIssueData;

  constructor(issueData?: QAIssueData) {
    if (issueData) {
      this.data = issueData;
    } else {
      this.content = '';
    }
  }

  set content(value: string) {
    this.data.content = value;
    this.data.upgrade = false;
    this.data.invalid = false;
    this.data.rating = 0;
    this.data.wellWritten = false;
    this.data.inScope = true;
    this.data.readable = true
    this.data.hasLinkToCode = true;
    this.data.hasRating = true;
    this.data.correctRating = true;
  }

  score(): number {
    let tally = 0;

    if (this.data.upgrade) {
      return tally;
    }

    if (this.data.invalid) {
      return -3;
    }

    if (this.data.rating === 1) {
      tally += 1;
    } else if (this.data.rating === 2) {
      tally += 2;
    } else if (this.data.rating === 3) {
      tally += 2;
    } else {
      return tally;
    }

    if (this.data.wellWritten) {
      tally += 1;
    }

    if (!this.data.inScope) {
      tally -= 2;
    }

    if (!this.data.readable) {
      tally -= 1;
    }

    if (!this.data.hasLinkToCode) {
      tally -= 1;
    }

    if (!this.data.hasRating) {
      tally -= 1;
    }

    if (!this.data.correctRating) {
      tally -= 2;
    }

    return tally;
  }

  toJSON(): QAIssueData {
    return this.data;
  } 
}

export class QAData {
  public started: boolean;
  public issues: Array<QAIssue>;
  public filename: string;
  public markdown: string;
  public issueId: string;

  constructor(markdown: string, serialized?: string) {
    this.markdown = markdown;

    try {
      // @ts-ignore
      const { started, filename, issues, issueId } = JSON.parse(serialized);

      this.started = started;
      this.filename = filename;
      this.issueId = issueId;
      this.issues = issues.map((issueData: QAIssueData) => new QAIssue(issueData));
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

export class QAFile {
  public _filename: string
  public data: QAData
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
    return this._filename.replace('-Q.md', ' - QA.md')
  }

  get path(): string {
    return `${this.judger.qaFolder.path}/${this.filename}`;
  }

  deserialize() {
    const lines = this.markdown.split('\n');
    const regexp = new RegExp("^<!--DATA: ({.*})-->$")
    const serialized = lines.reverse().find((line) => !!line.match(regexp));
    // @ts-ignore
    this.data = serialized ? new QAData(this.markdown, serialized.match(regexp)[1]) : new QAData(this.markdown);
  }

  serialize() {
    // remove old data
    const markdown = this.markdown.split('\n').filter((line) => !line.match(new RegExp("^<!--DATA: ({.*})-->$"))).join('\n');
    return `${markdown}\n<!--DATA: ${this.data.serialize()}-->`
  }

  async load(create = true) {
    // has the file been created
    let file = this.judger.file(this.path);

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
      this.data = new QAData(this.markdown);
      this.data.init(this.filename)

      // copy the file
      await this.judger.create(this.judger.qaFolder, this.filename, this.serialize());

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