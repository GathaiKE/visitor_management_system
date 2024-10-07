from rest_framework import serializers

from core.models import (
    MyUser,
    Building,
    BuildingAdmin,
    Floor,
    Office,
    Visitor,
    Visit,
    Organization,
    OrganizationAdmin,
    Checkin,
    Face,
    VisitorImage, 
    VisitOTP,
    Admin,
    Blacklist,
    Payments
)


# Custom Validators
def validate_phone_number(value):
    if not value.startswith('254') or len(value) != 12:
        raise serializers.ValidationError(
            "Phone number must be in the format 254xxxxxxxxx")


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = "__all__"


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)


class BuildingSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())

    class Meta:
        model = Building
        fields = "__all__"

    def to_representation(self, instance):
        representation =  super().to_representation(instance)
        representation['organization'] = OrganizationSerializer(instance.organization).data
        return representation


class FloorSerializer(serializers.ModelSerializer):
    building = serializers.PrimaryKeyRelatedField(queryset=Building.objects.all())
    class Meta:
        model = Floor
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['building'] = BuildingSerializer(instance.building).data
        return representation


class OfficeSerializer(serializers.ModelSerializer):
    floor = serializers.PrimaryKeyRelatedField(queryset=Floor.objects.all())
    class Meta:
        model = Office
        fields = "__all__"

    def to_representation(self, instance):
        representation =  super().to_representation(instance)
        representation['floor'] = FloorSerializer(instance.floor).data
        return representation


class OrganizationAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationAdmin
        fields = "__all__"


class BuildingAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuildingAdmin
        fields = "__all__"


class VerifyUserOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.IntegerField()


class VerifyVisitorOtpSerializer(serializers.Serializer):
    id_number = serializers.CharField()
    otp = serializers.CharField()


class ResendUserOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResendVisitorOtpSerializer(serializers.Serializer):
    id_number = serializers.CharField()


class VisitorSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(validators=[validate_phone_number])

    class Meta:
        model = Visitor
        fields = "__all__"

    def create(self, validated_data):
        visitor = Visitor.objects.create(**validated_data)
        visitor.generate_otp()
        return visitor


class VisitSerializer(serializers.ModelSerializer):
    visitor = serializers.PrimaryKeyRelatedField(queryset=Visitor.objects.all())
    building = serializers.PrimaryKeyRelatedField(queryset=Building.objects.all())
    floor = serializers.PrimaryKeyRelatedField(queryset=Floor.objects.all())
    office = serializers.PrimaryKeyRelatedField(queryset=Office.objects.all())

    class Meta:
        model = Visit
        fields = "__all__"

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['visitor'] = VisitorSerializer(instance.visitor).data
        rep['building'] = BuildingSerializer(instance.building).data
        rep['floor'] = FloorSerializer(instance.floor).data
        rep['office'] = OfficeSerializer(instance.office).data
        return rep


#  See changes

class CheckinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checkin
        fields = "__all__"


class FaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Face
        fields = "__all__"


class RegisterMyUserSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(validators=[validate_phone_number])

    class Meta:
        model = MyUser
        fields = "__all__"

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = MyUser(**validated_data)
        user.set_password(password)
        user.generate_otp()
        user.save()
        return user


class GetMyUserSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    building = BuildingSerializer(read_only=True)

    class Meta:
        model = MyUser
        fields = "__all__"


class VisitorImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorImage
        fields = "__all__"



class VisitOTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitOTP
        fields = "__all__"
        


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True,trim_whitespace=True)
    new_password = serializers.CharField(required=True,trim_whitespace=True)




class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = "__all__"

class BlacklistSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=Visitor.objects.all())
    class Meta:
        model = Blacklist
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['user'] = VisitorSerializer(instance.user).data
        return representation

class PaymentSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())
    class Meta:
        model = Payments
        fields = '__all_'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['organization'] = OrganizationSerializer(instance.organization).data
        return rep