// This theme was extracted from the Material UI website dark theme via dev tools
// commented lines violate typescript types, did type defs schema change?

import { ThemeOptions } from '@mui/material';

export const darkThemeOptions: ThemeOptions = {
  mixins: {
    toolbar: {
      minHeight: 56,
      '@media (min-width:0px) and (orientation: landscape)': {
        minHeight: 48,
      },
      '@media (min-width:600px)': {
        minHeight: 64,
      },
    },
  },

};
