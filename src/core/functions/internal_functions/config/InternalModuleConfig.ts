import { InternalModule } from "../InternalModule";
import { RunningConfig } from "../../../Judger";
import { ModuleName } from "../InternalModule";

export class InternalModuleConfig extends InternalModule {
  public name: ModuleName = "config";

  async create_static_templates(): Promise<void> {}

  async create_dynamic_templates(): Promise<void> {}

  async generate_object(
    config: RunningConfig
  ): Promise<Record<string, unknown>> {
    return config;
  }
}
