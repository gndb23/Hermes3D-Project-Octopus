#!/usr/bin/env python3
"""
Everflow Supplies - Standard 8-Image Listing Stack Generator
Front-office Marketing Creative Tool for E-Commerce Product Image Generation

Generates standardized image generation prompts, composition directives, and
infographic overlay specifications for:
- Shopee & Lazada (1:1 Square, 1200x1200)
- TikTok Shop (1:1 / 3:4)
- Shopify B2B Storefront (1:1 / 3:4)

Usage:
    python generate_listing_stack.py --product padded_bubble_mailer
    python generate_listing_stack.py --product polymailer --format json
    python generate_listing_stack.py --list-products
"""

import argparse
import json
import os
import sys

PRODUCT_CONFIGS = {
    "padded_bubble_mailer": {
        "title": "Heavy-Duty Padded Bubble Mailer",
        "category_dir": "02_Polymailers/Padded_Bubble_Mailers",
        "material_specs": "12-Micron co-extruded virgin PE outer layer with high-density plump air bubble cushioning film",
        "flap_spec": "+4 cm flap with destructive hot-melt tamper-evident adhesive strip and anti-static liner",
        "border_spec": "10mm heat-pressed explosion-proof borders on both sides (usable inner width = W - 20mm)",
        "sizes": [
            {"size": "17 × 29 + 4 cm", "pack": "100 Pcs / Pack"},
            {"size": "20 × 35 + 4 cm", "pack": "100 Pcs / Pack"},
            {"size": "25 × 35 + 4 cm", "pack": "100 Pcs / Pack"},
            {"size": "28 × 40 + 4 cm", "pack": "100 Pcs / Pack"},
            {"size": "32 × 44 + 4 cm", "pack": "100 Pcs / Pack"},
            {"size": "35 × 45 + 4 cm", "pack": "50 Pcs / Pack"},
            {"size": "38 × 50 + 4 cm", "pack": "50 Pcs / Pack"}
        ],
        "colors": ["Pure White", "Kraft Brown", "Matte Black", "Metallic Pink"],
        "hero_hooks": ["Shockproof Bubble Cushioning", "100% Waterproof Virgin PE", "Strong Hot-Melt Adhesive Seal", "Multi-Product Transit Safe"],
        "quality_tests": [
            "Waterproof test: Dense water droplet beads pooled on exterior without penetration",
            "Puncture & tension test: Key scratch & corner stretch without puncture",
            "100% Opacity test: Thick interior dark bubble lining preventing content visibility under direct light",
            "Drop test: Heavy corner impact test with cushioned items undamaged"
        ],
        "key_features": [
            "New Virgin PE Outer Layer: Smooth, tear-resistant, puncture-proof barrier",
            "Plump Shock-Absorbing Air Cells: High-retention air bubbles providing 360-degree impact damping",
            "10mm Heat-Welded Edge Borders: Explosion-proof lateral seams under transit compression",
            "Destructive Hot-Melt Adhesive: Tamper-evident seal tearing the envelope if opened"
        ]
    },
    "polymailer": {
        "title": "Premium White Polymailer Shipping Bags",
        "category_dir": "02_Polymailers/Standard_Polymailers",
        "material_specs": "60-Micron thick co-extruded LDPE multi-layer virgin film",
        "flap_spec": "+4 cm flap with peel-and-seal destructive hot-melt adhesive",
        "border_spec": "Precision heat-sealed waterproof side seams",
        "sizes": [
            {"size": "17 × 29 + 4 cm", "pack": "100 Pcs / Pack"},
            {"size": "20 × 35 + 4 cm", "pack": "100 Pcs / Pack"},
            {"size": "25 × 35 + 4 cm", "pack": "100 Pcs / Pack"},
            {"size": "28 × 40 + 4 cm", "pack": "100 Pcs / Pack"},
            {"size": "32 × 44 + 4 cm", "pack": "100 Pcs / Pack"},
            {"size": "35 × 45 + 4 cm", "pack": "100 Pcs / Pack"},
            {"size": "38 × 50 + 4 cm", "pack": "100 Pcs / Pack"}
        ],
        "colors": ["Pure Matte White", "Charcoal Black", "Pastel Blush Pink", "Sage Mint"],
        "hero_hooks": ["60-Micron Heavy Duty", "100% Opaque Privacy Lining", "Tamper-Evident Adhesive", "SG Ready Stock Dispatch"],
        "quality_tests": [
            "Waterproof test: Submersion & water spray beading completely dry inside",
            "Tear & pull test: High stretch elasticity before tearing under extreme pull force",
            "100% Privacy test: Charcoal/silver interior barrier preventing flashlight see-through",
            "Adhesive destruction test: Film tearing apart destructively upon peel attempt"
        ],
        "key_features": [
            "Multi-Layer Co-Extruded PE: High tensile strength and elasticity",
            "Anti-Static Release Liner: Effortless peel that will not stick to hands",
            "Dark Privacy Interior: 100% confidential parcel contents",
            "Direct Thermal Label Compatibility: Strong label grip with zero curling"
        ]
    },
    "carton_box": {
        "title": "Die-Cut T-Series Corrugated Carton Box",
        "category_dir": "01_Carton_Boxes/Die_Cut_T_Series",
        "material_specs": "High-rigidity T-series corrugated board (B-Flute / E-Flute kraft paperboard)",
        "flap_spec": "Self-locking tuck-top fold with clean scored crease lines",
        "border_spec": "Precision die-cut burr-free edges with structural corner reinforcements",
        "sizes": [
            {"size": "T1 (15 × 15 × 5 cm)", "pack": "50 Pcs / Bundle"},
            {"size": "T2 (20 × 14 × 4 cm)", "pack": "50 Pcs / Bundle"},
            {"size": "T3 (27 × 16 × 5 cm)", "pack": "50 Pcs / Bundle"},
            {"size": "T4 (25 × 20 × 7 cm)", "pack": "50 Pcs / Bundle"},
            {"size": "T5 (30 × 22 × 8 cm)", "pack": "50 Pcs / Bundle"}
        ],
        "colors": ["Natural Kraft Brown", "Clean Matte White"],
        "hero_hooks": ["T5 Die-Cut Self-Locking", "Reinforced 3-Ply Rigid Board", "No Tape Required Assembly", "SG Ready Stock 24H"],
        "quality_tests": [
            "Compressive load test: 20kg dumbbell stack resting on top without buckling",
            "Drop test: Packed box surviving 1.2m drop without popping tuck tabs",
            "Edge burst test: High bursting strength corrugated fluting",
            "Fold endurance: Clean crisp folds without surface paper cracking"
        ],
        "key_features": [
            "Pre-Scored Fold Lines: 3-second rapid assembly without tools",
            "Double-Wall Side Flaps: Enhanced corner crush resistance",
            "Flat Stacking Storage: Ships flat to save warehouse footprint",
            "Eco-Friendly 100% Recyclable: FSC certified natural kraft"
        ]
    }
}

