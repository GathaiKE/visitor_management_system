from django.contrib import admin
from .models import MyUser, Building, Floor, Office, Visitor

admin.site.register(MyUser)
admin.site.register(Building)
admin.site.register(Floor)
admin.site.register(Office)
admin.site.register(Visitor)
