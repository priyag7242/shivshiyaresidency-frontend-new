import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET || 'your-api-secret',
});

export interface UploadResult {
  secure_url: string;
  public_id: string;
  format: string;
}

export const uploadPDFToCloudinary = async (pdfBlob: Blob, fileName: string): Promise<UploadResult> => {
  try {
    // Convert blob to base64
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataURI = `data:application/pdf;base64,${base64String}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'raw',
      public_id: `bills/${fileName}`,
      format: 'pdf',
      folder: 'shiv-shiva-residency',
      use_filename: true,
      unique_filename: true,
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload PDF to cloud storage');
  }
};

export const deletePDFFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

export default cloudinary; 