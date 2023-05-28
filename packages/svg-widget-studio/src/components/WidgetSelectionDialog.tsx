import {
  Avatar, Dialog, DialogTitle, List, ListItemAvatar, ListItemButton, ListItemText,
} from '@mui/material';
import { startCase } from 'lodash-es';
import React from 'react';
import { styled } from '@mui/styles';
import { widgetIconMap, widgetOptions } from '../models/WorkspaceModel';
import { useWorkspaceMst } from '../rootStore';

const WIDGET_DIALOG_TITLE_ID = 'widget-dialog-title';
export const classes = {
  widgetAvatar: 'workspace__widget-avatar',
  widgetName: 'workspace__widget-name',
};
const DialogStyled = styled(Dialog)(({ theme }) => ({
  [`& .${classes.widgetAvatar}`]: {
    bottom: theme.spacing(1),
    left: theme.spacing(1),
    position: 'absolute',
  },
  [`& .${classes.widgetName}`]: {
    marginLeft: theme.spacing(3),
    fontSize: '2em',
  },
}));
export const WidgetSelectionDialog = () => {
  const workspaceStore = useWorkspaceMst();
  const {
    selectedStore,
    selectedWidgetModelType,
  } = workspaceStore;

  return (
    <DialogStyled
      disableEscapeKeyDown={!selectedStore}
      disableRestoreFocus={!selectedStore}
      open={workspaceStore.widgetPickerOpen}
      aria-labelledby={WIDGET_DIALOG_TITLE_ID}
      onClose={(_, reason) => {
        // if no store, ensure choice is made
        if (reason === 'backdropClick' && !selectedStore) {
          return;
        }
        workspaceStore.setWidgetPickerOpen(false);
      }}
    >
      <DialogTitle id={WIDGET_DIALOG_TITLE_ID}>Select Widget</DialogTitle>
      <List>
        {
          Array.from(widgetOptions.keys())
            .map((widgetName) => (
              <ListItemButton
                key={widgetName}
                selected={selectedWidgetModelType === widgetName}
                onClick={() => {
                  workspaceStore.newWidgetStore(widgetName);
                  workspaceStore.setWidgetPickerOpen(false);
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={startCase(widgetName)}
                    className={classes.widgetAvatar}
                    src={widgetIconMap.get(widgetName)}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={startCase(widgetName)}
                  primaryTypographyProps={{ className: classes.widgetName }}
                />
              </ListItemButton>
            ))
        }
      </List>
    </DialogStyled>
  );
};
