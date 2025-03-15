import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    PutObjectTaggingCommand,
    GetObjectTaggingCommand,
    PutObjectAclCommand,
    ObjectCannedACL
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-app-files';
const BASE_URL = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;

// Helper function to generate user-specific prefix
const getUserPrefix = (userId: string): string => {
    return `user-${userId}/`;
};

// Upload a file to S3 with optional public access
export const uploadFile = async (
    userId: string,
    fileName: string,
    fileContent: Buffer,
    contentType: string,
    isPublic: boolean = false
): Promise<string> => {
    const key = `${getUserPrefix(userId)}${fileName}`;

    const acl: ObjectCannedACL = isPublic ? 'public-read' : 'private';

    const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ACL: acl,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Add a tag to indicate public status
    if (isPublic) {
        await s3Client.send(new PutObjectTaggingCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Tagging: {
                TagSet: [
                    {
                        Key: 'public',
                        Value: 'true'
                    }
                ]
            }
        }));
    }

    return key;
};

// Get a signed URL for downloading a file
export const getFileUrl = async (userId: string, fileKey: string, expiresIn = 3600): Promise<string> => {
    // Get object tagging to check if file is public
    try {
        const tagResponse = await s3Client.send(new GetObjectTaggingCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey
        }));

        const isPublic = tagResponse.TagSet?.some(tag => tag.Key === 'public' && tag.Value === 'true');

        // If file is public, return a direct URL
        if (isPublic) {
            return `${BASE_URL}/${encodeURIComponent(fileKey)}`;
        }

        // Otherwise ensure user ownership and return a signed URL
        if (!fileKey.startsWith(getUserPrefix(userId))) {
            throw new Error('Access denied to this file');
        }

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        return getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
        // If we can't get tags, fall back to checking prefix and using signed URL
        if (!fileKey.startsWith(getUserPrefix(userId))) {
            throw new Error('Access denied to this file');
        }

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        return getSignedUrl(s3Client, command, { expiresIn });
    }
};

// Get a direct public URL for a file (only if it's public)
export const getPublicFileUrl = async (fileKey: string): Promise<string | null> => {
    try {
        // Check if file is public
        const tagResponse = await s3Client.send(new GetObjectTaggingCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey
        }));

        const isPublic = tagResponse.TagSet?.some(tag => tag.Key === 'public' && tag.Value === 'true');

        if (isPublic) {
            return `${BASE_URL}/${encodeURIComponent(fileKey)}`;
        }

        return null; // Not public
    } catch (error) {
        return null; // Error or not public
    }
};

// Delete a file from S3
export const deleteFile = async (userId: string, fileKey: string): Promise<void> => {
    // Make sure the user can only delete their own files
    if (!fileKey.startsWith(getUserPrefix(userId))) {
        throw new Error('Access denied to this file');
    }

    const deleteParams = {
        Bucket: BUCKET_NAME,
        Key: fileKey,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
};

// List user files
export const listUserFiles = async (userId: string, prefix = ''): Promise<{ key: string; size: number; lastModified: Date }[]> => {
    const userPrefix = getUserPrefix(userId);
    const fullPrefix = prefix ? `${userPrefix}${prefix}` : userPrefix;

    const listParams = {
        Bucket: BUCKET_NAME,
        Prefix: fullPrefix,
    };

    const response = await s3Client.send(new ListObjectsV2Command(listParams));

    return (response.Contents || []).map(item => ({
        key: item.Key || '',
        size: item.Size || 0,
        lastModified: item.LastModified || new Date(),
    }));
};

// Update file visibility
export const setFileVisibility = async (userId: string, fileKey: string, isPublic: boolean): Promise<void> => {
    // Make sure the user can only modify their own files
    if (!fileKey.startsWith(getUserPrefix(userId))) {
        throw new Error('Access denied to this file');
    }

    const aclParams = {
        Bucket: BUCKET_NAME,
        Key: fileKey,
        ACL: isPublic ? 'public-read' as ObjectCannedACL : 'private' as ObjectCannedACL
    };

    await s3Client.send(new PutObjectAclCommand(aclParams));

    // Update file tags to indicate public status
    const tagParams = {
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Tagging: {
            TagSet: isPublic ? [{ Key: 'public', Value: 'true' }] : []
        }
    };

    await s3Client.send(new PutObjectTaggingCommand(tagParams));
};