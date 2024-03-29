import React from 'react';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { styled } from '@mui/styles';
import { FileMenuItem } from '../types';

const ListItemIconStyled = styled(ListItemIcon)(({ theme }) => ({
  minWidth: theme.spacing(4),
}));

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
