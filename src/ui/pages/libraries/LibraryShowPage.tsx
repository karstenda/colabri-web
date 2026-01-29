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
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useDialogs } from '../../hooks/useDialogs/useDialogs';
import useNotifications from '../../hooks/useNotifications/useNotifications';
import {
  useDeleteLibrary,
  useLibrary,
} from '../../hooks/useLibraries/useLibraries';
import PageContainer from '../../components/MainLayout/PageContainer';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { DocumentType } from '../../../api/ColabriAPI';

export default function LibraryShowPage() {
  const { libraryId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const organization = useOrganization();

  // Load the library
  const { library, isLoading, error } = useLibrary(
    organization?.id || '',
    libraryId || '',
    organization !== undefined && libraryId !== undefined,
  );

  const { deleteLibrary } = useDeleteLibrary(organization?.id || '');

  const handleLibraryEdit = React.useCallback(() => {
    navigate(`/org/${organization?.id}/config/libraries/${libraryId}/edit`);
  }, [navigate, libraryId, organization]);

  const handleLibraryDelete = React.useCallback(async () => {
    if (!library) {
      return;
    }

    const confirmed = await dialogs.confirm(
      t('libraries.messages.deleteConfirm', { name: library.name }),
      {
        title: t('libraries.messages.deleteTitle'),
        severity: 'error',
        okText: t('common.delete'),
        cancelText: t('common.cancel'),
      },
    );

    if (confirmed) {
      try {
        await deleteLibrary(libraryId as string);

        navigate(`/org/${organization?.id}/config/libraries/`);

        notifications.show(t('libraries.messages.deleteSuccess'), {
          severity: 'success',
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          t('libraries.messages.deleteError', {
            message: (deleteError as Error).message,
          }),
          {
            severity: 'error',
            autoHideDuration: 3000,
          },
        );
      }
    }
  }, [
    library,
    dialogs,
    libraryId,
    deleteLibrary,
    navigate,
    organization,
    notifications,
    t,
  ]);

  const handleBack = React.useCallback(() => {
    navigate(`/org/${organization?.id}/config/libraries/`);
  }, [navigate, organization]);

  const renderShow = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error || !library) {
      return (
        <Box sx={{ flex: 1, p: 2 }}>
          <Alert severity="error">
            {t('libraries.messages.loadDetailError', {
              message: error ? error.message : t('libraries.notFound'),
            })}
          </Alert>
        </Box>
      );
    }

    return (
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="overline">{t('common.name')}</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {library.name}
              </Typography>

              <Typography variant="overline">
                {t('libraries.fields.type')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {library.type === DocumentType.DocumentTypeColabStatement
                  ? t('statements.type')
                  : library.type === DocumentType.DocumentTypeColabSheet
                    ? t('sheets.type')
                    : library.type}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="overline">
                {t('common.createdAt')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {dayjs(library.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Typography>
              <Typography variant="overline">
                {t('common.updatedAt')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {dayjs(library.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            {t('common.back')}
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleLibraryEdit}
            >
              {t('common.edit')}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleLibraryDelete}
            >
              {t('common.delete')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }, [
    isLoading,
    error,
    library,
    t,
    handleBack,
    handleLibraryEdit,
    handleLibraryDelete,
  ]);

  return (
    <PageContainer
      title={library?.name || t('libraries.detailsTitle')}
      breadcrumbs={[
        {
          title: t('libraries.title'),
          path: `/org/${organization?.id}/config/libraries`,
        },
        { title: library?.name || t('libraries.detailsTitle') },
      ]}
    >
      {renderShow}
    </PageContainer>
  );
}
