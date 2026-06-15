import logging
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

# Sibling App Imports
from animals.models import Animal
from sponsorship.models import SponsorshipTier
from activities.models import Activity
from shop.models import Product

logger = logging.getLogger(__name__)

def _build_tierra_viva_context() -> str:
    """Retrieves real-time context from the database to inject into the system prompt."""
    context = []
    
    # 1. Animals
    try:
        animals = Animal.objects.filter(is_adopted=False)[:10]
        context.append("=== ANIMALES EN EL SANTUARIO (Disponibles para Apadrinamiento) ===")
        if animals.exists():
            for a in animals:
                context.append(f"- {a.name} ({a.species}): {a.description[:120]}... | Estado de Salud: {a.get_health_status_display()}")
        else:
            context.append("No hay animales cargados actualmente.")
    except Exception as e:
        context.append(f"Error cargando animales: {e}")
        
    # 2. Sponsorship Tiers
    try:
        tiers = SponsorshipTier.objects.filter(is_active=True).order_by('level')
        context.append("\n=== NIVELES DE APADRINAMIENTO ===")
        if tiers.exists():
            for t in tiers:
                context.append(f"- Nivel {t.level}: {t.name} | Precio Mensual: ${t.price} MXN | Anual: ${t.price_annual or (t.price * 10)} MXN | Descripción: {t.description[:120]}")
        else:
            context.append("No hay niveles de apadrinamiento configurados.")
    except Exception as e:
        context.append(f"Error cargando membresías: {e}")
        
    # 3. Activities / Camps / Workshops
    try:
        activities = Activity.objects.filter(is_active=True, date__gte=timezone_now_date())[:5]
        context.append("\n=== PRÓXIMAS ACTIVIDADES, CAMPAMENTOS Y TALLERES ===")
        if activities.exists():
            for act in activities:
                context.append(f"- {act.title} ({act.get_activity_type_display()}): {act.date} a las {act.time} | Precio: ${act.price} MXN | Capacidad restante: {act.remaining_capacity} personas | Lugar: {act.location}")
        else:
            context.append("No hay actividades futuras programadas por el momento.")
    except Exception as e:
        context.append(f"Error cargando actividades: {e}")
        
    # 4. Shop Products
    try:
        products = Product.objects.filter(is_active=True)[:10]
        context.append("\n=== PRODUCTOS EN NUESTRA TIENDA ORGÁNICA ===")
        if products.exists():
            for p in products:
                context.append(f"- {p.name}: ${p.price} MXN | Unidad: {p.get_unit_display()} | Stock: {p.stock} unidades | Categoría: {p.category or 'General'}")
        else:
            context.append("No hay productos cargados en la tienda.")
    except Exception as e:
        context.append(f"Error cargando productos: {e}")
        
    return "\n".join(context)

def timezone_now_date():
    from django.utils import timezone
    return timezone.now().date()

def _build_system_prompt() -> str:
    db_context = _build_tierra_viva_context()
    
    return (
        "Eres el Asistente Inteligente Virtual de Tierra Viva Santuario.\n"
        "Tierra Viva es un rancho sustentable y un santuario de animales rescatados donde practicamos economía colaborativa, "
        "apadrinamiento de animales, permacultura, y organizamos campamentos y talleres educativos.\n\n"
        
        "REGLAS DE ALCANCE (GUARDRAILS):\n"
        "1. Solo tienes permitido responder preguntas sobre Tierra Viva: nuestros animales, programas de apadrinamiento, "
        "tienda orgánica y próximos talleres o actividades. Si el usuario pregunta cosas ajenas (como código de programación, "
        "recetas que no involucren nuestros productos, chismes de famosos, etc.), rechaza con elegancia y redirígelos a Tierra Viva.\n"
        "2. Mantén siempre un tono cálido, empático, ecológico y estructurado.\n"
        "3. Usa analogías hermosas relacionadas con la naturaleza (semillas, raíces, colmenas, sol, tierra, etc.) para adornar tus respuestas.\n\n"
        
        "DIRECTRICES DE CONTENIDO:\n"
        "- Si te preguntan por un animal, menciona a los animales reales que tenemos en el santuario (según la lista proveída abajo).\n"
        "- Si te preguntan cómo participar, detalla el programa de apadrinamiento y los talleres o campamentos de actividades.\n"
        "- Si solicitan detalles técnicos o reportan fallos, indícales amablemente que pueden escribir a nuestro equipo al correo tierraviva@zohomail.com.\n\n"
        "- Si solicitan informacion de animales puedes responder con informacion real del animal que pregunten"
        "CONTEXTO EN TIEMPO REAL DEL SANTUARIO:\n"
        f"{db_context}"
    )

class AssistantChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        api_key = getattr(settings, 'GROQ_API_KEY', '') or ''
        if not api_key:
            return Response({
                "reply": "Hola, gracias por contactarnos. Por el momento el asistente virtual no tiene configurada su conexión de IA. Por favor, vuelve a intentar más tarde o escríbenos directamente por redes sociales."
            }, status=status.HTTP_200_OK)

        messages_input = request.data.get('messages', [])
        if not messages_input:
            # Fallback if they just send a "prompt" string
            prompt = request.data.get('prompt')
            if prompt:
                messages_input = [{"role": "user", "content": prompt}]
            else:
                return Response({"error": "messages or prompt is required"}, status=400)

        try:
            from groq import Groq

            client = Groq(api_key=api_key)
            
            # Format history for Groq
            groq_messages = [{"role": "system", "content": _build_system_prompt()}]
            for msg in messages_input[-10:]: # Keep last 10 messages for context
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                if role in ['user', 'assistant', 'system']:
                    groq_messages.append({"role": role, "content": content})

            completion = client.chat.completions.create(
                messages=groq_messages,
                model="llama-3.1-8b-instant",
                temperature=0.5,
                max_tokens=500,
            )

            reply = completion.choices[0].message.content
            return Response({"reply": reply}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error generating Groq response: {e}")
            return Response({
                "reply": "Lo lamento, experimenté una dificultad temporal para procesar tu pregunta en este momento. Por favor, intenta de nuevo en unos segundos."
            }, status=status.HTTP_200_OK)
