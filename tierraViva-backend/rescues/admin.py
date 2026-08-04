import csv
from django.contrib import admin
from django.http import HttpResponse
from .models import RescueRequest, RescuerContact

@admin.action(description="Exportar seleccionados como CSV")
def export_as_csv(modeladmin, request, queryset):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="rescues_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Usuario', 'Email', 'Teléfono', 'Animal', 'Especie (Otro)', 
        'Dirección', 'Latitud', 'Longitud', 'Estado', 'Descripción', 'Fecha'
    ])
    
    for obj in queryset:
        writer.writerow([
            obj.id,
            obj.user.username if obj.user else 'Guest',
            obj.email,
            obj.phone,
            obj.get_animal_type_display(),
            obj.other_species,
            obj.address,
            obj.latitude,
            obj.longitude,
            obj.get_status_display(),
            obj.description,
            obj.created_at.strftime("%Y-%m-%d %H:%M")
        ])
    
    return response

@admin.register(RescueRequest)
class RescueRequestAdmin(admin.ModelAdmin):
    list_display = ('animal_type', 'status', 'address', 'phone', 'email', 'created_at')
    list_filter = ('status', 'animal_type', 'created_at')
    search_fields = ('address', 'description', 'phone', 'email', 'other_species')
    readonly_fields = ('created_at', 'updated_at', 'latitude', 'longitude')
    actions = [export_as_csv]
    
    fieldsets = (
        ('Información de la Solicitud', {
            'fields': (
                'user', 'status', 'animal_type', 'other_species', 'description', 'photo'
            )
        }),
        ('Ubicación y Contacto', {
            'fields': (
                'address', 'email', 'phone', 'latitude', 'longitude'
            )
        }),
        ('Fechas', {
            'fields': (
                'created_at', 'updated_at'
            )
        }),
    )

@admin.register(RescuerContact)
class RescuerContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'email')
