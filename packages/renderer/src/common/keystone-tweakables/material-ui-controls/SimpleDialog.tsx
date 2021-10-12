import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Typography } from '@mui/material';
import { styled } from '@mui/styles';

const CLASS_BASE = 'simple-dialog';
const classes = {
  dialogContent: `${CLASS_BASE}__dialog-content`,
  closeIconButton: `${CLASS_BASE}__close-icon-button`,
};

const MyDialog = styled(Dialog)(({ theme }) => ({
  maxHeight: '90%',
  [`& .${classes.dialogContent}`]: {
    overflow: 'auto',
    padding: theme.spacing(1),
  },
  [`& .${classes.closeIconButton}`]: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

export const SimpleDialog = ({
  isOpen, handleClose, title, children,
}) => (
  <MyDialog aria-labelledby="simple-dialog-title" open={isOpen}>
    <DialogTitle id="simple-dialog-title">
      <Typography>{title}</Typography>
      <IconButton
        className={classes.closeIconButton}
        aria-label="close"
        onClick={handleClose}
        size="large"
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <div className={classes.dialogContent}>
      { children }
    </div>
  </MyDialog>
);
