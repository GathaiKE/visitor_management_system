from pprint import pprint
import boto3
import json
import logging
from botocore.config import Config
from botocore.exceptions import ClientError
from django.conf import settings


logger = logging.getLogger(__name__)

too_be = 'rekog-champions-collection-A',
# "Cintel-Core-AMS-Production-Collection"


class FaceRecognitionSystem:
    def __init__(self, region='eu-west-1', 
                 collection_id = "CintelCore-Staff-AMS-Testing-Collection",
                 to_be = 'Cintel-Core-AMS-Production-Collection',
                 bucket='rekog-champions'):
        self.region = region
        self.collection_id = collection_id
        self.bucket = bucket
        self.to_be = to_be
        self.client = boto3.client('rekognition', region_name=self.region)
        self.s3_client = boto3.client('s3', region_name=self.region)

    def detect_faces(self, target_file):
        try:
            with open(target_file, 'rb') as image_target:
                response = self.client.detect_faces(Image={'Bytes': image_target.read()}, Attributes=['ALL'])
                print('Detected faces for ' + target_file)
                for face_detail in response['FaceDetails']:
                    print('The detected face is between ' + str(face_detail['AgeRange']['Low']) +
                        ' and ' + str(face_detail['AgeRange']['High']) + ' years old')
                    print('Here are the other attributes:')
                    print(json.dumps(face_detail, indent=4, sort_keys=True))
                    print("Gender: " + str(face_detail['Gender']))
                    print("Smile: " + str(face_detail['Smile']))
                    print("Eyeglasses: " + str(face_detail['Eyeglasses']))
                    print("Emotions: " + str(face_detail['Emotions'][0]))

                logger.info("Detected %s faces.", len(response['FaceDetails']))
                return response['FaceDetails']

        except ClientError:
            logger.exception("Couldn't detect faces in %s.", self.image_name)
            raise
        

    def search_faces_by_image(self, photo, threshold=99, max_faces=1):
        with open(photo, 'rb') as image:
            response = self.client.search_faces_by_image(CollectionId=self.collection_id,
                                                         Image={'Bytes': image.read()},
                                                         FaceMatchThreshold=threshold, MaxFaces=max_faces)
        face_matches = response['FaceMatches']
        print(face_matches)
        print("Faces found: " + str(len(face_matches)))

        for match in face_matches:
            print('FaceId: ' + match['Face']['FaceId'])
            print('ImageId: ' + match['Face']['ImageId'])
            print('Similarity: ' + "{:.2f}".format(match['Similarity']) + "%")
            print('Confidence: ' + str(match['Face']['Confidence']))

        return face_matches

    def add_faces_to_collection(self, target_file, photo):
        with open(target_file, 'rb') as image_target:
            response = self.client.index_faces(CollectionId=self.collection_id,
                                               Image={'Bytes': image_target.read()},
                                               ExternalImageId=photo,
                                               MaxFaces=1,
                                               QualityFilter="AUTO",
                                               DetectionAttributes=['ALL'])
        print(response)

        print('Results for ' + photo)
        print('Faces indexed:')
        for face_record in response['FaceRecords']:
            print('  Face ID: ' + face_record['Face']['FaceId'])
            print('  Location: {}'.format(face_record['Face']['BoundingBox']))
            print('  Image ID: {}'.format(face_record['Face']['ImageId']))
            print('  External Image ID: {}'.format(face_record['Face']['ExternalImageId']))
            print('  Confidence: {}'.format(face_record['Face']['Confidence']))

        print('Faces not indexed:')
        for unindexed_face in response['UnindexedFaces']:
            print(' Location: {}'.format(unindexed_face['FaceDetail']['BoundingBox']))
            print(' Reasons:')
            for reason in unindexed_face['Reasons']:
                print('   ' + reason)

        return len(response['FaceRecords'])

    def upload_file_to_s3(self, local_file, key_name):
        try:
            response = self.s3_client.upload_file(local_file, self.bucket, key_name)
            print("File upload successful!")
        except ClientError as e:
            logging.error(e)

    def create_collection(self):
        print('Creating collection: ' + self.collection_id)
        response = self.client.create_collection(CollectionId=self.collection_id)
        print('Collection ARN: ' + response['CollectionArn'])
        print('Status code: ' + str(response['StatusCode']))
        print('Done...')
    
    def delete_collection(self): 
        print("deleting collection" + self.to_be)
        response = self.client.delete_collection(CollectionId=self.to_be)
        print('Status code: ' + str(response['StatusCode']))
        print('Done...')   
        # try:
        #     print("deleting collection" + self.to_be)
        #     self.client.delete_collection(CollectionId=self.to_be)
        #     logger.info("Deleted collection %s.", self.to_be)
        #     self.collection_id = None
        # except ClientError:
        #     logger.exception("Couldn't delete collection %s.", self.collection_id)
        #     raise

    def compare_faces(self, source_file, target_file, similarity_threshold=99):
        with open(target_file, 'rb') as image_target:
            response = self.client.compare_faces(SimilarityThreshold=similarity_threshold,
                                                SourceImage={'S3Object': {'Bucket': self.bucket, 'Name': source_file}},
                                                TargetImage={'Bytes': image_target.read()})
        for face_match in response['FaceMatches']:
            position = face_match['Face']['BoundingBox']
            similarity = str(face_match['Similarity'])
            print('The face at ' +
                  str(position['Left']) + ' ' +
                  str(position['Top']) +
                  ' matches with ' + similarity + '% confidence')

        return len(response['FaceMatches'])


# Example usage:
face_recognition_system = FaceRecognitionSystem()

# # Detect Faces
# face_count = face_recognition_system.detect_faces('testimage4.jpg')
# print("Faces detected: " + str(face_count))

# Search Faces by Image
# face_matches = face_recognition_system.search_faces_by_image('testimage4.jpg')
# print("Faces found: " + str(len(face_matches)))
# print(len(face_matches))

# Add Faces to Collection
# indexed_faces_count = face_recognition_system.add_faces_to_collection('testimage2.jpg', 'testimage2analyzed')
# print("Faces indexed count: " + str(indexed_faces_count))

# Upload File to S3
# reda = face_recognition_system.upload_file_to_s3('testimage4.jpg', 'analyzedtestimage4.jpg')
# print(reda)

# Create Collection
face_recognition_system.create_collection()
# face_recognition_system.delete_collection()

# Compare Faces
# face_matches = face_recognition_system.compare_faces('image (3).jpg', 'testimage3.jpg')
# print("Face matches: " + str(face_matches))
