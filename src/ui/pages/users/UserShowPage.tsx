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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router';
import dayjs from 'dayjs';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import {
    useDeleteUser,
    useUser,
    useUserGroups,
} from '../../hooks/useUsers/useUsers';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { styled } from '@mui/material/styles';
import { AssigneeChip } from '../../components/AssigneeChip';


// Create styled Paper component (with border)
const StyledPaper = styled(Paper)(
  ({ theme }) => ({
    border: `1px solid ${(theme.vars || theme).palette.divider}`,
  })
);

export default function UserShowPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const organization = useOrganization();

  const {user, isLoading: isUserLoading, error: userError} = useUser(organization?.id || '', userId || '', organization !== undefined && userId !== undefined);

  const { userGroups, isLoading: isUserGroupsLoading, error: userGroupsError } = useUserGroups(organization?.id || '', userId || '', organization !== undefined && userId !== undefined);

  const isLoading = isUserLoading || isUserGroupsLoading;

  const { deleteUser } = useDeleteUser(organization?.id || '');


  const handleUserEdit = React.useCallback(() => {
    navigate(`/org/${organization?.id}/users/${userId}/edit`);
  }, [navigate, userId, organization]);

  const handleUserDelete = React.useCallback(async () => {
    if (!user) {
      return;
    }

    const confirmed = await dialogs.confirm(
      `Do you wish to delete ${user.email}?`,
      {
        title: `Delete user?`,
        severity: 'error',
        okText: 'Delete',
        cancelText: 'Cancel',
      },
    );

    if (confirmed) {



      try {
        await deleteUser(userId as string);

        navigate(`/org/${organization?.id}/users/`);

        notifications.show('User deleted successfully.', {
          severity: 'success',
          autoHideDuration: 3000,
        });
        
      } catch (deleteError) {
        notifications.show(
          `Failed to delete user. Reason:' ${(deleteError as Error).message}`,
          {
            severity: 'error',
            autoHideDuration: 3000,
          },
        );
      }
    }
  }, [user, dialogs, userId, navigate, notifications]);

  const handleBack = React.useCallback(() => {
    navigate(`/org/${organization?.id}/users`);
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
    if (userError) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{userError.message}</Alert>
        </Box>
      );
    }
    if (userGroupsError) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{userGroupsError.message}</Alert>
        </Box>
      );
    }

    return user ? (
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, sm: 12 }}>
            <StyledPaper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Email</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.email}
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <StyledPaper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">First Name</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.firstName}
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <StyledPaper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Last Name</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.lastName}
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <StyledPaper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Created date</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {dayjs(user.createdAt).format('MMMM D, YYYY')}
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <StyledPaper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Disabled</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.disabled ? 'Yes' : 'No'}
              </Typography>
            </StyledPaper>
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }}>
            <StyledPaper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Groups</Typography>
              {userGroups?.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, paddingTop: '10px', paddingBottom: '10px' }}>
                    {userGroups.map((group) => (
                        <AssigneeChip
                            key={`group-${group.id}`}
                            assignee={{...group, type: 'group'}}
                            variant="outlined"
                            size="small"
                        />
                    ))}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  No groups assigned
                </Typography>
              )}
            </StyledPaper>
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
              onClick={handleUserEdit}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleUserDelete}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Box>
    ) : null;
  }, [
    isLoading,
    userError,
    user,
    handleBack,
    handleUserDelete,
    handleUserEdit,
  ]);

  const pageTitle = `${user ? user.email : ''}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Users', path: '/org/'+organization?.id+'/users' },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>{renderShow}</Box>
    </PageContainer>
  );
}
