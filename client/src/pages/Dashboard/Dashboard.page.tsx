import React, { useState } from 'react';
import {
  IconDownload,
  IconEdit,
  IconEye,
  IconFile,
  IconInfoCircle,
  IconShare,
  IconTrash,
  IconUpload,
  IconLogin,
  IconEyeOff,
} from '@tabler/icons-react';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import {
  Badge,
  Box,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  rgba,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { useLogStats } from '@/hooks/log/log';

// Updated action mapping to match your API response
const ACTION_ICONS = {
  UPLOAD: <IconUpload size={20} />,
  DOWNLOAD: <IconDownload size={20} />,
  DELETE: <IconTrash size={20} />,
  VIEW_FILES: <IconEye size={20} />,
  SHARE: <IconShare size={20} />,
  EDIT: <IconEdit size={20} />,
  LOGIN: <IconLogin size={20} />,
  TOGGLE_VISIBILITY: <IconEyeOff size={20} />,
};

const ACTION_COLORS = {
  UPLOAD: 'blue',
  DOWNLOAD: 'green',
  DELETE: 'red',
  VIEW_FILES: 'yellow',
  SHARE: 'violet',
  EDIT: 'orange',
  LOGIN: 'cyan',
  TOGGLE_VISIBILITY: 'pink',
};

// This function helps display friendly names to the user
const getActionDisplayName = (actionKey) => {
  const displayNames = {
    VIEW_FILES: 'View',
    TOGGLE_VISIBILITY: 'Toggle Visibility',
    LOGIN: 'Login',
  };
  
  return displayNames[actionKey] || actionKey.charAt(0) + actionKey.slice(1).toLowerCase();
};

const TimeRangeOptions = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '14days', label: 'Last 14 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
  { value: '1year', label: 'Last Year' },
];

// Custom tooltip component for bar chart
const FileAccessTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Paper p="md" withBorder shadow="md" radius="md">
        <Text fw={500}>{payload[0].payload.tooltip}</Text>
        <Text>Access count: {payload[0].value}</Text>
      </Paper>
    );
  }
  return null;
};

