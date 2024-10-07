import logging
from pprint import pprint
import boto3
import botocore
from botocore.config import Config
from botocore.exceptions import ClientError
from django.conf import settings
import time


logger = logging.getLogger(__name__)

# AWS_REKOG_REGION = 'eu-west-1'
AWS_REKOG_REGION = settings.AWS_REKOG_REGION
# AWS_REKOG_COLLECTION_ID = "Cintel-Core-AMS-Production-Collection"
AWS_REKOG_COLLECTION_ID =  settings.AWS_REKOG_COLLECTION_ID
# "Cintel-Core-AMS-Staging-Collection"
## 
## 'rekog-champions-collection-A'

AWS_ACCESS_KEY_ID = settings.AWS_ACCESS_KEY_ID
# AWS_ACCESS_KEY_ID='AKIAXTLQEYCGVTWCQ7QT'
AWS_SECRET_ACCESS_KEY = settings.AWS_SECRET_ACCESS_KEY
# AWS_SECRET_ACCESS_KEY="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"
#

class RekognitionImage:
    """
    Encapsulates an Amazon Rekognition image. This class is a thin wrapper
    around parts of the Boto3 Amazon Rekognition API.
    """
    def __init__(self, image, image_name, rekognition_client):
        """
        Initializes the image object.

        :param image: Data that defines the image, either the image bytes or
                      an Amazon S3 bucket and object key.
        :param image_name: The name of the image.
        :param rekognition_client: A Boto3 Rekognition client.
        """
        self.image = image
        self.image_name = image_name
        self.rekognition_client = rekognition_client

    @classmethod
    def from_file(cls, image_file_name, rekognition_client, image_name=None):
        """
        Creates a RekognitionImage object from a local file.

        :param image_file_name: The file name of the image. The file is opened and its
                                bytes are read.
        :param rekognition_client: A Boto3 Rekognition client.
        :param image_name: The name of the image. If this is not specified, the
                           file name is used as the image name.
        :return: The RekognitionImage object, initialized with image bytes from the
                 file.
        """
        with open(image_file_name, 'rb') as img_file:
            image = {'Bytes': img_file.read()}
        name = image_file_name if image_name is None else image_name
        return cls(image, name, rekognition_client)

    
    def detect_faces(self):
        """
        Detects faces in the image.

        :return: The list of faces found in the image.
        """
        try:
            response = self.rekognition_client.detect_faces(
                Image=self.image, Attributes=['ALL'])
            faces = [RekognitionFace(face) for face in response['FaceDetails']]
            logger.info("Detected %s faces.", len(faces))
        except ClientError:
            logger.exception("Couldn't detect faces in %s.", self.image_name)
            raise
        else:
            return faces


class RekognitionCollectionManager:
    """
    Encapsulates Amazon Rekognition collection management functions.
    This class is a thin wrapper around parts of the Boto3 Amazon Rekognition API.
    """
    def __init__(self, rekognition_client):
        """
        Initializes the collection manager object.

        :param rekognition_client: A Boto3 Rekognition client.
        """
        self.rekognition_client = rekognition_client

    def create_collection(self, collection_id):
        """
        Creates an empty collection.

        :param collection_id: Text that identifies the collection.
        :return: The newly created collection.
        """
        try:
            response = self.rekognition_client.create_collection(
                CollectionId=collection_id)
            response['CollectionId'] = collection_id
            collection = RekognitionCollection(response, self.rekognition_client)
            logger.info("Created collection %s.", collection_id)
        except ClientError:
            logger.exception("Couldn't create collection %s.", collection_id)
            raise
        else:
            return collection

    def list_collections(self, max_results):
        """
        Lists collections for the current account.

        :param max_results: The maximum number of collections to return.
        :return: The list of collections for the current account.
        """
        try:
            response = self.rekognition_client.list_collections(MaxResults=max_results)
            collections = [
                RekognitionCollection({'CollectionId': col_id}, self.rekognition_client)
                for col_id in response['CollectionIds']]
        except ClientError:
            logger.exception("Couldn't list collections.")
            raise
        else:
            return collections

