let id = 0; // global variable

function generateJson() {
    id += 1; // increment ID
    const timestamp = new Date().toISOString(); // ISO 8601 timestamp

    const cameras = [];
    for (let cameraId = 1; cameraId <= 8; cameraId++) {
        cameras.push({
            cameraId: cameraId,
            probability: Math.floor(Math.random() * 101) // 0-100
        });
    }

    return {
        id: id,
        timestamp: timestamp,
        cameras: cameras
    };
}
