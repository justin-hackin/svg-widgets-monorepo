import { types } from 'mobx-state-tree';
import { includes, flatten } from 'lodash';

export const DRAG_MODES = {
  ROTATE: 'rotate',
  TRANSLATE: 'translate',
  SCALE_TEXTURE: 'scale texture',
  SCALE_VIEW: 'scale view',
};

const keyTrackingModelFactory = (keysToTrack, target = window) => {
  const ModelWithKeys = types.model(keysToTrack.reduce((acc, key) => {
    acc[key] = types.optional(types.boolean, false);
    return acc;
  }, {})).actions((self) => ({
    set(key, value) {
      self[key] = value;
    },
  }));

  return types.model(`KeyTracking--${keysToTrack.join('-')}`, {
    keysTracked: types.optional(types.array(types.string), keysToTrack),
    keysHeld: types.optional(ModelWithKeys, {}),
  }).volatile(() => ({ target }))
    .actions((self) => {
      const keyupHandler = (e) => {
        if (includes(self.keysTracked, e.key)) {
          self.keysHeld.set(e.key, false);
        }
      };
      const keydownHandler = (e) => {
        if (includes(self.keysTracked, e.key)) {
          self.keysHeld.set(e.key, true);
        }
      };

      return {
        afterCreate() {
          self.target.addEventListener('keyup', keyupHandler);
          self.target.addEventListener('keydown', keydownHandler);
        },
        beforeDestroy() {
          self.target.removeEventListener('keyup', keyupHandler);
          self.target.removeEventListener('keydown', keydownHandler);
        },
      };
    });
};

const modeDefs = [
  { mode: DRAG_MODES.SCALE_VIEW, keyOrKeysHeld: 'Alt' },
  { mode: DRAG_MODES.SCALE_TEXTURE, keyOrKeysHeld: 'Control' },
  { mode: DRAG_MODES.ROTATE, keyOrKeysHeld: 'Shift' },
];

const defaultMode = DRAG_MODES.TRANSLATE;
const allTrue = (array: boolean[]) => {
  for (const val of array) {
    if (val === false) { return false; }
  }
  return true;
};

const areKeysHeld = (trackerKeys, keyOrKeysHeld) => (Array.isArray(keyOrKeysHeld)
  ? allTrue(keyOrKeysHeld.map((key) => trackerKeys[key])) : trackerKeys[keyOrKeysHeld]);

const keysUsed = [...flatten(modeDefs.map(({ keyOrKeysHeld }) => keyOrKeysHeld)), defaultMode];
export const ModifierTrackingModel = keyTrackingModelFactory(keysUsed)
  .views((self) => ({
    get dragMode() {
      for (const modeDef of modeDefs) {
        if (areKeysHeld(self.keysHeld, modeDef.keyOrKeysHeld)) { return modeDef.mode; }
      }
      return defaultMode;
    },
  }));
