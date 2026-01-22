import os
import random
import string
from datetime import datetime, timedelta
from flask import request, jsonify, redirect, url_for
from flask_login import login_user, logout_user, current_user
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash
from app import db, mail, oauth
from app.models import User, OTPVerification


def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(email, otp):
    """Send OTP to user's email"""
    try:
        msg = Message(
            subject='StudentHub - Verify Your Email',
            recipients=[email],
            html=f'''
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4F46E5;">🎓 StudentHub Email Verification</h2>
                <p>Your verification code is:</p>
                <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px;">
                    {otp}
                </div>
                <p style="color: #666; margin-top: 20px;">This code expires in 10 minutes.</p>
                <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
            '''
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False


def register_auth_routes(app):
    """Register authentication routes"""

    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

    # -------------------- Email OTP Routes --------------------

    @app.route("/auth/send-otp", methods=["POST"])
    def send_otp():
        """Send OTP to email for verification"""
        data = request.json
        email = data.get("email", "").lower().strip()

        if not email:
            return jsonify({"error": "Email is required"}), 400

        # Check if email already registered
        existing_user = User.query.filter_by(email=email).first()
        if existing_user and existing_user.email_verified:
            return jsonify({"error": "Email already registered"}), 400

        # Generate OTP
        otp = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=10)

        # Delete any existing OTP for this email
        OTPVerification.query.filter_by(email=email).delete()

        # Save new OTP
        otp_record = OTPVerification(
            email=email,
            otp=otp,
            expires_at=expires_at
        )
        db.session.add(otp_record)
        db.session.commit()

        # Send email
        if send_otp_email(email, otp):
            return jsonify({"message": "OTP sent successfully"})
        else:
            return jsonify({"error": "Failed to send OTP. Check email configuration."}), 500

    @app.route("/auth/verify-otp", methods=["POST"])
    def verify_otp():
        """Verify OTP and complete signup"""
        data = request.json
        email = data.get("email", "").lower().strip()
        otp = data.get("otp", "").strip()
        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not all([email, otp, username, password]):
            return jsonify({"error": "All fields are required"}), 400

        # Find OTP record
        otp_record = OTPVerification.query.filter_by(
            email=email,
            otp=otp,
            verified=False
        ).first()

        if not otp_record:
            return jsonify({"error": "Invalid OTP"}), 400

        if otp_record.expires_at < datetime.utcnow():
            return jsonify({"error": "OTP expired"}), 400

        # Check if username taken
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already taken"}), 400

        # Mark OTP as verified
        otp_record.verified = True

        # Create user
        user = User(
            username=username,
            email=email,
            password=generate_password_hash(password),
            email_verified=True
        )
        db.session.add(user)
        db.session.commit()

        # Login user
        login_user(user)

        return jsonify({
            "message": "Account created successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "avatar_url": user.avatar_url
            }
        })

    # -------------------- OAuth Routes --------------------

    @app.route("/auth/github")
    def github_login():
        """Initiate GitHub OAuth"""
        redirect_uri = url_for('github_callback', _external=True)
        return oauth.github.authorize_redirect(redirect_uri)

    @app.route("/auth/github/callback")
    def github_callback():
        """Handle GitHub OAuth callback"""
        try:
            token = oauth.github.authorize_access_token()
            resp = oauth.github.get('user', token=token)
            profile = resp.json()

            # Get email (might need separate request)
            email = profile.get('email')
            if not email:
                emails_resp = oauth.github.get('user/emails', token=token)
                emails = emails_resp.json()
                primary_email = next((e for e in emails if e.get('primary')), None)
                email = primary_email['email'] if primary_email else None

            if not email:
                return redirect(f"{FRONTEND_URL}/login?error=no_email")

            # Find or create user
            user = User.query.filter_by(email=email).first()

            if not user:
                # Create new user
                username = profile.get('login', email.split('@')[0])
                # Ensure unique username
                base_username = username
                counter = 1
                while User.query.filter_by(username=username).first():
                    username = f"{base_username}{counter}"
                    counter += 1

                user = User(
                    username=username,
                    email=email,
                    oauth_provider='github',
                    oauth_id=str(profile.get('id')),
                    avatar_url=profile.get('avatar_url'),
                    email_verified=True
                )
                db.session.add(user)
                db.session.commit()

            login_user(user)
            return redirect(f"{FRONTEND_URL}?login=success")

        except Exception as e:
            print(f"GitHub OAuth error: {e}")
            return redirect(f"{FRONTEND_URL}/login?error=oauth_failed")

    @app.route("/auth/google")
    def google_login():
        """Initiate Google OAuth"""
        redirect_uri = url_for('google_callback', _external=True)
        return oauth.google.authorize_redirect(redirect_uri)

    @app.route("/auth/google/callback")
    def google_callback():
        """Handle Google OAuth callback"""
        try:
            token = oauth.google.authorize_access_token()
            user_info = token.get('userinfo')

            if not user_info:
                return redirect(f"{FRONTEND_URL}/login?error=no_user_info")

            email = user_info.get('email')
            if not email:
                return redirect(f"{FRONTEND_URL}/login?error=no_email")

            # Find or create user
            user = User.query.filter_by(email=email).first()

            if not user:
                # Create new user
                username = user_info.get('name', email.split('@')[0]).replace(' ', '_').lower()
                # Ensure unique username
                base_username = username
                counter = 1
                while User.query.filter_by(username=username).first():
                    username = f"{base_username}{counter}"
                    counter += 1

                user = User(
                    username=username,
                    email=email,
                    oauth_provider='google',
                    oauth_id=user_info.get('sub'),
                    avatar_url=user_info.get('picture'),
                    email_verified=True
                )
                db.session.add(user)
                db.session.commit()

            login_user(user)
            return redirect(f"{FRONTEND_URL}?login=success")

        except Exception as e:
            print(f"Google OAuth error: {e}")
            return redirect(f"{FRONTEND_URL}/login?error=oauth_failed")

    # -------------------- Session Check --------------------

    @app.route("/auth/me")
    def get_current_user():
        """Get current logged-in user"""
        if current_user.is_authenticated:
            return jsonify({
                "user": {
                    "id": current_user.id,
                    "username": current_user.username,
                    "email": current_user.email,
                    "avatar_url": current_user.avatar_url,
                    "oauth_provider": current_user.oauth_provider
                }
            })
        return jsonify({"user": None}), 401
