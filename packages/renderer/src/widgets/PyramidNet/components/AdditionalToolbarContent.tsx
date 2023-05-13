import { IconButton, SvgIcon, Tooltip } from '@mui/material';
import React, { MouseEventHandler } from 'react';

export interface AdditionalToolbarItem {
  ButtonIcon: typeof SvgIcon,
  tooltipText: string,
  action: MouseEventHandler,
}

export function AdditionalToolbarContent({ additionalToolbarContent }:
{ additionalToolbarContent: AdditionalToolbarItem[] }) {
  return (
    <>
      {additionalToolbarContent.map(({ tooltipText, action, ButtonIcon }, index) => (
        <Tooltip key={index} title={tooltipText} arrow>
          <IconButton
            onClick={action}
          >
            <ButtonIcon />
          </IconButton>
        </Tooltip>
      ))}
    </>
  );
}
