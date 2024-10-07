from django.db import models, transaction
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.validators import RegexValidator, MinValueValidator, MinLengthValidator, MaxLengthValidator
from django.contrib.auth.hashers import make_password
import datetime
import random
import uuid



class Organization(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    organization_name = models.CharField(max_length=255)
    organization_number = models.CharField(max_length=8, unique=True, null=True)
    address = models.CharField(max_length=255, null=True)
    email = models.EmailField(max_length=255, unique=True, null=True)
    status = models.BooleanField(null=False,default=False)
    phone_number = models.CharField(max_length=12, null=True, validators=[RegexValidator(regex=r'^\d{10,12}$', message='Phone number is incomplete')] )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(auto_now=True, null=True)

        
    class Meta:
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['organization_number'])
        ]
        ordering = ["-created_at"]
        


class Building(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    building_name = models.CharField(max_length=255)
    location = models.CharField(null=True, max_length=255)
    floors = models.IntegerField(null=False, default=1, validators=[MinValueValidator(1)])
    status = models.BooleanField(null=False, default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        with transaction.atomic():
            for floor_number in range(self.floors):
                Floor.objects.create(building=self, floor_number = floor_number)


class Floor(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    floor_number = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        ordering = ["-created_at"]


class Office(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE)
    office_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        ordering = ["-created_at"]

class Admin(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    first_name = models.CharField(max_length=255, null=False)
    middle_name = models.CharField(max_length=255, null=True)
    last_name = models.CharField(max_length=255, null=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE, null=True)
    is_building_admin = models.BooleanField(null=False, default=False)
    is_organization_admin = models.BooleanField(null=False, default=False)
    is_super_admin = models.BooleanField(null=False, default=False)
    is_assistant_super_admin = models.BooleanField(null=False, default=False)
    phone_number = models.CharField(max_length=12, null=False, validators=[RegexValidator(regex=r'^\d{10,12}$', message='Phone number is incomplete')])
    email = models.EmailField(unique=True, null=False)
    id_number = models.CharField(unique=True, null=False, validators=[MinLengthValidator(7), MaxLengthValidator(8)])
    active = models.BooleanField(null=False, default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    deleted_at = models.DateTimeField(auto_now=True, null=True)
    password = models.CharField(null=False, max_length=120)

    class Meta:
        ordering = ["-created_at"]


    def save(self, *args, **kwargs):
        if not self.pk:
            self.password = make_password(self.password)
        super(Admin, self).save(*args, **kwargs)

    


class OrganizationAdmin(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    user_id = models.CharField(max_length=255)
    organization_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        ordering = ["-created_at"]


class BuildingAdmin(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    user_id = models.CharField(max_length=255)
    building_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        ordering = ["-created_at"]


class Visitor(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    id_number = models.CharField(max_length=20, unique=True)
    phone_number = models.CharField(max_length=15)
    otp = models.CharField(max_length=6, null=True)
    otp_expiry = models.DateTimeField(null=True)
    is_phone_verified = models.BooleanField(default=False)
    is_checked_in = models.BooleanField(default=False)
    image_url = models.CharField(max_length=255, null=True)
    rating = models.CharField(max_length=255, null=True)
    blacklisted = models.BooleanField(default=False, null=False)
    image = models.FileField(upload_to="core/uploads/", null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.first_name

    def has_otp_expired(self):
        return self.otp_expiry <= timezone.now()

    def mark_phone_as_verified(self):
        self.is_phone_verified = True
        self.save()

    def mark_as_checked_in(self):
        self.is_checked_in = True
        self.save()

    def mark_as_checked_out(self):
        self.is_checked_in = False
        self.save()

    def generate_otp(self):
        # self.otp = str(random.randint(100000, 999999))
        self.otp = str(random.randint(1000, 9999))
        self.otp_expiry = timezone.now() + datetime.timedelta(minutes=15)
        self.save()
        return self.otp


class Visit(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    visitor= models.ForeignKey(Visitor, on_delete=models.CASCADE)
    building= models.ForeignKey(Building, on_delete=models.CASCADE)
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE)
    office = models.ForeignKey(Office, on_delete=models.CASCADE)
    ## added reasons column
    reasons = models.CharField(max_length=255, default="Official")

    # otp = models.CharField(max_length=6, null=True)
    # otp_expiry = models.DateTimeField(null=True)

    checkin_time = models.DateTimeField(auto_now_add=True)
    checkout_time = models.DateTimeField(null=True)
    is_checked_in = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        ordering = ["-created_at"]



class VisitOTP(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    id_number = models.CharField(max_length=20, unique=False, null=False)
    phone_number = models.CharField(max_length=15, null=False)
    otp = models.CharField(max_length=6, blank=True)
    otp_expiry = models.DateTimeField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        ordering = ["-created_at"]


class Checkin(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    image = models.FileField(upload_to="core/uploads/")

    def create(self, validated_data):
        return Checkin.objects.create(**validated_data)


class Face(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    face_id = models.CharField(max_length=255)
    visitor_id = models.CharField(max_length=255)


class MyUser(AbstractUser):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    is_admin = models.BooleanField(default=False)
    is_visitor = models.BooleanField(default=False)
    is_checked_in = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, null=True)
    otp_expiry = models.DateTimeField(null=True)
    phone_number = models.CharField(max_length=13)
    organization = models.ForeignKey(
        Organization, null=True, on_delete=models.DO_NOTHING)
    building = models.ForeignKey(
        Building, null=True, on_delete=models.DO_NOTHING)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        ordering = ["-created_at"]


    def has_otp_expired(self):
        return self.otp_expiry <= timezone.now()

    def mark_phone_as_verified(self):
        self.is_phone_verified = True
        self.save()

    def generate_otp(self):
        # self.otp = str(random.randint(100000, 999999))
        self.otp = str(random.randint(1000, 9999))
        self.otp_expiry = timezone.now() + datetime.timedelta(minutes=15)
        self.save()
        return self.otp


class VisitorImage(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    image_url = models.CharField(max_length=255)
    visitor_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    deleted_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ["-created_at"]


class Blacklist(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    user = models.ForeignKey(Visitor, on_delete=models.CASCADE, null=False)
    reason = models.TextField(null=False, validators=[MinLengthValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    deleted_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ["-created_at"]

class Payments(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    transaction_number = models.CharField(null=True)
    receipt_number = models.CharField(max_length=255, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    payment_method = models.CharField(max_length=255)
    client_name = models.CharField(null=True, max_length=255)
    client_email = models.EmailField(null=True)
    organization = models.ForeignKey(Organization, null=False, on_delete=models.PROTECT)
    organization_name = models.CharField(null=True, max_length=255)
    organization_email = models.EmailField(null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=False)


# Email templates to come up with.
# ---------------------------------
# Change password
# Reset password
# Book demo
# Communicationemail template.
# Receipt