class RekognitionCollection:
    """
    Encapsulates an Amazon Rekognition collection. This class is a thin wrapper
    around parts of the Boto3 Amazon Rekognition API.
    """
    def __init__(self, collection, rekognition_client):
        """
        Initializes a collection object.

        :param collection: Collection data in the format returned by a call to
                           create_collection.
        :param rekognition_client: A Boto3 Rekognition client.
        """
        self.collection_id = collection['CollectionId']
        self.collection_arn, self.face_count, self.created = self._unpack_collection(
            collection)
        self.rekognition_client = rekognition_client

    @staticmethod
    def _unpack_collection(collection):
        """
        Unpacks optional parts of a collection that can be returned by
        describe_collection.

        :param collection: The collection data.
        :return: A tuple of the data in the collection.
        """
        return (
            collection.get('CollectionArn'),
            collection.get('FaceCount', 0),
            collection.get('CreationTimestamp'))

    def to_dict(self):
        """
        Renders parts of the collection data to a dict.

        :return: The collection data as a dict.
        """
        rendering = {
            'collection_id': self.collection_id,
            'collection_arn': self.collection_arn,
            'face_count': self.face_count,
            'created': self.created
        }
        return rendering

    def describe_collection(self):
        """
        Gets data about the collection from the Amazon Rekognition service.

        :return: The collection rendered as a dict.
        """
        try:
            response = self.rekognition_client.describe_collection(
                CollectionId=self.collection_id)
            # Work around capitalization of Arn vs. ARN
            response['CollectionArn'] = response.get('CollectionARN')
            (self.collection_arn, self.face_count,
             self.created) = self._unpack_collection(response)
            logger.info("Got data for collection %s.", self.collection_id)
        except ClientError:
            logger.exception("Couldn't get data for collection %s.", self.collection_id)
            raise
        else:
            return self.to_dict()

    def delete_collection(self):
        """
        Deletes the collection.
        """
        try:
            self.rekognition_client.delete_collection(CollectionId=self.collection_id)
            logger.info("Deleted collection %s.", self.collection_id)
            self.collection_id = None
        except ClientError:
            logger.exception("Couldn't delete collection %s.", self.collection_id)
            raise

    def index_faces(self, image, max_faces):
        """
        Finds faces in the specified image, indexes them, and stores them in the
        collection.

        :param image: The image to index.
        :param max_faces: The maximum number of faces to index.
        :return: A tuple. The first element is a list of indexed faces.
                 The second element is a list of faces that couldn't be indexed.
        """
        try:
            response = self.rekognition_client.index_faces(
                CollectionId=self.collection_id, Image=image.image,
                ExternalImageId=image.image_name, MaxFaces=max_faces,
                DetectionAttributes=['ALL'])
            indexed_faces = [
                RekognitionFace({**face['Face'], **face['FaceDetail']})
                for face in response['FaceRecords']]
            unindexed_faces = [
                RekognitionFace(face['FaceDetail'])
                for face in response['UnindexedFaces']]
            logger.info(
                "Indexed %s faces in %s. Could not index %s faces.", len(indexed_faces),
                image.image_name, len(unindexed_faces))
        except ClientError:
            logger.exception("Couldn't index faces in image %s.", image.image_name)
            raise
        else:
            return indexed_faces, unindexed_faces

    def list_faces(self, max_results):
        """
        Lists the faces currently indexed in the collection.

        :param max_results: The maximum number of faces to return.
        :return: The list of faces in the collection.
        """
        try:
            response = self.rekognition_client.list_faces(
                CollectionId=self.collection_id, MaxResults=max_results)
            faces = [RekognitionFace(face) for face in response['Faces']]
            logger.info(
                "Found %s faces in collection %s.", len(faces), self.collection_id)
        except ClientError:
            logger.exception(
                "Couldn't list faces in collection %s.", self.collection_id)
            raise
        else:
            return faces

    def search_faces(self, face_id, threshold, max_faces):
        """
        Searches for faces in the collection that match another face from the
        collection.

        :param face_id: The ID of the face in the collection to search for.
        :param threshold: The match confidence must be greater than this value
                          for a face to be included in the results.
        :param max_faces: The maximum number of faces to return.
        :return: The list of matching faces found in the collection. This list does
                 not contain the face specified by `face_id`.
        """
        try:
            response = self.rekognition_client.search_faces(
                CollectionId=self.collection_id, FaceId=face_id,
                FaceMatchThreshold=threshold, MaxFaces=max_faces)
            faces = [RekognitionFace(face['Face']) for face in response['FaceMatches']]
            logger.info(
                "Found %s faces in %s that match %s.", len(faces), self.collection_id,
                face_id)
        except ClientError:
            logger.exception(
                "Couldn't search for faces in %s that match %s.", self.collection_id,
                face_id)
            raise
        else:
            return faces

    def search_faces_by_image(self, image, threshold, max_faces):
        """
        Searches for faces in the collection that match the largest face in the
        reference image.

        :param image: The image that contains the reference face to search for.
        :param threshold: The match confidence must be greater than this value
                          for a face to be included in the results.
        :param max_faces: The maximum number of faces to return.
        :return: A tuple. The first element is the face found in the reference image.
                 The second element is the list of matching faces found in the
                 collection.
        """
        try:
            response = self.rekognition_client.search_faces_by_image(
                CollectionId=self.collection_id, Image=image.image,
                FaceMatchThreshold=threshold, MaxFaces=max_faces)
            image_face = RekognitionFace({
                'BoundingBox': response['SearchedFaceBoundingBox'],
                'Confidence': response['SearchedFaceConfidence']
            })
            collection_faces = [
                RekognitionFace(face['Face']) for face in response['FaceMatches']]
            logger.info("Found %s faces in the collection %s that match the largest "
                        "face in %s.", len(collection_faces), self.collection_id, image.image_name)
        except ClientError:
            logger.exception(
                "Couldn't search for faces in %s that match %s.", self.collection_id,
                image.image_name)
            raise
        else:
            return image_face, collection_faces
        

