import React, { useLayoutEffect } from 'react';
import { observer } from 'mobx-react';
import {
  Avatar, Dialog, DialogTitle, List, ListItemAvatar, ListItemButton, ListItemText,
} from '@mui/material';
import { kebabCase, startCase } from 'lodash';
import { styled } from '@mui/styles';
import { ResizableZoomPan } from './components/ResizableZoomPan';
import { useWorkspaceMst } from './models/WorkspaceModel';
import { WidgetControlPanel } from './components/WidgetControlPanel';
import { FullPageDiv } from '../common/style/style';
import { DielineViewToolbar } from './components/DielineViewToolbar';

const WIDGET_DIALOG_TITLE_ID = 'widget-dialog-title';
const CLASS_BASE = 'workspace';
const classes = {
  widgetFab: `${CLASS_BASE}__widget-fab`,
  widgetAvatar: `${CLASS_BASE}__widget-avatar`,
  widgetName: `${CLASS_BASE}__widget-name`,
};

const WidgetWorkspaceStyled = styled(FullPageDiv)(({ theme }) => ({
  [`& .${classes.widgetFab}`]: {
    bottom: theme.spacing(1),
    left: theme.spacing(1),
    position: 'absolute',
  },

}));

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

export const WidgetWorkspace = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { selectedStore, selectedWidgetName, widgetOptions } = workspaceStore;

  useLayoutEffect(() => {
    workspaceStore.fitToDocument();
  }, [workspaceStore?.selectedWidgetName]);

  // wrap with observer here so WidgetSVG can be rendered with ReactDOMServer for saving to string

  return (
    <>
      <WidgetWorkspaceStyled>
        {selectedStore && (
          <>
            <ResizableZoomPan SVGBackground="url(#grid-pattern)">
              { selectedStore.assetDefinition.WorkspaceView }
            </ResizableZoomPan>
            <WidgetControlPanel />
            <DielineViewToolbar />
          </>
        )}
      </WidgetWorkspaceStyled>
      <DialogStyled
        open={workspaceStore.widgetPickerOpen}
        aria-labelledby={WIDGET_DIALOG_TITLE_ID}
        onClose={() => { workspaceStore.setWidgetPickerOpen(false); }}
      >
        <DialogTitle id={WIDGET_DIALOG_TITLE_ID}>Select Widget</DialogTitle>
        <List>
          {
            Array.from(widgetOptions.keys()).map((widgetName) => (
              <ListItemButton
                key={widgetName}
                selected={selectedWidgetName === widgetName}
                onClick={() => {
                  workspaceStore.selectedWidgetName = widgetName;
                  workspaceStore.setWidgetPickerOpen(false);
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={startCase(widgetName)}
                    className={classes.widgetAvatar}
                    src={new URL(`../../static/images/widgets/${kebabCase(widgetName)}.png`, import.meta.url).href}
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
    </>
  );
});
