// import { useQueryParam, StringParam, JsonParam } from 'use-query-params';
import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { ThemeProvider } from '@material-ui/styles';
import {
  createMuiTheme, Dialog, Fab, List, ListItem, ListItemText, DialogTitle, ListItemAvatar, Avatar,
} from '@material-ui/core';
import BuildIcon from '@material-ui/icons/Build';
import { startCase } from 'lodash';

import darkTheme from './data/material-ui-dark-theme';
import { GridPattern } from './components/ResizableZoomPan/components/GridPattern';
import { ResizableZoomPan } from './components/ResizableZoomPan';
import {
  IWorkspaceModel, useWorkspaceMst, WorkspaceStoreProvider,
} from './models/WorkspaceModel';
import { WidgetControlPanel } from './components/WidgetControlPanel';
import { useStyles } from './style';
import requireStatic from '../requireStatic';

const WIDGET_DIALOG_TITLE_ID = 'widget-dialog-title';
const patternId = 'grid-pattern';
// @ts-ignore
const theme = createMuiTheme(darkTheme);

export const DielineViewerLOC = observer(() => {
  const [widgetPickerOpen, setWidgetPickerOpen] = useState<boolean>(false);
  const {
    svgDimensions, selectedStore,
    SelectedControlledSvgComponent, selectedWidgetName, setSelectedWidgetName, selectedControlPanelProps, widgetOptions,
  } = useWorkspaceMst() as IWorkspaceModel;
  const classes = useStyles();

  if (!selectedStore) {
    return null;
  }
  return (
    <>
      <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
        <ResizableZoomPan SVGBackground={`url(#${patternId})`}>
          <svg {...svgDimensions}>
            <GridPattern patternId={patternId} />
            <SelectedControlledSvgComponent />
          </svg>
        </ResizableZoomPan>
        <Fab
          color="inherit"
          aria-label="open widget picker"
          onClick={() => {
            setWidgetPickerOpen(true);
          }}
          className={classes.widgetButton}
        >
          <BuildIcon />
        </Fab>
        <WidgetControlPanel {...selectedControlPanelProps} />
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
                  setSelectedWidgetName(widgetName);
                  setWidgetPickerOpen(false);
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={startCase(widgetName)}
                    className={classes.widgetAvatar}
                    src={
                    requireStatic(`images/widgets/${widgetName}.jpg`)
                  }
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

export const DielineViewer = observer(() => (
  <ThemeProvider theme={theme}>
    <WorkspaceStoreProvider>
      <DielineViewerLOC />
    </WorkspaceStoreProvider>
  </ThemeProvider>
));