class RekognitionFace:
    """Encapsulates an Amazon Rekognition face."""
    def __init__(self, face, timestamp=None):
        """
        Initializes the face object.

        :param face: Face data, in the format returned by Amazon Rekognition
                     functions.
        :param timestamp: The time when the face was detected, if the face was
                          detected in a video.
        """
        self.bounding_box = face.get('BoundingBox')
        self.confidence = face.get('Confidence')
        self.landmarks = face.get('Landmarks')
        self.pose = face.get('Pose')
        self.quality = face.get('Quality')
        age_range = face.get('AgeRange')
        if age_range is not None:
            self.age_range = (age_range.get('Low'), age_range.get('High'))
        else:
            self.age_range = None
        self.smile = face.get('Smile', {}).get('Value')
        self.eyeglasses = face.get('Eyeglasses', {}).get('Value')
        self.sunglasses = face.get('Sunglasses', {}).get('Value')
        self.gender = face.get('Gender', {}).get('Value', None)
        self.beard = face.get('Beard', {}).get('Value')
        self.mustache = face.get('Mustache', {}).get('Value')
        self.eyes_open = face.get('EyesOpen', {}).get('Value')
        self.mouth_open = face.get('MouthOpen', {}).get('Value')
        self.emotions = [emo.get('Type') for emo in face.get('Emotions', [])
                         if emo.get('Confidence', 0) > 50]
        self.face_id = face.get('FaceId')
        self.image_id = face.get('ImageId')
        self.timestamp = timestamp

    def to_dict(self):
        """
        Renders some of the face data to a dict.

        :return: A dict that contains the face data.
        """
        rendering = {}
        if self.bounding_box is not None:
            rendering['bounding_box'] = self.bounding_box
        if self.age_range is not None:
            rendering['age'] = f'{self.age_range[0]} - {self.age_range[1]}'
        if self.gender is not None:
            rendering['gender'] = self.gender
        if self.emotions:
            rendering['emotions'] = self.emotions
        if self.face_id is not None:
            rendering['face_id'] = self.face_id
        if self.image_id is not None:
            rendering['image_id'] = self.image_id
        if self.timestamp is not None:
            rendering['timestamp'] = self.timestamp
        has = []
        if self.smile:
            has.append('smile')
        if self.eyeglasses:
            has.append('eyeglasses')
        if self.sunglasses:
            has.append('sunglasses')
        if self.beard:
            has.append('beard')
        if self.mustache:
            has.append('mustache')
        if self.eyes_open:
            has.append('open eyes')
        if self.mouth_open:
            has.append('open mouth')
        if has:
            rendering['has'] = has
        return rendering


