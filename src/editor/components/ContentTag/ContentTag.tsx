import { Box, Chip } from '@mui/material';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { useContentTypes } from '../../../ui/hooks/useTemplates/useTemplates';
import ContentTypeIcon from '../icons/ContentTypeIcon';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export type ContentTagProps = {
  type?: 'contentType' | 'docType';
  label?: string;
  code?: string;
  size?: 'small' | 'medium';
  onClick?: () => void;
};

const ContentTag = ({ type, label, code, size, onClick }: ContentTagProps) => {
  const organization = useOrganization();
  const { contentTypes } = useContentTypes(
    organization?.id || '',
    type === 'contentType',
  );

  // If no label is provided, try to get it from content types
  if (!label && contentTypes?.length && type === 'contentType') {
    const contentType = contentTypes.find((ct) => ct.code === code);
    label = contentType ? contentType.name : undefined;
  } else {
    label = 'Unknown';
  }

  // Get the right icon
  let icon;
  switch (type) {
    case 'contentType':
      icon = <ContentTypeIcon />;
      break;
    case 'docType':
      icon = <InsertDriveFileIcon />;
      break;
    default:
      icon = undefined;
  }

  return (
    <Chip
      sx={{
        minWidth: '50px',
      }}
      size={size}
      icon={icon}
      onClick={onClick}
      label={label || code}
    />
  );
};

export default ContentTag;
