import os
from PIL import Image, ImageDraw

def process_logo():
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Check for user logo in public/fevicon.png or public/favicon.png
    fevicon_path = os.path.join(project_dir, "public", "fevicon.png")
    favicon_path = os.path.join(project_dir, "public", "favicon.png")
    root_icon_path = os.path.join(project_dir, "icon.png")

    source_logo_path = None
    if os.path.exists(fevicon_path):
        source_logo_path = fevicon_path
    elif os.path.exists(favicon_path):
        source_logo_path = favicon_path
    else:
        print("❌ Error: No source logo found in public/fevicon.png or public/favicon.png")
        return

    print(f"[LOGO] Using user's new logo image: {source_logo_path}")

    # Open original user logo
    original_img = Image.open(source_logo_path).convert("RGBA")

    # Save to public/favicon.png and icon.png
    original_img.save(favicon_path)
    original_img.save(fevicon_path)
    original_img.save(root_icon_path)
    print("[SUCCESS] Saved user logo to public/favicon.png, public/fevicon.png, and root icon.png")

    # Android launcher icon target dimensions
    res_dir = os.path.join(project_dir, "android", "app", "src", "main", "res")
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    resample_filter = Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.LANCZOS

    for folder, size in densities.items():
        folder_path = os.path.join(res_dir, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

        # 1. Standard launcher icon
        resized_img = original_img.resize((size, size), resample_filter)
        resized_img.save(os.path.join(folder_path, "ic_launcher.png"))

        # 2. Round launcher icon
        round_mask = Image.new("L", (size, size), 0)
        draw_mask = ImageDraw.Draw(round_mask)
        draw_mask.ellipse((0, 0, size, size), fill=255)
        
        round_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        round_img.paste(resized_img, (0, 0), round_mask)
        round_img.save(os.path.join(folder_path, "ic_launcher_round.png"))

        # 3. Foreground adaptive launcher icon
        resized_img.save(os.path.join(folder_path, "ic_launcher_foreground.png"))

        print(f"[SUCCESS] Created Android launcher icons for {folder} ({size}x{size})")

if __name__ == "__main__":
    process_logo()
