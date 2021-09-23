import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Dialog, Fab, List, ListItem, ListItemText, DialogTitle, ListItemAvatar, Avatar,
} from '@material-ui/core';
import BuildIcon from '@material-ui/icons/Build';
import { startCase } from 'lodash';

import { GridPattern } from './components/ResizableZoomPan/components/GridPattern';
import { ResizableZoomPan } from './components/ResizableZoomPan';
import { useWorkspaceMst } from './models/WorkspaceModel';
import { WidgetControlPanel } from './components/WidgetControlPanel';
import { useStyles } from '../common/style/style';

const WIDGET_DIALOG_TITLE_ID = 'widget-dialog-title';
const patternId = 'grid-pattern';

export const WidgetWorkspace = observer(() => {
  const [widgetPickerOpen, setWidgetPickerOpen] = useState<boolean>(false);
  const workspaceStore = useWorkspaceMst();
  const classes = useStyles();

  if (!workspaceStore.selectedStore) {
    return null;
  }
  const {
    selectedStore: {
      WidgetSVG, documentAreaProps,
    },
    selectedWidgetName,
    selectedControlPanelProps, widgetOptions,
  } = workspaceStore;

  // wrap with observer here so WidgetSVG can be rendered with ReactDOMServer for saving to string
  const ObserverWidgetSVG = useMemo(() => (observer(WidgetSVG)), [WidgetSVG]);

  return (
    <>
      <div className={classes.fullPage}>
        <ResizableZoomPan SVGBackground={`url(#${patternId})`}>
          <svg {...documentAreaProps}>
            <GridPattern patternId={patternId} />
            <ObserverWidgetSVG />
          </svg>
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
        {/* @ts-ignore */}
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
                  workspaceStore.setSelectedWidgetName(widgetName);
                  setWidgetPickerOpen(false);
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={startCase(widgetName)}
                    className={classes.widgetAvatar}
                    src={new URL(`../../static/images/widgets/${widgetName}.jpg`, import.meta.url).href}
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