def generate_8_slide_stack(product_key):
    cfg = PRODUCT_CONFIGS.get(product_key)
    if not cfg:
        raise ValueError(f"Unknown product '{product_key}'. Available: {list(PRODUCT_CONFIGS.keys())}")

    title = cfg["title"]
    cat_dir = cfg["category_dir"]
    
    slides = [
        {
            "slide_num": 1,
            "name": "Aesthetic / Lifestyle Hero",
            "filename": "01_Aesthetic_Lifestyle_Hero.jpg",
            "objective": "High-End Mood & Brand Appeal (TikTok Shop, Instagram & Shopify Header)",
            "ai_prompt": (
                f"Commercial aesthetic lifestyle photography of Everflow Supplies {title}. "
                "Shot on a clean, modern Scandinavian packing desk in a sunny fulfillment studio. "
                "Surrounded by neat packaging props: aesthetic wrapped packages, pastel shipping parcels, "
                "minimalist handheld tape dispenser, a clean laptop showing e-commerce order dashboard, and delicate warm props. "
                "Soft natural morning window lighting, organic wood table texture, shallow depth of field, "
                "aspirational small business fulfillment aesthetic, ultra-sharp 8k resolution, authentic editorial magazine style."
            ),
            "overlay_elements": [
                "Subtle brand badge: EVERFLOW SUPPLIES — Thoughtfully Packed",
                "Warm, minimalist typography without aggressive sales badges",
                "Clean lifestyle visual hook prioritizing aspirational presentation"
            ]
        },
        {
            "slide_num": 2,
            "name": "Main Hero",
            "filename": "02_Main_Hero.jpg",
            "objective": "Marketplace CTR Driver for Shopee & Lazada Search Grids",
            "ai_prompt": (
                f"Commercial studio product photography of Everflow Supplies {title}, angled 3D floating perspective. "
                "Isolated on pure solid white background (#ffffff) with soft realistic contact drop shadow beneath. "
                "Crisp edge detail, immaculate studio lighting with soft specular highlights, industrial packaging presentation, "
                "accented with Everflow dark navy blue (#00357a). Ultra-sharp focus, 8k resolution."
            ),
            "overlay_elements": [
                f"Top Header: EVERFLOW SUPPLIES — {title.upper()}",
                "Right Corner Badge: 🇸🇬 SG READY STOCK | Dispatched in 24H",
                f"Feature Pill Badges: {', '.join(cfg['hero_hooks'])}",
                "Lower Banner: Wholesale Direct Pricing | Bulk Tier Discounts"
            ]
        },
        {
            "slide_num": 3,
            "name": "Product Size & Dimension Guide",
            "filename": "03_Product_Size_Dimension_Guide.jpg",
            "objective": "Eliminate Customer Sizing Errors (#1 Return & Inquiry Reason)",
            "ai_prompt": (
                f"High-resolution e-commerce dimension infographic diagram of {title}. "
                "Left side: clean 2.5D product layout showing red dimensional measurement arrows. "
                "Right side: clean, modern navy-accented tabular matrix showing available sizes and bundle units. "
                "Crisp white studio background, high contrast, clean vector-grade industrial precision."
            ),
            "overlay_elements": [
                "Header Title: EVERFLOW SUPPLIES — Product Size & Dimension Guide",
                f"Dimension Lines: Red measurement arrows showing Width (W), Length (L), and {cfg['flap_spec']}",
                f"Inner Usable Area Callout: * Note: {cfg['border_spec']}",
                "Size Matrix Table: " + " | ".join([f"{item['size']} ({item['pack']})" for item in cfg['sizes'][:5]]) + "...",
                "Visual Scale Reference: Comparison icons with iPhone, A4 Sheet, and Shoe Box"
            ]
        },
        {
            "slide_num": 4,
            "name": "Quality Test",
            "filename": "04_Quality_Test.jpg",
            "objective": "Prove Structural Integrity, Durability, and Water Resistance",
            "ai_prompt": (
                f"Split 4-panel commercial stress test proof infographic for {title}. "
                "Macro photo 1: Large glistening water droplets pooled on surface demonstrating 100% waterproof barrier. "
                "Macro photo 2: Extreme tension and stretch resistance test with metal keys proving puncture resistance. "
                "Macro photo 3: High-opacity privacy test with bright flashlight behind material showing zero translucency. "
                "Macro photo 4: Destructive adhesive seal tearing surface paper proving permanent tamper-proof bonding. "
                "Crisp laboratory lighting, scientific testing aesthetic, high-trust industrial packaging standard."
            ),
            "overlay_elements": [
                "Header: LABORATORY TESTED — STRUCTURAL STRENGTH & INTEGRITY",
                "Panel 1: 100% WATERPROOF & MOISTURE RESISTANT",
                "Panel 2: HIGH TEAR & PUNCTURE RESISTANCE",
                "Panel 3: 100% OPAQUE PRIVACY PROTECTION",
                "Panel 4: DESTRUCTIVE TAMPER-EVIDENT HOT-MELT SEAL"
            ]
        },
        {
            "slide_num": 5,
            "name": "Key Features Close-Up",
            "filename": "05_Key_Features_Close_Up.jpg",
            "objective": "Highlight Craftsmanship, Multi-Layer Material Build, and Specs",
            "ai_prompt": (
                f"Macro 3D exploded diagram and close-up detail photography of {title}. "
                f"Showing multi-layer material cross section: {cfg['material_specs']}. "
                "Extreme close-up on the destructive adhesive strip, anti-static easy-peel release liner, "
                f"and {cfg['border_spec']}. Razor-sharp micro textures, studio edge lighting, pure white background."
            ),
            "overlay_elements": [
                "Header: INDUSTRIAL CRAFTSMANSHIP & MATERIAL SPECIFICATIONS",
                "Layer 1: Virgin Co-Extruded Film — Puncture & Liquid Barrier",
                "Layer 2: Air Bubble / Structural Cushioning Matrix",
                "Feature 3: 10mm Heat-Welded Explosion-Proof Reinforced Borders",
                "Feature 4: Anti-Static Release Strip (Will Not Cling to Hands)"
            ]
        },
        {
            "slide_num": 6,
            "name": "Application & Packing Workflow",
            "filename": "06_Application_Packing_Workflow.jpg",
            "objective": "Showcase Seamless Packing Speed and Fulfillment Visualization",
            "ai_prompt": (
                f"Step-by-step 3-frame horizontal commercial photography showing rapid packing workflow using {title}. "
                "Frame 1: Clean, professional hands inserting apparel/goods into open envelope. "
                "Frame 2: Finger peeling the anti-static protective adhesive liner effortlessly. "
                "Frame 3: Pressing flap closed into permanent destructive bond and applying shipping thermal AWB label. "
                "Clean packing workbench, organized fulfillment setting, professional commercial lighting."
            ),
            "overlay_elements": [
                "Header: FAST & EFFORTLESS 3-STEP PACKING ROUTINE",
                "Step 1: INSERT ITEM — Wide-mouth smooth insertion",
                "Step 2: PEEL LINER — Anti-static strip peels in 1 second",
                "Step 3: SEAL & LABEL — Permanent tamper-evident bond + direct thermal AWB grip"
            ]
        },
        {
            "slide_num": 7,
            "name": "All Available Size / Colour",
            "filename": "07_All_Available_Size_Colour.jpg",
            "objective": "Comprehensive Catalog Display to Guide Variant Selection",
            "ai_prompt": (
                f"Overhead flat-lay photograph showcasing complete catalog lineup of {title}. "
                f"Neatly aligned progression of all sizes from XS to XL across available colorways ({', '.join(cfg['colors'])}). "
                "Crisp white studio tabletop, perfectly symmetrical arrangement, high-key commercial lighting, zero clutter."
            ),
            "overlay_elements": [
                "Header: COMPLETE CATALOG RANGE — SIZES & COLORWAYS",
                f"Available Finishes: {', '.join(cfg['colors'])}",
                "Size Callouts: Direct dimension overlay badges below each displayed model",
                "Footer Hook: Custom Logo Printing Available Upon Request (Low MOQ)"
            ]
        },
        {
            "slide_num": 8,
            "name": "Real Product Display",
            "filename": "08_Real_Product_Display.jpg",
            "objective": "Authentic Delivery Transparency & Bulk Pack Value Reassurance",
            "ai_prompt": (
                f"Authentic commercial warehouse photograph of {title} in factory-delivered bundle packaging. "
                "A pristine stack of 50-100 pcs tied securely with transparent banding and clean barcode product label. "
                "Background subtly displays organized warehouse shelving racks and shipping pallets filled with ready stock. "
                "Natural warehouse lighting with clean commercial polish, demonstrating high-volume fulfillment capability."
            ),
            "overlay_elements": [
                "Header: AUTHENTIC REAL PACKAGING DISPLAY — READY TO SHIP",
                "Bundle Badge: Factory-Sealed 100 Pcs / 50 Pcs Wrapped Bundles",
                "Trust Callout: Singapore Local Warehouse Dispatch | Pristine Stock Guaranteed",
                "B2B Support: Official GST Tax Invoice Provided | Wholesale Pallet Inquiries"
            ]
        }
    ]

    return {
        "product_key": product_key,
        "product_title": title,
        "storage_path": f"Everflow Supplies/Marketing/01_Product_Photos/Categories/{cat_dir}/03_Final_Marketplace_Listings/",
        "slides": slides
    }

