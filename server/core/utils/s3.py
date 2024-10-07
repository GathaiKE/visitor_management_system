from botocore.exceptions import ClientError
from core.models import VisitorImage
from django.conf import settings
import logging
import boto3
import os

from . import helpers


class SimpleStorage:
    def __init__(self) -> None:
        self.bucket = settings.AWS_S3_BUCKET
        self.visitor_id = None
        self.object_url = None

    def upload_file(self, file_name, object_name=None):
        """Upload a file to an S3 bucket

        :param file_name: File to upload
        :param object_name: S3 object name. If not specified then file_name is used
        :return: True if file was uploaded, else False
        """

        # If S3 object_name was not specified, use file_name
        if object_name is None:
            object_name = os.path.basename(file_name)

        # Upload the file
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
        
        try:
            response = s3_client.upload_file(
                file_name, self.bucket, object_name)

            self.object_url = f"https://{self.bucket}.s3.amazonaws.com/{object_name}"

            self._save_visitor_image()
            helpers.delete_file(file_name)


        except ClientError as e:
            logging.error(e)
            return False

        return True

    def _save_visitor_image(self):
        try:
            print("saving visitor images")
            visitor_image = VisitorImage(
                image_url=self.object_url, visitor_id=self.visitor_id)
            visitor_image.save()
        except Exception as e:
            print(f"Error while saving the visitor image: {str(e)}")
