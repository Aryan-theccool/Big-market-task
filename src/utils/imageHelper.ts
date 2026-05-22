export const compressAndResizeImage = (base64Str: string, maxW = 800, maxH = 800): Promise<{ src: string; w: number; h: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxW || h > maxH) {
        const ratio = w / h;
        if (w > h) {
          w = maxW;
          h = Math.round(maxW / ratio);
        } else {
          h = maxH;
          w = Math.round(maxH * ratio);
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        resolve({
          src: canvas.toDataURL('image/jpeg', 0.82),
          w,
          h,
        });
      } else {
        resolve({ src: base64Str, w, h });
      }
    };
    img.onerror = () => {
      resolve({ src: base64Str, w: 200, h: 150 });
    };
  });
};

export const triggerImageUpload = (store: any, toast?: (msg: string, color?: string) => void) => {
  if (typeof window === 'undefined') return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (toast) toast('Processing selected image...', '#6366F1');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Str = event.target?.result as string;
      const state = store.getState ? store.getState() : store;
      
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      
      const centerX = (viewportW / 2 - state.viewport.x) / state.viewport.zoom;
      const centerY = (viewportH / 2 - state.viewport.y) / state.viewport.zoom;

      const compressed = await compressAndResizeImage(base64Str);

      const addFn = store.addElement || state.addElement;
      if (addFn) {
        addFn({
          id: 'el_' + Math.random().toString(36).slice(2, 9),
          type: 'image',
          x: centerX - compressed.w / 2,
          y: centerY - compressed.h / 2,
          w: compressed.w,
          h: compressed.h,
          src: compressed.src,
          z: Date.now() % 100000,
        });
        if (toast) toast('Image placed on board successfully!', '#10B981');
      }
    };
    reader.readAsDataURL(file);
  };
  input.click();
};
