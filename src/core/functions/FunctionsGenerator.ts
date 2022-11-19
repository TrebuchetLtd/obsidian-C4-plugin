import { InternalFunctions } from "./internal_functions/InternalFunctions";
import C4JudgingPlugin from "../../main";
import { IGenerateObject } from "./IGenerateObject";
import { RunningConfig } from "../Judger";
import * as obsidian_module from "obsidian";

export enum FunctionsMode {
  INTERNAL,
  USER_INTERNAL,
}

export class FunctionsGenerator implements IGenerateObject {
  public internal_functions: InternalFunctions;

  constructor(private plugin: C4JudgingPlugin) {
    this.internal_functions = new InternalFunctions(this.plugin);
  }

  async init(): Promise<void> {
    await this.internal_functions.init();
  }

  additional_functions(): Record<string, unknown> {
    return {
      obsidian: obsidian_module,
    };
  }

  async generate_object(
    config: RunningConfig,
    functions_mode: FunctionsMode = FunctionsMode.USER_INTERNAL
  ): Promise<Record<string, unknown>> {
    const final_object = {};
    const additional_functions_object = this.additional_functions();
    const internal_functions_object =
      await this.internal_functions.generate_object(config);

    Object.assign(final_object, additional_functions_object);
    switch (functions_mode) {
      case FunctionsMode.INTERNAL:
        Object.assign(final_object, internal_functions_object);
        break;
    }

    return final_object;
  }
}
