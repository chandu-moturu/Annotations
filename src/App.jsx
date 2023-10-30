import { useState, useEffect, useRef } from "react";
import { Annotorious } from "@recogito/annotorious";
import "@recogito/annotorious/dist/annotorious.min.css";
import "./App.css";
import imageupload from "./assets/imageUpload.png";

function ImageAnnotator() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const imageRef = useRef(null);

  useEffect(() => {
    if (selectedImage) {
      initAnnotorious();
    }
  }, [selectedImage]);

  useEffect(() => {
    loadAnnotationsFromStorage();
  }, []);

  const initAnnotorious = () => {
    const image = imageRef.current;
    const annotorious = new Annotorious({ image });
    annotorious.clearAnnotations();

    const savedAnnotations =
      JSON.parse(localStorage.getItem("annotations")) || [];

    savedAnnotations.forEach((annotation) => {
      annotorious.addAnnotation(annotation);
    });

    annotorious.on("createAnnotation", (annotation) => {
      const updatedAnnotations = [...annotations, annotation];
      setAnnotations(updatedAnnotations);
      saveAnnotationsToStorage(updatedAnnotations);
    });

    return () => annotorious.destroy();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      localStorage.removeItem("annotations");
      setSelectedImage(imageUrl);
      setAnnotations([]);
    }
  };

  const saveAnnotationsToStorage = (annotations) => {
    const saveAnnotations =
      JSON.parse(localStorage.getItem("annotations")) || [];
    const updatedAnnotations = [...saveAnnotations, ...annotations];
    localStorage.setItem("annotations", JSON.stringify(updatedAnnotations));
  };

  const loadAnnotationsFromStorage = () => {
    const savedAnnotations =
      JSON.parse(localStorage.getItem("annotations")) || [];
    setAnnotations(savedAnnotations);
  };

  const downloadAnnotations = () => {
    const allAnnotations =
      JSON.parse(localStorage.getItem("annotations")) || [];
    const annotationsBlob = new Blob([JSON.stringify(allAnnotations)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(annotationsBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "annotations.json";
    a.click();
  };

  return (
    <div className="main__container">
      <form
        htmlFor="file"
        className="file__input"
        onClick={() => document.querySelector(".input-field").click()}
      >
        <img src={imageupload} alt="" />
        <span>Click to Select Image</span>
        <input
          type="file"
          accept="image/*"
          className="input-field"
          onChange={handleImageUpload}
        />
      </form>

      {selectedImage && (
        <div style={{ position: "relative" }}>
          <img
            ref={imageRef}
            src={selectedImage}
            alt=""
            style={{ width: "100%" }}
          />
        </div>
      )}

      {selectedImage && (
        <div>
          <button className="download__btn" onClick={downloadAnnotations}>
            Download Annotations
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageAnnotator;
