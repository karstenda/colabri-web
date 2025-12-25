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
  useDeleteAttribute,
  useAttribute,
} from '../../hooks/useAttributes/useAttributes';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { styled } from '@mui/material/styles';

export default function AttributeShowPage() {
  const { attributeId } = useParams();
  const navigate = useNavigate();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const organization = useOrganization();

  const { attribute, isLoading, error } = useAttribute(
    organization?.id || '',
    attributeId || '',
    organization !== undefined && attributeId !== undefined,
  );

  const { deleteAttribute } = useDeleteAttribute(organization?.id || '');

  const handleAttributeEdit = React.useCallback(() => {
    navigate(`/org/${organization?.id}/attributes/${attributeId}/edit`);
  }, [navigate, attributeId, organization]);

  const handleAttributeDelete = React.useCallback(async () => {
    if (!attribute) {
      return;
    }

    const confirmed = await dialogs.confirm(
      `Do you wish to delete the attribute "${attribute.name}"?`,
      {
        title: `Delete attribute?`,
        severity: 'error',
        okText: 'Delete',
        cancelText: 'Cancel',
      },
    );

    if (confirmed) {
      try {
        await deleteAttribute(attributeId as string);

        navigate(`/org/${organization?.id}/attributes/`);

        notifications.show('Attribute deleted successfully.', {
          severity: 'success',
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          `Failed to delete attribute. Reason: ${
            (deleteError as Error).message
          }`,
          {
            severity: 'error',
            autoHideDuration: 3000,
          },
        );
      }
    }
  }, [
    attribute,
    dialogs,
    attributeId,
    navigate,
    notifications,
    deleteAttribute,
    organization,
  ]);

  const handleBack = React.useCallback(() => {
    navigate(`/org/${organization?.id}/attributes`);
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

    const typeMap: Record<string, string> = {
      string: 'String',
      number: 'Number',
      boolean: 'Boolean',
      date: 'Date',
    };

    return attribute ? (
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, sm: 12 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Name</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {attribute.name}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Type</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {typeMap[attribute.type] || attribute.type}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Created date</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {dayjs(attribute.createdAt).format('MMMM D, YYYY')}
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
              onClick={handleAttributeEdit}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleAttributeDelete}
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
    attribute,
    handleBack,
    handleAttributeDelete,
    handleAttributeEdit,
  ]);

  const pageTitle = `${attribute ? attribute.name : ''}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        {
          title: 'Attributes',
          path: '/org/' + organization?.id + '/attributes',
        },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>{renderShow}</Box>
    </PageContainer>
  );
}
