import {
    IconDotsVertical,
    IconDownload,
    IconEye,
    IconEyeOff,
    IconShare,
    IconTrash,
    IconFolderOpen,
    IconFile,
    IconFileText,
    IconFileSpreadsheet,
    IconPdf,
    IconFileZip,
    IconPhoto,
    IconVideo,
    IconFileMusic,
  } from '@tabler/icons-react';
  import {
    ActionIcon,
    Badge,
    Group,
    Menu,
    Table,
    Text,
    Box,
    Paper,
    Modal,
    useMantineTheme,
    ScrollArea,
    Center,
    Loader,
    UnstyledButton,
    useMantineColorScheme,
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
  import { useState } from 'react';
  import { FilePreview } from '../FilePreview/FilePreview';
  import styles from './FileList.module.css';
  
  interface FileListProps {
    folder: string;
    onFolderOpen: (folderPath: string) => void;
  }
  
  export function FileList({ folder = '', onFolderOpen }: FileListProps) {
    const { data, isLoading, isError } = useListFiles(folder);
    const deleteFile = useDeleteFile();
    const toggleVisibility = useToggleFileVisibility();
    const downloadFile = useDownloadFile();
    const getShareLink = useGetShareLink();
    const theme = useMantineTheme();
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
  
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
  
    const handleDownload = (fileId: string, fileName: string) => {
      downloadFile.mutate({ fileId, fileName });
    };
  
    const getFileIcon = (type: string) => {
      switch (true) {
        case type.includes('folder'):
          return <IconFolderOpen size={20} className={styles.folderIcon} />;
        case type.includes('image'):
          return <IconPhoto size={20} className={styles.imageIcon} />;
        case type.includes('video'):
          return <IconVideo size={20} className={styles.videoIcon} />;
        case type.includes('audio'):
          return <IconFileMusic size={20} className={styles.audioIcon} />;
        case type.includes('pdf'):
          return <IconPdf size={20} className={styles.pdfIcon} />;
        case type.includes('spreadsheet'):
        case type.includes('excel'):
        case type.includes('csv'):
          return <IconFileSpreadsheet size={20} className={styles.spreadsheetIcon} />;
        case type.includes('text'):
        case type.includes('document'):
          return <IconFileText size={20} className={styles.textIcon} />;
        case type.includes('zip'):
        case type.includes('compressed'):
          return <IconFileZip size={20} className={styles.zipIcon} />;
        default:
          return <IconFile size={20} className={styles.fileIcon} />;
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
  
    if (isLoading) {
      return (
        <Center h={200} className={styles.loaderContainer}>
          <Loader size="md" color={theme.primaryColor} />
        </Center>
      );
    }
  
    if (isError) {
      return (
        <Paper p="md" withBorder className={styles.errorContainer}>
          <Text c="red" ta="center">Error loading files</Text>
        </Paper>
      );
    }
  
    if (!data?.files.length) {
      return (
        <Paper p="md" withBorder className={styles.emptyContainer}>
          <Text ta="center">No files found in this location</Text>
        </Paper>
      );
    }
  
    return (
      <>
        <Paper withBorder radius="md" shadow="sm" className={styles.fileListContainer}>
          <ScrollArea className={styles.scrollArea}>
            <Table highlightOnHover className={styles.fileTable}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.nameColumn}>Name</th>
                  <th className={styles.sizeColumn}>Size</th>
                  <th className={styles.typeColumn}>Type</th>
                  <th className={styles.dateColumn}>Uploaded</th>
                  <th className={styles.statusColumn}>Status</th>
                  <th className={styles.actionsColumn}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.files.map((file) => (
                  <tr key={file.id} className={styles.fileRow}>
                    <td>
                      <UnstyledButton
                        onClick={() => handleItemClick(file)}
                        className={styles.fileButton}
                      >
                        <Group gap="sm">
                          {getFileIcon(file.type)}
                          <Text fw={500} className={styles.fileName}>{file.name}</Text>
                        </Group>
                      </UnstyledButton>
                    </td>
                    <td className={styles.fileSize}>{formatFileSize(file.size)}</td>
                    <td className={styles.fileType}>{file.type}</td>
                    <td className={styles.fileDate}>{formatDate(file.uploadedAt)}</td>
                    <td>
                      <Badge
                        color={file.isPublic ? 'green' : 'blue'}
                        variant={isDark ? 'filled' : 'light'}
                        className={styles.statusBadge}
                      >
                        {file.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </td>
                    <td>
                      <Group gap="xs" className={styles.actionGroup}>
                        <Tooltip label="Download" withArrow position="top">
                          <ActionIcon
                            color="blue"
                            variant="light"
                            onClick={() => handleDownload(file.id, file.name)}
                            loading={downloadFile.isPending}
                            className={styles.actionButton}
                          >
                            <IconDownload size={18} />
                          </ActionIcon>
                        </Tooltip>
                        
                        {file.isPublic && (
                          <Tooltip label="Share" withArrow position="top">
                            <ActionIcon
                              color="green"
                              variant="light"
                              onClick={() => getShareLink.mutate(file.id)}
                              className={styles.actionButton}
                            >
                              <IconShare size={18} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        
                        <Menu position="bottom-end" withinPortal>
                          <Menu.Target>
                            <ActionIcon variant="light" className={styles.menuButton}>
                              <IconDotsVertical size={18} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown className={styles.menuDropdown}>
                            <Menu.Item
                              leftSection={file.isPublic ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                              onClick={() => toggleVisibility.mutate(file.id)}
                              className={styles.menuItem}
                            >
                              Make {file.isPublic ? 'Private' : 'Public'}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => deleteFile.mutate(file.id)}
                              className={styles.deleteMenuItem}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </Paper>
  
        <Modal
          opened={opened}
          onClose={close}
          title={selectedFile?.name || ''}
          size="xl"
          centered
          classNames={{ 
            title: styles.modalTitle,
            content: styles.modalContent
          }}
        >
          {selectedFile && <FilePreview file={selectedFile} />}
        </Modal>
      </>
    );
  }