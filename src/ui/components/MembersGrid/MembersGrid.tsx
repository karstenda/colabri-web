import { DataGrid } from "@mui/x-data-grid/DataGrid";
import React from "react";
import { useGroupMembers, useRemoveGroupMembers, useAddGroupMembers } from "../../hooks/useGroups/useGroups";
import { useOrganization } from "../../context/UserOrganizationContext/UserOrganizationProvider";
import PersonOffIcon from '@mui/icons-material/PersonOff';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import UserAvatar from "../UserAvatar/UserAvatar";
import { gridClasses } from "@mui/x-data-grid";
import { GridColDef, GridFilterModel, GridLogicOperator, GridPaginationModel, GridSortModel } from "@mui/x-data-grid/models";
import { GridColumnVisibilityModel } from "@mui/x-data-grid/hooks/features/columns";
import { GridActionsCellItem } from "@mui/x-data-grid/components/cell";
import { Group, User } from "../../../api/ColabriAPI";
import { useDialogs } from "../../hooks/useDialogs/useDialogs";
import useNotifications from "../../hooks/useNotifications/useNotifications";
import { useNavigate } from "react-router";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import AddMemberModal from "./AddMemberModal";


const INITIAL_PAGE_SIZE = 10;

export type MembersGridProps = {
    group?: Group;
    editable?: boolean;
    handleClick?: (params: User) => void;
}

