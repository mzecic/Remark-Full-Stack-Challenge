import { openai } from "@ai-sdk/openai";
import { streamText, type Message } from "ai";
import { getImageWithFallbacks } from "../../utils/imageSearch";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Tech product database - this simulates external API data
const techProducts = {
  laptops: {
    gaming: [
      {
        name: "ASUS ROG Strix G16",
        price: "$1,899",
        specs: "RTX 5070, Intel i7-14700HX, 32GB RAM",
        pros: "Latest RTX 5070 with incredible ray tracing performance",
        image:
          "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.amazon.com/s?k=ASUS+ROG+Strix+G16+RTX+5070",
      },
      {
        name: "MSI Raider GE78",
        price: "$2,299",
        specs: "RTX 5080, Intel i9-14900HX, 32GB RAM",
        pros: "Top-tier gaming performance with RTX 5080",
        image:
          "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.amazon.com/s?k=MSI+Raider+GE78+RTX+5080",
      },
      {
        name: "Alienware m18",
        price: "$2,799",
        specs: "RTX 5090, Intel i9-14900HX, 64GB RAM",
        pros: "Ultimate gaming powerhouse with RTX 5090",
        image:
          "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.amazon.com/s?k=Alienware+m18+RTX+5090",
      },
    ],
    work: [
      {
        name: "MacBook Air M4",
        price: "$1,299",
        specs: "M4 chip, 16GB RAM, 512GB SSD",
        pros: "Latest M4 chip with exceptional efficiency",
        image:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.apple.com/macbook-air/",
      },
      {
        name: "ThinkPad X1 Carbon Gen 12",
        price: "$1,599",
        specs: "Intel Core Ultra 7, 32GB RAM, 1TB SSD",
        pros: "Latest Intel Core Ultra with AI acceleration",
        image:
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop&crop=center",
        sourceUrl:
          "https://www.lenovo.com/us/en/p/laptops/thinkpad/thinkpadx1/thinkpad-x1-carbon-gen-12",
      },
      {
        name: "Dell XPS 13 Plus",
        price: "$1,199",
        specs: "Intel Core Ultra 5, 16GB RAM, 512GB SSD",
        pros: "Sleek design with latest Intel Core Ultra",
        image:
          "https://images.unsplash.com/photo-1588702547923-7ac93bbd11ce?w=400&h=300&fit=crop&crop=center",
        sourceUrl:
          "https://www.dell.com/en-us/shop/dell-laptops/xps-13-plus-laptop/spd/xps-13-9320-laptop",
      },
    ],
    budget: [
      {
        name: "ASUS VivoBook 16",
        price: "$649",
        specs: "AMD Ryzen 7 8700G, 16GB RAM, 512GB SSD",
        pros: "Great value with latest AMD Ryzen 8000 series",
        image:
          "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.amazon.com/s?k=ASUS+VivoBook+16+Ryzen+8700G",
      },
      {
        name: "Acer Aspire 5",
        price: "$599",
        specs: "Intel Core i5-1335U, 16GB RAM, 512GB SSD",
        pros: "Solid performance for everyday tasks",
        image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.amazon.com/s?k=Acer+Aspire+5+2025",
      },
    ],
  },
  phones: {
    flagship: [
      {
        name: "iPhone 16 Pro Max",
        price: "$1,199",
        specs: "A18 Pro, 256GB, ProRAW camera",
        pros: "Latest A18 Pro chip with advanced AI features",
        image:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.apple.com/iphone-16-pro/",
      },
      {
        name: "Samsung Galaxy S25 Ultra",
        price: "$1,299",
        specs: "Snapdragon 8 Gen 4, 512GB, S Pen",
        pros: "Latest Snapdragon with enhanced AI capabilities",
        image:
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.samsung.com/us/smartphones/galaxy-s25-ultra/",
      },
      {
        name: "Google Pixel 9 Pro XL",
        price: "$1,099",
        specs: "Tensor G4, 256GB, Magic Eraser",
        pros: "Best AI photography and pure Android experience",
        image:
          "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://store.google.com/product/pixel_9_pro_xl",
      },
    ],
    midrange: [
      {
        name: "iPhone 15",
        price: "$799",
        specs: "A16 Bionic, 128GB, USB-C",
        pros: "Great performance with new USB-C port",
        image:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.apple.com/shop/buy-iphone/iphone-15",
      },
      {
        name: "Samsung Galaxy A55",
        price: "$499",
        specs: "Exynos 1480, 256GB, Triple camera",
        pros: "Premium features at midrange price",
        image:
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.samsung.com/us/smartphones/galaxy-a55/",
      },
      {
        name: "Google Pixel 8a",
        price: "$549",
        specs: "Tensor G3, 128GB, AI camera",
        pros: "Pixel camera quality at affordable price",
        image:
          "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://store.google.com/product/pixel_8a",
      },
    ],
  },
  desktops: {
    gaming: [
      {
        name: "NZXT BLD H7 Elite",
        price: "$2,499",
        specs: "RTX 5080, AMD Ryzen 9 8900X, 32GB DDR5",
        pros: "Pre-built gaming powerhouse with latest components",
        image:
          "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://nzxt.com/product/bld-h7-elite",
      },
      {
        name: "Alienware Aurora R16",
        price: "$3,299",
        specs: "RTX 5090, Intel i9-14900KF, 64GB DDR5",
        pros: "Ultimate gaming desktop with liquid cooling",
        image:
          "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop&crop=center",
        sourceUrl:
          "https://www.dell.com/en-us/shop/desktop-computers/alienware-aurora-r16-gaming-desktop/spd/alienware-aurora-r16-desktop",
      },
    ],
    work: [
      {
        name: "Mac Studio M4 Ultra",
        price: "$3,999",
        specs: "M4 Ultra, 128GB RAM, 8TB SSD",
        pros: "Unmatched performance for creative professionals",
        image:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.apple.com/mac-studio/",
      },
      {
        name: "Dell OptiPlex 7000",
        price: "$1,299",
        specs: "Intel Core i7-14700, 32GB RAM, 1TB SSD",
        pros: "Reliable business desktop with great support",
        image:
          "https://images.unsplash.com/photo-1588702547923-7ac93bbd11ce?w=400&h=300&fit=crop&crop=center",
        sourceUrl:
          "https://www.dell.com/en-us/shop/desktop-computers/optiplex-7000-small-form-factor/spd/optiplex-7000-desktop",
      },
    ],
  },
  tablets: {
    flagship: [
      {
        name: "iPad Pro M4 13-inch",
        price: "$1,299",
        specs: "M4 chip, 256GB, OLED display",
        pros: "Most powerful tablet with desktop-class performance",
        image:
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.apple.com/ipad-pro/",
      },
      {
        name: "Samsung Galaxy Tab S10 Ultra",
        price: "$1,199",
        specs: "Snapdragon 8 Gen 4, 512GB, S Pen included",
        pros: "Largest Android tablet with productivity features",
        image:
          "https://images.unsplash.com/photo-1609891297862-4154a5b4ec51?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.samsung.com/us/tablets/galaxy-tab-s10/",
      },
    ],
    budget: [
      {
        name: "iPad Air M2",
        price: "$599",
        specs: "M2 chip, 128GB, Liquid Retina display",
        pros: "Great performance at a more affordable price",
        image:
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.apple.com/ipad-air/",
      },
      {
        name: "Samsung Galaxy Tab A9+",
        price: "$279",
        specs: "Snapdragon 695, 128GB, 11-inch display",
        pros: "Solid Android tablet for everyday use",
        image:
          "https://images.unsplash.com/photo-1609891297862-4154a5b4ec51?w=400&h=300&fit=crop&crop=center",
        sourceUrl: "https://www.samsung.com/us/tablets/galaxy-tab-a9/",
      },
    ],
  },
};

