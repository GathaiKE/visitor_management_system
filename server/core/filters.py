import django_filters

from core.models import (
    MyUser,
    Organization,
    OrganizationAdmin,
    Building,
    BuildingAdmin,
    Floor,
    Office,
    Visitor,
    Visit,
    Checkin,
    Face,
    VisitorImage,
    VisitOTP,
    Admin,
    Blacklist,
    Payments
)


class MyUserFilter(django_filters.FilterSet):
    class Meta:
        model = MyUser
        fields = "__all__"


class OrganizationFilter(django_filters.FilterSet):
    class Meta:
        model = Organization
        fields = "__all__"


class OrganizationAdminFilter(django_filters.FilterSet):
    class Meta:
        model = OrganizationAdmin
        fields = "__all__"


class BuildingFilter(django_filters.FilterSet):
    class Meta:
        model = Building
        fields = "__all__"


class BuildingAdminFilter(django_filters.FilterSet):
    class Meta:
        model = BuildingAdmin
        fields = "__all__"


class FloorFilter(django_filters.FilterSet):
    class Meta:
        model = Floor
        fields = "__all__"


class OfficeFilter(django_filters.FilterSet):
    class Meta:
        model = Office
        fields = "__all__"


class VisitorFilter(django_filters.FilterSet):
    class Meta:
        model = Visitor
        fields = [
            "first_name",
            "last_name",
            "id_number",
            "phone_number",
            "rating"
        ]


class VisitFilter(django_filters.FilterSet):
    class Meta:
        model = Visit
        fields = "__all__"


class VisitorImageFilter(django_filters.FilterSet):
    class Meta:
        model = VisitorImage
        fields = "__all__"


class VisitOTPFilter(django_filters.FilterSet):

    class Meta:
        model = VisitOTP
        fields = "__all__"
    

class AdminFilter(django_filters.FilterSet):
    class Meta:
        model = Admin
        fields = "__all__"

class BlacklistFilter(django_filters.FilterSet):
    class Meta:
        model = Blacklist
        fields = "__all__"

class PaymentFilter(django_filters.FilterSet):
    class Meta:
        model = Payments
        fields = "__all__"