function MembersGrid(props: MembersGridProps) {

    const { group, handleClick, editable } = props;

    const organization = useOrganization();
    const dialogs = useDialogs();
    const notifications = useNotifications();
    const navigate = useNavigate();
    
    // Create the states for pagination, filtering, sorting, and column visibility
    const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
        page: 0,
        pageSize: INITIAL_PAGE_SIZE,
    });
    const [filterModel, setFilterModel] = React.useState<GridFilterModel>({ items: [] });
    const [sortModel, setSortModel] = React.useState<GridSortModel>([]);
    const [columnVisibilityModel, setColumnVisibilityModel] = React.useState<GridColumnVisibilityModel>({ updatedAt: false });

    // Default quick filter logic operator to 'or'
    filterModel.quickFilterLogicOperator = GridLogicOperator.Or;

    // Hook to support removing group members
    const { removeGroupMembers, isPending: isRemovingMembers } = useRemoveGroupMembers(organization?.id || '', group?.id || '');
    
    // Hook to support adding group members
    const { addGroupMembers, isPending: isAddingMembers } = useAddGroupMembers(organization?.id || '', group?.id || '');

    // All filterable column fields for quick filter
    const allFilterableFields = React.useMemo(() => 
        ['email', 'firstName', 'lastName'],[]);

    // Use React Query hook for fetching users
    const { 
        members, 
        isLoading: isMembersLoading,
        refetch: refetchMembers
    } = useGroupMembers(
    organization?.id || '', 
    group?.id || '',
    { 
        limit: paginationModel.pageSize, 
        offset: paginationModel.page * paginationModel.pageSize,
        sort: sortModel.map(item => ({
        field: item.field,
        direction: item.sort === 'asc' ? 'asc' : 'desc'
        })),
        filter: {
        items: filterModel.items.map(item => ({
            id: item.id ? `${item.field}-${item.operator}` : item.id+"",
            field: item.field,
            operator: item.operator,
            value: item.value?.toString()
        })),
        logicOperator: (filterModel.logicOperator as 'and' | 'or') || 'and',
        quickFilterValues: filterModel.quickFilterValues,
        quickFilterLogicOperator: (filterModel.quickFilterLogicOperator as 'and' | 'or') || 'and',
        quickFilterFields: (() => {
            const quickFilterFields = [];
            for (const field of allFilterableFields) {
            if (columnVisibilityModel[field] || !filterModel.quickFilterExcludeHiddenColumns) {
                quickFilterFields.push(field);
            }
            }
            return quickFilterFields;
        })()
        },
    });

    // Determine loading state
    const isLoading = isMembersLoading || isRemovingMembers || isAddingMembers;

    // When a group member is to be removed
    const handleGroupMemberDelete = React.useCallback(
        (user: User) => async () => {
            const userName = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.email || 'this user';
            const confirmed = await dialogs.confirm(
            `Do you wish to remove ${userName} from ${group?.name}?`,
            {
                title: `Remove member?`,
                severity: 'error',
                okText: 'Remove',
                cancelText: 'Cancel',
            },
            );

            if (confirmed) {
            try {
                await removeGroupMembers([user.id!]);

                notifications.show(`User ${userName} removed successfully from ${group?.name}.`, {
                severity: 'success',
                autoHideDuration: 3000,
                });
            } catch (removeError) {
                notifications.show(
                `Failed to remove user. Reason: ${(removeError as Error).message}`,
                {
                    severity: 'error',
                    autoHideDuration: 3000,
                },
                );
            }
            }
        },
    [organization, group, dialogs, notifications, removeGroupMembers],
    );

    // When a group member is to be added
    const handleGroupMemberAdd = React.useCallback(
        async () => {
            if (!organization?.id || !group?.id) {
                notifications.show('Missing organization or group information', {
                    severity: 'error',
                    autoHideDuration: 3000,
                });
                return;
            }

            try {
                const selectedUsers = await dialogs.open(AddMemberModal, {
                    orgId: organization.id,
                    groupName: group.name || 'this group',
                });

                if (selectedUsers.length > 0) {
                    const userIds = selectedUsers.map(user => user.id!);
                    await addGroupMembers(userIds);

                    const userNames = selectedUsers.map(user => 
                        user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.email || 'Unknown user'
                    ).join(', ');

                    notifications.show(
                        `Successfully added ${selectedUsers.length} member(s) to ${group.name}: ${userNames}`, 
                        {
                            severity: 'success',
                            autoHideDuration: 3000,
                        }
                    );
                }
            } catch (addError) {
                notifications.show(
                    `Failed to add members. Reason: ${(addError as Error).message}`,
                    {
                        severity: 'error',
                        autoHideDuration: 3000,
                    },
                );
            }
        },
        [organization, group, dialogs, notifications, addGroupMembers],
    );

    // When a member is clicked for editing
    const handleRowEdit = React.useCallback(
        (user: User) => async () => {
            navigate(`/org/${organization?.id}/users/${user.id}/edit`);
        }, [organization]);

    // When the refresh button is clicked
    const handleRefresh = React.useCallback(() => {
        refetchMembers();
    }, [refetchMembers]);


    const columns = React.useMemo<GridColDef[]>(
    () => [
        { 
            field: 'Avatar',
            headerName: '',
            width: 50, 
            renderCell: (params) => (
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <UserAvatar
                    user={params.row}
                    width={35}
                    height={35}
                />
                </div>
            ),
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            resizable: false,
            disableReorder: true,
        },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'firstName', headerName: 'First Name', width: 150 },
        { field: 'lastName', headerName: 'Last Name', width: 150 },
        {
            field: 'disabled',
            headerName: 'Disabled',
            type: 'boolean',
            width: 100,
            renderCell: (params) => {
                const isDisabled = params.row.disabled;
                if (isDisabled) {
                    return (<div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <PersonOffIcon />
                    </div>);
                } else {
                    return <></>
                }
            },
        },
        {
            field: 'Actions',
            headerName: '',
            type: 'actions',
            flex: 1,
            align: 'right',
            getActions: editable ? (params) => [
                <GridActionsCellItem
                    key="edit-item"
                    icon={<EditIcon />}
                    label="Edit"
                    onClick={handleRowEdit(params.row)}
                />,
                <GridActionsCellItem
                    key="remove-member-item"
                    icon={<DeleteIcon />}
                    label="Remove"
                    onClick={handleGroupMemberDelete(params.row)}
                />] : [],
            },
    ],[handleRowEdit, handleGroupMemberDelete, editable]);

    return (
        <Stack direction="column" spacing={2}>
            {editable && <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                <Tooltip title="Reload data" placement="right" enterDelay={1000}>
                    <div>
                    <IconButton size="small" aria-label="refresh" onClick={handleRefresh}>
                        <RefreshIcon />
                    </IconButton>
                    </div>
                </Tooltip>
                <Button
                    variant="contained"
                    onClick={handleGroupMemberAdd}
                    startIcon={<AddIcon />}
                >
                    Add Member
                </Button>
            </Stack>}
    
            <DataGrid
                rows={members}
                rowCount={members.length}
                columns={columns}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                pagination
                sortingMode="server"
                filterMode="server"
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                sortModel={sortModel}
                onSortModelChange={(newModel) => setSortModel(newModel)}
                filterModel={filterModel}
                onFilterModelChange={(newModel) => setFilterModel(newModel)}
                disableRowSelectionOnClick
                onRowClick={(params) => (handleClick && handleClick(params.row))}
                loading={isLoading}
                showToolbar
                pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
                sx={{
                [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                    outline: 'transparent',
                },
                [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                    {
                    outline: 'none',
                    },
                [`& .${gridClasses.row}:hover`]: {
                    cursor: 'pointer',
                },
                }}
                slotProps={{
                loadingOverlay: {
                    variant: 'circular-progress',
                    noRowsVariant: 'circular-progress',
                },
                baseIconButton: {
                    size: 'small',
                },
                toolbar: {
                    title: 'Group Members',
                    quickFilterProps: {
                        debounceMs: 500,
                    },
                    showQuickFilter: true,
                    csvOptions: { disableToolbarButton: true },
                    printOptions: { disableToolbarButton: true },
                },
                }}
            />
        </Stack>);
}

export default MembersGrid;