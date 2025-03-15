import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Text, Group, Button, Loader, Image } from '@mantine/core';
import api from '@/api/api';

interface FileDetails {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export function PublicFileViewer() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!fileId) return;
    
    const fetchFileDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/file/${fileId}/url`);
        setFile({
          id: data.file.id,
          name: data.file.name,
          type: data.file.type,
          size: data.file.size,
          url: data.url
        });
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFileDetails();
  }, [fileId]);
  
  const handleDownload = () => {
    if (!file) return;
    
    // Create an anchor and trigger download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Group justify="center">
          <Loader />
          <Text>Loading file...</Text>
        </Group>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Text c="red" style={{ textAlign: 'center' }}>{error}</Text>
      </Card>
    );
  }
  
  if (!file) {
    return null;
  }
  
  // Render content based on file type
  const renderFilePreview = () => {
    // Image preview
    if (file.type.startsWith('image/')) {
      return <Image src={file.url} alt={file.name} height={300} fit="contain" />;
    }
    
    // PDF preview
    if (file.type === 'application/pdf') {
      return (
        <iframe 
          src={file.url} 
          width="100%" 
          height="500px" 
          title={file.name}
          style={{ border: 'none' }}
        />
      );
    }
    
    // Video preview
    if (file.type.startsWith('video/')) {
      return (
        <video 
          controls 
          width="100%" 
          height="auto"
          style={{ maxHeight: '500px' }}
        >
          <source src={file.url} type={file.type} />
          Your browser does not support video playback.
        </video>
      );
    }
    
    // Audio preview
    if (file.type.startsWith('audio/')) {
      return (
        <audio controls style={{ width: '100%' }}>
          <source src={file.url} type={file.type} />
          Your browser does not support audio playback.
        </audio>
      );
    }
    
    // Default: No preview
    return (
      <Text size="lg" mt="md" mb="md">
        This file type cannot be previewed directly. Click the download button below to view the file.
      </Text>
    );
  };
  
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Card.Section p="md">
        <Text fw={500} size="lg">{file.name}</Text>
        <Text size="sm" c="dimmed">
          {file.type} · {(file.size / 1024).toFixed(2)} KB
        </Text>
      </Card.Section>
      
      <Card.Section p="md">
        {renderFilePreview()}
      </Card.Section>
      
      <Button 
        variant="filled" 
        color="blue" 
        fullWidth 
        mt="md" 
        onClick={handleDownload}
      >
        Download File
      </Button>
    </Card>
  );
}