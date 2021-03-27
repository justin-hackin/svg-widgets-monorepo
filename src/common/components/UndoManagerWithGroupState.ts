import { UndoManager } from 'mst-middlewares';
import { Instance, types } from 'mobx-state-tree';

// from https://github.com/mobxjs/mobx-state-tree/issues/1423#issuecomment-701315117
export const UndoManagerWithGroupState = types.compose(
  UndoManager,
  types.model('UndoManagerWithGroupState', {
    groupActive: false,
  }).actions((self) => {
    // @ts-ignore
    const { startGroup, stopGroup } = self;
    return {
      startGroup(fn) {
        startGroup(fn);
        self.groupActive = true;
      },
      stopGroup() {
        stopGroup();
        self.groupActive = false;
      },
    };
  }),
);

export interface IUndoManagerWithGroupState extends Instance<typeof UndoManagerWithGroupState> {}
