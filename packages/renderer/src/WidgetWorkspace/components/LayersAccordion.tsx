import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@material-ui/core';
import React from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useStyles } from '../../common/style/style';

export const LayersAccordion = ({ layers }) => {
  const classes = useStyles();

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography className={classes.heading}>Accordion 1</Typography>
      </AccordionSummary>
      <AccordionDetails>

      </AccordionDetails>
    </Accordion>
  );
};