def get_rekognition_client():
    aws_config = Config(region_name=AWS_REKOG_REGION)
    rekognition_client = boto3.client(
        'rekognition', 
        config=aws_config,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
    
    return rekognition_client


def get_collection(collection_id):
    rekognition_client = get_rekognition_client()
    
    print(f"GET COLLECTION, collection_id: {collection_id}")

    collection_managager = RekognitionCollectionManager(
        rekognition_client=rekognition_client
    )

    collections = collection_managager.list_collections(
        max_results=30
    )

    print(f"Collections: {collections}")

    for collection in collections:
        if collection_id == collection.to_dict().get("collection_id"):
            return collection
        print(f"collection dictionary: {collection.to_dict()}"), 
        
    return False


def index_face(image_file_name, image_name):

    rekognition_client = get_rekognition_client()

    collection_id = AWS_REKOG_COLLECTION_ID

    print(f"COLLECTION ID: {collection_id}")

    collection = get_collection(collection_id)

    print(f"COLLECTION : {collection}")    

    if not collection:
        return False

    image = RekognitionImage.from_file(
        image_file_name=image_file_name,
        image_name=image_name,
        rekognition_client=rekognition_client
    )

    indexed_faces, unindexed_faces = collection.index_faces(
        image=image,
        max_faces=1
    )

    if len(indexed_faces):
        face_id = indexed_faces[0].to_dict().get("face_id")
        print( f"face with face id: {face_id} indexed successfuly")
        return {
            "face_id":face_id
        }
    
    else:
        return False
    

def search_face(image_file_name, image_name):
    
    rekognition_client = get_rekognition_client()

    # rekognition image
    rekognition_image = RekognitionImage.from_file(
        image_file_name=image_file_name,
        image_name=image_name,
        rekognition_client=rekognition_client
    )

    # collection
    collection_id = AWS_REKOG_COLLECTION_ID
    collection = get_collection(collection_id)
    if collection:
    
        image_face, match_faces = collection.search_faces_by_image(
            image=rekognition_image,
            threshold=95,
            max_faces=2
        )

        if len(match_faces):
            return match_faces[0].to_dict().get("face_id")
        else:
            return False
    else:
        return False






##############################################################################


def create_user(collection_id, user_id):
    """
    Finds faces in the specified image, indexes them, and stores them in the
            collection.

    :param collection_id: The ID of the collection where the indexed faces will be stored at.
    :param image_file_name: The image file location that will be used by indexFaces call.

    :return: The indexFaces response
    """

    client = get_rekognition_client()

    try:
        print(f'Creating user: {collection_id}, {user_id}')
        client.create_user(
            CollectionId=collection_id,
            UserId=user_id
        )

    except ClientError as e:
        # logger.exception(f'Failed to create user with given user id: {user_id}')
        if e.operation_name == "CreateUser":
            
            # create a collection
            print(f"Creating Collection: {collection_id}")
            collection_manager = RekognitionCollectionManager(rekognition_client=client)
            collection_manager.create_collection(collection_id=collection_id)
            
            time.sleep(3)

            # create user
            print(f"Creating User: {user_id}")
            client.create_user(
                CollectionId=collection_id,
                UserId=user_id
            )
        
        else:
            raise




def associate_faces(collection_id, user_id, face_ids):
    """
    Associate stored faces within collection to the given user

    :param collection_id: The ID of the collection where user and faces are stored.
    :param user_id: The ID of the user that we want to associate faces to
    :param face_ids: The list of face IDs to be associated to the given user

    :return: response of AssociateFaces API
    """
    logger.info(f'Associating faces to user: {user_id}, {face_ids}')

    print(f'Associating faces to user: {user_id}, {face_ids}')

    client = get_rekognition_client()
    try:
        logging.info(f'CollectionId: {collection_id}')
        logging.info(f'UserId: {user_id}')
        logging.info(f'FaceIds: {face_ids}')
        response = client.associate_faces(
            CollectionId=collection_id,
            UserId=user_id,
            FaceIds=face_ids
        )
        print(f'- associated {len(response["AssociatedFaces"])} faces')
    except ClientError as error:
        logger.exception(f"Failed to associate faces to the given user: {error}")
        raise
    else:
        print(response)
        return response


def disassociate_faces(collection_id, user_id, face_ids):
    """
    Disassociate stored faces within collection to the given user

    :param collection_id: The ID of the collection where user and faces are stored.
    :param user_id: The ID of the user that we want to disassociate faces from
    :param face_ids: The list of face IDs to be disassociated from the given user

    :return: response of AssociateFaces API
    """
    logger.info(f'Disssociating faces from user: {user_id}, {face_ids}')

    client = get_rekognition_client()

    try:
        response = client.disassociate_faces(
            CollectionId=collection_id,
            UserId=user_id,
            FaceIds=face_ids
        )
        print(f'- disassociated {len(response["DisassociatedFaces"])} faces')
    except ClientError:
        logger.exception("Failed to disassociate faces from the given user")
        raise
    else:
        print(response)
        return response


def list_users(collection_id):
    """
    List all users from the given collection

    :param collection_id: The ID of the collection where user is stored.

    :return: response that contains list of Users found within given collection
    """
    logger.info(f'Listing the users in collection: {collection_id}')

    client = get_rekognition_client()

    try:
        response = client.list_users(
            CollectionId=collection_id
        )
        pprint(response["Users"])
    except ClientError:
        logger.exception(f'Failed to list all user from given collection: {collection_id}')
        raise
    else:
        return response


def search_face_in_collection(face_id, collection_id):
    threshold = 90
    max_faces = 2

    client = get_rekognition_client()

    response = client.search_faces(
        CollectionId=collection_id, 
        FaceId=face_id, 
        FaceMatchThreshold=threshold, 
        MaxFaces=max_faces
    )

    face_matches = response['FaceMatches']
    print('Matching faces')
    for match in face_matches:
        print('FaceId:' + match['Face']['FaceId'])
        print('Similarity: ' + "{:.2f}".format(match['Similarity']) + "%")

    return len(face_matches)


def search_users_by_face_id(collection_id, face_id):
    """
    SearchUsers operation with face ID provided as the search source

    :param collection_id: The ID of the collection where user and faces are stored.
    :param face_id: The ID of the face in the collection to search for.

    :return: response of SearchUsers API
    """
    logger.info(f'Searching for users using a face-id: {face_id}')

    client = get_rekognition_client()
    try:
        response = client.search_users(
            CollectionId=collection_id,
            FaceId=face_id
        )
        print(f'- found {len(response["UserMatches"])} matches')
        print([f'- {x["User"]["UserId"]} - {x["Similarity"]}%' for x in response["UserMatches"]])
    except ClientError as e:
        print(e.operation_name)
        print(e.response)
        print(f"Collection ID: {collection_id}, Face ID: {face_id}")
        logger.exception(f'Failed to perform SearchUsers with given face id: {face_id}')
        raise
    else:
        print(response)
        return response

def search_users_by_user_id(collection_id, user_id):
    """
    SearchUsers operation with user ID provided as the search source

    :param collection_id: The ID of the collection where user and faces are stored.
    :param user_id: The ID of the user in the collection to search for.

    :return: response of SearchUsers API
    """
    logger.info(f'Searching for users using a user-id: {user_id}')

    client = get_rekognition_client()
    try:
        response = client.search_users(
            CollectionId=collection_id,
            UserId=user_id
        )
        print(f'- found {len(response["UserMatches"])} matches')
        print([f'- {x["User"]["UserId"]} - {x["Similarity"]}%' for x in response["UserMatches"]])
    except ClientError:
        logger.exception(f'Failed to perform SearchUsers with given face id: {user_id}')
        raise
    else:
        print(response)
        return response


def load_image(file_name):
    """
    helper function to load the image for indexFaces call from local disk

    :param image_file_name: The image file location that will be used by indexFaces call.
    :return: The Image in bytes
    """
    print(f'- loading image: {file_name}')
    with open(file_name, 'rb') as file:
        return {'Bytes': file.read()}
    

def search_users_by_image(collection_id, image_file):
    """
    SearchUsersByImage operation with user ID provided as the search source

    :param collection_id: The ID of the collection where user and faces are stored.
    :param image_file: The image that contains the reference face to search for.

    :return: response of SearchUsersByImage API
    """
    logger.info(f'Searching for users using an image: {image_file}')

    client = get_rekognition_client()

    try:
        response = client.search_users_by_image(
            CollectionId=collection_id,
            Image=load_image(image_file)
        )
        print(f'- found {len(response["UserMatches"])} matches')
        print([f'- {x["User"]["UserId"]} - {x["Similarity"]}%' for x in response["UserMatches"]])
    except ClientError:
        logger.exception(f'Failed to perform SearchUsersByImage with given image: {image_file}')
        raise
    else:
        print(response)
        return response

def detect_face(image_file_name, image_name):
    print("detecting....")
    rekognition_client = get_rekognition_client()

    rekognition_image = RekognitionImage.from_file(
        image_file_name=image_file_name,
        image_name=image_name,
        rekognition_client=rekognition_client
    )

    result = rekognition_image.detect_faces()

    if len(result):
        face = result[0]
        print(face.smile)
        return True


    return False




def detect_user_by_face(image_file_name, image_name):
    rekognition_client = get_rekognition_client()

    # Create a RekognitionImage instance from the provided image file
    rekognition_image = RekognitionImage.from_file(
        image_file_name=image_file_name,
        image_name=image_name,
        rekognition_client=rekognition_client
    )
    collection_id = AWS_REKOG_COLLECTION_ID
    collection = get_collection(collection_id)
    print(f"collection matokeo: {collection}")
    # Search for faces in the collection that match the largest face in the reference image
    image_face, match_faces = collection.search_faces_by_image(
        image=rekognition_image,
        threshold=96,
        max_faces=2  # Assuming you want to find only one matching face
    )

    if len(match_faces) > 0:
        # Assuming you want to return the user ID associated with the first matching face
        matching_face = match_faces[0]
        user_id = get_user_id_by_face_id(collection_id=AWS_REKOG_COLLECTION_ID, face_id=matching_face.face_id)
        return user_id
    else:
        return None


def get_user_id_by_face_id(collection_id, face_id):
    # Search for users in the collection using the face ID
    response = search_users_by_face_id(collection_id=collection_id, face_id=face_id)

    # Assuming you want to return the user ID associated with the first matching user
    if response and len(response["UserMatches"]) > 0:
        matching_user = response["UserMatches"][0]["User"]
        user_id = matching_user["UserId"]
        return user_id
    else:
        return None


# image_file_name = 'H:/CintelCore/vms-core-api/core/utils/testimage.jpg'
# image_name = 'testedimage'
# outa = detect_user_by_face(image_file_name,image_name)
# print(outa)


# detect_face(
#     image_file_name="/home/faraji/Developer/Backend/images/noni_AeLsHim.jpg",
#     image_name="noni"
# )

