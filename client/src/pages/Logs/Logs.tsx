// pages/Logs.tsx

import React, { useEffect, useState } from 'react';
import {
  IconAdjustments,
  IconCalendarEvent,
  IconClock,
  IconDots,
  IconDownload,
  IconEye,
  IconFile,
  IconFileDescription,
  IconFilter,
  IconInfoCircle,
  IconSearch,
  IconUser,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Drawer,
  Flex,
  Grid,
  Group,
  Loader,
  Menu,
  Modal,
  MultiSelect,
  Pagination,
  Paper,
  rem,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Timeline,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { LogQueryParams, useExportLogs, useLogDetails, useUserLogs } from '@/hooks/log/log';

export enum LogAction {
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  DELETE = 'DELETE',
  SHARE = 'SHARE',
  VIEW = 'VIEW',
  VIEW_FILES = 'VIEW_FILES',
  TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY',
  UPDATE_USER = 'UPDATE_USER',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
}

// Action badge component to display log actions with appropriate colors
const ActionBadge = ({ action }: { action: string }) => {
  const theme = useMantineTheme();

  const getColor = () => {
    switch (action.toLowerCase()) {
      case 'upload':
        return 'blue';
      case 'download':
        return 'green';
      case 'delete':
        return 'red';
      case 'view':
      case 'view_files':
        return 'yellow';
      case 'share':
        return 'grape';
      case 'edit':
      case 'toggle_visibility':
        return 'orange';
      case 'update_user':
      case 'change_password':
        return 'indigo';
      case 'register':
      case 'login':
        return 'teal';
      default:
        return 'gray';
    }
  };

  return <Badge color={getColor()}>{action}</Badge>;
};

export default function LogsPage() {
  const theme = useMantineTheme();

  // State for filters
  const [filters, setFilters] = useState<LogQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });

  // State for drawer and modals
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [filtersOpened, { open: openFilters, close: closeFilters }] = useDisclosure(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  // Fetch logs data
  const { data: logsData, isLoading, refetch } = useUserLogs(filters);

  // Fetch log details when a log is selected
  const { data: logDetailsData, isLoading: isLoadingDetails } = useLogDetails(
    selectedLogId || '',
    !!selectedLogId
  );

  // Export logs mutation
  const { mutate: exportLogs, isPending: isExporting } = useExportLogs();

  // Initialize available actions with all enum values
  const [availableActions, setAvailableActions] = useState<string[]>(Object.values(LogAction));

  // Update available actions when logs data changes
  useEffect(() => {
    if (logsData?.logs) {
      // Merge with logs data to ensure all possible actions are included
      const actionsFromLogs = Array.from(new Set(logsData.logs.map((log) => log.action)));
      setAvailableActions(Array.from(new Set([...Object.values(LogAction), ...actionsFromLogs])));
    }
  }, [logsData?.logs]);

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle opening the details drawer
  const handleViewDetails = (logId: string) => {
    setSelectedLogId(logId);
    openDrawer();
  };

  // Handle applying filters
  const handleApplyFilters = () => {
    // Update date range filters
    const updatedFilters: LogQueryParams = { ...filters };

    if (dateRange[0]) {
      // Make sure it's at the start of the day
      const startDate = new Date(dateRange[0]);
      startDate.setHours(0, 0, 0, 0);
      updatedFilters.startDate = startDate.toISOString();
    } else {
      delete updatedFilters.startDate;
    }

    if (dateRange[1]) {
      // Make sure it's at the end of the day
      const endDate = new Date(dateRange[1]);
      endDate.setHours(23, 59, 59, 999);
      updatedFilters.endDate = endDate.toISOString();
    } else {
      delete updatedFilters.endDate;
    }

    // Reset to page 1 when applying new filters
    updatedFilters.page = 1;

    setFilters(updatedFilters);
    closeFilters();

    // Give user feedback when filters are applied
    const hasActiveFilters =
      !!updatedFilters.action ||
      !!updatedFilters.fileId ||
      !!updatedFilters.startDate ||
      !!updatedFilters.endDate;

    if (hasActiveFilters) {
      notifications.show({
        title: 'Filters Applied',
        message: 'The logs have been filtered according to your criteria',
        color: 'blue',
      });
    }
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    });
    setDateRange([null, null]);
    closeFilters();

    notifications.show({
      title: 'Filters Cleared',
      message: 'All filters have been reset',
      color: 'gray',
    });
  };

  // Handle exporting logs
  const handleExportLogs = () => {
    exportLogs(filters);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Check if any filters are active
  const hasActiveFilters =
    !!filters.action || !!filters.fileId || !!filters.startDate || !!filters.endDate;

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>Activity Logs</Title>

        <Group>
          <Button
            leftSection={<IconFilter size={16} />}
            variant={hasActiveFilters ? 'filled' : 'light'}
            color={hasActiveFilters ? 'blue' : 'gray'}
            onClick={openFilters}
          >
            {hasActiveFilters ? 'Filters Active' : 'Filter'}
          </Button>

          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleExportLogs}
            loading={isExporting}
          >
            Export CSV
          </Button>
        </Group>
      </Group>

      {/* Filters modal */}
      <Modal opened={filtersOpened} onClose={closeFilters} title="Filter Logs" size="lg">
        <Stack>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Sort by"
                data={[
                  { value: 'timestamp', label: 'Date' },
                  { value: 'action', label: 'Action' },
                ]}
                value={filters.sortBy}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: value || 'timestamp',
                  }))
                }
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Sort order"
                data={[
                  { value: 'desc', label: 'Newest first' },
                  { value: 'asc', label: 'Oldest first' },
                ]}
                value={filters.sortOrder}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortOrder: (value as 'asc' | 'desc') || 'desc',
                  }))
                }
              />
            </Grid.Col>
          </Grid>

          <Select
            label="Action type"
            placeholder="Filter by action"
            clearable
            data={availableActions.map((action) => ({ value: action, label: action }))}
            value={filters.action}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                action: value || undefined,
              }))
            }
          />

          <TextInput
            label="File ID"
            placeholder="Filter by file ID"
            value={filters.fileId || ''}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                fileId: event.currentTarget.value || undefined,
              }))
            }
          />

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Date range
            </Text>
            <DatePicker
              type="range"
              placeholder="Select date range"
              value={dateRange}
              onChange={setDateRange}
              clearable
              valueFormat="DD MMM YYYY"
            />
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Log details drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="right"
        size="md"
        title={<Text fw={600}>Log Details</Text>}
        scrollAreaComponent={Box}
      >
        {isLoadingDetails ? (
          <Stack align="center" p="xl">
            <Loader />
            <Text>Loading log details...</Text>
          </Stack>
        ) : logDetailsData ? (
          <Stack>
            <Card withBorder>
              <Group gap="xs">
                <IconClock size={16} />
                <Text fw={500}>Timestamp:</Text>
                <Text>{formatDate(logDetailsData.log.timestamp)}</Text>
              </Group>

              <Group gap="xs" mt="xs">
                <IconUser size={16} />
                <Text fw={500}>User ID:</Text>
                <Text>{logDetailsData.log.userId}</Text>
              </Group>

              <Group gap="xs" mt="xs">
                <Text fw={500}>Action:</Text>
                <ActionBadge action={logDetailsData.log.action} />
              </Group>
            </Card>

            {logDetailsData.log.details && (
              <Card withBorder>
                <Group gap="xs">
                  <IconFileDescription size={16} />
                  <Text fw={500}>Details:</Text>
                </Group>
                <Text mt="xs">{logDetailsData.log.details}</Text>
              </Card>
            )}

            {logDetailsData.log.file && (
              <Card withBorder>
                <Group gap="xs">
                  <IconFile size={16} />
                  <Text fw={500}>Associated File:</Text>
                </Group>

                <Box mt="md">
                  <Text fw={500}>{logDetailsData.log.file.name}</Text>
                  <Group gap="xs" mt="xs">
                    <Text size="sm" c="dimmed">
                      Type:
                    </Text>
                    <Text size="sm">{logDetailsData.log.file.type}</Text>
                  </Group>
                  <Group gap="xs" mt="xs">
                    <Text size="sm" c="dimmed">
                      Size:
                    </Text>
                    <Text size="sm">{(logDetailsData.log.file.size / 1024).toFixed(2)} KB</Text>
                  </Group>
                  <Group gap="xs" mt="xs">
                    <Text size="sm" c="dimmed">
                      Public:
                    </Text>
                    <Text size="sm">{logDetailsData.log.file.isPublic ? 'Yes' : 'No'}</Text>
                  </Group>
                </Box>
              </Card>
            )}
          </Stack>
        ) : (
          <Text c="dimmed">No log details available</Text>
        )}
      </Drawer>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <Paper withBorder p="sm" mb="md">
          <Group>
            <IconFilter size={16} />
            <Text size="sm" fw={500}>
              Active Filters:
            </Text>

            {filters.action && <Badge>Action: {filters.action}</Badge>}

            {filters.fileId && <Badge>File ID: {filters.fileId}</Badge>}

            {filters.startDate && filters.endDate && (
              <Badge>
                Date: {new Date(filters.startDate).toLocaleDateString()} -{' '}
                {new Date(filters.endDate).toLocaleDateString()}
              </Badge>
            )}

            <Button variant="subtle" size="xs" onClick={handleClearFilters} ml="auto">
              Clear All
            </Button>
          </Group>
        </Paper>
      )}

      {/* Logs table */}
      <Paper withBorder p="md">
        {isLoading ? (
          <Stack align="center" p="xl">
            <Loader />
            <Text>Loading logs...</Text>
          </Stack>
        ) : logsData && logsData.logs.length > 0 ? (
          <>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date & Time</Table.Th>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Details</Table.Th>
                  <Table.Th>File</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {logsData.logs.map((log) => (
                  <Table.Tr key={log.id}>
                    <Table.Td>
                      <Text size="sm">{formatDate(log.timestamp)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <ActionBadge action={log.action} />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={1}>
                        {log.details || '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {log.file ? (
                        <Group gap="xs">
                          <IconFile size={16} />
                          <Text size="sm" lineClamp={1}>
                            {log.file.name}
                          </Text>
                        </Group>
                      ) : (
                        <Text size="sm" c="dimmed">
                          -
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                          <ActionIcon variant="subtle" size="sm">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEye size={16} />}
                            onClick={() => handleViewDetails(log.id)}
                          >
                            View Details
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {logsData.pagination.pages > 1 && (
              <Group justify="center" mt="md">
                <Pagination
                  total={logsData.pagination.pages}
                  value={logsData.pagination.page}
                  onChange={handlePageChange}
                />
              </Group>
            )}
          </>
        ) : (
          <Text ta="center" py="xl">
            No logs found. Try adjusting your filters.
          </Text>
        )}
      </Paper>
    </Container>
  );
}
