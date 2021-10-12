import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Typography } from '@mui/material';
import { styled } from '@mui/styles';

const MyDialog = styled(Dialog)({
  maxHeight: '90%',
});
const SimpleDialogContent = styled('div')(({ theme }) => ({
  overflow: 'auto',
  padding: theme.spacing(1),
}));

const CloseIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1),
  top: theme.spacing(1),
}));

export const SimpleDialog = ({
  isOpen, handleClose, title, children,
}) => (
  <MyDialog aria-labelledby="simple-dialog-title" open={isOpen}>
    <DialogTitle id="simple-dialog-title">
      <Typography>{title}</Typography>
      <CloseIconButton
        aria-label="close"
        onClick={handleClose}
        size="large"
      >
        <CloseIcon />
      </CloseIconButton>
    </DialogTitle>
    <SimpleDialogContent>
      { children }
    </SimpleDialogContent>
  </MyDialog>
);
