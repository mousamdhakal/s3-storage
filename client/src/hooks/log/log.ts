// hooks/useLogs.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/api/api';
import { notifications } from '@mantine/notifications';

// Types
interface LogItem {
    id: string;
    action: string;
    details: string | null;
    timestamp: string;
    userId: string;
    fileId: string | null;
    file?: {
        id: string;
        name: string;
        type: string;
    };
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

interface ListLogsResponse {
    logs: LogItem[];
    pagination: PaginationInfo;
}

interface LogDetailsResponse {
    log: LogItem & {
        file?: {
            id: string;
            name: string;
            type: string;
            size: number;
            isPublic: boolean;
        };
    };
}

interface FileActivityLogsResponse {
    logs: LogItem[];
}

interface DeleteLogsResponse {
    message: string;
}

// Query parameters for fetching logs
export interface LogQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    action?: string;
    fileId?: string;
    startDate?: string;
    endDate?: string;
}

// Hook to fetch user logs with filtering and pagination
export function useUserLogs(params: LogQueryParams = {}) {
    return useQuery<ListLogsResponse, AxiosError<{ message: string }>>({
        queryKey: ['logs', params],
        queryFn: async () => {
            const { data } = await api.get('/logs', { params });
            return data;
        }
    });
}

// Hook to fetch details of a specific log
export function useLogDetails(logId: string, enabled = true) {
    return useQuery<LogDetailsResponse, AxiosError<{ message: string }>>({
        queryKey: ['log', logId],
        queryFn: async () => {
            const { data } = await api.get(`/logs/${logId}`);
            return data;
        },
        enabled
    });
}

// Hook to fetch logs for a specific file
export function useFileActivityLogs(fileId: string, enabled = true) {
    return useQuery<FileActivityLogsResponse, AxiosError<{ message: string }>>({
        queryKey: ['fileLogs', fileId],
        queryFn: async () => {
            const { data } = await api.get(`/logs/file/${fileId}`);
            return data;
        },
        enabled
    });
}

// Hook to export logs to CSV
export function useExportLogs() {
    return useMutation<void, AxiosError<{ message: string }>, LogQueryParams>({
        mutationFn: async (params) => {
            // Fetch logs with the specified filters
            const { data } = await api.get<ListLogsResponse>('/logs', {
                params: { ...params, limit: 1000 }
            });

            // Convert logs to CSV format
            const headers = ['Date', 'Action', 'Details', 'File'];
            const rows = data.logs.map(log => [
                new Date(log.timestamp).toLocaleString(),
                log.action,
                log.details || '',
                log.file ? log.file.name : ''
            ]);

            // Create CSV content
            let csvContent = headers.join(',') + '\n';
            rows.forEach(row => {
                // Properly escape CSV fields
                const escapedRow = row.map(field => {
                    // If field contains commas, quotes, or newlines, wrap in quotes and escape inner quotes
                    if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
                        return `"${field.replace(/"/g, '""')}"`;
                    }
                    return field;
                });
                csvContent += escapedRow.join(',') + '\n';
            });

            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        onError: (error) => {
            notifications.show({
                title: 'Failed to export logs',
                message: error.response?.data.message || 'Something went wrong',
                color: 'red',
            });
        }
    });
}

interface LogStatsResponse {
    actionCounts: { action: string; count: number }[];
    dailyActivity: { date: string; count: number }[];
    mostAccessedFiles: { id: string; name: string; count: string | number }[];
    weeklyTrend: Record<string, number | string>[];
}

// Hook for log statistics
export function useLogStats(timeRange: string = '30days') {
    return useQuery<LogStatsResponse, AxiosError<{ message: string }>>({
        queryKey: ['logStats', timeRange],
        queryFn: async () => {
            const { data } = await api.get<LogStatsResponse>('/logs/statistics', {
                params: { timeRange }
            });

            // Convert count strings to numbers for consistent usage
            return {
                ...data,
                actionCounts: data.actionCounts.map(item => ({
                    action: item.action,
                    count: item.count
                })),
                mostAccessedFiles: data.mostAccessedFiles.map(file => ({
                    id: file.id,
                    name: file.name,
                    count: typeof file.count === 'string' ? Number(file.count) : file.count
                }))
            };
        },
        // Refresh every 30 minutes
        refetchInterval: 30 * 60 * 1000
    });
}