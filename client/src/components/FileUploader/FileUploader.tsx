import { useState, useEffect } from 'react';
import { Button, Group, Text, Progress, Card, Box, Center } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useUploadFile } from '@/hooks/file/file';
import { IconCloudUpload, IconX, IconDownload, IconCheck, IconFileUpload } from '@tabler/icons-react';

export function FileUploader({ folder = '', onSuccess = () => {} }) {
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const uploadFile = useUploadFile();
  
  // Simulate progress updates
  useEffect(() => {
    if (uploadFile.isPending) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          // Cap at 95% until complete to indicate waiting for server response
          const newProgress = prev + (5 * Math.random());
          return Math.min(newProgress, 95);
        });
      }, 400);
      
      return () => clearInterval(interval);
    } else if (uploadFile.isSuccess) {
      setProgress(100);
      onSuccess();
    }
  }, [uploadFile.isPending, uploadFile.isSuccess, onSuccess]);
  
  const handleDrop = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    setProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    
    uploadFile.mutate(formData);
  };
  
  const handleReset = () => {
    if (!uploadFile.isPending) {
      setFileName('');
      setProgress(0);
      // Reset the upload state
      uploadFile.reset();
    }
  };

  return (
    <Card shadow="sm" p="xl" radius="md" withBorder className="mx-auto max-w-2xl">
      <Card.Section p="md" bg="blue.0">
        <Center>
          <IconCloudUpload size={48} color="#228be6" stroke={1.5} />
        </Center>
        <Text ta="center" fw={700} size="xl" mt="md">
          Upload Files
        </Text>
      </Card.Section>

      <Box mt="md">
        <Dropzone
          onDrop={handleDrop}
          maxSize={10 * 1024 * 1024}
          loading={uploadFile.isPending}
          multiple={false}
          radius="md"
          accept={['image/*', 'application/pdf', '.docx', '.xlsx']}
          className={fileName ? 'border-blue-400' : ''}
        >
          <Group justify="center" gap="xl" style={{ minHeight: 140, pointerEvents: 'none' }}>
            <Dropzone.Accept>
              <Center>
                <IconDownload size={50} stroke={1.5} color="#228be6" />
                <Box ml="md">
                  <Text size="xl" inline fw={500}>
                    Drop file here
                  </Text>
                </Box>
              </Center>
            </Dropzone.Accept>
            
            <Dropzone.Reject>
              <Center>
                <IconX size={50} stroke={1.5} color="#ff6b6b" />
                <Box ml="md">
                  <Text size="xl" inline fw={500} c="red">
                    File not accepted
                  </Text>
                  <Text size="sm" c="dimmed" mt={7}>
                    File may be too large or not supported
                  </Text>
                </Box>
              </Center>
            </Dropzone.Reject>
            
            <Dropzone.Idle>
              {!fileName ? (
                <Center>
                  <IconFileUpload size={50} stroke={1.5} />
                  <Box ml="md">
                    <Text size="xl" inline fw={500}>
                      Click or drag file here
                    </Text>
                    <Text size="sm" c="dimmed" mt={7}>
                      File should not exceed 10MB
                    </Text>
                  </Box>
                </Center>
              ) : (
                <Center>
                  {uploadFile.isSuccess ? (
                    <IconCheck size={32} stroke={1.5} color="#12b886" />
                  ) : (
                    <IconFileUpload size={32} stroke={1.5} />
                  )}
                  <Box ml="md" style={{ maxWidth: '80%' }}>
                    <Text truncate fw={500}>
                      {fileName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {uploadFile.isSuccess ? 'Uploaded successfully' : 
                      uploadFile.isPending ? 'Uploading...' : 'Ready to upload'}
                    </Text>
                  </Box>
                </Center>
              )}
            </Dropzone.Idle>
          </Group>
        </Dropzone>
      </Box>

      {(uploadFile.isPending || (uploadFile.isSuccess && fileName)) && (
        <Box mt="md">
          <Group justify="space-between" mb={5}>
            <Text size="sm" fw={500}>
              {uploadFile.isPending ? 'Uploading...' : 'Upload complete'}
            </Text>
            <Text size="sm" fw={500}>
              {Math.round(progress)}%
            </Text>
          </Group>
          <Progress 
            value={progress} 
            size="md" 
            radius="xl" 
            color={uploadFile.isSuccess ? 'green' : 'blue'} 
            striped={uploadFile.isPending}
            animated={uploadFile.isPending}
          />
        </Box>
      )}

      {uploadFile.isError && (
        <Text c="red" size="sm" mt="md">
          {uploadFile.error.response?.data.message || 'Upload failed. Please try again.'}
        </Text>
      )}

      <Group mt="xl" justify="space-between">
        {fileName && !uploadFile.isPending && (
          <Button 
            variant="light" 
            color={uploadFile.isSuccess ? "green" : "blue"} 
            onClick={handleReset}
            leftSection={uploadFile.isSuccess ? <IconCheck size={16} /> : <IconX size={16} />}
          >
            {uploadFile.isSuccess ? 'Upload Another File' : 'Clear Selection'}
          </Button>
        )}
        
        {fileName && !uploadFile.isSuccess && !uploadFile.isPending && (
          <Button 
            onClick={() => {
              const formData = new FormData();
              formData.append('file', new File([], fileName));
              if (folder) {
                formData.append('folder', folder);
              }
              uploadFile.mutate(formData);
            }} 
            disabled={uploadFile.isPending}
          >
            Upload Now
          </Button>
        )}
      </Group>
    </Card>
  );
}