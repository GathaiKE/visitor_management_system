import requests
from django.conf import settings
import base64
import logging

logger = logging.getLogger()


class Kairos():
    def __init__(self) -> None:
        self.headers = {
            # 'Content-Type': 'application/json',
            'app_id': settings.KAIROS_APP_ID,
            'app_key': settings.KAIROS_APP_KEY,
        }
        self.base_url = settings.KAIROS_BASE_URL
        self.gallery_name = settings.KAIROS_GALLERY_NAME

    def enroll(self, image_file_path, subject_id):
        """
        Enrolls an image into a gallery.
        :param image_file_path: The URL of the image to enroll.
        :param subject_id: The subject ID to enroll the image into.
        :return: The response from the server.
        """

        url = self.base_url + "/enroll"

        payload = {
            "subject_id": subject_id,
            "gallery_name": self.gallery_name,
            "image": self.get_encoded_photo(image_file_path)
        }

        try:
            response = requests.post(url, data=payload, headers=self.headers)
            data = response.json()

            errors = data.get('Errors')
            if errors:
                logger.error(f"Error: {errors}")
                return False

            logger.info(f"User {subject_id} enrolled successfully")
            return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(e)
            return False

        except Exception as e:
            logger.error(e)
            return False

    def recognize(self, image_file_path):
        """
        Recognizes an image in a gallery.
        :param image_file_path: the image_file_path of the image to recognize.
        :return: The subject_id of the subject in the recognized image.
        """
        url = self.base_url + "/recognize"

        payload = {
            "gallery_name": self.gallery_name,
            "image": self.get_encoded_photo(image_file_path)
        }

        try:
            response = requests.post(url, data=payload, headers=self.headers)

            data = response.json()

            errors = data.get('Errors')
            if errors:
                logger.error(f"Error: {errors}")
                return False

            images = data.get('images')
            if not images:
                logger.error("No images in response")
                return False

            max_confidence = 0.0

            for image in images:
                candidates = image.get('candidates')
                if not candidates:
                    logger.error("No candidates in response")
                    return False

                for candidate in candidates:
                    confidence = candidate.get('confidence')

                    if confidence > max_confidence:
                        max_confidence = confidence
                        subject_id = candidate.get('subject_id')

            logger.info(f"User {subject_id} recognized successfully")
            return subject_id

        except requests.exceptions.RequestException as e:
            logger.error(e)
            return False

        except Exception as e:
            logger.error(e)
            return False

    def get_encoded_photo(self, image_file_path):
        """
        Encodes an image into base64.
        :param image_file_path: The URL of the image to encode.
        :return: The base64 encoded image.
        """
        with open(image_file_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read())
        return encoded_string
