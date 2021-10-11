import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Checkbox, Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import React from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { observer } from 'mobx-react';
import { useStyles } from '../../common/style/style';
import { AssetDefinition } from '../widget-types/types';
import { RegisteredAssetsDefinition } from '../widget-types/RegisteredAssetsDefinition';
import { DisjunctAssetsDefinition } from '../widget-types/DisjunctAssetsDefinition';
import { SolitaryAssetDefinition } from '../widget-types/SolitaryAssetDefinition';
import { SimpleSwitch } from '../../common/keystone-tweakables/material-ui-controls/SimpleSwitch';

export const AssetsAccordion = observer(({ assetDefinition } : { assetDefinition: AssetDefinition }) => {
  const classes = useStyles();
  if (assetDefinition instanceof SolitaryAssetDefinition) {
    return null;
  }
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="assets-accordion-content"
        id="assets-accordion-header"
      >
        <Typography className={classes.heading}>Assets</Typography>
      </AccordionSummary>
      <AccordionDetails classes={{
        root: classes.assetsAccordionDetailsRoot,
      }}
      >
        {assetDefinition instanceof DisjunctAssetsDefinition && assetDefinition.allowOverlayMode && (
          <SimpleSwitch
            name="overlayModeEnabled"
            label="Overlay mode"
            value={assetDefinition.overlayModeEnabled}
            onChange={(_, checked) => {
              assetDefinition.setOverlayModeEnabled(checked);
            }}
          />
        )}
        <List disablePadding>
          {assetDefinition.members.map((member, index) => {
            const labelId = `visibility-label-${member.name}`;
            return (
              <ListItem
                key={index}
                dense
                {...(assetDefinition instanceof DisjunctAssetsDefinition ? {
                  button: true,
                  onClick: () => {
                    assetDefinition.setSelectedMember(index);
                  },
                  disabled: assetDefinition.overlayModeEnabled,
                  selected: !assetDefinition.overlayModeEnabled && assetDefinition.selectedMember === index,
                } : undefined)}
              >
                {assetDefinition instanceof RegisteredAssetsDefinition && (
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={assetDefinition.memberVisibility[index]}
                      tabIndex={-1}
                      disableRipple
                      icon={<VisibilityOffIcon />}
                      checkedIcon={<VisibilityIcon />}
                      inputProps={{ 'aria-labelledby': labelId }}
                      onChange={(_, checked) => {
                        assetDefinition.setMemberVisibility(index, checked);
                      }}
                    />
                  </ListItemIcon>
                )}
                <ListItemText className={classes.assetListItemText} id={labelId} primary={`${member.name}`} />
                {member.copies !== undefined && (
                  <Chip avatar={<Avatar>×</Avatar>} label={member.copies} />
                )}

              </ListItem>
            );
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  );
});
