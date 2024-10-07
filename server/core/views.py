from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework import permissions
from django.contrib.auth import login
from knox.views import LoginView as KnoxLoginView
from core.filters import (
    MyUserFilter,
    OrganizationFilter,
    OrganizationAdminFilter,
    BuildingFilter,
    BuildingAdminFilter,
    FloorFilter,
    OfficeFilter,
    VisitorFilter,
    VisitFilter,
    VisitorImageFilter, VisitOTPFilter
)
from core.serializers import (
    ChangePasswordSerializer,
    OrganizationSerializer,
    OrganizationAdminSerializer,
    BuildingSerializer,
    BuildingAdminSerializer,
    VisitSerializer,
    RegisterMyUserSerializer,
    GetMyUserSerializer,
    VisitorSerializer,
    LoginSerializer,
    VerifyUserOtpSerializer,
    VerifyVisitorOtpSerializer,
    FloorSerializer,
    OfficeSerializer,
    ResendUserOtpSerializer,
    ResendVisitorOtpSerializer,
    CheckinSerializer,
    VisitorImageSerializer, 
    VisitOTPSerializer,
    AdminSerializer,
    BlacklistSerializer,
    PaymentSerializer
)
from core.models import (
    Building,
    Floor,
    Office,
    MyUser,
    Visitor,
    Visit,
    BuildingAdmin,
    Organization,
    OrganizationAdmin,
    VisitorImage,
    Face, 
    VisitOTP,
    Admin,
    Blacklist,
    Payments
)


from rest_framework.decorators import api_view, authentication_classes
from rest_framework.authentication import BasicAuthentication
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import APIException
from knox.auth import TokenAuthentication
from django.shortcuts import get_object_or_404, get_list_or_404
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.middleware.csrf import get_token
from django.conf import settings
from core.utils.kairos import Kairos
from core.utils.azure import AzureStorage
from core.utils.s3 import SimpleStorage
import core.utils.helpers as h
import core.utils.aws_rekog as ams_ar
import multiprocessing


import random
import datetime
from django.utils import timezone
from django.db import transaction

# Password reset imports
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse

def update_password(request):
    if request.method == 'POST':
        user_id = request.POST.get('id')
        new_password = request.POST.get('new_password')

        try:
            user = User.objects.get(id=user_id)
            user.password = make_password(new_password)
            user.save()
            return JsonResponse({'message': 'Password updated successfully.'})
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found.'})
    else:
        return JsonResponse({'error': 'Invalid request method.'})
    
    
#End of Update password view


