import C4JudgingPlugin from "../../../main";
import { RunningConfig } from "../../Judger";
import { IGenerateObject } from "../IGenerateObject";

const module_names = [
  "config",
  "date",
  "file",
  "frontmatter",
  "obsidian",
  "system",
  "user",
  "web",
] as const;
export type ModuleName = typeof module_names[number];

export abstract class InternalModule implements IGenerateObject {
  protected static_functions: Map<string, unknown> = new Map();
  protected dynamic_functions: Map<string, unknown> = new Map();
  protected config: RunningConfig;
  protected static_object: { [x: string]: unknown };

  constructor(protected plugin: C4JudgingPlugin) {}

  getName(): ModuleName {
    // @ts-ignore
    return this.name;
  }

  abstract create_static_templates(): Promise<void>;
  abstract create_dynamic_templates(): Promise<void>;

  async init(): Promise<void> {
    await this.create_static_templates();
    this.static_object = Object.fromEntries(this.static_functions);
  }

  async generate_object(
    new_config: RunningConfig
  ): Promise<Record<string, unknown>> {
    this.config = new_config;
    await this.create_dynamic_templates();

    return {
      ...this.static_object,
      ...Object.fromEntries(this.dynamic_functions),
    };
  }
}
