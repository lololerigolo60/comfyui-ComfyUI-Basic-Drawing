import numpy as np
import torch
from PIL import Image
import base64
import io
import folder_paths
import os
import random

class BasicDrawingBoard:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "image_data": ("STRING", {"default": ""}),
                "width": ("INT", {"default": 512, "min": 64, "max": 4096, "step": 64}),
                "height": ("INT", {"default": 512, "min": 64, "max": 4096, "step": 64}),
            },
            "optional": {
                "image": ("IMAGE",),
                "auto_mask": ("MASK",),
            }
        }

    RETURN_TYPES = ("IMAGE", "MASK")
    RETURN_NAMES = ("IMAGE", "MASK")
    FUNCTION = "process_drawing"
    CATEGORY = "CustomNodes/Drawing"

    def process_drawing(self, image_data, width, height, image=None, auto_mask=None):
        temp_filename = ""
        auto_mask_filename = ""
        
        # 1. Image de fond
        if image is not None:
            i = 255. * image[0].cpu().numpy()
            base_img = Image.fromarray(np.uint8(i)).convert("RGBA")
            base_img = base_img.resize((width, height), Image.Resampling.LANCZOS)
            temp_dir = folder_paths.get_temp_directory()
            temp_filename = f"drawing_bg_{random.randint(0, 1000000)}.png"
            base_img.save(os.path.join(temp_dir, temp_filename))
        else:
            base_img = Image.new("RGBA", (width, height), (0, 0, 0, 255))

        # 2. FUSION DES MASQUES (Correction pour SAM Multi-détection)
        if auto_mask is not None:
            # Si SAM envoie plusieurs masques, on les fusionne en un seul
            # auto_mask a souvent une forme (N, H, W). On prend le max sur la dimension 0.
            if auto_mask.shape[0] > 1:
                combined_mask = torch.max(auto_mask, dim=0)[0].unsqueeze(0)
            else:
                combined_mask = auto_mask

            m = 255. * combined_mask[0].cpu().numpy()
            mask_img = Image.fromarray(np.uint8(m)).convert("L")
            mask_img = mask_img.resize((width, height), Image.Resampling.LANCZOS)
            
            temp_dir = folder_paths.get_temp_directory()
            auto_mask_filename = f"auto_mask_{random.randint(0, 1000000)}.png"
            mask_img.save(os.path.join(temp_dir, auto_mask_filename))
            
            # On met à jour auto_mask pour la sortie du nœud également
            auto_mask = combined_mask

        # 3. Fusion avec le dessin manuel
        if image_data and image_data != "":
            header, encoded = image_data.split(",", 1)
            data = base64.b64decode(encoded)
            drawing_img = Image.open(io.BytesIO(data)).convert("RGBA")
            drawing_img = drawing_img.resize((width, height), Image.Resampling.LANCZOS)
            base_img.alpha_composite(drawing_img)
            
            final_mask_img = drawing_img.split()[-1]
            final_mask_np = np.array(final_mask_img).astype(np.float32) / 255.0
            mask_tensor = torch.from_numpy(np.where(final_mask_np > 0, 1.0, 0.0))[None,]
        else:
            mask_tensor = auto_mask if auto_mask is not None else torch.zeros((1, height, width))

        final_img = base_img.convert("RGB")
        img_tensor = torch.from_numpy(np.array(final_img).astype(np.float32) / 255.0)[None,]
        
        return {"ui": {"bg_file": [temp_filename], "auto_mask": [auto_mask_filename]}, "result": (img_tensor, mask_tensor)}

NODE_CLASS_MAPPINGS = {"BasicDrawingBoard": BasicDrawingBoard}
NODE_DISPLAY_NAME_MAPPINGS = {"BasicDrawingBoard": "🎨 Basic Drawing Board"}