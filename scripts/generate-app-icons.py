import os
import math
from PIL import Image, ImageDraw, ImageFont

def draw_lendkart_logo(size, rounded=False, foreground_only=False):
    # Create high-res 512x512 image for smooth scaling
    canvas_size = 512
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if not foreground_only:
        # Background: Dark Olive (#0a0c01)
        bg_color = (10, 12, 1, 255)
        border_color = (132, 204, 22, 255) # #84cc16

        if rounded:
            # Circle
            draw.ellipse([8, 8, canvas_size-8, canvas_size-8], fill=bg_color, outline=border_color, width=12)
        else:
            # Rounded Rectangle (Squircle)
            radius = 110
            draw.rounded_rectangle([8, 8, canvas_size-8, canvas_size-8], radius=radius, fill=bg_color, outline=border_color, width=12)

    # Center Logo: Leaf + Handshake symbol representation in Lime (#84cc16)
    lime = (132, 204, 22, 255)
    lime_trans = (132, 204, 22, 90)

    center_x = canvas_size // 2
    center_y = canvas_size // 2

    # Outer glowing leaf backdrop
    leaf_bbox = [center_x - 160, center_y - 170, center_x + 160, center_y + 150]
    draw.chord(leaf_bbox, start=200, end=380, fill=lime_trans)

    # Stylized Handshake & Leaf Icon
    # Main hand 1 (Left to right arc)
    draw.line([center_x - 110, center_y + 40, center_x - 30, center_y - 30, center_x + 40, center_y + 20], fill=lime, width=32)
    # Main hand 2 (Right to left arc)
    draw.line([center_x + 110, center_y - 40, center_x + 30, center_y + 30, center_x - 40, center_y - 20], fill=lime, width=32)

    # Central handshake connection node
    draw.ellipse([center_x - 35, center_y - 35, center_x + 35, center_y + 35], fill=lime)

    # Leaf accent top right
    draw.ellipse([center_x + 30, center_y - 140, center_x + 120, center_y - 50], outline=lime, width=20)

    # Downscale smoothly to requested size
    resample_filter = Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.LANCZOS
    return img.resize((size, size), resample_filter)

def main():
    res_dir = os.path.join(os.path.dirname(__file__), "..", "android", "app", "src", "main", "res")
    
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    for folder, size in densities.items():
        folder_path = os.path.join(res_dir, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

        # 1. Standard launcher icon
        ic_standard = draw_lendkart_logo(size, rounded=False)
        ic_standard.save(os.path.join(folder_path, "ic_launcher.png"))

        # 2. Round launcher icon
        ic_round = draw_lendkart_logo(size, rounded=True)
        ic_round.save(os.path.join(folder_path, "ic_launcher_round.png"))

        # 3. Foreground adaptive launcher icon
        ic_fore = draw_lendkart_logo(size, rounded=False, foreground_only=True)
        ic_fore.save(os.path.join(folder_path, "ic_launcher_foreground.png"))

        print(f"Generated Android launcher icons for {folder} ({size}x{size})")

    # Also save web favicon / app icon PNG in root and public
    root_icon = draw_lendkart_logo(512, rounded=False)
    root_dir = os.path.join(os.path.dirname(__file__), "..")
    root_icon.save(os.path.join(root_dir, "icon.png"))
    root_icon.save(os.path.join(root_dir, "public", "favicon.png"))
    print("Generated root icon.png and public/favicon.png (512x512)")

if __name__ == "__main__":
    main()
