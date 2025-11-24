import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import type {} from '@mui/material/themeCssVarsAugmentation';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import LabelIcon from '@mui/icons-material/Label';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import LanguageIcon from '@mui/icons-material/Language';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import TitleIcon from '@mui/icons-material/Title';
import { matchPath, useLocation } from 'react-router';
import MainSidebarContext from '../../context/MainSidebarContext';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../../constants';
import MainSidebarPageItem from './MainSidebarPageItem';
import MainSidebarHeaderItem from './MainSidebarHeaderItem';
import MainSidebarDividerItem from './MainSidebarDividerItem';
import {
  getDrawerSxTransitionMixin,
  getDrawerWidthTransitionMixin,
} from '../../mixins';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';

export interface MainSidebarProps {
  expanded?: boolean;
  setExpanded: (expanded: boolean) => void;
  disableCollapsibleSidebar?: boolean;
  container?: Element;
}

export default function MainSidebar({
  expanded = true,
  setExpanded,
  disableCollapsibleSidebar = false,
  container,
}: MainSidebarProps) {
  const theme = useTheme();

  const { pathname } = useLocation();

  const [expandedItemIds, setExpandedItemIds] = React.useState<string[]>([]);

  const isOverSmViewport = useMediaQuery(theme.breakpoints.up('sm'));
  const isOverMdViewport = useMediaQuery(theme.breakpoints.up('md'));

  const [isFullyExpanded, setIsFullyExpanded] = React.useState(expanded);
  const [isFullyCollapsed, setIsFullyCollapsed] = React.useState(!expanded);

  const organization = useOrganization();

  React.useEffect(() => {
    if (expanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsFullyExpanded(true);
      }, theme.transitions.duration.enteringScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsFullyExpanded(false);

    return () => {};
  }, [expanded, theme.transitions.duration.enteringScreen]);

  React.useEffect(() => {
    if (!expanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsFullyCollapsed(true);
      }, theme.transitions.duration.leavingScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsFullyCollapsed(false);

    return () => {};
  }, [expanded, theme.transitions.duration.leavingScreen]);

  const mini = !disableCollapsibleSidebar && !expanded;

  const handleSetSidebarExpanded = React.useCallback(
    (newExpanded: boolean) => () => {
      setExpanded(newExpanded);
    },
    [setExpanded],
  );

  const handlePageItemClick = React.useCallback(
    (itemId: string, hasNestedNavigation: boolean) => {
      if (hasNestedNavigation && !mini) {
        setExpandedItemIds((previousValue) =>
          previousValue.includes(itemId)
            ? previousValue.filter(
                (previousValueItemId) => previousValueItemId !== itemId,
              )
            : [...previousValue, itemId],
        );
      } else if (!isOverSmViewport && !hasNestedNavigation) {
        setExpanded(false);
      }
    },
    [mini, setExpanded, isOverSmViewport],
  );

  const hasDrawerTransitions =
    isOverSmViewport && (!disableCollapsibleSidebar || isOverMdViewport);

  const getDrawerContent = React.useCallback(
    (viewport: 'phone' | 'tablet' | 'desktop') => (
      <React.Fragment>
        <Toolbar />
        <Box
          component="nav"
          aria-label={`${viewport.charAt(0).toUpperCase()}${viewport.slice(1)}`}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'auto',
            scrollbarGutter: mini ? 'stable' : 'auto',
            overflowX: 'hidden',
            pt: !mini ? 0 : 2,
            ...(hasDrawerTransitions
              ? getDrawerSxTransitionMixin(isFullyExpanded, 'padding')
              : {}),
          }}
        >
          <List
            dense
            sx={{
              padding: mini ? 0 : 0.5,
              mb: 4,
              width: mini ? MINI_DRAWER_WIDTH : 'auto',
            }}
          >
            <MainSidebarHeaderItem>Content</MainSidebarHeaderItem>
            <MainSidebarPageItem
              id="docs"
              title="Documents"
              icon={<InsertDriveFileIcon />}
              href={`/org/${organization?.id}/docs`}
              selected={!!matchPath(`/org/${organization?.id}/docs/*`, pathname)}
              defaultExpanded={!!matchPath(`/org/${organization?.id}/docs`, pathname)}
              expanded={expandedItemIds.includes(`docs`)}
              nestedNavigation={
                <List
                  dense
                  sx={{
                    padding: 0,
                    my: 1,
                    pl: mini ? 0 : 1,
                    minWidth: 240,
                  }}
                >
                  <MainSidebarPageItem
                    id="my-docs"
                    title="My Documents"
                    icon={<DescriptionIcon />}
                    href="/docs/my"
                    selected={!!matchPath('/docs/my', pathname)}
                  />
                  <MainSidebarPageItem
                    id="shared-docs"
                    title="Shared Documents"
                    icon={<ShareIcon />}
                    href="/docs/shared"
                    selected={!!matchPath('/docs/shared', pathname)}
                  />
                  <MainSidebarPageItem
                    id="library-docs"
                    title="Document Library"
                    icon={<LocalLibraryIcon />}
                    href="/docs/lib"
                    selected={!!matchPath('/docs/lib', pathname)}
                  />
                </List>
              }
            />
            <MainSidebarPageItem
              id="statements"
              title="Statements"
              icon={<TitleIcon />}
              href={`/org/${organization?.id}/statements`}
              selected={!!matchPath(`/org/${organization?.id}/statements/*`, pathname)}
              defaultExpanded={!!matchPath(`/org/${organization?.id}/statements`, pathname)}
              expanded={expandedItemIds.includes('statements')}
              nestedNavigation={
                <List
                  dense
                  sx={{
                    padding: 0,
                    my: 1,
                    pl: mini ? 0 : 1,
                    minWidth: 240,
                  }}
                >
                  <MainSidebarPageItem
                    id="my-statements"
                    title="My Statements"
                    icon={<DescriptionIcon />}
                    href="/statements/my"
                    selected={!!matchPath('/statements/my', pathname)}
                  />
                  <MainSidebarPageItem
                    id="shared-statements"
                    title="Shared Statements"
                    icon={<ShareIcon />}
                    href="/statements/shared-drafts"
                    selected={!!matchPath('/statements/shared', pathname)}
                  />
                  <MainSidebarPageItem
                    id="library-statements"
                    title="Statement Library"
                    icon={<LocalLibraryIcon />}
                    href="/statements/lib"
                    selected={!!matchPath('/statements/lib', pathname)}
                  />
                </List>
              }
            />
            <MainSidebarDividerItem />
            <MainSidebarHeaderItem>Admin</MainSidebarHeaderItem>
            <MainSidebarPageItem
              id="users"
              title="Users"
              icon={<PersonIcon />}
              href={`/org/${organization?.id}/users`}
              selected={!!matchPath(`/org/${organization?.id}/users/*`, pathname) || pathname === '/'}
            />
            <MainSidebarPageItem
              id="groups"
              title="Groups"
              icon={<GroupIcon />}
              href={`/org/${organization?.id}/groups`}
              selected={!!matchPath(`/org/${organization?.id}/groups/*`, pathname) || pathname === '/'}
            />
            <MainSidebarPageItem
              id="config"
              title="Configuration"
              icon={<SettingsIcon />}
              href={`/org/${organization?.id}/config`}
              selected={!!matchPath(`/org/${organization?.id}/config/*`, pathname)}
              defaultExpanded={!!matchPath(`/org/${organization?.id}/config`, pathname)}
              expanded={expandedItemIds.includes('config')}
              nestedNavigation={
                <List
                  dense
                  sx={{
                    padding: 0,
                    my: 1,
                    pl: mini ? 0 : 1,
                    minWidth: 240,
                  }}
                >
                  <MainSidebarPageItem
                    id="config-languages"
                    title="Languages"
                    icon={<LanguageIcon />}
                    href={`/org/${organization?.id}/config/languages`}
                    selected={!!matchPath(`/org/${organization?.id}/config/languages/*`, pathname)}
                  />
                  <MainSidebarPageItem
                    id="config-attributes"
                    title="Attributes"
                    icon={<LabelIcon />}
                    href={`/org/${organization?.id}/attributes`}
                    selected={!!matchPath(`/org/${organization?.id}/attributes/*`, pathname)}
                  />
                </List>
              }
            />
          </List>
        </Box>
      </React.Fragment>
    ),
    [mini, hasDrawerTransitions, isFullyExpanded, expandedItemIds, pathname],
  );

  const getDrawerSharedSx = React.useCallback(
    (isTemporary: boolean) => {
      const drawerWidth = mini ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;

      return {
        displayPrint: 'none',
        width: drawerWidth,
        flexShrink: 0,
        ...getDrawerWidthTransitionMixin(expanded),
        ...(isTemporary ? { position: 'absolute' } : {}),
        [`& .MuiDrawer-paper`]: {
          position: 'absolute',
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundImage: 'none',
          ...getDrawerWidthTransitionMixin(expanded),
        },
      };
    },
    [expanded, mini],
  );

  const sidebarContextValue = React.useMemo(() => {
    return {
      onPageItemClick: handlePageItemClick,
      mini,
      fullyExpanded: isFullyExpanded,
      fullyCollapsed: isFullyCollapsed,
      hasDrawerTransitions,
    };
  }, [
    handlePageItemClick,
    mini,
    isFullyExpanded,
    isFullyCollapsed,
    hasDrawerTransitions,
  ]);

  return (
    <MainSidebarContext.Provider value={sidebarContextValue}>
      <Drawer
        container={container}
        variant="temporary"
        open={expanded}
        onClose={handleSetSidebarExpanded(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: {
            xs: 'block',
            sm: disableCollapsibleSidebar ? 'block' : 'none',
            md: 'none',
          },
          ...getDrawerSharedSx(true),
        }}
      >
        {getDrawerContent('phone')}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: 'none',
            sm: disableCollapsibleSidebar ? 'none' : 'block',
            md: 'none',
          },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent('tablet')}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent('desktop')}
      </Drawer>
    </MainSidebarContext.Provider>
  );
}
