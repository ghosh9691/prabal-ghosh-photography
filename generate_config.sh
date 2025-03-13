#!/bin/bash

CONFIG_FILE="config.json"
PHOTOS_DIR="photos"

# Function to list image files in a folder
get_images() {
    local folder="$1"
    find "$folder" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) -exec basename {} \; | jq -R . | jq -s .
}

# Ensure the photos directory exists
if [ ! -d "$PHOTOS_DIR" ]; then
    echo "Error: '$PHOTOS_DIR' directory not found."
    exit 1
fi

# Start building JSON
echo "{" > "$CONFIG_FILE"
echo '  "categories": [' >> "$CONFIG_FILE"

FIRST_CATEGORY=true

# Loop through categories (folders inside photos/)
for CATEGORY in "$PHOTOS_DIR"/*; do
    if [ -d "$CATEGORY" ]; then
        CATEGORY_NAME=$(basename "$CATEGORY")

        # Find albums (subdirectories inside category)
        ALBUMS_JSON="["
        FIRST_ALBUM=true

        for ALBUM in "$CATEGORY"/*; do
            if [ -d "$ALBUM" ]; then
                ALBUM_NAME=$(basename "$ALBUM")
                ALBUM_PHOTOS_JSON=$(get_images "$ALBUM")

                # Add comma separator if needed
                if [ "$FIRST_ALBUM" = false ]; then
                    ALBUMS_JSON+=","
                fi
                FIRST_ALBUM=false

                # Add album JSON entry
                ALBUMS_JSON+="
                {
                  \"name\": \"$ALBUM_NAME\",
                  \"path\": \"$ALBUM_NAME\",
                  \"photos\": $ALBUM_PHOTOS_JSON
                }"
            fi
        done
        ALBUMS_JSON+="]"

        # Get category-level photos (if any)
        CATEGORY_PHOTOS_JSON=$(get_images "$CATEGORY")

        # Add comma separator if needed
        if [ "$FIRST_CATEGORY" = false ]; then
            echo ',' >> "$CONFIG_FILE"
        fi
        FIRST_CATEGORY=false

        # Write category entry
        echo "    {" >> "$CONFIG_FILE"
        echo "      \"name\": \"$CATEGORY_NAME\"," >> "$CONFIG_FILE"
        echo "      \"path\": \"$CATEGORY_NAME\"," >> "$CONFIG_FILE"
        echo "      \"albums\": $ALBUMS_JSON," >> "$CONFIG_FILE"
        echo "      \"photos\": $CATEGORY_PHOTOS_JSON" >> "$CONFIG_FILE"
        echo -n "    }" >> "$CONFIG_FILE"
    fi
done

# Close JSON structure
echo "" >> "$CONFIG_FILE"
echo "  ]" >> "$CONFIG_FILE"
echo "}" >> "$CONFIG_FILE"

echo "✅ Config file generated: $CONFIG_FILE"
