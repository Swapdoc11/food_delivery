/**
 * Validates and formats an image URL
 */
export function getValidImageUrl(imageUrl, defaultImage = '/foodie.png') {
    if (!imageUrl) return defaultImage;
    
    try {
        // Handle Cloudinary URLs
        if (imageUrl.includes('cloudinary.com')) {
            return imageUrl;
        }
        
        // Handle absolute URLs
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        // Handle relative URLs
        if (imageUrl.startsWith('/')) {
            return imageUrl;
        }
        
        // If none of the above, assume it's a relative path and prepend /
        return `/${imageUrl}`;
    } catch (error) {
        console.error('Invalid image URL:', error);
        return defaultImage;
    }
}
