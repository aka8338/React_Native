from flask_mail import Message
from app import mail
from flask import render_template, current_app

class EmailService:
    """Service for sending emails."""
    
    @staticmethod
    def send_email(to, subject, template, **kwargs):
        """Send an email."""
        msg = Message(
            subject,
            recipients=[to],
            html=template,
            sender=current_app.config["MAIL_DEFAULT_SENDER"]
        )
        mail.send(msg)
    
    @staticmethod
    def send_otp_email(to, otp_code):
        """Send an OTP verification email."""
        subject = "Verify Your Email - Sorghum Disease Identifier App"
        
        # Email template as HTML string since we don't have templates folder set up
        template = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; }}
                .header {{ text-align: center; padding: 20px 0; }}
                .header h1 {{ color: #148F55; margin: 0; }}
                .content {{ padding: 20px 0; }}
                .otp-box {{ background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; }}
                .otp-code {{ font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #148F55; }}
                .footer {{ text-align: center; padding: 20px 0; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Sorghum Disease Identifier App</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Thank you for signing up for the Sorghum Disease Identifier App. To complete your registration, please use the verification code below:</p>
                    
                    <div class="otp-box">
                        <div class="otp-code">{otp_code}</div>
                    </div>
                    
                    <p>This code will expire in 10 minutes. If you did not request this verification, please ignore this email.</p>
                    
                    <p>Best regards,<br>The Sorghum Disease Identifier Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        EmailService.send_email(to, subject, template)
    
    @staticmethod
    def send_password_reset_email(to, reset_link):
        """Send a password reset email."""
        subject = "Reset Your Password - Sorghum Disease Identifier App"
        
        template = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; }}
                .header {{ text-align: center; padding: 20px 0; }}
                .header h1 {{ color: #148F55; margin: 0; }}
                .content {{ padding: 20px 0; }}
                .btn {{ display: inline-block; background-color: #148F55; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin: 20px 0; }}
                .footer {{ text-align: center; padding: 20px 0; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Sorghum Disease Identifier App</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>You requested to reset your password for the Sorghum Disease Identifier App. Please click the button below to reset your password:</p>
                    
                    <p style="text-align: center;">
                        <a href="{reset_link}" class="btn">Reset Password</a>
                    </p>
                    
                    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                    
                    <p>Best regards,<br>The Sorghum Disease Identifier Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        EmailService.send_email(to, subject, template) 