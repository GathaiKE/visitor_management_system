from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from django.conf import settings
from core.models import VisitorImage
from core.utils import helpers as h


class AzureStorage():
    def __init__(self) -> None:
        self.connection_string = settings.AZURE_STORAGE_CONNECTION_STRING
        self.container_name = settings.AZURE_STORAGE_CONTAINER_NAME
        self.visitor_id = None
        self.blob_url = None

    def upload_file_to_azure(self, file_path, blob_name):
        try:
            # Create a BlobServiceClient using the connection string
            blob_service_client = BlobServiceClient.from_connection_string(
                self.connection_string)

            # Create a ContainerClient
            container_client = blob_service_client.get_container_client(
                self.container_name)

            # Upload the file to Azure Blob Storage
            with open(file_path, "rb") as data:
                blob_client = container_client.get_blob_client(blob_name)
                blob_client.upload_blob(data, overwrite=True)

            # Generate a URL for the uploaded blob
            blob_url = blob_client.url

            if blob_url:
                self.blob_url = blob_url
                h.delete_file(file_path=file_path)
                self.save_visitor_image()

            return blob_url
        except Exception as e:
            return str(e)

    def save_visitor_image(self):
        try:
            visitor_image = VisitorImage(
                image_url=self.blob_url, visitor_id=self.visitor_id)
            visitor_image.save()
        except Exception as e:
            print(f"Error while saving the visitor image: {str(e)}")
