import { useState, useEffect } from "react";
import type { ImageType } from "@/app/types";
import ROUTES from "@/lib/routes";
import { useDataContext } from "@/contexts/DataContext";

export function useImageTypes() {
  const [imageTypes, setImageTypes] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Try to use data from context if available
  try {
    const dataContext = useDataContext();
    
    // Return the data from context instead of making separate API calls
    return {
      imageTypes: dataContext.imageTypes,
      loading: dataContext.imageTypesLoading,
      error: dataContext.imageTypesError,
      fetchImageTypes: dataContext.refreshImageTypes,
      createImageType: dataContext.createImageType,
      updateImageType: dataContext.updateImageType,
      deleteImageType: dataContext.deleteImageType,
      generateImageTypeImage: dataContext.generateImageTypeImage,
    };
  } catch (e) {
    // If context is not available, fall back to original implementation
    const fetchImageTypes = async () => {
      setLoading(true);
      try {
        const res = await fetch(ROUTES.API.IMAGE_TYPES.BASE);
        if (!res.ok) {
          throw new Error("Failed to fetch image types");
        }
        const data: ImageType[] = await res.json();
        setImageTypes(data);
        return data;
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error occurred");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchImageTypes().catch(console.error);
    }, []);

    const createImageType = async (imageTypeData: Partial<ImageType>) => {
      try {
        const res = await fetch(ROUTES.API.IMAGE_TYPES.BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imageTypeData),
        });
        if (!res.ok) {
          throw new Error("Failed to create image type");
        }
        const newType = await res.json();
        setImageTypes((prev) => [...prev, newType]);
        return newType;
      } catch (err: unknown) {
        if (err instanceof Error) {
          throw new Error(err.message);
        } else {
          throw new Error("Unknown error occurred");
        }
      }
    };

    const updateImageType = async (
      id: string,
      imageTypeData: Partial<ImageType>,
    ) => {
      try {
        const res = await fetch(ROUTES.API.IMAGE_TYPES.DETAIL(id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imageTypeData),
        });
        if (!res.ok) {
          throw new Error("Failed to update image type");
        }
        const updatedType = await res.json();
        setImageTypes((prev) =>
          prev.map((it) => (it.id === id ? updatedType : it)),
        );
        return updatedType;
      } catch (err: unknown) {
        if (err instanceof Error) {
          throw new Error(err.message);
        } else {
          throw new Error("Unknown error occurred");
        }
      }
    };

    const deleteImageType = async (id: string) => {
      try {
        const res = await fetch(ROUTES.API.IMAGE_TYPES.DETAIL(id), {
          method: "DELETE",
        });
        if (!res.ok) {
          throw new Error("Failed to delete image type");
        }
        setImageTypes((prev) => prev.filter((it) => it.id !== id));
      } catch (err: unknown) {
        if (err instanceof Error) {
          throw new Error(err.message);
        } else {
          throw new Error("Unknown error occurred");
        }
      }
    };

    const generateImageTypeImage = async (prompt: string): Promise<string> => {
      try {
        const res = await fetch(ROUTES.API.IMAGE_TYPES.GENERATE_IMAGE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (!res.ok) {
          throw new Error("Failed to generate image");
        }
        const { imageUrl } = await res.json();
        return imageUrl;
      } catch (err: unknown) {
        if (err instanceof Error) {
          throw new Error(err.message);
        } else {
          throw new Error("Unknown error occurred");
        }
      }
    };

    return {
      imageTypes,
      loading,
      error,
      fetchImageTypes,
      createImageType,
      updateImageType,
      deleteImageType,
      generateImageTypeImage,
    };
  }
}