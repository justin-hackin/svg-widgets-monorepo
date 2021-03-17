import { Button, Tooltip } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../../common/constants';

export const AdditionalToolbarContent = () => (
  <Link
    to={ROUTES.TEXTURE_EDITOR}
    component={<span>LOOOL</span>}
  />
);
