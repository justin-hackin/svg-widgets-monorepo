// eslint-disable-next-line max-classes-per-file
import { includes, flatten } from 'lodash';
import {
  Model, model, modelAction,
} from 'mobx-keystone';
import { computed, observable } from 'mobx';
import {
  EVENTS, IS_ELECTRON_BUILD, IS_WEB_BUILD,
} from '../../../constants';

export const DRAG_MODES = {
  TRANSLATE: 'translate',
  TRANSLATE_VERTICAL: 'translate-vertical',
  TRANSLATE_HORIZONTAL: 'translate-horizontal',
  ROTATE: 'rotate',
  SCALE_TEXTURE: 'scale texture',
  SCALE_VIEW: 'scale view',
};

// sorted in order of precedence, first match becomes mode
const allTrue = (array: boolean[]) => {
  for (const val of array) {
    if (val !== true) { return false; }
  }
  return true;
};

const areKeysHeld = (trackerKeys, keysHeld) => allTrue(keysHeld.map((key) => trackerKeys[key]));

interface ModeDef {
  mode: string,
  keysHeld: string[]
}

@model('ModifierTrackingModel')
export class ModifierTrackingModel extends Model({
}) {
  @observable
  keysHeld = {} as Record<string, boolean>;

  modeDefs = [
    { mode: DRAG_MODES.TRANSLATE_HORIZONTAL, keysHeld: ['Alt', 'Control'] },
    { mode: DRAG_MODES.TRANSLATE_VERTICAL, keysHeld: ['Control', 'Shift'] },
    { mode: DRAG_MODES.SCALE_VIEW, keysHeld: ['Alt'] },
    { mode: DRAG_MODES.SCALE_TEXTURE, keysHeld: ['Control'] },
    { mode: DRAG_MODES.ROTATE, keysHeld: ['Shift'] },
  ] as ModeDef[];

  defaultMode = DRAG_MODES.TRANSLATE;

  @computed
  get keysTracked() {
    return flatten(this.modeDefs.map(({ keysHeld }) => keysHeld));
  }

  @modelAction
  keyupHandler(e) {
    if (includes(this.keysTracked, e.key)) {
      this.keysHeld[e.key] = false;
    }
  }

  @modelAction
  keydownHandler(e) {
    if (includes(this.keysTracked, e.key)) {
      this.keysHeld[e.key] = true;
    }
  }

  @modelAction
  releaseHeldKeys() {
    this.keysTracked.forEach((keyHeld) => {
      this.keysHeld[keyHeld] = false;
    });
  }

  @computed
  get dragMode() {
    for (const modeDef of this.modeDefs) {
      if (areKeysHeld(this.keysHeld, modeDef.keysHeld)) { return modeDef.mode; }
    }
    return this.defaultMode;
  }

  @modelAction
  resetHandler = () => {
    this.releaseHeldKeys();
  };

  onAttachedToRootStore():(() => void) {
    window.addEventListener('keyup', this.keyupHandler.bind(this));
    window.addEventListener('keydown', this.keydownHandler.bind(this));

    if (IS_ELECTRON_BUILD) {
      globalThis.ipcRenderer.on(EVENTS.RESET_DRAG_MODE, this.resetHandler);
    } else if (IS_WEB_BUILD) {
      window.addEventListener('blur', this.resetHandler);
    }
    return () => {
      window.removeEventListener('keyup', this.keyupHandler);
      window.removeEventListener('keydown', this.keydownHandler);

      if (IS_ELECTRON_BUILD) {
        globalThis.ipcRenderer.removeListener(EVENTS.RESET_DRAG_MODE, this.resetHandler);
      } else if (IS_WEB_BUILD) {
        window.removeEventListener('blur', this.resetHandler);
      }
    };
  }
}
