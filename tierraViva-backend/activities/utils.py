import qrcode
import io
import logging
from email.mime.image import MIMEImage
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)

def generate_booking_qr(booking):
    """
    Generates a QR code PNG image for a booking token.
    Returns raw bytes of the PNG image.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    # This URL is used to verify the ticket on the frontend or dashboard scan page
    data = f"{settings.FRONTEND_URL}/activities/verify/{booking.token}"
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0D2C1A", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


def send_booking_ticket_email(booking):
    """
    Compiles content and dispatches the booking ticket confirmation email.
    Uses globally defined settings.EMAIL_BACKEND.
    """
    subject = f"🎟️ Tu acceso confirmado para {booking.activity.title} — Tierra Viva"
    
    event_date = booking.activity.date.strftime('%d / %m / %Y')
    event_time = booking.activity.time.strftime('%H:%M') + " HRS"
    location = booking.activity.location
    tickets_count = booking.tickets
    
    # 1. Simple HTML template context
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0d2c1a; text-align: center;">¡Tu reserva está lista! 🌿</h2>
        <p>Hola <strong>{booking.user.first_name or booking.user.username}</strong>,</p>
        <p>Hemos confirmado tu pago para la actividad en <strong>Tierra Viva</strong>. Aquí tienes tus accesos:</p>
        
        <div style="background-color: #f7f9f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e3f20;">{booking.activity.title}</h3>
          <p>📅 <strong>Fecha:</strong> {event_date}</p>
          <p>⏰ <strong>Hora:</strong> {event_time}</p>
          <p>📍 <strong>Lugar:</strong> {location}</p>
          <p>🎟️ <strong>Lugares reservados:</strong> {tickets_count}</p>
          <p>💳 <strong>Monto Total:</strong> ${booking.total_price} MXN</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="margin-bottom: 10px; font-size: 14px; color: #666;">Presenta este código QR en tu entrada:</p>
          <img src="cid:qr_code" alt="Código QR de Acceso" style="border: 2px solid #0d2c1a; padding: 5px; border-radius: 5px; width: 200px; height: 200px;" />
          <p style="margin-top: 10px; font-size: 11px; color: #999;">Token único: {booking.token}</p>
        </div>
        
        <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          Tierra Viva Santuario - Ayuda Solidaria y Sustentabilidad.
        </p>
      </body>
    </html>
    """

    # 2. Text fallback
    text_content = (
        f"¡Hola! Tu acceso para {booking.activity.title} está listo.\n\n"
        f"Fecha: {event_date} a las {event_time}\n"
        f"Ubicación: {location}\n"
        f"Lugares reservados: {tickets_count}\n"
        f"Monto Total: ${booking.total_price} MXN\n\n"
        f"Tu código QR de acceso único está disponible en:\n"
        f"{settings.FRONTEND_URL}/activities/verify/{booking.token}\n\n"
        f"IMPORTANTE: Solo puede escanearse una vez. No compartas este enlace.\n\n"
        f"Token de autenticidad: {booking.token}\n\n"
        f"Atentamente, el equipo de Tierra Viva."
    )

    logger.info(f"[Booking/Delivery] Preparing ticket email for booking {booking.id} ({booking.user.email})")

    # 3. Create Email object
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[booking.user.email]
    )
    msg.attach_alternative(html_content, "text/html")
    msg.mixed_subtype = 'related'

    # 4. Generate & Attach QR Code Inline
    try:
        qr_bytes = generate_booking_qr(booking)
        qr_image = MIMEImage(qr_bytes, _subtype='png')
        qr_image.add_header('Content-ID', '<qr_code>')
        qr_image.add_header('Content-Disposition', 'inline', filename=f"ticket_{str(booking.token)[:8]}.png")
        msg.attach(qr_image)
    except Exception as qr_err:
        logger.error(f"Error generating or attaching QR code: {qr_err}")

    # 5. Dispatch
    msg.send(fail_silently=False)
    logger.info(f"[Booking/Delivery] ✅ Ticket email sent successfully for booking {booking.id}")
