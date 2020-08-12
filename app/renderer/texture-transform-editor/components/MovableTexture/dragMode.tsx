import {useEffect, useState} from 'react';

export const DRAG_MODES = {
  ROTATE: 'rotate',
  TRANSLATE: 'translate',
  SCALE_TEXTURE: 'scale texture',
  SCALE_VIEW: 'scale view',
};

export function useDragMode() {
  const [pressed, setPressed] = useState({ Shift: false, Alt: false, Control: false });

  useEffect(() => {
    const createHandler = (keyName, value: boolean) => (e) => {
      if (e.key === keyName) {
        setPressed((oldPressed) => ({
          ...oldPressed,
          ...{ [keyName]: value },
        }));
      }
    };

    const createHandlers = (keyName) => [
      window.addEventListener('keydown', createHandler(keyName, true)),
      window.addEventListener('keyup', createHandler(keyName, false)),
    ];

    const shiftHandlers = createHandlers('Shift');
    const altHandlers = createHandlers('Alt');
    const controlHandlers = createHandlers('Control');


    return () => {
      [shiftHandlers, altHandlers, controlHandlers].forEach(([keydown, keyup]) => {
        window.removeEventListener('keydown', keydown);
        window.removeEventListener('keyup', keyup);
      });
    };
  }, []);

  if (pressed.Alt) {
    return DRAG_MODES.SCALE_VIEW;
  }
  if (pressed.Control) {
    return DRAG_MODES.SCALE_TEXTURE;
  }
  if (pressed.Shift) {
    return DRAG_MODES.ROTATE;
  }
  return DRAG_MODES.TRANSLATE;
}
