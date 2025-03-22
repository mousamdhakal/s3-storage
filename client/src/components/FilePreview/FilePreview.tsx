import {
  IconClock,
  IconDownload,
  IconFile,
  IconFileBroken,
  IconPhoto,
  IconRuler,
  IconShare,
  IconVideoOff,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Center,
  Group,
  Image,
  Paper,
  Text,
  useMantineTheme,
} from '@mantine/core';
import classes from './FilePreview.module.css';

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    type: string;
    url?: string;
    size: number;
    uploadedAt?: string;
    isPublic?: boolean;
  };
  onDownload?: (e:any, fileId: string, fileName: string) => void;
  onShare?: (e:any,fileId: string) => void;
}

export function FilePreview({ file, onDownload, onShare }: FilePreviewProps) {
  const theme = useMantineTheme();

  // In a real application, you would have a proper URL for the file
  const fileUrl = file.url;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleString();
  };

  // Render different preview based on file type
  const renderPreview = () => {
    if (file.type.includes('image')) {
      return (
        <div className={classes.previewContent}>
          <Image src={fileUrl} alt={file.name} fit="contain" className={classes.imagePreview} />
        </div>
      );
    }

    if (file.type.includes('video')) {
      return (
        <div className={classes.previewContent}>
          <video
            controls
            className={classes.videoPreview}
            onError={(e) => {
              // Handle video loading error
              const target = e.target as HTMLVideoElement;
              target.style.display = 'none';
              // Could show error element instead
            }}
          >
            <source src={fileUrl} type={file.type} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (file.type.includes('audio')) {
      return (
        <div className={classes.previewContent}>
          <Box py={40} className={classes.audioPreview}>
            <audio controls style={{ width: '100%' }}>
              <source src={fileUrl} type={file.type} />
              Your browser does not support the audio tag.
            </audio>
          </Box>
        </div>
      );
    }

    if (file.type.includes('pdf')) {
      return (
        <div className={classes.previewContent} style={{ padding: 0 }}>
          <Box h={600} w="100%">
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1`}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title={file.name}
            />
          </Box>
        </div>
      );
    }

    if (file.type.includes('text') || file.type.includes('code')) {
      return (
        <div className={classes.previewContent} style={{ padding: 0 }}>
          <Box
            component="iframe"
            src={fileUrl}
            width="100%"
            height={400}
            style={{ border: 'none' }}
            title={file.name}
          />
        </div>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className={classes.previewContent}>
        <Box className={classes.fallbackContainer}>
          <IconFileBroken size={64} className={classes.fallbackIcon} />
          <Text size="lg" fw={500} mb="md">
            Preview not available for this file type
          </Text>
          <Text size="sm" c="dimmed">
            Please download the file to view its contents
          </Text>
        </Box>
      </div>
    );
  };

  return (
    <Paper className={classes.previewContainer}>

      {renderPreview()}

      <div className={classes.previewFooter}>
        <Group justify="space-between">
          <Group>
            <div className={classes.metadataItem}>
              <IconFile size={16} />
              <Text size="sm">{file.type}</Text>
            </div>

            <div className={classes.metadataItem}>
              <IconRuler size={16} />
              <Text size="sm">{formatFileSize(file.size)}</Text>
            </div>
          </Group>

        <Group>
          {onDownload && (
            <ActionIcon
              color="blue"
              variant="light"
              onClick={(e) => onDownload(e,file.id, file.name)}
              title="Download"
            >
              <IconDownload size={18} />
            </ActionIcon>
          )}

          {onShare && file.isPublic && (
            <ActionIcon
              color="green"
              variant="light"
              onClick={(e) => onShare(e, file.id)}
              title="Share"
            >
              <IconShare size={18} />
            </ActionIcon>
          )}
        </Group>

          {file.uploadedAt && (
            <div className={classes.metadataItem}>
              <IconClock size={16} />
              <Text size="sm">{formatDate(file.uploadedAt)}</Text>
            </div>
          )}
        </Group>
      </div>
    </Paper>
  );
}
