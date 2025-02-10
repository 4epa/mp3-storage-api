import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class FileService {
  private readonly s3Client = new S3Client({
    region: process.env.AWS_REGION,
  });

  async upload(file: Buffer, fileName: string, fileType: string) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file,
        ContentType: fileType,
      }),
    );
  }
}