// Smart product matching function
function getProductRecommendations(userMessage: string) {
  const message = userMessage.toLowerCase();

  // Laptop recommendations
  if (message.includes("laptop") || message.includes("laptops")) {
    if (
      message.includes("gaming") ||
      message.includes("game") ||
      message.includes("rtx") ||
      message.includes("graphics")
    ) {
      return {
        category: "laptops",
        useCase: "gaming",
        products: techProducts.laptops.gaming,
      };
    } else if (
      message.includes("work") ||
      message.includes("productivity") ||
      message.includes("business") ||
      message.includes("office")
    ) {
      return {
        category: "laptops",
        useCase: "work",
        products: techProducts.laptops.work,
      };
    } else if (
      message.includes("budget") ||
      message.includes("cheap") ||
      message.includes("affordable") ||
      message.includes("under")
    ) {
      return {
        category: "laptops",
        useCase: "budget",
        products: techProducts.laptops.budget,
      };
    } else {
      // Default to work laptops for general laptop requests
      return {
        category: "laptops",
        useCase: "work",
        products: techProducts.laptops.work,
      };
    }
  }
  // Phone recommendations
  if (
    message.includes("phone") ||
    message.includes("smartphone") ||
    message.includes("iphone") ||
    message.includes("android")
  ) {
    if (
      message.includes("budget") ||
      message.includes("cheap") ||
      message.includes("affordable") ||
      message.includes("under")
    ) {
      return {
        category: "phones",
        useCase: "midrange",
        products: techProducts.phones.midrange,
      };
    } else {
      return {
        category: "phones",
        useCase: "flagship",
        products: techProducts.phones.flagship,
      };
    }
  }

  // Desktop recommendations
  if (
    message.includes("desktop") ||
    message.includes("desktops") ||
    message.includes("pc") ||
    message.includes("computer")
  ) {
    if (
      message.includes("gaming") ||
      message.includes("game") ||
      message.includes("rtx") ||
      message.includes("graphics")
    ) {
      return {
        category: "desktops",
        useCase: "gaming",
        products: techProducts.desktops.gaming,
      };
    } else {
      return {
        category: "desktops",
        useCase: "work",
        products: techProducts.desktops.work,
      };
    }
  }

  // Tablet recommendations
  if (
    message.includes("tablet") ||
    message.includes("tablets") ||
    message.includes("ipad")
  ) {
    if (
      message.includes("budget") ||
      message.includes("cheap") ||
      message.includes("affordable") ||
      message.includes("under")
    ) {
      return {
        category: "tablets",
        useCase: "budget",
        products: techProducts.tablets.budget,
      };
    } else {
      return {
        category: "tablets",
        useCase: "flagship",
        products: techProducts.tablets.flagship,
      };
    }
  }

  return null;
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  // Get the latest user message
  const conversationalContext = messages
    .slice(-3) // Use last 3 messages for context
    .map((m) => m.content)
    .join("\n");

  // Check if we can provide product recommendations
  const recommendations = getProductRecommendations(conversationalContext);

  // Enhance product images if we have recommendations
  let enhancedProducts = recommendations?.products || [];
  if (recommendations && recommendations.products.length > 0) {
    try {
      // Call our image enhancement API
      const enhanceResponse = await fetch(
        `${
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : process.env.NEXT_PUBLIC_URL || ""
        }/api/enhance-products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ products: recommendations.products }),
        }
      );

      if (enhanceResponse.ok) {
        const enhanceData = await enhanceResponse.json();
        enhancedProducts = enhanceData.products || recommendations.products;
      }
    } catch (error) {
      console.error("Error enhancing product images:", error);
      // Fall back to original products if enhancement fails
      enhancedProducts = recommendations.products;
    }
  }

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    system: `You are Barnabus, a tech-savvy chicken expert. Be concise, helpful, and use occasional chicken puns.

When you recommend products, you MUST provide the data for the UI. After your conversational text, add a block like this:
__PRODUCT_DATA_START__
[{"name": "Product 1", ...}]
__PRODUCT_DATA_END__

${
  recommendations
    ? `Based on the user's request for ${
        recommendations.category
      }, I have found these products. Please present them to the user, and then include the following data block exactly as provided.

Product Data Block:
__PRODUCT_DATA_START__
${JSON.stringify(enhancedProducts)}
__PRODUCT_DATA_END__`
    : `The user may be asking for new or different product recommendations. Analyze the conversation. If you think the user wants a list of products, find relevant items from the database below. Then, present them to the user and include the data block as instructed. If the user is not asking for products, just continue the conversation naturally without the data block.

Full Product Database:
${JSON.stringify(techProducts)}`
}
`,
    messages,
  });

  return result.toDataStreamResponse();
}
