import React from 'react';
import {
  ListItemIcon, ListItemText, MenuItem, SvgIcon,
} from '@mui/material';
import { styled } from '@mui/styles';

const ListItemIconStyled = styled(ListItemIcon)(({ theme }) => ({
  minWidth: theme.spacing(4),
}));

export interface FileMenuItem {
  action: Function,
  MenuIcon: typeof SvgIcon,
  menuText: string,
}

export function AdditionalFileMenuItems({ resetFileMenuRef, additionalFileMenuItems }
: { resetFileMenuRef: Function, additionalFileMenuItems: FileMenuItem[] }) {
  return (
    <>
      {additionalFileMenuItems.map(({ MenuIcon, menuText, action }, index) => (
        <MenuItem
          key={index}
          onClick={async () => {
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
