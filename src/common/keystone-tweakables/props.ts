import { prop } from 'mobx-keystone';
import uuid from 'uuid/v4';

import { ControllablePrimitiveModel } from './models/ControllablePrimitiveModel';
import { ControllablePrimitiveWithOptionsModel } from './models/ControllablePrimitiveWithOptionsModel';
import { propertyMetadataCtx } from './data';
import { ControllableReferenceWithOptionsModel } from './models/ControllableReferenceWithOptionsModel';
import {
  ColorPickerMetadata, INPUT_TYPE,
  NumberTextMetadata,
  PrimitiveMetadata, RadioMetadata,
  ReferenceRadioMetadata,
  ReferenceSelectMetadata, SelectMetadata, SliderMetadata,
  SliderWithTextMetadata, SwitchMetadata, WithOptionsMetadata,
} from './types';

export function controllablePrimitiveProp<T, M extends PrimitiveMetadata>(value: T, metadata: M) {
  return prop<ControllablePrimitiveModel<T, M>>(() => propertyMetadataCtx.apply(
    () => new ControllablePrimitiveModel<T, M>({
      value,
      $modelId: uuid(),
    }), metadata,
  ));
}

export const sliderProp = (
  value: number, metadata: Omit<SliderMetadata, 'type'>,
) => controllablePrimitiveProp<number, SliderMetadata>(
  value, { type: INPUT_TYPE.SLIDER, ...metadata },
);
export const sliderWithTextProp = (
  value: number, metadata: Omit<SliderWithTextMetadata, 'type'>,
) => controllablePrimitiveProp<number, SliderWithTextMetadata>(
  value, { type: INPUT_TYPE.SLIDER_WITH_TEXT, ...metadata },
);
export const colorPickerProp = (value: string) => controllablePrimitiveProp<string, ColorPickerMetadata>(
  value, { type: INPUT_TYPE.COLOR_PICKER },
);

function controllablePrimitiveWithOptionsProp<T, M extends WithOptionsMetadata<T>>(
  value: T, metadata: M,
) {
  return prop<ControllablePrimitiveWithOptionsModel<T, M>>(() => propertyMetadataCtx.apply(
    () => new ControllablePrimitiveWithOptionsModel<T, M>({
      value,
      $modelId: uuid(),
    }), metadata,
  ));
}

export function radioProp<T>(
  value: T, metadata: Omit<RadioMetadata<T>, 'type'>,
) {
  return controllablePrimitiveWithOptionsProp<T, RadioMetadata<T>>(
    value, { type: INPUT_TYPE.RADIO, ...metadata },
  );
}

export function selectProp<T>(
  value: T, metadata: Omit<SelectMetadata<T>, 'type'>,
) {
  return controllablePrimitiveWithOptionsProp<T, SelectMetadata<T>>(
    value, { type: INPUT_TYPE.SELECT, ...metadata },
  );
}

// TODO: consider default label override + context for units on label
export const numberTextProp = (
  value: number, metadata?: Omit<NumberTextMetadata, 'type'>,
) => controllablePrimitiveProp<number, NumberTextMetadata>(
  value, { type: INPUT_TYPE.NUMBER_TEXT, ...metadata },
);

export function referenceSelectProp<T extends object>(metadata: Omit<ReferenceSelectMetadata<T>, 'type'>) {
  const defaultFn = () => propertyMetadataCtx.apply(
    () => new ControllableReferenceWithOptionsModel<T, ReferenceSelectMetadata<T>>({}),
    { type: INPUT_TYPE.REFERENCE_SELECT, ...metadata },
  );
  return prop<ControllableReferenceWithOptionsModel<T, ReferenceSelectMetadata<T>>>(defaultFn);
}

export function referenceRadioProp<T extends object>(metadata: Omit<ReferenceRadioMetadata<T>, 'type'>) {
  return prop<ControllableReferenceWithOptionsModel<T, ReferenceRadioMetadata<T>>>(() => propertyMetadataCtx.apply(
    () => new ControllableReferenceWithOptionsModel<T, ReferenceRadioMetadata<T>>({}), {
      type: INPUT_TYPE.REFERENCE_RADIO, ...metadata,
    },
  ));
}

export const switchProp = (value: boolean) => controllablePrimitiveProp<boolean, SwitchMetadata>(
  value, { type: INPUT_TYPE.SWITCH },
);
