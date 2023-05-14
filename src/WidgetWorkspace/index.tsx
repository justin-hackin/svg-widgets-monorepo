import React, { useLayoutEffect } from 'react';
import { observer } from 'mobx-react';
import {
  Avatar, Dialog, DialogTitle, List, ListItemAvatar, ListItemButton, ListItemText,
} from '@mui/material';
import { kebabCase, startCase } from 'lodash';
import { styled } from '@mui/styles';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { ResizableZoomPan } from './components/ResizableZoomPan';
import { WidgetControlPanel } from './components/WidgetControlPanel';
import { FullPageDiv } from '../common/style/style';
import { DielineViewToolbar } from './components/DielineViewToolbar';
import { useWorkspaceMst } from './rootStore';
import { widgetOptions } from './models/WorkspaceModel';
import { FileInputs } from './components/FileInputs';
import 'react-reflex/styles.css';

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

const splitterSelector = '.reflex-splitter';
const StyledReflexContainer = styled(ReflexContainer)(({ theme }) => ({
  [`&.reflex-container > ${splitterSelector}`]: {
    borderColor: theme.palette.grey.A400,
  },
  [`&.reflex-container > ${splitterSelector}.active, &.reflex-container ${splitterSelector}:hover`]: {
    borderColor: theme.palette.primary.main,
  },

}));

export const WidgetWorkspace = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { selectedStore, selectedWidgetModelType } = workspaceStore;

  useLayoutEffect(() => {
    workspaceStore.fitToDocument();
  }, [workspaceStore?.selectedWidgetModelType]);

  // wrap with observer here so WidgetSVG can be rendered with ReactDOMServer for saving to string

  return (
    <>
      <WidgetWorkspaceStyled>
        {selectedStore && (
          <StyledReflexContainer orientation="vertical">
            <ReflexElement>
              <ResizableZoomPan SVGBackground="url(#grid-pattern)">
                {selectedStore.assetDefinition.WorkspaceView}
              </ResizableZoomPan>
            </ReflexElement>
            <ReflexSplitter />
            <ReflexElement>
              <WidgetControlPanel />
              <DielineViewToolbar />
            </ReflexElement>
          </StyledReflexContainer>
        )}
      </WidgetWorkspaceStyled>
      <FileInputs />
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
            Array.from(widgetOptions.keys()).map((widgetName) => (
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
