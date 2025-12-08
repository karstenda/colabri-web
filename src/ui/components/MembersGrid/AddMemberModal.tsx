import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { DialogProps } from '../../hooks/useDialogs/useDialogs';
import { AssigneeSelector } from '../AssigneeSelector';
import { User } from '../../../api/ColabriAPI';
import { Assignee } from '../../data/Common';

export interface AddMemberModalPayload {
  orgId: string;
  groupName: string;
}

export interface AddMemberModalProps
  extends DialogProps<AddMemberModalPayload, User[]> {}

export function AddMemberModal({
  open,
  payload,
  onClose,
}: AddMemberModalProps) {
  const [selectedUsers, setSelectedUsers] = React.useState<Assignee[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleCancel = async () => {
    await onClose([]);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Filter to only include users and extract the User objects
      const users = selectedUsers
        .filter(
          (assignee): assignee is User & { type: 'user' } =>
            assignee.type === 'user',
        )
        .map((userAssignee) => {
          // Remove the 'type' property to get the pure User object
          const { type, ...user } = userAssignee;
          return user as User;
        });

      await onClose(users);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (value: Assignee | Assignee[] | null) => {
    if (Array.isArray(value)) {
      setSelectedUsers(value);
    } else if (value) {
      setSelectedUsers([value]);
    } else {
      setSelectedUsers([]);
    }
  };

  const isConfirmDisabled = selectedUsers.length === 0;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Add Members to {payload.groupName}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Select users to add to this group.
          </Typography>

          <AssigneeSelector
            orgId={payload.orgId}
            value={selectedUsers}
            onChange={handleSelectionChange}
            multiple
            usersOnly
            placeholder="Select users to add..."
            label="Users"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || isConfirmDisabled}
        >
          Add Members
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddMemberModal;
