// Simplified and more accurate function to get the best possible fallback product image.
export function getRealProductImage(
  productName: string,
  productType: string
): string {
  const cleanName = productName.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "");

  // Create a map of keywords to specific, high-quality Unsplash images.
  const imageMap: { [key: string]: string } = {
    // Apple Products
    "iphone 16":
      "https://images.unsplash.com/photo-1715739842155-38f20ff536cb?w=500&h=400&fit=crop&crop=center",
    "iphone 15":
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=400&fit=crop&crop=center",
    iphone:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=400&fit=crop&crop=center",
    "macbook air":
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=400&fit=crop&crop=center",
    "macbook pro":
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=400&fit=crop&crop=center",
    macbook:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=400&fit=crop&crop=center",
    "ipad pro":
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=400&fit=crop&crop=center",
    "ipad air":
      "https://images.unsplash.com/photo-1587095951499-78c3de3a1893?w=500&h=400&fit=crop&crop=center",
    ipad: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=400&fit=crop&crop=center",
    "mac studio":
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=400&fit=crop&crop=center",

    // Samsung Products
    "samsung galaxy s25":
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=400&fit=crop&crop=center",
    "samsung galaxy tab s10":
      "https://images.unsplash.com/photo-1609891297862-4154a5b4ec51?w=500&h=400&fit=crop&crop=center",
    "samsung phone":
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=400&fit=crop&crop=center",
    "samsung tablet":
      "https://images.unsplash.com/photo-1609891297862-4154a5b4ec51?w=500&h=400&fit=crop&crop=center",

    // Google Products
    "google pixel 9":
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=400&fit=crop&crop=center",
    "google pixel":
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&h=400&fit=crop&crop=center",

    // Laptops
    thinkpad:
      "https://images.unsplash.com/photo-1588702547923-7ac93bbd11ce?w=500&h=400&fit=crop&crop=center",
    "dell xps":
      "https://images.unsplash.com/photo-1588702547923-7ac93bbd11ce?w=500&h=400&fit=crop&crop=center",
    "asus rog":
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&h=400&fit=crop&crop=center",
    "msi raider":
      "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&h=400&fit=crop&crop=center",
    "alienware laptop":
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&h=400&fit=crop&crop=center",
    "gaming laptop":
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&h=400&fit=crop&crop=center",

    // Desktops
    "alienware desktop":
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&h=400&fit=crop&crop=center",
    nzxt: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500&h=400&fit=crop&crop=center",
    "gaming desktop":
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500&h=400&fit=crop&crop=center",

    // Generic Fallbacks (last resort)
    laptop:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=400&fit=crop&crop=center",
    phone:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=400&fit=crop&crop=center",
    desktop:
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&h=400&fit=crop&crop=center",
    tablet:
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&h=400&fit=crop&crop=center",
  };

  // Find the best match from the map keys.
  const bestMatchKey = Object.keys(imageMap).find((key) =>
    cleanName.includes(key)
  );

  if (bestMatchKey) {
    return imageMap[bestMatchKey];
  }

  // If no specific keyword matches, use the general product type as a final fallback.
  return imageMap[productType] || imageMap["laptop"]; // Default to a laptop image if all else fails.
}
