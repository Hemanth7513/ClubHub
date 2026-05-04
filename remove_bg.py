import os
from PIL import Image

def remove_white_background(input_path, output_path, threshold=240):
    """
    Converts white/off-white pixels to transparent.
    """
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # If the pixel is very bright (near white), make it transparent
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Processed: {output_path}")

# Paths to the assets in the public folder
public_dir = r"c:\Users\MKG\\.gemini\\antigravity\\scratch\\clubhub\\frontend\\public"
assets = [
    "premium_genz_dancer_3d_1777823683932.png",
    "premium_genz_singer_3d_1777823703098.png",
    "premium_genz_painter_3d_1777823721653.png"
]

for asset in assets:
    full_path = os.path.join(public_dir, asset)
    if os.path.exists(full_path):
        remove_white_background(full_path, full_path) # Overwrite with transparent version
    else:
        print(f"Not found: {full_path}")
