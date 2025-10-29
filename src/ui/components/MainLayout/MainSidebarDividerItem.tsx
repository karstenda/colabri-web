import * as React from 'react';
import Divider from '@mui/material/Divider';
import type {} from '@mui/material/themeCssVarsAugmentation';
import MainSidebarContext from '../../context/MainSidebarContext';
import { getDrawerSxTransitionMixin } from '../../mixins';

export default function MainSidebarDividerItem() {
  const sidebarContext = React.useContext(MainSidebarContext);
  if (!sidebarContext) {
    throw new Error('Sidebar context was used without a provider.');
  }
  const { fullyExpanded = true, hasDrawerTransitions } = sidebarContext;

  return (
    <li>
      <Divider
        sx={{
          borderBottomWidth: 1,
          my: 1,
          mx: -0.5,
          ...(hasDrawerTransitions
            ? getDrawerSxTransitionMixin(fullyExpanded, 'margin')
            : {}),
        }}
      />
    </li>
  );
}
