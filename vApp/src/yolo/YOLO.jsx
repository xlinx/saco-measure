yolo.setup({
    modelUrl: "model/model.json",
    labels: ["person", "car", "dog"],
    colors: ["#FF0000", "#00FF00"],
    displayLabels: new Set(["person", "dog"]),
    scoreThreshold: 0.3,
    boxLineWidth: 10,
    boxLabels: true,
});
yolo.loadModel().then((model) => {
    console.log("Model loaded!", model)
});
yolo.detect(imageElement, model, canvas, (detections) => {
    console.log(detections);
});
// yolo.detectVideo(videoElement, model, canvas);
