import React from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { useStyles } from './style';

export const ControlsExpansionPanel = ({ summary, children }) => {
  // @ts-ignore
  const classes = useStyles();
  return (
    <ExpansionPanel defaultExpanded>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography className={classes.heading}>{summary}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.controlPaper}>
        {children}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