class LoginView(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = AuthTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return super(LoginView, self).post(request, format=None)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def verify_user_otp(request):
    if request.method == 'POST':
        serializer = VerifyUserOtpSerializer(data=request.data)

        if serializer.is_valid():
            request_otp = serializer.validated_data.get('otp')
            email = serializer.validated_data.get('email')
            user = get_object_or_404(MyUser, email=email)

            if user.otp == request_otp and not user.has_otp_expired():
                user.mark_phone_as_verified()
                return Response({'detail': 'OTP verified and phone number marked as verified.'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Invalid OTP or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({"detail": "invalid request method"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def resend_user_otp(request):
    if request.method == 'POST':
        serializer = ResendUserOtpSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            user = get_object_or_404(MyUser, email=email)

            bg_send_sms_message = multiprocessing.Process(
                target=h.send_sms_message,
                kwargs={
                    "phone_number": user.phone_number,
                    "message": f"{user.otp} is your code. Please do not share it with anyone."
                }
            )
            bg_send_sms_message.start()
            return Response({"detail": "OTP resent successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({"detail": "invalid request method"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def generate_user_otp(request):
    if request.method == 'POST':
        serializer = ResendUserOtpSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            user = get_object_or_404(MyUser, email=email)
            otp = user.generate_otp()

            bg_send_sms_message = multiprocessing.Process(
                target=h.send_sms_message,
                kwargs={
                    "phone_number": user.phone_number,
                    "message": f"{otp} is your code. Please do not share it with anyone."
                }
            )
            # bg_send_sms_message.start() // stops sending OTP to user created

            return Response({"detail": "OTP generated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({"detail": "invalid request method"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def verify_visitor_otp(request):
    if request.method == 'POST':
        serializer = VerifyVisitorOtpSerializer(data=request.data)

        if serializer.is_valid():
            request_otp = serializer.validated_data.get('otp')
            id_number = serializer.validated_data.get('id_number')
            visitor = get_object_or_404(Visitor, id_number=id_number)

            if visitor.otp == request_otp and not visitor.has_otp_expired():
                visitor.mark_phone_as_verified()
                visitor.mark_as_checked_in()
                return Response({'detail': 'OTP verified and phone number marked as verified.'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Invalid OTP or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({"detail": "invalid request method"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def resend_visitor_otp(request):
    if request.method == 'POST':
        serializer = ResendVisitorOtpSerializer(data=request.data)

        if serializer.is_valid():
            id_number = serializer.validated_data.get('id_number')
            visitor = get_object_or_404(Visitor, id_number=id_number)
            otp = visitor.generate_otp()

            bg_send_sms_message = multiprocessing.Process(
                target=h.send_sms_message,                
                kwargs={
                    "phone_number": visitor.phone_number,
                    "message": f"{otp} is your code. Please do not share it with anyone."
                }
            )
            bg_send_sms_message.start()

            return Response({"detail": "OTP resent successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({"detail": "invalid request method"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def generate_visitor_otp(request):
    if request.method == 'POST':
        serializer = ResendVisitorOtpSerializer(data=request.data)

        if serializer.is_valid():
            id_number = serializer.validated_data.get('id_number')
            visitor = get_object_or_404(Visitor, id_number=id_number)
            otp = visitor.generate_otp()
            message = f"{otp} is your code. Please do not share it with anyone."

            bg_send_sms_message = multiprocessing.Process(
                target=h.send_sms_message,
                kwargs={
                    "phone_number": visitor.phone_number,
                    "message": message
                }
            )
            bg_send_sms_message.start()

            return Response({"detail": "OTP generated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({"detail": "invalid request method"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'POST'])
def user_list(request):
    """
    List all users, or create a new user.
    """
    if request.method == 'GET':
        queryset = MyUser.objects.all()
        filtered_queryset = MyUserFilter(request.GET, queryset=queryset).qs
        serializer = GetMyUserSerializer(filtered_queryset, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = RegisterMyUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            serializer = GetMyUserSerializer(user)

            
            bg_send_sms_message = multiprocessing.Process(  
                target=h.send_sms_message,
                kwargs={
                    "phone_number": user.phone_number,
                    "message": f"{user.otp} is your one time password. Please do not share with anyone."
                }       
            )
            # bg_send_sms_message.start() // stops sending OTP to user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_detail(request, pk):
    """
    Retrieve, update or delete a user.
    """
    try:
        user = MyUser.objects.get(pk=pk)
    except MyUser.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = GetMyUserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = GetMyUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
# @authentication_classes([BasicAuthentication, TokenAuthentication])
# @permission_classes()
@permission_classes([IsAuthenticated])
def organization_list(request):
    """
    List all organizations, or create a new organization.
    """
    if request.method == 'GET':
        organizations = Organization.objects.all()
        filtered_queryset = OrganizationFilter(
            request.GET, queryset=organizations).qs
        serializer = OrganizationSerializer(filtered_queryset, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = OrganizationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            print(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def organization_detail(request, pk):
    """
    Retrieve, update or delete an organization.
    """

    try:
        organization = Organization.objects.get(pk=pk)
    except Organization.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OrganizationSerializer(organization)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = OrganizationSerializer(
            organization, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        organization.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def organization_admin_list(request):
    """
    List all organization admins, or create a new organization admin.
    """
    if request.method == 'GET':
        organization_admins = OrganizationAdmin.objects.all()
        filtered_queryset = OrganizationAdminFilter(
            request.GET, queryset=organization_admins).qs
        serializer = OrganizationAdminSerializer(filtered_queryset, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = OrganizationAdminSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def organization_admin_detail(request, pk):
    """
    Retrieve, update or delete an organization admin.
    """

    try:
        organization_admin = OrganizationAdmin.objects.get(pk=pk)
    except OrganizationAdmin.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OrganizationAdminSerializer(organization_admin)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = OrganizationAdminSerializer(
            organization_admin, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        organization_admin.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def building_list(request):
    """
    List all buildings, or create a new building.
    """
    if request.method == 'GET':
        buildings = Building.objects.all()
        filtered_queryset = BuildingFilter(request.GET, queryset=buildings).qs
        serializer = BuildingSerializer(filtered_queryset, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = BuildingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def building_detail(request, pk):
    """
    Retrieve, update or delete a building.
    """
    try:
        building = Building.objects.get(pk=pk)
    except Building.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = BuildingSerializer(building)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = BuildingSerializer(
            building, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        building.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def building_admin_list(request):
    """
    List all building admins, or create a new building admin.
    """
    if request.method == 'GET':
        building_admins = BuildingAdmin.objects.all()
        filtered_queryset = BuildingAdminFilter(
            request.GET, queryset=building_admins).qs
        serializer = BuildingAdminSerializer(filtered_queryset, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = BuildingAdminSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def building_admin_detail(request, pk):
    """
    Retrieve, update or delete a building admin.
    """
    try:
        building_admin = BuildingAdmin.objects.get(pk=pk)
    except BuildingAdmin.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = BuildingAdminSerializer(building_admin)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = BuildingAdminSerializer(
            building_admin, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        building_admin.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def floor_list(request):
    """
    List all floors, or create a new floor.
    """
    if request.method == 'GET':
        floors = Floor.objects.all()
        filtered_queryset = FloorFilter(request.GET, queryset=floors).qs
        serializer = FloorSerializer(filtered_queryset, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = FloorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def floor_detail(request, pk):
    """
    Retrieve, update or delete a floor.
    """
    try:
        floor = Floor.objects.get(pk=pk)
    except Floor.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FloorSerializer(floor)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = FloorSerializer(floor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        floor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def office_list(request):
    """
    List all offices, or create a new office.
    """
    if request.method == 'GET':
        office = Office.objects.all()
        filtered_queryset = OfficeFilter(request.GET, queryset=office).qs
        serializer = OfficeSerializer(filtered_queryset, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = OfficeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def office_detail(request, pk):
    """
    Retrieve, update or delete an office.
    """
    try:
        office = Office.objects.get(pk=pk)
    except Office.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OfficeSerializer(office)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = OfficeSerializer(office, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        office.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def visit_list(request, org_id=None):
    if request.method == 'GET':
        current_date = timezone.localtime(timezone.now()).date()
        if org_id:
            try:
                organization = Organization.objects.get(pk=org_id)
                visits = Visit.objects.filter(organization=organization, checkin_time__date=current_date)
            except Organization.DoesNotExist:
                return Response({"error":"Organization does not exist"}, status=status.HTTP_404_NOT_FOUND)
        else:
            visits = Visit.objects.filter(checkin_time__date=current_date)
        filtered_queryset = VisitFilter(request.GET, queryset=visits).qs
        sorted_queryset = filtered_queryset.order_by('-created_at')
        serializer = VisitSerializer(sorted_queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        serializer = VisitSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def visit_detail(request, pk):
    """
    Retrieve, update or delete a visit.
    """
    try:
        visit = Visit.objects.get(pk=pk)
    except Visit.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = VisitSerializer(visit)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = VisitSerializer(visit, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        visit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def visitor_image_list(request):
    """
    List all visitor images.
    """
    if request.method == 'GET':
        try:
            visitor_images = VisitorImage.objects.all()
            filtered_visitor_images = VisitorImageFilter(
                request.GET, queryset=visitor_images).qs
            serializer = VisitorImageSerializer(
                filtered_visitor_images, many=True)
            return Response(serializer.data)
        except VisitorImage.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def visitor_list(request):
    """
    List all visitors, or create a new visitor.
    """
    if request.method == 'GET':
        visitor = Visitor.objects.all()
        filtered_queryset = VisitorFilter(request.GET, queryset=visitor).qs
        serializer = VisitorSerializer(filtered_queryset, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = VisitorSerializer(data=request.data)
        if serializer.is_valid():
            visitor = serializer.save()
            message = f"{visitor.otp} is your one time password. Please do not share with anyone."
            
            visitor_id = serializer.data.get('id')
            print("------------------------")
            print(visitor_id)
            print("------------------------")
            result = ams_ar.create_user(collection_id=settings.AWS_REKOG_COLLECTION_ID,
                                        user_id=str(visitor))
         
            print(f"Created user results: {result}")

            bg_send_sms_message = multiprocessing.Process(
                target=h.send_sms_message,
                kwargs={
                    "phone_number": visitor.phone_number,
                    "message": message})
            bg_send_sms_message.start()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def visitor_detail(request, pk):
    try:
        visitor = Visitor.objects.get(pk=pk)
    except Visitor.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = VisitorSerializer(visitor)
        return Response(serializer.data)

    # enroll user
    elif request.method == 'PUT':
        serializer = VisitorSerializer(
            visitor, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        visitor = serializer.save()

        # get image
        image_name = serializer.data.get("image")
        image_path = f"{settings.BASE_DIR}{image_name}"
        modfied_image_name = image_name.replace('/core/uploads/', '')

        #index face
        indexing_results = ams_ar.index_face(image_file_name=image_path,image_name=modfied_image_name)
        print(f"Index face result: {indexing_results}")
        if not indexing_results:
            return Response({"detail":"failed to index face"},
                            status=status.HTTP_400_BAD_REQUEST)
        
        # associate userid with faceid in the collection
        my_imageface_id = indexing_results.get('face_id')
        print(f"FACE ID: {my_imageface_id}")
        # face_id = face_indexing.get('face_id')
        #     print(f"face id: {face_id}")
        face = Face()
        face.face_id = my_imageface_id
        face.visitor_id = pk
        face.save()

        face_ids = []
        face_ids.append(my_imageface_id)
        print(f"Face ids: {face_ids}")
        respons = ams_ar.associate_faces(
            collection_id=settings.AWS_REKOG_COLLECTION_ID,
            user_id=str(pk),
            face_ids=face_ids
        )
        print(f"Associate faces response: {respons}")
        
        # setup bg delete job
        bg_delete_image = multiprocessing.Process(
            target=h.delete_file, args=(image_path,)) 
        if not respons:
            bg_delete_image.start()
            return Response(
                {"detail": "visitor not enrolled"},
                status=status.HTTP_400_BAD_REQUEST)
        
        
        
        object_name = f"users/{visitor.id}/{modfied_image_name}"
        simple_storage = SimpleStorage()
        simple_storage.visitor_id = pk
        bg_upload_to_s3 = multiprocessing.Process(
            target=simple_storage.upload_file,
            args=(image_path, object_name,))

        bg_upload_to_s3.start()
        
        return Response(serializer.data)
    elif request.method == 'DELETE':
        visitor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET','POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def nonfacial_checkin(request):
    if request.method == 'GET':
        visitotp = VisitOTP.objects.all()
        filtered_queryset = VisitOTPFilter(request.GET, queryset=visitotp).qs
        serializer = VisitOTPSerializer(filtered_queryset, many=True)
        return Response(serializer.data,  status=status.HTTP_200_OK)
    
    if request.method == 'POST':
        serializer = VisitOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # generate otp
        new_visit_otp = str(random.randint(1000,9999))
        visit_opt_expiry_time = timezone.now() + datetime.timedelta(minutes=15)

        # get phone number and idnumber from request
        visit_id_number = request.data.get("id_number")
        visit_phone_number = request.data.get("phone_number")
        
        # send otp to phone number
        message = f"Use this as the Visit OTP: {new_visit_otp}."
        bg_send_sms_message = multiprocessing.Process(target=h.send_sms_message,
                                        kwargs={
                                            "phone_number":visit_phone_number,
                                            "message":message
                                        })
        bg_send_sms_message.start()
    
        # print(f"checking flow results: {checkin_flow}")

        try:
            with transaction.atomic():
                VisitOTP.objects.create(id_number=visit_id_number,
                                phone_number=visit_phone_number,
                                otp=new_visit_otp,
                                otp_expiry=visit_opt_expiry_time
                                )
     
            # update visitors table
            visitor = get_object_or_404(Visitor,id_number=visit_id_number)
            serializer = VisitorSerializer(visitor)
            if visitor.is_checked_in:
                return Response({'detail':'visitor already checked in'}, status=status.HTTP_400_BAD_REQUEST)

            visitor.mark_as_checked_in()
            serializer = VisitorSerializer(visitor)
            # return Response(serializer.data)

        except APIException as e:
            return Response({"error occured within VISITOTP table":str(e)}, status=e.status_code)
    
        return Response(serializer.data, status=status.HTTP_201_CREATED)



@api_view(['POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def nonfacial_checkout(request):
    if request.method == 'POST':
    # get otp from requests
        serializer = VisitOTPSerializer(data=request.data)
    
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        visitor_phone = request.data.get("phone_number")
        visitor_otp = request.data.get("otp")
        visitor_id_number = request.data.get("id_number")
        get_object_or_404(VisitOTP, phone_number=visitor_phone, otp=visitor_otp)

        # update visitors table
        visitor = get_object_or_404(Visitor,id_number=visitor_id_number)
        if not visitor.is_checked_in:
            return Response({'detaill':"visitor already checked out"}, status=status.HTTP_400_BAD_REQUEST)
                
        visitor.mark_as_checked_out()
        serializer = VisitorSerializer(visitor)
        return Response(serializer.data, status=status.HTTP_200_OK)





@api_view(['POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def checkin(request):
    serializer = CheckinSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer.save()
    image_name = serializer.data['image']    
    base_dir = settings.BASE_DIR
    image_path = f"{base_dir}{image_name}"
    modfied_image_name = image_name.replace('/core/uploads/', '')  
      
    bg_delete_checkin_image = multiprocessing.Process(
    target=h.delete_file, args=(image_path,))

    # detect face in image
    faced = ams_ar.detect_face(image_file_name=image_path,image_name=modfied_image_name)
    if not faced:
        return Response(faced)

    id_face = ams_ar.search_face(image_file_name=image_path,image_name=modfied_image_name)
    if not id_face:
        return Response(
            {"detail":"face matching face id not found"},
                    status=status.HTTP_404_NOT_FOUND
        )
    print(f"FACE ID: {id_face}")
    search_results = ams_ar.search_users_by_face_id(
        collection_id=settings.AWS_REKOG_COLLECTION_ID,face_id=id_face
    )    
    if search_results is None:
        return Response({"detail":"user not found"},
                    status=status.HTTP_404_NOT_FOUND)
    user_matches = search_results.get('UserMatches')
    if not len(user_matches):
                return Response(
                    {"detail":"user not found"},
                    status=status.HTTP_404_NOT_FOUND)
    
    print("-"*100)
    visitor_id = user_matches[0]['User']['UserId']
    print(f"Visitor id: {visitor_id}")
    try:
        visitor = Visitor.objects.get(pk=visitor_id)
        serializer = VisitorSerializer(visitor)
        if visitor.is_checked_in:
            bg_delete_checkin_image.start()
            return Response(
                {"detail": "Visitor already checked in"},
                status=status.HTTP_400_BAD_REQUEST)
        
        visitor.mark_as_checked_in()
        serializer = VisitorSerializer(visitor)
        bg_delete_checkin_image.start()
        return Response(serializer.data)
    except Visitor.DoesNotExist:
        bg_delete_checkin_image.start()
        return Response(
            {"detail": "Visitor not found"},
            status=status.HTTP_404_NOT_FOUND)
    
    #return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def checkout(request):
    serializer = CheckinSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer.save()

    image_name = serializer.data['image']
    base_dir = settings.BASE_DIR
    image_path = f"{base_dir}{image_name}"
    modfied_image_name = image_name.replace('/core/uploads/', '')   


    bg_delete_checkin_image = multiprocessing.Process(
        target=h.delete_file, args=(image_path,))

    #id = kairos.recognize(image_file_path=image_path)
    # detect face in image
    faced = ams_ar.detect_face(image_file_name=image_path,image_name=modfied_image_name)
    if not faced:
        return Response(faced)

    # get user id from captured face
    id=ams_ar.detect_user_by_face(image_file_name=image_path,image_name=modfied_image_name)
    if not id:
        bg_delete_checkin_image.start()
        return Response({"detail": "No matching user found"},
                        status=status.HTTP_404_NOT_FOUND)

    try:
        visitor = Visitor.objects.get(pk=id)

        if not visitor.is_checked_in:
            bg_delete_checkin_image.start()
            return Response(
                {"detail": "Visitor already checked in"},
                status=status.HTTP_400_BAD_REQUEST)

        visitor.mark_as_checked_out()
        serializer = VisitorSerializer(visitor)
        bg_delete_checkin_image.start()
        return Response(serializer.data)

    except Visitor.DoesNotExist:
        bg_delete_checkin_image.start()
        return Response(
            {"detail": "Visitor not found"},
            status=status.HTTP_404_NOT_FOUND)
    



@api_view(['POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request, pk):

    try:
        user = MyUser.objects.get(pk=pk)
    except MyUser.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


    if request.method == 'POST':
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if user.check_password(serializer.data.get('old_password')):
                user.set_password(serializer.data.get('new_password'))
                user.save()
                update_session_auth_hash(request,user)
                return Response({"message":"Password changed successfully"}, status=status.HTTP_200_OK)
            return Response({"error":"Incorrect 'old_password'"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

      
      
@api_view(['POST, GET'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes(IsAuthenticated)
def admin_list_create_view(request):
    if request.method == 'POST':
        serializer = AdminSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == "GET":
        admins = Admin.objects.all()
        serializer = AdminSerializer(admins, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

@api_view(['PUT, GET', 'DELETE'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes(IsAuthenticated)
def admin_detail_view(request, pk):
    instance = get_object_or_404(Admin, pk=pk)

    if request.method == 'GET':
        serializer = AdminSerializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = AdminSerializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

@api_view(['POST', 'GET'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def blacklist_list_create_view(request):
    if request.method == 'POST':
        serializer = BlacklistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'GET':
        data = Blacklist.objects.all()
        serializer = BlacklistSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

@api_view(['PUT', 'DELETE', 'GET'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def blacklist_detail_view(request, pk):
    instance = get_object_or_404(Blacklist, pk=pk)

    if request.method == 'GET':
        serializer = BlacklistSerializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == 'PUT':
        serializer = BlacklistSerializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'DELETE':
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@api_view(['GET', 'POST'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def payment_list_create_view(request):
    if request.method == "POST":
        serializer = PaymentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if request.method == "GET":
        data = Payments.objects.all()
        serializer = PaymentSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
@api_view(['PUT', 'GET', 'DELETE'])
@authentication_classes([BasicAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def payment_detail_view(request, pk):
    instance = get_object_or_404(Payments, pk=pk)

    if request.method == 'PUT':
        serializer = PaymentSerializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    if request.method == 'GET':
        serializer = PaymentSerializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if request.method == 'DELETE':
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
