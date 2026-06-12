import type { FabricCanvasHandle } from '@/lib/types';
import type { RefObject } from 'react';

export function useArtworkBridge(fabricRef: RefObject<FabricCanvasHandle | null>) {
  const handleArtworkUpload = (file: File) => {
    if (!file || !fabricRef.current) return;
    const reader = new FileReader();
    reader.onload = (e) => fabricRef.current?.addArtwork(e.target!.result as string);
    reader.readAsDataURL(file);
  };

  const handleArtworkRemove          = ()            => fabricRef.current?.removeArtwork();
  const handleArtworkAlign           = (dir: string) => fabricRef.current?.alignArtwork(dir);
  const handleArtworkUpdateTransform = ()            => fabricRef.current?.applyTransformFromState();

  const handleLeftChestUpload = (file: File) => {
    if (!file || !fabricRef.current) return;
    const reader = new FileReader();
    reader.onload = (e) => fabricRef.current?.addLeftChestArtwork(e.target!.result as string);
    reader.readAsDataURL(file);
  };

  const handleLeftChestRemove = () => fabricRef.current?.removeLeftChestArtwork();

  return {
    handleArtworkUpload,
    handleArtworkRemove,
    handleArtworkAlign,
    handleArtworkUpdateTransform,
    handleLeftChestUpload,
    handleLeftChestRemove,
  };
}
