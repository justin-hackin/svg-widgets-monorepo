import React from 'react';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { styled } from '@mui/styles';
import { FileMenuItem } from '../widget-types/BaseWidgetClass';

const ListItemIconStyled = styled(ListItemIcon)(({ theme }) => ({
  minWidth: theme.spacing(4),
}));
export function AdditionalFileMenuItems({ resetFileMenuRef, additionalFileMenuItems }
: { resetFileMenuRef: Function, additionalFileMenuItems: FileMenuItem[] }) {
  return (
    <>
      {additionalFileMenuItems.map(({ MenuIcon, menuText, action }) => (
        <MenuItem onClick={async () => {
          await action();
          resetFileMenuRef();
        }}
        >
          <ListItemIconStyled>
            <MenuIcon fontSize="small" />
          </ListItemIconStyled>
          <ListItemText primary={menuText} />
        </MenuItem>
      ))}
    </>
  );
}
