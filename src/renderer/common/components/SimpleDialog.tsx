import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Typography } from '@material-ui/core';
import { useStyles } from '../../DielineViewer/style';

export const SimpleDialog = ({
  isOpen, handleClose, title, children,
}) => {
  const classes = useStyles();

  return (
    <Dialog aria-labelledby="simple-dialog-title" open={isOpen}>
      <DialogTitle disableTypography id="simple-dialog-title">
        <Typography variant="h6">{title}</Typography>
        <IconButton
          aria-label="close"
          className={classes.closeDialogButton}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      { children }
    </Dialog>
  );
};
