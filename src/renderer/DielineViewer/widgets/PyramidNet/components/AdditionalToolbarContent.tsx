import { Button, Tooltip } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../../main/ipc';

export const AdditionalToolbarContent = () => (
  <>
    <Tooltip title="Open/reveal texture editor" arrow>
      <Button
        color="inherit"
        startIcon={<OpenInNewIcon />}
      >
        Texture
      </Button>
    </Tooltip>
    <Link to={ROUTES.TEXTURE_EDITOR}>Texture</Link>
  </>
);
