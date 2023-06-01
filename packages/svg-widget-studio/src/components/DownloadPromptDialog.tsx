import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export function DownloadPromptDialog(
  {
    open, handleClose, initialValue = '',
  }:
  { open: boolean, handleClose: (txt: string)=>void, initialValue: string | undefined },
) {
  const [inputText, setInputText] = useState(initialValue);
  useEffect(() => {
    setInputText(initialValue || '');
  }, [initialValue]);

  return (
    <Dialog open={open}>
      <DialogTitle>Download</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Choose basename for the zip file containing SVG assets and .widget specification file:
        </DialogContentText>
        <TextField
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handleClose(inputText);
            }
          }}
          autoFocus
          margin="dense"
          label="Download file basename"
          type="text"
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          handleClose(inputText);
        }}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
}
