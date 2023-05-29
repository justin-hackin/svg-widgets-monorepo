import React, {
  ComponentProps, FunctionComponent, useLayoutEffect, useMemo,
} from 'react';
import { observer } from 'mobx-react';
import { useResizeDetector } from 'react-resize-detector';
import { styled } from '@mui/styles';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { WidgetControlPanel } from './WidgetControlPanel';
import { useWorkspaceMst } from '../rootStore';
import { FileInputs } from './FileInputs';
import 'react-reflex/styles.css';
import { FullPageDiv } from '../style';
import { WidgetDesignArea } from './WidgetDesignArea';
import { WidgetSelectionDialog } from './WidgetSelectionDialog';

const classes = {
  widgetFab: 'workspace__widget-fab',
};

const WidgetWorkspaceStyled = styled(FullPageDiv)(({ theme }) => ({
  [`& .${classes.widgetFab}`]: {
    bottom: theme.spacing(1),
    left: theme.spacing(1),
    position: 'absolute',
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

export type Orientation = NonNullable<ComponentProps<typeof ReflexContainer>['orientation']>;
type WidgetWorkspaceOptionalProps = {
  panelOrientation: Orientation | undefined,
  maxPanelWidthPercent: number,
  minPanelWidthPercent: number,
};

export const WidgetWorkspace: FunctionComponent<Partial<WidgetWorkspaceOptionalProps>> = observer(({
  panelOrientation, maxPanelWidthPercent = 50, minPanelWidthPercent = 25,
}) => {
  const workspaceStore = useWorkspaceMst();
  const { width, height, ref } = useResizeDetector();

  const { selectedStore, selectedWidgetModelType, preferences } = workspaceStore;
  const { panelSizePercent, panelOrientation: preferencesPanelOrientation } = preferences;
  const resolvedPanelOrientation = panelOrientation || preferencesPanelOrientation;

  useLayoutEffect(() => {
    workspaceStore.zoomPanView.fitToDocument();
  }, [selectedWidgetModelType]);
  const dimensionValue = resolvedPanelOrientation === 'vertical' ? width : height;
  const maxPanelSize = useMemo(
    () => dimensionValue && dimensionValue * (maxPanelWidthPercent / 100),
    [dimensionValue, resolvedPanelOrientation],
  );
  const minPanelSize = useMemo(
    () => dimensionValue && dimensionValue * (minPanelWidthPercent / 100),
    [dimensionValue, resolvedPanelOrientation],
  );
  const panelSize = useMemo(
    () => dimensionValue && dimensionValue * (panelSizePercent / 100),
    [dimensionValue, resolvedPanelOrientation],
  );

  return (
    <div ref={ref}>
      <WidgetWorkspaceStyled>
        {selectedStore && width && (
          <StyledReflexContainer orientation={resolvedPanelOrientation}>
            <ReflexElement>
              <WidgetDesignArea
                orientation={resolvedPanelOrientation}
                showOrientationToggle={!panelOrientation}
              />
            </ReflexElement>
            <ReflexSplitter />
            <ReflexElement
              onResize={({ domElement }) => {
                preferences.setPanelSizePercent(
                  ((domElement as HTMLDivElement).getBoundingClientRect().width / width) * 100,
                );
              }}
              minSize={minPanelSize}
              maxSize={maxPanelSize}
              size={panelSize}
            >
              <WidgetControlPanel />
            </ReflexElement>
          </StyledReflexContainer>
        )}
      </WidgetWorkspaceStyled>
      <FileInputs />
      <WidgetSelectionDialog />
    </div>
  );
});