def format_as_markdown(data):
    lines = []
    lines.append(f"# Everflow Supplies: Standard 8-Image Listing Stack")
    lines.append(f"**Product**: {data['product_title']}")
    lines.append(f"**Drive Target Directory**: `{data['storage_path']}`\n")
    lines.append("| Slide # | Slide Name / Photo Description | Objective | Visual Composition & AI Prompt | Key Infographic Overlays |")
    lines.append("| :---: | :--- | :--- | :--- | :--- |")
    
    for s in data["slides"]:
        overlays = "<br>• ".join([""] + s["overlay_elements"])
        prompt_snippet = s["ai_prompt"][:160] + "..."
        lines.append(f"| **Photo {s['slide_num']}** | **{s['name']}**<br>`{s['filename']}` | {s['objective']} | *{prompt_snippet}* | {overlays} |")
        
    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Everflow Supplies 8-Image Listing Stack Generator")
    parser.add_argument("--product", choices=list(PRODUCT_CONFIGS.keys()), default="padded_bubble_mailer", help="Product type")
    parser.add_argument("--format", choices=["markdown", "json"], default="markdown", help="Output format")
    parser.add_argument("--list-products", action="store_true", help="List available products")
    
    args = parser.parse_args()
    
    if args.list_products:
        print("Available product configurations:")
        for k, v in PRODUCT_CONFIGS.items():
            print(f"  - {k}: {v['title']}")
        return

    data = generate_8_slide_stack(args.product)
    
    if args.format == "json":
        print(json.dumps(data, indent=2))
    else:
        print(format_as_markdown(data))

if __name__ == "__main__":
    main()
