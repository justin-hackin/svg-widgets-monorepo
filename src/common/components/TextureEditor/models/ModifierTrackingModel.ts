// eslint-disable-next-line max-classes-per-file
import { includes, flatten } from 'lodash';
import {
  Model, model, modelAction, prop,
} from 'mobx-keystone';
import { computed } from 'mobx';
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


const keyTrackingModelFactory = (keysToTrack, target = window) => {
  const trackedKeysStr = keysToTrack.join('-');
  @model(`ModelWithKeys--${trackedKeysStr}`)
  class ModelWithKeys extends Model(keysToTrack.reduce((acc, key) => {
      acc[key] = prop(false);
      return acc;
    }, {})) {
    @modelAction
    set(key, value) {
      this[key] = value;
    }
  }

  @model(`KeyTracking--${trackedKeysStr}`)
  class KeyTrackingModel extends Model({
      keysTracked: prop<string[]>(keysToTrack),
      keysHeld: prop<ModelWithKeys>(() => (new ModelWithKeys({}))),
    }) {
    target = target;

    keyupHandler = (e) => {
      if (includes(this.keysTracked, e.key)) {
        this.keysHeld.set(e.key, false);
      }
    };

    keydownHandler = (e) => {
      if (includes(this.keysTracked, e.key)) {
        this.keysHeld.set(e.key, true);
      }
    };

    onAttachedToRootStore(rootStore) {
      super.onAttachedToRootStore(rootStore);
      this.target.addEventListener('keyup', this.keyupHandler);
      this.target.addEventListener('keydown', this.keydownHandler);
      return () => {
        this.target.removeEventListener('keyup', this.keyupHandler);
        this.target.removeEventListener('keydown', this.keydownHandler);
      };
    }

    @modelAction
    releaseHeldKeys() {
      this.keysTracked.forEach((keyHeld) => {
        this.keysHeld.set(keyHeld, false);
      });
    }
  }
  return KeyTrackingModel;
};

// sorted in order of precedence, first match becomes mode
const defaultMode = DRAG_MODES.TRANSLATE;
const modeDefs = [
  { mode: DRAG_MODES.TRANSLATE_HORIZONTAL, keyOrKeysHeld: ['Alt', 'Control'] },
  { mode: DRAG_MODES.TRANSLATE_VERTICAL, keyOrKeysHeld: ['Control', 'Shift'] },
  { mode: DRAG_MODES.SCALE_VIEW, keyOrKeysHeld: 'Alt' },
  { mode: DRAG_MODES.SCALE_TEXTURE, keyOrKeysHeld: 'Control' },
  { mode: DRAG_MODES.ROTATE, keyOrKeysHeld: 'Shift' },
];

const allTrue = (array: boolean[]) => {
  for (const val of array) {
    if (val === false) { return false; }
  }
  return true;
};

const areKeysHeld = (trackerKeys, keyOrKeysHeld) => (Array.isArray(keyOrKeysHeld)
  ? allTrue(keyOrKeysHeld.map((key) => trackerKeys[key])) : trackerKeys[keyOrKeysHeld]);

const keysUsed = [...flatten(modeDefs.map(({ keyOrKeysHeld }) => keyOrKeysHeld)), defaultMode];

export class ModifierTrackingModel extends keyTrackingModelFactory(keysUsed) {
  @computed
  get dragMode() {
    for (const modeDef of modeDefs) {
      if (areKeysHeld(this.keysHeld, modeDef.keyOrKeysHeld)) { return modeDef.mode; }
    }
    return defaultMode;
  }

  @modelAction
  resetHandler = () => {
    this.releaseHeldKeys();
  };

  onAttachedToRootStore(rootStore) {
    super.onAttachedToRootStore(rootStore);
    if (IS_ELECTRON_BUILD) {
      globalThis.ipcRenderer.on(EVENTS.RESET_DRAG_MODE, this.resetHandler);
    } else if (IS_WEB_BUILD) {
      window.addEventListener('blur', this.resetHandler);
    }
    return () => {
      if (IS_ELECTRON_BUILD) {
        globalThis.ipcRenderer.removeListener(EVENTS.RESET_DRAG_MODE, this.resetHandler);
      } else if (IS_WEB_BUILD) {
        window.removeEventListener('blur', this.resetHandler);
      }
    };
  }
}
