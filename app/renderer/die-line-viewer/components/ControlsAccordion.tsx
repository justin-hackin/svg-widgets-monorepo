import * as React from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { useStyles } from './style';

export const ControlsAccordion = ({ summary, children }) => {
  // @ts-ignore
  const classes = useStyles();
  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography className={classes.heading}>{summary}</Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.controlPaper}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};
