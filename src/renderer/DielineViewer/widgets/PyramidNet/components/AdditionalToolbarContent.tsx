import { Button, Tooltip } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../../../../common/constants';

export const AdditionalToolbarContent = () => {
  const history = useHistory();
  return (
    <Tooltip title="Open/reveal texture editor" arrow>
      <Button
        color="inherit"
        startIcon={<OpenInNewIcon />}
        onClick={() => { history.push(ROUTES.TEXTURE_EDITOR); }}
      >
        Texture
      </Button>
    </Tooltip>
  );
};
