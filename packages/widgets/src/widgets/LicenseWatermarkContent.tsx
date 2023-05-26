import React from 'react';
import { DocumentMetadata } from '@/WidgetWorkspace/DocumentMetadata';
import { LicenseGroup } from '@/common/components/SVGWrapper/components/LicenseGroup';
import { WatermarkContentComponent } from '@/common/components/SVGWrapper';
import { castToViewBox } from '@/WidgetWorkspace/widget-types/types';

export const LicenseWatermarkContent: WatermarkContentComponent = ({ documentAreaProps }) => (
  <>
    <DocumentMetadata />
    <LicenseGroup viewBox={castToViewBox(documentAreaProps)} />
  </>
);
