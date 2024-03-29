import React from 'react';
import { castToViewBox, DocumentMetadata, WatermarkContentComponent } from 'svg-widget-studio';
import { LicenseGroup } from '@/common/components/LicenseGroup';

export const LicenseWatermarkContent: WatermarkContentComponent = ({ documentArea }) => (
  <>
    <DocumentMetadata />
    <LicenseGroup viewBox={castToViewBox(documentArea)} />
  </>
);
