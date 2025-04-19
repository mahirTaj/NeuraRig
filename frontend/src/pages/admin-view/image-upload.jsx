import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Make sure this path is correct

function ProductImageUpload({
  imageFile,
  setImageFile,
  uploadedImageUrl,
  setUploadedImageUrl,
  isCustomStyling = false
}) {
  const inputRef = useRef(null);

  function handleImageFileChange(event) {
    console.log(event.target.files);
  }

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      <Label className="text-lg font-semibold mb-2 block">
        Upload Image
      </Label>
      <div>
        <Input
          id="image-upload"
          type="file"
        //   className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
        />
      </div>
    </div>
  );
}

export default ProductImageUpload;
