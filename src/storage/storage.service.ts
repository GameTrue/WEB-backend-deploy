import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand 
} from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'ru-central1',
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        accessKeyId: process.env.YANDEX_STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.YANDEX_STORAGE_SECRET_KEY,
      },
    });
    
    this.bucketName = process.env.YANDEX_STORAGE_BUCKET || 'course-bucket';
  }

  /**
   * Загрузка файла в Object Storage
   * @param file Файл из multer
   * @param path Путь для сохранения в бакете (например, 'avatars/user123.jpg')
   * @returns URL загруженного файла
   */
  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: path,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', 
    });

    try {
      await this.s3Client.send(command);
      return `https://${this.bucketName}.storage.yandexcloud.net/${path}`;
    } catch (error) {
      console.error('Error uploading file to Yandex Object Storage:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Удаление файла из Object Storage
   * @param path Путь к файлу в бакете
   */
  async deleteFile(path: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: path,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from Yandex Object Storage:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Генерирует путь для файла аватара
   * @param userId ID пользователя
   * @param fileExtension Расширение файла
   * @returns Путь для хранения в бакете
   */
  generateAvatarPath(userId: string, fileExtension: string): string {
    return `avatars/${userId}${fileExtension}`;
  }

  /**
   * Получить URL аватара по умолчанию
   * @returns URL аватара по умолчанию
   */
  getDefaultAvatarUrl(): string {
    return 'https://course-bucket.storage.yandexcloud.net/avatars/fb54f6a6-f01e-4600-82d6-a7345d456d96.png'; 
  }
}