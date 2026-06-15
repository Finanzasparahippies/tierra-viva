from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Sum, Avg, Count, F
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import connection

# Sibling App Imports
from sponsorship.models import Sponsorship, SponsorshipTier
from shop.models import Order, Product
from activities.models import Booking, Activity
from rescues.models import RescueRequest
from animals.models import Animal

# Safe import for psutil
try:
    import psutil
except ImportError:
    psutil = None

User = get_user_model()

class AnalyticsOverview(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            # 1. Date range for charts (Last 30 days)
            end_date = timezone.now()
            start_date = end_date - timedelta(days=29)
            
            # 2. Financial Metrics - Sponsorships
            sponsorship_sales = Sponsorship.objects.filter(active=True).aggregate(Sum('amount'))['amount__sum'] or 0
            sponsorship_sales = float(sponsorship_sales)
            total_active_sponsorships = Sponsorship.objects.filter(active=True).count()
            
            # 3. Financial Metrics - Shop / Merch
            paid_orders = Order.objects.filter(paid=True)
            total_orders_count = paid_orders.count()
            shop_sales = paid_orders.aggregate(total=Sum(F('items__price') * F('items__quantity')))['total'] or 0
            shop_sales = float(shop_sales)
            
            # 4. Financial Metrics - Activities / Camps
            paid_bookings = Booking.objects.filter(status='PAID')
            total_bookings_count = paid_bookings.count()
            activities_sales = paid_bookings.aggregate(Sum('total_price'))['total_price__sum'] or 0
            activities_sales = float(activities_sales)
            
            # Gross Sales combined
            gross_sales = sponsorship_sales + shop_sales + activities_sales

            # 5. Inventory & Resources Alerts
            low_stock_products = Product.objects.filter(stock__lt=5).count()
            total_products_count = Product.objects.count()
            total_animals = Animal.objects.count()
            
            # 6. Rescue Metrics
            total_rescues = RescueRequest.objects.count()
            pending_rescues = RescueRequest.objects.filter(status='PENDING').count()
            resolved_rescues = RescueRequest.objects.filter(status='RESOLVED').count()

            # 7. Chart Data (Daily ticket/booking sales, shop sales, and sponsorships for the last 30 days)
            daily_stats = []
            for i in range(30):
                current_date = start_date + timedelta(days=i)
                date_str = current_date.strftime('%d %b')
                
                # Activity booking sales on this date
                a_sales = Booking.objects.filter(
                    status='PAID',
                    created_at__date=current_date.date()
                ).aggregate(Sum('total_price'))['total_price__sum'] or 0
                a_sales = float(a_sales)
                
                # Shop sales on this date
                s_sales = Order.objects.filter(
                    paid=True,
                    created_at__date=current_date.date()
                ).aggregate(total=Sum(F('items__price') * F('items__quantity')))['total'] or 0
                s_sales = float(s_sales)
                
                # Sponsorship contributions on this date
                sp_sales = Sponsorship.objects.filter(
                    start_date__date=current_date.date()
                ).aggregate(Sum('amount'))['amount__sum'] or 0
                sp_sales = float(sp_sales)
                
                daily_stats.append({
                    'date': date_str,
                    'activities': round(a_sales, 2),
                    'shop': round(s_sales, 2),
                    'sponsorships': round(sp_sales, 2),
                    'total': round(a_sales + s_sales + sp_sales, 2)
                })

            metrics = {
                'financials': {
                    'gross_sales': round(gross_sales, 2),
                    'sponsorship_sales': round(sponsorship_sales, 2),
                    'shop_sales': round(shop_sales, 2),
                    'activities_sales': round(activities_sales, 2),
                },
                'sponsorships': {
                    'active_count': total_active_sponsorships,
                },
                'shop': {
                    'total_orders': total_orders_count,
                    'low_stock_count': low_stock_products,
                    'total_products': total_products_count,
                },
                'activities': {
                    'total_bookings': total_bookings_count,
                },
                'rescues': {
                    'total': total_rescues,
                    'pending': pending_rescues,
                    'resolved': resolved_rescues,
                },
                'ranch': {
                    'total_animals': total_animals,
                },
                'charts': {
                    'daily_sales': daily_stats
                },
                'status': 'success'
            }
            return Response(metrics)
        except Exception as e:
            return Response({'error': str(e), 'status': 'error'}, status=500)


class SystemMetricsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Database Connection Check
        db_status = "Desconectado"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                row = cursor.fetchone()
                if row:
                    db_status = "Conectado"
        except Exception:
            db_status = "Error"

        # Check if psutil is available
        if psutil:
            try:
                # CPU Metrics
                cpu_percent = psutil.cpu_percent(interval=0.1)
                cpu_count = psutil.cpu_count(logical=True)

                # Memory Metrics
                mem = psutil.virtual_memory()
                mem_total_gb = mem.total / (1024 ** 3)
                mem_used_gb = mem.used / (1024 ** 3)
                mem_percent = mem.percent

                # Disk Metrics
                disk = psutil.disk_usage('/')
                disk_total_gb = disk.total / (1024 ** 3)
                disk_used_gb = disk.used / (1024 ** 3)
                disk_percent = disk.percent

                # Uptime
                boot_time = datetime.fromtimestamp(psutil.boot_time())
                uptime = datetime.now() - boot_time
                uptime_str = str(uptime).split('.')[0]

                metrics = {
                    'cpu': {
                        'percent': cpu_percent,
                        'cores': cpu_count
                    },
                    'memory': {
                        'total_gb': round(mem_total_gb, 2),
                        'used_gb': round(mem_used_gb, 2),
                        'percent': mem_percent
                    },
                    'disk': {
                        'total_gb': round(disk_total_gb, 2),
                        'used_gb': round(disk_used_gb, 2),
                        'percent': disk_percent
                    },
                    'database': {
                        'status': db_status
                    },
                    'system': {
                        'uptime': uptime_str
                    }
                }
                return Response(metrics)
            except Exception as e:
                return Response(self._get_fallback_metrics(db_status, str(e)))
        else:
            return Response(self._get_fallback_metrics(db_status, "psutil no está disponible"))

    def _get_fallback_metrics(self, db_status, message):
        return {
            'cpu': {
                'percent': 10.0,
                'cores': 2
            },
            'memory': {
                'total_gb': 4.00,
                'used_gb': 1.60,
                'percent': 40.0
            },
            'disk': {
                'total_gb': 80.00,
                'used_gb': 30.00,
                'percent': 37.5
            },
            'database': {
                'status': db_status
            },
            'system': {
                'uptime': 'Uptime fallback (no psutil)',
                'message': message
            }
        }
