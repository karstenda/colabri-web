import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router';
import dayjs from 'dayjs';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import {
  useDeleteGroup,
  useGroup,
} from '../../hooks/useGroups/useGroups';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';

export default function GroupShowPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const organization = useOrganization();

  const { group, isLoading, error } = useGroup(
    organization?.id || '',
    groupId || '',
    organization !== undefined && groupId !== undefined
  );

  const { deleteGroup } = useDeleteGroup(organization?.id || '');

  const handleGroupEdit = React.useCallback(() => {
    navigate(`/org/${organization?.id}/groups/${groupId}/edit`);
  }, [navigate, groupId, organization]);

  const handleGroupDelete = React.useCallback(async () => {
    if (!group) {
      return;
    }

    const confirmed = await dialogs.confirm(
      `Do you wish to delete ${group.name}?`,
      {
        title: `Delete group?`,
        severity: 'error',
        okText: 'Delete',
        cancelText: 'Cancel',
      },
    );

    if (confirmed) {
      try {
        await deleteGroup(groupId as string);

        navigate(`/org/${organization?.id}/groups/`);

        notifications.show('Group deleted successfully.', {
          severity: 'success',
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          `Failed to delete group. Reason: ${(deleteError as Error).message}`,
          {
            severity: 'error',
            autoHideDuration: 3000,
          },
        );
      }
    }
  }, [group, dialogs, groupId, deleteGroup, navigate, organization, notifications]);

  const handleBack = React.useCallback(() => {
    navigate(`/org/${organization?.id}/groups`);
  }, [navigate, organization]);

  const renderShow = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    return group ? (
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Name</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {group.name}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Description</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {group.description || 'No description'}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Created date</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {dayjs(group.createdAt).format('MMMM D, YYYY')}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">System Group</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {group.system ? (
                  <Chip label="System" color="primary" size="small" />
                ) : (
                  'No'
                )}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleGroupEdit}
              disabled={group.system}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleGroupDelete}
              disabled={group.system}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Box>
    ) : null;
  }, [
    isLoading,
    error,
    group,
    handleBack,
    handleGroupDelete,
    handleGroupEdit,
  ]);

  const pageTitle = `${group ? group.name : ''}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Groups', path: '/org/' + organization?.id + '/groups' },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>{renderShow}</Box>
    </PageContainer>
  );
}
