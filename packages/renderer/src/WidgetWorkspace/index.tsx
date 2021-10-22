import React, { useLayoutEffect, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Avatar, Dialog, DialogTitle, Fab, List, ListItem, ListItemAvatar, ListItemText,
} from '@material-ui/core';
import BuildIcon from '@material-ui/icons/Build';
import { startCase } from 'lodash';
import { ResizableZoomPan } from './components/ResizableZoomPan';
import { useWorkspaceMst } from './models/WorkspaceModel';
import { WidgetControlPanel } from './components/WidgetControlPanel';
import { useStyles } from '../common/style/style';

const WIDGET_DIALOG_TITLE_ID = 'widget-dialog-title';

export const WidgetWorkspace = observer(() => {
  const classes = useStyles();
  const workspaceStore = useWorkspaceMst();
  const { selectedStore, selectedWidgetName, widgetOptions } = workspaceStore;

  const [widgetPickerOpen, setWidgetPickerOpen] = useState<boolean>(false);

  useLayoutEffect(() => {
    workspaceStore.fitToDocument();
  }, [workspaceStore?.selectedWidgetName]);

  if (!selectedStore) { return null; }
  const { WorkspaceView } = selectedStore.assetDefinition;

  // wrap with observer here so WidgetSVG can be rendered with ReactDOMServer for saving to string

  return (
    <>
      <div className={classes.fullPage}>
        <ResizableZoomPan SVGBackground="url(#grid-pattern)">
          { WorkspaceView }
        </ResizableZoomPan>
        <Fab
          color="inherit"
          aria-label="open widget picker"
          onClick={() => {
            setWidgetPickerOpen(true);
          }}
          className={classes.widgetFab}
        >
          <BuildIcon />
        </Fab>
        <WidgetControlPanel />
      </div>
      <Dialog
        open={widgetPickerOpen}
        aria-labelledby={WIDGET_DIALOG_TITLE_ID}
        onClose={() => { setWidgetPickerOpen(false); }}
      >
        <DialogTitle id={WIDGET_DIALOG_TITLE_ID}>Select Widget</DialogTitle>
        <List>
          {
            Object.keys(widgetOptions).map((widgetName) => (
              <ListItem
                key={widgetName}
                selected={selectedWidgetName === widgetName}
                onClick={() => {
                  workspaceStore.setSelectedWidgetName(widgetName);
                  setWidgetPickerOpen(false);
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={startCase(widgetName)}
                    className={classes.widgetAvatar}
                    src={new URL(`../../static/images/widgets/${widgetName}.png`, import.meta.url).href}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={startCase(widgetName)}
                  primaryTypographyProps={{ className: classes.widgetName }}
                />
              </ListItem>
            ))
          }
        </List>
      </Dialog>
    </>
  );
});
