from django.conf import settings
import requests
import os
import shutil
import re
import sys
import logging

from django.http import JsonResponse


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout,
)

logger = logging.getLogger(__name__)


def send_sms_message(phone_number, message):
    """
    Sent SMS Messages to a user.
    """
    print("SENDING SMS")
    print(f"PHONE {phone_number}")
    print(f"message {message}")
    
    

    # Include required parameters in the query string
    params = {
        "partnerID": 9356,
        "Shortcode": "CINTELCORE",
        "apikey": "fc205ad07102ad78080bc24f2b6adfe4",
        "mobile": phone_number,
        "message": message,
        "shortcode": "CINTELCORE",
    }   

    try:


        response = requests.post("https://quicksms.advantasms.com/api/services/sendotp/", params=params)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)
        
        # Handle the response, check for success, log errors, etc.
        if response.status_code == 200:
            print("SMS sent successfully")
            # return {"is_successful":True}
            return True
        else:
            print(f"Failed to send SMS. Error: {response.text}")
            return False
        return {"is_resolved":True, "response":response}
        # else:
        #     print(f"Failed to send SMS. Error: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"Error sending SMS: {e}")
        return False
        # return {"is_rejected":True,"error":f"Request Exception: {e}"}
    except Exception as e:
        print(f"Error sending SMS: {e}")
        return False
        return {"is_rejected":True, "error":f"Exception: {e}"}


def deprecated_send_sms_message(phone_number, message):
    """
    Sent SMS Messages to a user.
    """
    print("SENDING SMS")
    print(f"PHONE {phone_number}")
    print(f"message {message}")

    api_key = settings.SMS_GATEWAY_API_KEY
    sender_id = settings.SMS_SENDER_ID

    url = f"https://portal.paylifesms.com/sms/api?action=send-sms&api_key={api_key}&to={phone_number}&from={sender_id}&sms={message}"

    try:
        response = requests.request(method="GET", url=url)
        print(f"SEND SMS RESPONSE: {response.json()}")
        if response.status_code == 200:
            return {"is_successful": True}
        return {"is_resolved": True, "response": response}

    except requests.exceptions.RequestException as e:
        return {"is_rejected": True, "error": f"Request Exception: {e}"}

    except Exception as e:
        return {"is_rejected": True, "error": f"Exception: {e}"}


def create_user_database_folder(name):
    # Define the base directory where you want to create the folder
    base_directory = "user/database"

    # Combine the base directory and the name to create the full path
    folder_path = os.path.join(base_directory, name)

    try:
        # Create the folder if it doesn't exist
        os.makedirs(folder_path)
        print(f"Folder '{folder_path}' created successfully.")
    except OSError as e:
        print(f"Error creating folder '{folder_path}': {str(e)}")


def move_image(source_path, destination_path):
    try:
        # Ensure the destination directory exists
        destination_directory = os.path.dirname(destination_path)
        os.makedirs(destination_directory, exist_ok=True)

        # Move the image file
        shutil.move(source_path, destination_path)
        print(
            f"Image '{source_path}' moved to '{destination_path}' successfully.")
    except OSError as e:
        print(f"Error moving image '{source_path}': {str(e)}")


def delete_file(file_path):
    """
    Delete a file.
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"File '{file_path}' has been deleted successfully.")
        else:
            print(f"File '{file_path}' does not exist.")
    except OSError as e:
        print(f"Error deleting file '{file_path}': {str(e)}")


# get user id from image path
def get_user_id_from_image_path(image_path):
    # Define a regular expression pattern to match the userID (assuming it's a numeric value)
    pattern = r'/(\d+)/'

    # Use re.search to find the match
    match = re.search(pattern, image_path)

    # Check if a match was found
    if match:
        # Extract the userID from the match
        user_id = match.group(1)
        return user_id
    else:
        return None
