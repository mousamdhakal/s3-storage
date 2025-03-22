import { useState } from 'react';
import {
  IconDotsVertical,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconFile,
  IconFileMusic,
  IconFileSpreadsheet,
  IconFileText,
  IconFileZip,
  IconFolderOpen,
  IconPdf,
  IconPhoto,
  IconShare,
  IconTrash,
  IconVideo,
  IconClock,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Center,
  Group,
  Loader,
  Menu,
  Modal,
  Paper,
  SimpleGrid,
  Text,
  UnstyledButton,
  useMantineColorScheme,
  useMantineTheme,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  useDeleteFile,
  useDownloadFile,
  useGetShareLink,
  useListFiles,
  useToggleFileVisibility,
} from '../../hooks/file/file';
import { FilePreview } from '../FilePreview/FilePreview';
import classes from './FileGrid.module.css'

interface FileGridProps {
  folder: string;
  onFolderOpen: (folderPath: string) => void;
}

export function FileGrid({ folder = '', onFolderOpen }: FileGridProps) {
  const { data, isLoading, isError } = useListFiles(folder);
  const deleteFile = useDeleteFile();
  const toggleVisibility = useToggleFileVisibility();
  const downloadFile = useDownloadFile();
  const getShareLink = useGetShareLink();
  const theme = useMantineTheme();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const { colorScheme } = useMantineColorScheme();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = (type: string, size = 40) => {
    switch (true) {
      case type.includes('folder'):
        return <IconFolderOpen size={size} color={theme.colors.blue[6]} />;
      case type.includes('image'):
        return <IconPhoto size={size} color={theme.colors.green[6]} />;
      case type.includes('video'):
        return <IconVideo size={size} color={theme.colors.red[6]} />;
      case type.includes('audio'):
        return <IconFileMusic size={size} color={theme.colors.violet[6]} />;
      case type.includes('pdf'):
        return <IconPdf size={size} color={theme.colors.red[7]} />;
      case type.includes('spreadsheet'):
      case type.includes('excel'):
      case type.includes('csv'):
        return <IconFileSpreadsheet size={size} color={theme.colors.green[7]} />;
      case type.includes('text'):
      case type.includes('document'):
        return <IconFileText size={size} color={theme.colors.blue[7]} />;
      case type.includes('zip'):
      case type.includes('compressed'):
        return <IconFileZip size={size} color={theme.colors.orange[7]} />;
      default:
        return <IconFile size={size} color={theme.colors.gray[6]} />;
    }
  };

  const previewFile = (file: any) => {
    if (isPreviewable(file.type)) {
      setSelectedFile(file);
      open();
    }
  };

  const isPreviewable = (type: string) => {
    return (
      type.includes('image') ||
      type.includes('video') ||
      type.includes('audio') ||
      type.includes('pdf') ||
      type.includes('text')
    );
  };

  const handleItemClick = (file: any) => {
    if (file.type === 'folder') {
      const newPath = folder ? `${folder}/${file.name}` : file.name;
      onFolderOpen(newPath);
    } else {
      previewFile(file);
    }
  };

  const handleDownload = (e: React.MouseEvent, fileId: string, fileName: string) => {
    e.stopPropagation();
    downloadFile.mutate({ fileId, fileName });
  };

  const handleShare = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    getShareLink.mutate(fileId);
  };

  const handleToggleVisibility = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    toggleVisibility.mutate(fileId);
  };

  const handleDelete = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    deleteFile.mutate(fileId);
  };

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    );
  }

  if (isError) {
    return (
      <Paper p="md" withBorder>
        <Text c="red">Error loading files</Text>
      </Paper>
    );
  }

  if (!data?.files.length) {
    return (
      <Paper p="md" withBorder>
        <Text style={{ textAlign: 'center' }}>No files found in this location</Text>
      </Paper>
    );
  }

  return (
    <>
      <SimpleGrid
        cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 5 }}
        spacing="md"
        className={classes.gridContainer}
      >
        {data.files.map((file) => (
          <Paper
            key={file.id}
            withBorder
            shadow="sm"
            className={classes.fileCard}
            onClick={() => handleItemClick(file)}
          >
            {/* File Actions Bar */}
            <div className={`file-actions ${classes.fileActions}`}>
              <Badge
                size="sm"
                color={file.isPublic ? 'green' : 'blue'}
                variant={colorScheme === 'dark' ? 'filled' : 'light'}
              >
                {file.isPublic ? 'Public' : 'Private'}
              </Badge>
              
              <Group gap={4}>
                <Tooltip label="Download">
                  <ActionIcon
                    size="sm"
                    color="blue"
                    variant="light"
                    onClick={(e) => handleDownload(e, file.id, file.name)}
                  >
                    <IconDownload size={14} />
                  </ActionIcon>
                </Tooltip>
                
                {file.isPublic && (
                  <Tooltip label="Share">
                    <ActionIcon
                      size="sm"
                      color="green"
                      variant="light"
                      onClick={(e) => handleShare(e, file.id)}
                    >
                      <IconShare size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
                
                <Menu position="bottom-end" withinPortal>
                  <Menu.Target>
                    <ActionIcon 
                      size="sm" 
                      variant="light"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconDotsVertical size={14} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                    <Menu.Item
                      leftSection={file.isPublic ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                      onClick={(e) => handleToggleVisibility(e, file.id)}
                    >
                      Make {file.isPublic ? 'Private' : 'Public'}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={(e) => handleDelete(e, file.id)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </div>

            {/* File Content */}
            <Box className={classes.fileButton}>
              <div className={classes.iconWrapper}>
                {getFileIcon(file.type)}
              </div>
              <Text className={classes.fileName} lineClamp={2}>
                {file.name}
              </Text>
            </Box>

            {/* File Metadata Footer */}
            <Box className={classes.fileFooter}>
              <Text className={classes.fileMetadata}>{formatFileSize(file.size)}</Text>
              <Tooltip label={formatDate(file.uploadedAt)}>
                <Group gap={4}>
                  <IconClock size={12} />
                  <Text className={classes.fileMetadata}>
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </Text>
                </Group>
              </Tooltip>
            </Box>
          </Paper>
        ))}
      </SimpleGrid>

      <Modal opened={opened} onClose={close} title={selectedFile?.name || ''} size="xl" centered>
        {selectedFile && <FilePreview file={selectedFile} onDownload={handleDownload} onShare={handleShare} />}
      </Modal>
    </>
  );
}