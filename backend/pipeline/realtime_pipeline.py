import time

import cv2
from resnet50.load_resnet50 import load_resnet50_model
from tsm import load_tsm
from post_analysis.clean_up import delete_resource

from realtime_handling.frame_to_vector import frames_to_vectors
from realtime_handling.prediction import predict_realtime
from realtime_handling.connect_phone_cam import connect_and_stream

resnet50_model = load_resnet50_model(device=None)
tsm_model = load_tsm.load_TSM(pt_path="tsm/tsm_feature_epoch_12.pt", feature_dim=2048, num_classes=2, n_segment=4)

camera_url1 = "http://192.168.1.57:8080/video"

num_camera = 8

lst_camera_urls = [camera_url1 for _ in range(num_camera)]

def realtime_pipeline(lst_camera_urls):
    lst_frames = [next(connect_and_stream(url))[1] for url in lst_camera_urls] # because the first yield is boolean, not frame
    features_stack = frames_to_vectors(lst_frames, resnet50_model, device='cuda')
    json_result = predict_realtime(tsm_model, features_stack, device='cuda')
    print("Realtime prediction result:", json_result)
    return json_result

# Example usage
while (True):
    realtime_pipeline(lst_camera_urls)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
cv2.destroyAllWindows()