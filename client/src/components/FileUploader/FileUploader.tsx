// components/FileUploader.tsx
import { useState } from 'react';
import { Button, Group, Text, Progress } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useUploadFile } from '@/hooks/file/file';

export function FileUploader({ folder = '' }) {
  const [progress, setProgress] = useState(0);
  const uploadFile = useUploadFile();

  const handleDrop = (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    if (folder) {
      formData.append('folder', folder);
    }
    
    uploadFile.mutate(formData);
  };

  return (
    <div>
      <Dropzone
        onDrop={handleDrop}
        maxSize={10 * 1024 * 1024} // 10MB
        loading={uploadFile.isPending}
      >
        <Group align="center" gap="xl" style={{ minHeight: 150, pointerEvents: 'none' }}>
          <div>
            <Text size="xl" inline>
              Drag a file here or click to select
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              File should not exceed 10MB
            </Text>
          </div>
        </Group>
      </Dropzone>
      
      {uploadFile.isPending && (
        <Progress value={progress} size="sm" mt="md" />
      )}
      
      {uploadFile.isError && (
        <Text c="red" size="sm" mt="md">
          {uploadFile.error.response?.data.message || 'Upload failed'}
        </Text>
      )}
    </div>
  );
}
