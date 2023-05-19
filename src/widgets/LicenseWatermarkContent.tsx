import { DocumentMetadata } from '@/WidgetWorkspace/DocumentMetadata';
import { LicenseGroup } from '@/common/components/SVGWrapper/components/LicenseGroup';
import React from 'react';
import { WatermarkContentComponent } from '@/common/components/SVGWrapper';

export const LicenseWatermarkContent: WatermarkContentComponent = ({ viewBox }) => (
  <>
    <DocumentMetadata />
    <LicenseGroup viewBox={viewBox} />
  </>
);
