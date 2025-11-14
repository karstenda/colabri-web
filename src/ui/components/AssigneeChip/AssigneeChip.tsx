import React from 'react';
import { Chip, Avatar, useTheme } from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';
import { Assignee } from '../AssigneeSelector/AssigneeSelector';
import UserAvatar from '../UserAvatar/UserAvatar';

export interface AssigneeChipProps {
  /**
   * The assignee to display as a chip
   */
  assignee: Assignee;
  
  /**
   * Size variant of the chip
   */
  size?: 'small' | 'medium';
  
  /**
   * Variant of the chip
   */
  variant?: 'filled' | 'outlined';
  
  /**
   * Whether the chip is deletable (shows delete icon)
   */
  onDelete?: () => void;
  
  /**
   * Additional props to pass to the Chip component
   */
  chipProps?: React.ComponentProps<typeof Chip>;
}

// Helper function to format user display name
const getUserDisplayName = (user: any): string => {
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || user.email || 'Unknown User';
};

// Helper function to format group display name
const getGroupDisplayName = (group: any): string => {
  return group.name || 'Unknown Group';
};

// Helper function to get assignee display name
const getAssigneeDisplayName = (assignee: Assignee): string => {
  return assignee.type === 'user' 
    ? getUserDisplayName(assignee)
    : getGroupDisplayName(assignee);
};

export default function AssigneeChip({
  assignee,
  size = 'small',
  variant = 'outlined',
  onDelete,
  chipProps,
}: AssigneeChipProps) {
  const theme = useTheme();

  return (
    <Chip
      label={getAssigneeDisplayName(assignee)}
      sx={{
        '& .MuiChip-label': {
          fontWeight: 'normal',
        },
        ...chipProps?.sx,
      }}
      avatar={
        assignee.type === 'user' ? (
          <UserAvatar user={assignee} width={24} height={24} />
        ) : (
          <Avatar sx={{
            marginLeft: 0,
            bgcolor:  theme.palette.grey[400],
            color: theme.palette.getContrastText(theme.palette.grey[400]),
            width: 32,
            height: 32,
            '&.MuiChip-avatarSmall': {
              width: 24,
              height: 24,
              marginLeft: 0,
              color: theme.palette.getContrastText(theme.palette.grey[400]),
            },
          }}>
            <GroupIcon fontSize="small" />
          </Avatar>
        )
      }
      variant={variant}
      size={size}
      onDelete={onDelete}
      {...chipProps}
    />
  );
}