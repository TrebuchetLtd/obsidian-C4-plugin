import { RunningConfig } from "../Judger";

export interface IGenerateObject {
  generate_object(config: RunningConfig): Promise<Record<string, unknown>>;
}
