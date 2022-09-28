import { ModelRepo } from "../modelRepo/ModelRepo";
import { ExecutorStore } from "../executors/ExecutorStore";
import { CoreDelta } from "../models/CoreDeltas";
import { SupportedModel } from "../models/SupportedModels";

export class OperationRepo {
  public executorStore: ExecutorStore;

  constructor(private modelRepo: ModelRepo) {
    this.executorStore = new ExecutorStore();

    this.modelRepo.subscribe((delta: CoreDelta<SupportedModel>) => {
      this.processDelta(delta);
    });
  }

  private processDelta(delta: CoreDelta<SupportedModel>): void {
    const { modelName } = delta.model;
    this.executorStore[modelName]?.enqueueDelta(delta);
  }
}
