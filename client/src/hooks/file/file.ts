// hooks/useFiles.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/api/api';
import { notifications } from '@mantine/notifications';

// Types
interface FileItem {
    id: string;
    name: string;
    size: number;
    type: string;
    folder: string | null;
    uploadedAt: string;
    lastAccessed: string;
    isPublic: boolean;
}

interface ListFilesResponse {
    files: FileItem[];
}

interface UploadFileResponse {
    message: string;
    file: FileItem;
}

interface FileUrlResponse {
    url: string;
    file: {
        id: string;
        name: string;
        size: number;
        type: string;
    };
}

interface DeleteFileResponse {
    message: string;
}

interface ToggleVisibilityResponse {
    message: string;
    file: {
        id: string;
        name: string;
        isPublic: boolean;
    };
}

// Upload file hook
export function useUploadFile() {
    const queryClient = useQueryClient();

    return useMutation<UploadFileResponse, AxiosError<{ message: string }>, FormData>({
        mutationFn: async (formData) => {
            const { data } = await api.post('/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        },
        onSuccess: () => {
            // Invalidate the file list query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['files'] });
            notifications.show({
                message: 'File uploaded successfully',
            });
        },
        onError: (error) => {
            notifications.show({
                title: 'Upload failed',
                message: error.response?.data.message || 'Something went wrong',
                color: 'red',
            });
        },
    });
}

// List file hook
export function useListFiles(folder?: string) {
    return useQuery<ListFilesResponse, AxiosError<{ message: string }>>({
        queryKey: ['files', folder],
        queryFn: async () => {
            const params = folder ? { folder } : {};
            const { data } = await api.get('/file/list', { params });
            return data;
        },
        onError: (error) => {
            notifications.show({
                title: 'Failed to load files',
                message: error.response?.data.message || 'Something went wrong',
                color: 'red',
            });
        },
    });
}

// Get file download URL hook
export function useGetFileUrl(fileId: string, enabled = false) {
    return useQuery<FileUrlResponse, AxiosError<{ message: string }>>({
        queryKey: ['fileUrl', fileId],
        queryFn: async () => {
            const { data } = await api.get(`/file/${fileId}/url`);
            return data;
        },
        enabled,
        onError: (error) => {
            notifications.show({
                title: 'Failed to get file URL',
                message: error.response?.data.message || 'Something went wrong',
                color: 'red',
            });
        },
    });
}

// Delete file hook
export function useDeleteFile() {
    const queryClient = useQueryClient();

    return useMutation<DeleteFileResponse, AxiosError<{ message: string }>, string>({
        mutationFn: async (fileId) => {
            const { data } = await api.delete(`/file/${fileId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
            notifications.show({
                message: 'File deleted successfully',
            });
        },
        onError: (error) => {
            notifications.show({
                title: 'Delete failed',
                message: error.response?.data.message || 'Something went wrong',
                color: 'red',
            });
        },
    });
}

// Toggle file visibility hook
export function useToggleFileVisibility() {
    const queryClient = useQueryClient();

    return useMutation<ToggleVisibilityResponse, AxiosError<{ message: string }>, string>({
        mutationFn: async (fileId) => {
            const { data } = await api.patch(`/file/${fileId}/visibility`);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
            notifications.show({
                message: `File is now ${data.file.isPublic ? 'public' : 'private'}`,
            });
        },
        onError: (error) => {
            notifications.show({
                title: 'Failed to change visibility',
                message: error.response?.data.message || 'Something went wrong',
                color: 'red',
            });
        },
    });
}

// Utility hook to download a file
export function useDownloadFile() {
    return useMutation<void, AxiosError<{ message: string }>, { fileId: string; fileName: string }>({
        mutationFn: async ({ fileId, fileName }) => {
            // First get the signed URL
            const { data } = await api.get<FileUrlResponse>(`/file/${fileId}/url`);

            // Then download the file using the URL
            const response = await fetch(data.url);
            const blob = await response.blob();

            // Create a download link and trigger it
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        onError: (error) => {
            notifications.show({
                title: 'Download failed',
                message: error.response?.data.message || 'Something went wrong',
                color: 'red',
            });
        },
    });
}

export function useGetShareLink() {
    return useMutation<{ shareUrl: string; file: { id: string; name: string; type: string } },
        AxiosError<{ message: string }>,
        string>({
            mutationFn: async (fileId) => {
                const { data } = await api.get(`/file/${fileId}/share`);
                return data;
            },
            onSuccess: (data) => {
                // Copy link to clipboard
                navigator.clipboard.writeText(data.shareUrl)
                    .then(() => {
                        notifications.show({
                            message: 'Share link copied to clipboard',
                        });
                    })
                    .catch(() => {
                        notifications.show({
                            message: 'Share link generated',
                        });
                    });
            },
            onError: (error) => {
                notifications.show({
                    title: 'Failed to generate share link',
                    message: error.response?.data.message || 'This file cannot be shared',
                    color: 'red',
                });
            },
        });
}