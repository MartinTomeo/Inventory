export class PhotoUtils {
  static readonly maxFileSize = 5 * 1024 * 1024;

  static readonly allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  static readonly accept = PhotoUtils.allowedTypes.join(',');

  static validate(photo: File): string | null {
    if (photo.size > PhotoUtils.maxFileSize) {
      return 'La imagen no puede superar los 5 MB.';
    }

    if (!PhotoUtils.allowedTypes.includes(photo.type)) {
      return 'Seleccioná una imagen JPG, PNG o WebP.';
    }

    return null;
  }

  static select(
    event: Event
  ): { photo: File | null; error: string | null } | null {
    const input = event.target as HTMLInputElement;
    const photo = input.files?.[0];

    // Si cancela el selector, conservamos la selección anterior.
    if (!photo) return null;

    const error = PhotoUtils.validate(photo);

    // Permite volver a seleccionar el mismo archivo.
    // El archivo válido se conservará en selectedPhoto.
    input.value = '';

    return {
      photo: error ? null : photo,
      error,
    };
  }

  static uploadError(code: unknown): string | null {
    switch (code) {
      case 'PHOTO_REQUIRED':
        return 'Seleccioná una imagen.';

      case 'FILE_TOO_LARGE':
        return 'La imagen no puede superar los 5 MB.';

      case 'INVALID_IMAGE_TYPE':
        return 'Seleccioná una imagen JPG, PNG o WebP.';

      case 'INVALID_UPLOAD':
        return 'El archivo subido no es válido.';

      case 'FILE_UPLOAD_ERROR':
        return 'No se pudo subir la imagen. Intentá nuevamente.';

      case 'FILE_STORAGE_ERROR':
        return 'El servidor no pudo guardar la imagen.';

      default:
        return null;
    }
  }
}
