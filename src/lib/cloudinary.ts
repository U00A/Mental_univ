// Cloudinary configuration and utilities
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';

// Initialize Cloudinary instance
export const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dykg2ijpf',
  },
});

// Generate optimized image URL
export function getOptimizedImageUrl(publicId: string, width = 500, height = 500) {
  return cld
    .image(publicId)
    .format('auto')
    .quality('auto')
    .resize(auto().gravity(autoGravity()).width(width).height(height))
    .toURL();
}

// Generate profile avatar URL
export function getAvatarUrl(publicId: string | undefined, size = 200) {
  if (!publicId) return null;
  return getOptimizedImageUrl(publicId, size, size);
}

// Cloudinary upload widget configuration
export const uploadPreset = 'rahatek_uploads'; // You'll need to create this in Cloudinary dashboard

// Upload image using unsigned upload (for client-side)
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  return data.public_id;
}
