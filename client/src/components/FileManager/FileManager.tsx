import { useState } from 'react';
import {
  Title,
  Box,
  Breadcrumbs,
  Anchor,
  SegmentedControl,
  Group,
  Paper,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { FileList } from '../FileList/FileList';
import { FileGrid } from '../FileGrid/FileGrid';
import { IconList, IconLayoutGrid } from '@tabler/icons-react';
import classes from './FileManager.module.css';

export function FileManager() {
  const [currentFolder, setCurrentFolder] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const theme = useMantineTheme();
  
  const folders = currentFolder ? currentFolder.split('/').filter(Boolean) : [];
  
  const navigateToFolder = (index: number) => {
    if (index === -1) {
      setCurrentFolder('');
      return;
    }
    setCurrentFolder(folders.slice(0, index + 1).join('/'));
  };
  
  return (
    <Box className={classes.container}>
      <Group className={classes.header} justify='space-between'>
        <Title order={2}>File Manager</Title>
        <SegmentedControl
          value={viewMode}
          onChange={(value) => setViewMode(value as 'table' | 'grid')}
          data={[
            {
              value: 'table',
              label: (
                <div className={classes.segmentedControlLabel}>
                  <IconList size={16} />
                  <Text size="sm">List</Text>
                </div>
              ),
            },
            {
              value: 'grid',
              label: (
                <div className={classes.segmentedControlLabel}>
                  <IconLayoutGrid size={16} />
                  <Text size="sm">Grid</Text>
                </div>
              ),
            },
          ]}
        />
      </Group>
      
      {/* Breadcrumb navigation */}
      <Paper className={classes.breadcrumbContainer}>
        <Breadcrumbs separator="/">
          <Anchor className={classes.breadcrumbLink} fw={700} onClick={() => navigateToFolder(-1)}>
            Home
          </Anchor>
          {folders.map((folder, index) => (
            <Anchor 
              key={index} 
              className={classes.breadcrumbLink} 
              onClick={() => navigateToFolder(index)}
            >
              {folder}
            </Anchor>
          ))}
        </Breadcrumbs>
      </Paper>
      
      {/* Conditional rendering based on view mode */}
      {viewMode === 'table' ? (
        <FileList folder={currentFolder} onFolderOpen={setCurrentFolder} />
      ) : (
        <FileGrid folder={currentFolder} onFolderOpen={setCurrentFolder} />
      )}
    </Box>
  );
}