export default function DashboardPage() {
  const theme = useMantineTheme();
  const [timeRange, setTimeRange] = useState('30days');
  const { data: stats, isLoading, error } = useLogStats(timeRange);
  
  // Get color for action from theme
  const getActionColor = (action) => {
    const colorKey = ACTION_COLORS[action] || 'gray';
    return theme.colors[colorKey][theme.colorScheme === 'dark' ? 5 : 6];
  };
  
  // Get icon for action
  const getActionIcon = (action) => {
    return ACTION_ICONS[action] || <IconFile size={20} />;
  };

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Group justify="space-between" mb="lg">
          <Title order={2}>Activity Dashboard</Title>
          <Skeleton height={36} width={200} radius="md" />
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} height={100} radius="md" />
            ))}
        </SimpleGrid>
        <Grid mt="xl">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Skeleton height={300} radius="md" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Skeleton height={300} radius="md" />
          </Grid.Col>
        </Grid>
        <Skeleton height={350} radius="md" mt="xl" />
      </Container>
    );
  }

  if (error || !stats) {
    return (
      <Container size="xl" py="xl">
        <Title order={2} mb="lg">
          Activity Dashboard
        </Title>
        <Paper p="xl" withBorder>
          <Text c="red">Failed to load dashboard data. Please try again later.</Text>
        </Paper>
      </Container>
    );
  }

  // Prepare data for charts
  const actionData = stats.actionCounts.map(({ action, count }) => ({
    action,
    count,
    color: getActionColor(action),
    displayName: getActionDisplayName(action),
  }));

  const totalActions = actionData.reduce((sum, item) => sum + item.count, 0);

  // Calculate percentages for action distribution
  const actionPercentages = actionData.map(({ action, count, color, displayName }) => ({
    action,
    displayName,
    value: Math.round((count / totalActions) * 100),
    color,
    count,
  }));

  // Process weekly trend data for the area chart
  const availableActions = Array.from(
    new Set(stats.weeklyTrend.flatMap((week) => Object.keys(week).filter((key) => key !== 'week')))
  );

  // Transform weekly trend data for the stacked area chart
  const weeklyTrendData = stats.weeklyTrend.map(week => {
    const newWeek = { week: week.week };
    availableActions.forEach(action => {
      if (action !== 'week') {
        newWeek[getActionDisplayName(action)] = week[action] || 0;
      }
    });
    return newWeek;
  });

  // Format file names to prevent overflow
  const formatFileName = (name) => {
    return name.length > 20 ? `${name.substring(0, 17)}...` : name;
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Activity Dashboard</Title>
        <Select
          data={TimeRangeOptions}
          value={timeRange}
          onChange={(value) => setTimeRange(value || '30days')}
          w={200}
        />
      </Group>

      {/* Activity Overview Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" mb="xl">
        {actionData.slice(0, 4).map((item) => (
          <Card key={item.action} withBorder padding="lg" radius="md" shadow="sm">
            <Group justify="space-between">
              <Group>
                <Box
                  style={{
                    backgroundColor: rgba(getActionColor(item.action), 0.15),
                    borderRadius: theme.radius.md,
                    padding: theme.spacing.xs,
                    color: getActionColor(item.action),
                  }}
                >
                  {getActionIcon(item.action)}
                </Box>
                <div>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    {item.displayName}
                  </Text>
                  <Text size="xl" fw={700}>
                    {item.count.toLocaleString()}
                  </Text>
                </div>
              </Group>
              <Badge
                size="lg"
                variant="light"
                color={ACTION_COLORS[item.action] || 'gray'}
              >
                {actionPercentages.find((a) => a.action === item.action)?.value}%
              </Badge>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Grid gutter="md">
        {/* Daily Activity Chart */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder padding="lg" radius="md" shadow="sm">
            <Card.Section withBorder p="xs">
              <Group justify="space-between">
                <Text fw={700} size="md">
                  Daily Activity
                </Text>
                <Tooltip label="Shows your activity frequency over time">
                  <IconInfoCircle size={18} style={{ cursor: 'pointer' }} color="gray" />
                </Tooltip>
              </Group>
            </Card.Section>
            <Box h={300} mt="md">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke={theme.colors.blue[6]} 
                    fill={theme.colors.blue[6]} 
                    fillOpacity={0.3} 
                    name="Activities"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid.Col>

        {/* Action Distribution */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder padding="lg" radius="md" shadow="sm" h="100%">
            <Card.Section withBorder p="xs">
              <Group justify="space-between">
                <Text fw={700} size="md">
                  Action Distribution
                </Text>
                <Text c="dimmed" size="xs">
                  Total: {totalActions}
                </Text>
              </Group>
            </Card.Section>
            <Box h={300} mt="md">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionPercentages}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="displayName"
                    // label={({ value }) => `${value}%`}
                    labelLine={false}
                  >
                    {actionPercentages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value, name, props) => {
                      const item = actionPercentages.find(i => i.displayName === name);
                      return [`${item?.count || 0} (${value}%)`, item?.displayName];
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid.Col>

        {/* Most Accessed Files */}
        <Grid.Col span={12}>
          <Card withBorder padding="lg" radius="md" shadow="sm">
            <Card.Section withBorder p="xs">
              <Group justify="space-between">
                <Text fw={700} size="md">
                  Most Accessed Files
                </Text>
                <Tooltip label="The files with the most activity during this period">
                  <IconInfoCircle size={18} style={{ cursor: 'pointer' }} color="gray" />
                </Tooltip>
              </Group>
            </Card.Section>
            {stats.mostAccessedFiles.length > 0 ? (
              <Box h={300} mt="md">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.mostAccessedFiles.map((file) => ({
                      name: formatFileName(file.name),
                      count: file.count,
                      id: file.id,
                      tooltip: file.name,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip content={<FileAccessTooltip />} />
                    <Legend />
                    <Bar dataKey="count" name="Accesses" fill={theme.colors.green[6]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box py="xl" ta="center">
                <Text c="dimmed">No file access data available for this period</Text>
              </Box>
            )}
          </Card>
        </Grid.Col>

        {/* Weekly Trend - Added if weekly data exists */}
        {stats.weeklyTrend.length > 0 && (
          <Grid.Col span={12}>
            <Card withBorder padding="lg" radius="md" shadow="sm">
              <Card.Section withBorder p="xs">
                <Group justify="space-between">
                  <Text fw={700} size="md">
                    Weekly Activity Breakdown
                  </Text>
                  <Tooltip label="Activity breakdown by action type per week">
                    <IconInfoCircle size={18} style={{ cursor: 'pointer' }} color="gray" />
                  </Tooltip>
                </Group>
              </Card.Section>
              <Box h={300} mt="md">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={weeklyTrendData}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    {availableActions.map((action) => (
                      <Area 
                        key={action}
                        type="monotone"
                        dataKey={getActionDisplayName(action)}
                        stackId="1"
                        stroke={getActionColor(action)}
                        fill={getActionColor(action)}
                        fillOpacity={0.6}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid.Col>
        )}
      </Grid>
    </Container>
  );
}