import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Checkbox,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { observer } from 'mobx-react';
import { styled } from '@mui/styles';
import { BaseAssetDefinition } from '../widget-types/types';
import { RegisteredAssetsDefinition } from '../widget-types/RegisteredAssetsDefinition';
import { DisjunctAssetsDefinition } from '../widget-types/DisjunctAssetsDefinition';
import { SolitaryAssetDefinition } from '../widget-types/SolitaryAssetDefinition';
import { SimpleSwitch } from '../../common/keystone-tweakables/material-ui-controls/SimpleSwitch';

const CLASS_BASE = 'assets-accordion';
const classes = {
  heading: `${CLASS_BASE}__heading`,
  listItemText: `${CLASS_BASE}__list-item-text`,
  details: `${CLASS_BASE}__details`,

};

const AccordionStyled = styled(Accordion)(({ theme }) => ({
  [`& .${classes.heading}`]: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  [`& .${classes.listItemText}`]: {
    paddingRight: '1em',
  },
  [`& .${classes.details}`]: {
    paddingTop: 0,
    paddingBottom: '0.5em',
    display: 'block',
  },
}));

export const AssetsAccordion = observer(({ assetDefinition } : { assetDefinition: BaseAssetDefinition }) => {
  if (assetDefinition instanceof SolitaryAssetDefinition) {
    return null;
  }
  return (
    <AccordionStyled>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="assets-accordion-content"
        id="assets-accordion-header"
      >
        <Typography className={classes.heading}>Assets</Typography>
      </AccordionSummary>
      <AccordionDetails>
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
          {(assetDefinition as RegisteredAssetsDefinition).members.map((member, index) => {
            const labelId = `visibility-label-${member.name}`;
            return (
              <ListItem
                key={index}
                dense
                {...(assetDefinition instanceof DisjunctAssetsDefinition ? {
                  onClick: () => {
                    assetDefinition.setSelectedMember(index);
                  },
                  disabled: assetDefinition.overlayModeEnabled,
                  selected: !assetDefinition.overlayModeEnabled && assetDefinition.selectedMember === index,
                } : {})}
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
                <ListItemText className={classes.listItemText} id={labelId} primary={`${member.name}`} />
                {member.copies !== undefined && (
                  <Chip avatar={<Avatar>×</Avatar>} label={member.copies} />
                )}

              </ListItem>
            );
          })}
        </List>
      </AccordionDetails>
    </AccordionStyled>
  );
});
