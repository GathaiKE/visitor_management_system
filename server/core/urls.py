from django.urls import include, path
from django.contrib import admin
from core import views
from .views import update_password

urlpatterns = [
    path('verify-user-otp/', views.verify_user_otp, name="verify_user_otp"),
    path('resend-user-otp/', views.resend_user_otp, name="resend_user_otp"),
    path('generate-user-otp/', views.generate_user_otp, name="generate_user_otp"),
    path('verify-visitor-otp/', views.verify_visitor_otp, name="verify_visitor_otp"),
    path('resend-visitor-otp/', views.resend_visitor_otp, name="resend_visitor_otp"),
    path('generate-visitor-otp/', views.generate_visitor_otp, name="generate_visitor_otp"),

    path("user/", views.user_list, name="user_list"),
    path("user/<str:pk>/", views.user_detail, name="user_detail"),

    path("change-password/<str:pk>/", views.change_password, name="change_password"),
    
    path("organization/", views.organization_list, name="organization_list"),
    path("organization/<str:pk>/", views.organization_detail, name="organization_detail"),

    path("organization-admin/", views.organization_admin_list, name="organization_admin_list"),
    path("organization-admin/<str:pk>/", views.organization_admin_detail, name="organization_admin_detail"),

    path("building/", views.building_list, name="building_list"),
    path("building/<str:pk>/", views.building_detail, name="building_detail"),

    path("building-admin/", views.building_admin_list, name="building_admin_list"),
    path("building-admin/<int:pk>/", views.building_admin_detail, name="building_admin_detail"),

    path("floor/", views.floor_list, name="floor_list"),
    path("floor/<str:pk>/", views.floor_detail, name="floor_detail"),

    path("office/", views.office_list, name="office_list"),
    path("office/<str:pk>/", views.office_detail, name="office_detail"),

    path("visitor/", views.visitor_list, name="visitor_list"),
    path("visitor/<str:pk>/", views.visitor_detail, name="visitor_detail"),

    path("visit/", views.visit_list, name="visit_list"),
    path("visit/<str:pk>/", views.visit_detail, name="visit_detail"),

    path("visitor-images/", views.visitor_image_list, name="visitor_image_list"),

    path("checkin/", views.checkin, name="checkin"),
    path("checkout/", views.checkout, name="checkout"),

    path('update-password/', update_password, name='update_password'),

    path('checkin-nonfacial/', views.nonfacial_checkin, name='nonfacial_checkin'),
    path('checkout-nonfacial/', views.nonfacial_checkout, name='nonfacial_checkout'),

    path('api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),

    path('admins/', views.admin_list_create_view, name='admin_list_create'),
    path('admins/<uuid:pk>/', views.admin_detail_view, name='admin_detail'),

    path('blacklist/', views.blacklist_list_create_view, name='blacklist_list_create'),
    path('blacklist/<uuid:pk>/', views.blacklist_detail_view, name='blacklist_detail'),

    path('payment/', views.payment_list_create_view, name='payment_list_create'),
    path('payment/<uuid:pk>/', views.payment_detail_view, name='payment_detail'),
]