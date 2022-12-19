from pyzbar import pyzbar
import cv2

def liveUPC():
    d = None
    t = None
    cap = cv2.VideoCapture(0)
    #TODO: solution for endless camera capture
    while d == None or t==None:
        # read the frame from the camera
        _, pic = cap.read()
        # decodes barcode from an image
        objects = pyzbar.decode(pic)
        for object in objects:
            # print barcode type & data
            d = object.data
            t = object.type
            print("Type:", t)
            print("Data:", d)
            print('***********************')
        # show the image in the window
        cv2.imshow("Scanner", pic)
        if cv2.waitKey(1) == ord("q"):
            break
    return d, t

d, t = liveUPC()